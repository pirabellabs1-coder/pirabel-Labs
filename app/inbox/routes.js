// ============================================================================
// BOÎTE MAIL IA — routes
//   Admin (auth + adminOnly) : /api/admin/inbox/*
//   Cron sécurisé : GET /api/cron/inbox  (Authorization: Bearer <CRON_SECRET>
//                   ou ?secret=<CRON_SECRET> pour un planificateur externe)
// ============================================================================
const crypto = require('crypto');
const engine = require('./engine');
const InboundEmail = require('../models/InboundEmail');

const RX_ID = /^[a-f0-9]{24}$/i;
function safeEqual(a, b) {
  const x = Buffer.from(String(a || '')); const y = Buffer.from(String(b || ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

module.exports = function registerInbox(app, deps) {
  const { auth, adminOnly, rateLimit, sanitize } = deps;
  const A = [auth, adminOnly];
  const pollLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 20, keyPrefix: 'inbox-poll', message: 'Trop de relèves : patientez une minute.' });
  const cronLimiter = rateLimit({ windowMs: 60 * 1000, max: 12, keyPrefix: 'inbox-cron', message: 'Trop de requêtes.' });

  const summary = (d) => ({
    _id: d._id, fromEmail: d.fromEmail, fromName: d.fromName, subject: d.subject, snippet: d.snippet,
    category: d.category, qualification: d.qualification, status: d.status, flagged: d.flagged,
    autoEligible: d.autoEligible, hasDraft: !!d.draftBody, leadId: d.leadId || null,
    receivedAt: d.receivedAt, repliedAt: d.repliedAt, replyMode: d.replyMode, readByAdmin: d.readByAdmin, error: d.error,
  });
  const fail = (res, e, label) => { console.error('[inbox.' + label + ']', e && e.message); return res.status(500).json({ error: 'Erreur serveur.' }); };
  async function load(req, res) {
    if (!RX_ID.test(req.params.id || '')) { res.status(400).json({ error: 'Identifiant invalide.' }); return null; }
    const d = await InboundEmail.findById(req.params.id);
    if (!d) { res.status(404).json({ error: 'E-mail introuvable.' }); return null; }
    return d;
  }

  // ------------------------------------------------------------------ vue d'ensemble + liste
  app.get('/api/admin/inbox', ...A, async (req, res) => {
    try {
      const f = {};
      if (['nouveau', 'brouillon', 'repondu', 'ignore', 'erreur'].includes(req.query.status)) f.status = req.query.status;
      if (['prospect', 'client', 'facture', 'rendez_vous', 'support', 'spam', 'sensible', 'autre'].includes(req.query.category)) f.category = req.query.category;
      if (req.query.flagged === '1') f.flagged = true;
      const list = await InboundEmail.find(f).sort({ receivedAt: -1 }).limit(100).lean();
      const byStatus = await InboundEmail.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
      const counts = {}; byStatus.forEach((s) => { counts[s._id] = s.n; });
      res.json({
        configured: engine.configured(),
        config: await engine.getConfig(),
        counts,
        aTraiter: await InboundEmail.countDocuments({ status: 'brouillon' }),
        emails: list.map(summary),
      });
    } catch (e) { return fail(res, e, 'list'); }
  });

  app.get('/api/admin/inbox/:id', ...A, async (req, res) => {
    try {
      const d = await load(req, res); if (!d) return;
      if (!d.readByAdmin) { d.readByAdmin = true; await d.save(); }
      res.json({ email: {
        ...summary(d), text: d.text, draftSubject: d.draftSubject, draftBody: d.draftBody,
        summary: d.summary, replySource: d.replySource, messageId: d.messageId,
      } });
    } catch (e) { return fail(res, e, 'detail'); }
  });

  // ------------------------------------------------------------------ brouillon : éditer / régénérer
  app.put('/api/admin/inbox/:id', ...A, async (req, res) => {
    try {
      const d = await load(req, res); if (!d) return;
      if (req.body.draftSubject !== undefined) d.draftSubject = sanitize(String(req.body.draftSubject), 400);
      if (req.body.draftBody !== undefined) d.draftBody = engine._internals.stripForeignLinks(String(req.body.draftBody)).slice(0, 8000);
      d.replySource = 'manuel';
      if (d.status === 'nouveau') d.status = 'brouillon';
      await d.save();
      res.json({ success: true });
    } catch (e) { return fail(res, e, 'edit'); }
  });

  app.post('/api/admin/inbox/:id/redraft', ...A, pollLimiter, async (req, res) => {
    try {
      const d = await load(req, res); if (!d) return;
      await engine.classifyAndDraft(d, 15000);
      if (d.status === 'nouveau') d.status = 'brouillon';
      await d.save();
      res.json({ success: true, draftSubject: d.draftSubject, draftBody: d.draftBody, autoEligible: d.autoEligible });
    } catch (e) { return fail(res, e, 'redraft'); }
  });

  // ------------------------------------------------------------------ envoyer la réponse (manuel, les deux modes)
  app.post('/api/admin/inbox/:id/send', ...A, pollLimiter, async (req, res) => {
    try {
      const d = await load(req, res); if (!d) return;
      if (d.status === 'repondu') return res.status(400).json({ error: 'Déjà répondu.' });
      if (req.body.draftBody !== undefined) d.draftBody = engine._internals.stripForeignLinks(String(req.body.draftBody)).slice(0, 8000);
      if (req.body.draftSubject !== undefined) d.draftSubject = String(req.body.draftSubject).slice(0, 400);
      const r = await engine.sendReply(d, 'manuel');
      if (!r.ok) { d.error = r.error || ''; await d.save(); return res.status(502).json({ error: 'Envoi impossible : ' + (r.error || 'inconnu') }); }
      await d.save();
      res.json({ success: true });
    } catch (e) { return fail(res, e, 'send'); }
  });

  app.post('/api/admin/inbox/:id/ignore', ...A, async (req, res) => {
    try { const d = await load(req, res); if (!d) return; d.status = 'ignore'; await d.save(); res.json({ success: true }); }
    catch (e) { return fail(res, e, 'ignore'); }
  });

  // ------------------------------------------------------------------ réglages (mode brouillon/auto, plafond)
  app.put('/api/admin/inbox/settings', ...A, async (req, res) => {
    try {
      if (req.body.mode !== undefined) await engine.setSetting(engine.K.mode, req.body.mode === 'auto' ? 'auto' : 'brouillon');
      if (req.body.enabled !== undefined) await engine.setSetting(engine.K.enabled, req.body.enabled ? 'true' : 'false');
      if (req.body.hourlyCap !== undefined) {
        const c = parseInt(req.body.hourlyCap, 10);
        if (c >= 1 && c <= 100) await engine.setSetting(engine.K.hourlyCap, String(c));
      }
      res.json({ success: true, config: await engine.getConfig() });
    } catch (e) { return fail(res, e, 'settings'); }
  });

  // ------------------------------------------------------------------ relève manuelle
  app.post('/api/admin/inbox/poll', ...A, pollLimiter, async (req, res) => {
    try {
      if (!engine.configured()) return res.status(503).json({ error: 'Boîte non configurée : ajoutez MAIL_IMAP_HOST / MAIL_IMAP_USER / MAIL_IMAP_PASSWORD dans Vercel.' });
      const r = await engine.runPoll({ trigger: 'manuel' });
      if (!r.ok) {
        if (r.reason === 'occupe') return res.status(409).json({ error: 'Une relève est déjà en cours. Réessayez dans un instant.' });
        return res.status(502).json({ error: 'Relève impossible (' + (r.reason || 'inconnu') + ').' });
      }
      res.json({ success: true, ...r });
    } catch (e) { return fail(res, e, 'poll'); }
  });

  // ------------------------------------------------------------------ cron sécurisé
  // Seule preuve acceptée : l'en-tête « Authorization: Bearer <CRON_SECRET> » (jamais le
  // secret en paramètre d'URL, qui fuiterait dans les journaux). Les planificateurs
  // (cron-job.org, etc.) savent envoyer un en-tête personnalisé.
  app.get('/api/cron/inbox', cronLimiter, async (req, res) => {
    try {
      const secret = String(process.env.CRON_SECRET || '').trim();
      if (!secret) return res.status(503).json({ error: 'Relève automatique non configurée : définissez CRON_SECRET dans Vercel.' });
      const authz = String(req.headers.authorization || '');
      const bearer = authz.startsWith('Bearer ') ? authz.slice(7) : '';
      if (!bearer || !safeEqual(bearer, secret)) return res.status(401).json({ error: 'Non autorisé.' });
      const r = await engine.runPoll({ trigger: 'cron' });
      res.json({ success: !!r.ok, ...r });
    } catch (e) { console.error('[cron.inbox]', e.message); res.status(500).json({ error: 'Erreur cron.' }); }
  });
};
