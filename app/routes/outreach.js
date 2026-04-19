const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Prospect = require('../models/Prospect');
const { sendEmail } = require('../config/email');
const { wrap: wrapOutreach } = require('../config/outreach-template');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, limitBody } = require('../middleware/security');
const { auth, adminOrEmployee } = require('../middleware/auth');

// =============================================================
// Bearer-token auth for the outreach endpoints.
// Set OUTREACH_TOKEN in Vercel env vars (32+ chars random string).
// =============================================================
function requireOutreachToken(req, res, next) {
  const expected = (process.env.OUTREACH_TOKEN || '').trim();
  if (!expected) return res.status(503).json({ error: 'OUTREACH_TOKEN not configured on server' });

  const header = req.headers['authorization'] || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const provided = match ? match[1].trim() : '';
  if (!provided) return res.status(401).json({ error: 'Missing Authorization: Bearer <token>' });

  // Constant-time compare to prevent timing attacks
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(provided);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

// Rate limit — up to 40 sends per hour per IP (roughly 1 every 90s)
const outreachLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: 'Too many sends. Slow down to avoid spam flags.',
  keyPrefix: 'outreach'
});

// =============================================================
// POST /api/outreach/send
// Body: { to, subject, html, [cc], [contactName], [company],
//         [sector], [website], [phone], [problem], [notes] }
// Sends the email via Brevo SMTP AND upserts a Prospect record
// with emailsSent incremented and lastContactedAt updated.
// =============================================================
// Helper: build the final HTML — either pass-through if caller gave a full
// HTML document, or wrap the body with the professional CTA-button template.
function buildEmailHtml(body) {
  const useTemplate = body && typeof body === 'object' && (body.body || body.html);
  if (!useTemplate) {
    return String(body || '').slice(0, 80000);
  }
  // Called with { body, primaryCta, secondaryCta, lang, preheader }
  return wrapOutreach({
    body: String(body.body || body.html || '').slice(0, 60000),
    primaryCta: body.primaryCta,
    secondaryCta: body.secondaryCta,
    lang: body.lang || 'fr',
    preheader: body.preheader || ''
  });
}

router.post('/send', requireOutreachToken, outreachLimiter, limitBody(80), async (req, res) => {
  try {
    const to = sanitizeEmail(req.body.to || '');
    const cc = sanitizeEmail(req.body.cc || '');
    const subject = sanitize(req.body.subject || '', 300);

    // Accept either raw html OR a rich template object with CTA buttons.
    let finalHtml;
    if (req.body.template && typeof req.body.template === 'object') {
      finalHtml = buildEmailHtml(req.body.template);
    } else {
      finalHtml = buildEmailHtml(req.body.html);
    }

    if (!isValidEmail(to)) return res.status(400).json({ error: 'Invalid recipient email' });
    if (!subject) return res.status(400).json({ error: 'Subject required' });
    if (!finalHtml) return res.status(400).json({ error: 'HTML body (or template.body) required' });

    // Send via Brevo SMTP (inherits From: "Pirabel Labs" <contact@pirabellabs.com>)
    const info = await sendEmail(to, subject, finalHtml, { cc: cc || undefined, returnInfo: true });
    if (!info || info === false) {
      return res.status(502).json({ error: 'SMTP send failed — check server logs' });
    }

    // Upsert the Prospect record for tracking + append timeline event.
    const set = {
      contactName: sanitize(req.body.contactName || to.split('@')[0], 150),
      email: to,
      company: sanitize(req.body.company || '', 200),
      sector: sanitize(req.body.sector || '', 100),
      website: sanitize(req.body.website || '', 300),
      phone: sanitize(req.body.phone || '', 30),
      problem: sanitize(req.body.problem || '', 500),
      notes: sanitize(req.body.notes || '', 2000),
      city: sanitize(req.body.city || '', 100),
      country: sanitize(req.body.country || '', 100),
      source: sanitize(req.body.source || 'cold_outreach', 50),
      campaign: sanitize(req.body.campaign || '', 100),
      lastContactedAt: new Date(),
      status: 'contacte'
    };
    if (Array.isArray(req.body.serviceInterest)) {
      set.serviceInterest = req.body.serviceInterest.map(s => sanitize(s, 50)).filter(Boolean).slice(0, 10);
    }
    if (typeof req.body.estimatedValue === 'number') set.estimatedValue = req.body.estimatedValue;
    if (typeof req.body.score === 'number') set.score = Math.min(Math.max(req.body.score, 0), 100);
    if (['chaud','tiede','froid'].includes(req.body.temperature)) set.temperature = req.body.temperature;

    const timelineEvent = {
      type: 'email_sent',
      at: new Date(),
      subject,
      body: finalHtml.slice(0, 4000),
      metadata: { messageId: info && info.messageId || null }
    };

    let prospect;
    try {
      prospect = await Prospect.findOneAndUpdate(
        { email: to },
        {
          $set: set,
          $inc: { emailsSent: 1 },
          $push: { timeline: timelineEvent }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (dbErr) {
      console.error('[outreach] prospect upsert failed:', dbErr.message);
    }

    res.json({
      success: true,
      to,
      subject,
      messageId: info && info.messageId ? info.messageId : null,
      prospectId: prospect ? prospect._id : null,
      prospectEmailsSent: prospect ? prospect.emailsSent : null
    });
  } catch (err) {
    console.error('[outreach/send] error:', err.message);
    res.status(500).json({ error: 'Send failed', detail: err.message });
  }
});

// =============================================================
// POST /api/outreach/send-admin
// Admin-only version (uses session auth instead of bearer token)
// so the admin dashboard UI can call it directly with cookies.
// =============================================================
router.post('/send-admin', auth, adminOrEmployee, outreachLimiter, limitBody(80), async (req, res) => {
  try {
    const to = sanitizeEmail(req.body.to || '');
    const cc = sanitizeEmail(req.body.cc || '');
    const subject = sanitize(req.body.subject || '', 300);
    const finalHtml = req.body.template
      ? buildEmailHtml(req.body.template)
      : buildEmailHtml(req.body.html);

    if (!isValidEmail(to)) return res.status(400).json({ error: 'Invalid recipient email' });
    if (!subject) return res.status(400).json({ error: 'Subject required' });
    if (!finalHtml) return res.status(400).json({ error: 'Body required' });

    const info = await sendEmail(to, subject, finalHtml, { cc: cc || undefined, returnInfo: true });
    if (!info || info === false) return res.status(502).json({ error: 'SMTP failed' });

    const set = {
      contactName: sanitize(req.body.contactName || to.split('@')[0], 150),
      email: to,
      company: sanitize(req.body.company || '', 200),
      sector: sanitize(req.body.sector || '', 100),
      website: sanitize(req.body.website || '', 300),
      phone: sanitize(req.body.phone || '', 30),
      problem: sanitize(req.body.problem || '', 500),
      notes: sanitize(req.body.notes || '', 2000),
      city: sanitize(req.body.city || '', 100),
      country: sanitize(req.body.country || '', 100),
      source: sanitize(req.body.source || 'cold_outreach', 50),
      campaign: sanitize(req.body.campaign || '', 100),
      lastContactedAt: new Date(),
      status: 'contacte',
      assignedTo: req.user ? req.user._id : undefined
    };
    if (Array.isArray(req.body.serviceInterest)) {
      set.serviceInterest = req.body.serviceInterest.map(s => sanitize(s, 50)).filter(Boolean).slice(0, 10);
    }
    if (typeof req.body.estimatedValue === 'number') set.estimatedValue = req.body.estimatedValue;
    if (typeof req.body.score === 'number') set.score = Math.min(Math.max(req.body.score, 0), 100);
    if (['chaud','tiede','froid'].includes(req.body.temperature)) set.temperature = req.body.temperature;

    const prospect = await Prospect.findOneAndUpdate(
      { email: to },
      {
        $set: set,
        $inc: { emailsSent: 1 },
        $push: { timeline: { type: 'email_sent', at: new Date(), subject, body: finalHtml.slice(0, 4000), metadata: { messageId: info.messageId, by: req.user ? req.user.email : null } } }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      prospectId: prospect._id,
      emailsSent: prospect.emailsSent,
      messageId: info.messageId || null
    });
  } catch (err) {
    console.error('[outreach/send-admin] error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// GET /api/outreach/prospects-admin — session-auth variant for UI
// =============================================================
router.get('/prospects-admin', auth, adminOrEmployee, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 300);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.temperature) filter.temperature = req.query.temperature;
    if (req.query.campaign) filter.campaign = req.query.campaign;
    if (req.query.q) {
      const r = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { contactName: r }, { email: r }, { company: r }, { sector: r }, { city: r }
      ];
    }
    const [prospects, total, stats] = await Promise.all([
      Prospect.find(filter).sort({ lastContactedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      Prospect.countDocuments(filter),
      Prospect.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, emailsSent: { $sum: '$emailsSent' } } }
      ])
    ]);
    res.json({ total, count: prospects.length, prospects, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// GET /api/outreach/prospect-detail/:id — full prospect with timeline
// =============================================================
router.get('/prospect-detail/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
    res.json({ prospect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// PUT /api/outreach/prospect/:id — update status, notes, etc.
// =============================================================
router.put('/prospect/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.temperature) updates.temperature = req.body.temperature;
    if (req.body.notes !== undefined) updates.notes = sanitize(req.body.notes, 2000);
    if (typeof req.body.estimatedValue === 'number') updates.estimatedValue = req.body.estimatedValue;
    if (typeof req.body.score === 'number') updates.score = Math.min(Math.max(req.body.score, 0), 100);
    if (req.body.nextFollowUpAt) updates.nextFollowUpAt = new Date(req.body.nextFollowUpAt);

    const prospect = await Prospect.findByIdAndUpdate(
      req.params.id,
      {
        $set: updates,
        $push: { timeline: { type: 'status_change', at: new Date(), metadata: { updates, by: req.user.email } } }
      },
      { new: true }
    );
    if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
    res.json({ prospect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// POST /api/outreach/batch
// Body: { items: [{to, subject, html, ...prospectFields}, ...],
//         delayMs: 30000 }
// Sends several emails sequentially with an optional delay between
// each to avoid Gmail/Brevo rate flags.
// =============================================================
router.post('/batch', requireOutreachToken, limitBody(500), async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items.slice(0, 30) : [];
    if (items.length === 0) return res.status(400).json({ error: 'items array required' });

    const delayMs = Math.min(Math.max(parseInt(req.body.delayMs) || 30000, 0), 300000);
    const results = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const to = sanitizeEmail(item.to || '');
        const subject = sanitize(item.subject || '', 300);
        const html = String(item.html || '').slice(0, 50000);
        if (!isValidEmail(to) || !subject || !html) {
          results.push({ to, status: 'skipped', error: 'invalid payload' });
          continue;
        }

        const info = await sendEmail(to, subject, html, {
          cc: item.cc ? sanitizeEmail(item.cc) : undefined,
          returnInfo: true
        });
        if (!info || info === false) {
          results.push({ to, status: 'failed', error: 'SMTP returned falsy' });
          continue;
        }

        try {
          await Prospect.findOneAndUpdate(
            { email: to },
            {
              $set: {
                contactName: sanitize(item.contactName || to.split('@')[0], 150),
                email: to,
                company: sanitize(item.company || '', 200),
                sector: sanitize(item.sector || '', 100),
                website: sanitize(item.website || '', 300),
                phone: sanitize(item.phone || '', 30),
                problem: sanitize(item.problem || '', 500),
                notes: sanitize(item.notes || '', 2000),
                lastContactedAt: new Date(),
                status: 'contacte'
              },
              $inc: { emailsSent: 1 }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        } catch (dbErr) { /* non-fatal */ }

        results.push({ to, status: 'sent', messageId: info && info.messageId || null });
      } catch (sendErr) {
        results.push({ to: item.to, status: 'failed', error: sendErr.message });
      }

      // Wait between sends (skip after the last one)
      if (i < items.length - 1 && delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    res.json({
      success: true,
      total: items.length,
      sent: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results
    });
  } catch (err) {
    console.error('[outreach/batch] error:', err.message);
    res.status(500).json({ error: 'Batch failed', detail: err.message });
  }
});

// =============================================================
// GET /api/outreach/prospects — list recent prospects (auth req)
// Simple paginated listing of the Prospect collection for
// monitoring outreach campaigns. Bearer-token protected.
// =============================================================
router.get('/prospects', requireOutreachToken, async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 200);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);
    const [prospects, total] = await Promise.all([
      Prospect.find().sort({ lastContactedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      Prospect.countDocuments()
    ]);
    res.json({ total, count: prospects.length, prospects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// GET /api/outreach/ping — simple liveness check (auth required)
// =============================================================
router.get('/ping', requireOutreachToken, (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// =============================================================
// AUTO FOLLOW-UPS
// =============================================================
// Rules:
//   - Send 1st follow-up 4 days after initial contact if no reply + no
//     status change beyond 'contacte'.
//   - Send 2nd follow-up 7 days after the 1st follow-up.
//   - After 3 total touches without reply, mark status = 'no_reply'.
//   - A prospect with nextFollowUpAt in the future is skipped until then.
//   - If status is already 'intéressé', 'rdv_pris', 'converti', 'perdu',
//     'negociation', 'no_reply' → never auto-follow-up.
// =============================================================
const FOLLOW_UP_TEMPLATES = {
  fr: [
    {
      subject: 'Petit rappel — êtes-vous toujours intéressé(e) ?',
      body: `<p>Bonjour,</p>
<p>Je reviens vers vous suite à mon premier email. Je sais que les semaines sont chargées, donc je comprends tout à fait si vous n'avez pas encore eu le temps d'y revenir.</p>
<p>Juste pour rappel : je vous propose gratuitement un diagnostic ciblé sur votre présence digitale, livrable en 48 à 72 heures, sans engagement. C'est une façon simple pour vous de voir concrètement ce qu'on pourrait débloquer sur votre site.</p>
<p>Souhaitez-vous que je vous envoie ce diagnostic ?</p>`
    },
    {
      subject: 'Dernière prise de contact — je clôture votre dossier',
      body: `<p>Bonjour,</p>
<p>Je vous ai contacté deux fois et vous n'avez pas eu le temps de me répondre — aucun souci, je comprends.</p>
<p>Je clôture votre dossier dans notre système aujourd'hui pour ne plus vous déranger. Si vous reprenez votre réflexion plus tard, vous pouvez toujours me répondre sur ce fil et je reprendrai la conversation avec plaisir.</p>
<p>Belle continuation.</p>`
    }
  ],
  en: [
    {
      subject: 'Quick follow-up — still relevant on your side?',
      body: `<p>Hi,</p>
<p>Following up on my earlier note. I know weeks get busy, so no worries if you haven't had time to come back to it yet.</p>
<p>Quick reminder: I'm offering a free targeted diagnostic on your digital presence, delivered within 48–72 hours, no strings attached. An easy way for you to see exactly what we could unlock on your site.</p>
<p>Would you like me to send the diagnostic?</p>`
    },
    {
      subject: 'Last note — closing your file on my side',
      body: `<p>Hi,</p>
<p>I've reached out twice and I know your inbox must be packed. No pressure.</p>
<p>I'm closing your file on my side today to avoid further noise. If you pick this up again later, just reply on this thread and I'll happily resume the conversation.</p>
<p>Wishing you the best.</p>`
    }
  ]
};

async function runFollowupBatch(opts = {}) {
  const now = new Date();
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const limit = Math.min(opts.limit || 15, 50);

  // Find candidates: contacted status, no recent reply, no future scheduled follow-up
  const candidates = await Prospect.find({
    status: 'contacte',
    emailsSent: { $gte: 1, $lt: 3 },
    lastContactedAt: { $lte: fourDaysAgo },
    $or: [
      { nextFollowUpAt: { $exists: false } },
      { nextFollowUpAt: null },
      { nextFollowUpAt: { $lte: now } }
    ]
  }).limit(limit).lean();

  const results = [];
  for (const p of candidates) {
    // Pick the right follow-up template: 1st for 1 email sent, 2nd for 2 sent
    const sentCount = p.emailsSent || 0;
    const followUpIndex = Math.min(sentCount - 1, FOLLOW_UP_TEMPLATES.fr.length - 1);
    if (followUpIndex < 0) continue;

    // Stricter timing for the 2nd follow-up: require 7 days since last contact
    if (sentCount >= 2 && new Date(p.lastContactedAt) > sevenDaysAgo) {
      continue;
    }

    // Pick language from country or default FR
    const isEn = /canada|united|uk|usa|united states/i.test(p.country || '') ||
                 /montreal|toronto|london|new york/i.test(p.city || '');
    const lang = isEn ? 'en' : 'fr';
    const tpl = FOLLOW_UP_TEMPLATES[lang][followUpIndex];

    // Primary CTA always opens the booking calendar so prospects can
    // self-serve a slot; fallback button shows social proof.
    const finalHtml = wrapOutreach({
      body: tpl.body,
      lang,
      primaryCta: {
        label: lang === 'en' ? 'Book a slot in the calendar' : 'Réserver un créneau dans le calendrier',
        url: 'https://www.pirabellabs.com' + (lang === 'en' ? '/en' : '') + '/rendez-vous'
      },
      secondaryCta: {
        label: lang === 'en' ? 'See our client results' : 'Voir nos résultats clients',
        url: 'https://www.pirabellabs.com' + (lang === 'en' ? '/en' : '') + '/resultats'
      },
      preheader: tpl.subject
    });

    try {
      const info = await sendEmail(p.email, tpl.subject, finalHtml, { returnInfo: true });
      if (!info || info === false) {
        results.push({ email: p.email, status: 'failed' });
        continue;
      }
      // On the 3rd send we will flip status to no_reply after it goes out
      const update = {
        $inc: { emailsSent: 1 },
        $set: { lastContactedAt: new Date() },
        $push: {
          timeline: {
            type: 'email_sent',
            at: new Date(),
            subject: tpl.subject,
            body: finalHtml.slice(0, 4000),
            metadata: { messageId: info.messageId, autoFollowUp: true, stage: followUpIndex + 1 }
          }
        }
      };
      if (sentCount + 1 >= 3) {
        update.$set.status = 'no_reply';
      }
      await Prospect.updateOne({ _id: p._id }, update);
      results.push({ email: p.email, status: 'sent', stage: followUpIndex + 1, messageId: info.messageId });
    } catch (err) {
      results.push({ email: p.email, status: 'error', error: err.message });
    }
    // Stagger sends by 2s to stay under Vercel's 30s function cap
    await new Promise(r => setTimeout(r, 2000));
  }

  return {
    candidatesFound: candidates.length,
    sent: results.filter(r => r.status === 'sent').length,
    failed: results.filter(r => r.status !== 'sent').length,
    results
  };
}

// =============================================================
// POST /api/outreach/run-followups — manual trigger from admin UI
// =============================================================
router.post('/run-followups', auth, adminOrEmployee, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.body.limit) || 15, 30);
    const result = await runFollowupBatch({ limit });
    res.json(result);
  } catch (err) {
    console.error('[outreach/run-followups]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// GET  /api/outreach/cron-followups — Vercel cron trigger
// POST /api/outreach/cron-followups — manual trigger with bearer
//
// Vercel cron sends:  Authorization: Bearer $CRON_SECRET
// We also accept:     x-cron-secret header or ?secret= query
// Falls back to OUTREACH_TOKEN if CRON_SECRET isn't set.
// =============================================================
function requireCronAuth(req, res, next) {
  const expected = (process.env.CRON_SECRET || process.env.OUTREACH_TOKEN || '').trim();
  if (!expected) return res.status(503).json({ error: 'No CRON_SECRET/OUTREACH_TOKEN configured' });
  const authHdr = req.headers['authorization'] || '';
  const bearer = /^Bearer\s+(.+)$/i.exec(authHdr);
  const got = (bearer ? bearer[1] : '') || req.headers['x-cron-secret'] || req.query.secret || '';
  if (String(got).trim() !== expected) return res.status(401).json({ error: 'unauthorized' });
  next();
}

async function cronHandler(req, res) {
  try {
    const result = await runFollowupBatch({ limit: 6 });
    res.json({ ok: true, at: new Date().toISOString(), ...result });
  } catch (err) {
    console.error('[cron-followups]', err.message);
    res.status(500).json({ error: err.message });
  }
}

router.get('/cron-followups', requireCronAuth, cronHandler);
router.post('/cron-followups', requireCronAuth, cronHandler);

// Expose for reuse
module.exports.runFollowupBatch = runFollowupBatch;

module.exports = router;
// Named export (runFollowupBatch) is attached above for reuse if ever needed.
