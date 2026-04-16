const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Prospect = require('../models/Prospect');
const { sendEmail } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, limitBody } = require('../middleware/security');

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
router.post('/send', requireOutreachToken, outreachLimiter, limitBody(50), async (req, res) => {
  try {
    const to = sanitizeEmail(req.body.to || '');
    const cc = sanitizeEmail(req.body.cc || '');
    const subject = sanitize(req.body.subject || '', 300);
    const html = String(req.body.html || '').slice(0, 50000);

    if (!isValidEmail(to)) return res.status(400).json({ error: 'Invalid recipient email' });
    if (!subject) return res.status(400).json({ error: 'Subject required' });
    if (!html) return res.status(400).json({ error: 'HTML body required' });

    // Send via Brevo SMTP (inherits From: "Pirabel Labs" <contact@pirabellabs.com>)
    const info = await sendEmail(to, subject, html, { cc: cc || undefined, returnInfo: true });
    if (!info || info === false) {
      return res.status(502).json({ error: 'SMTP send failed — check server logs' });
    }

    // Upsert the Prospect record for tracking
    const prospectData = {
      contactName: sanitize(req.body.contactName || to.split('@')[0], 150),
      email: to,
      company: sanitize(req.body.company || '', 200),
      sector: sanitize(req.body.sector || '', 100),
      website: sanitize(req.body.website || '', 300),
      phone: sanitize(req.body.phone || '', 30),
      problem: sanitize(req.body.problem || '', 500),
      notes: sanitize(req.body.notes || '', 2000),
      lastContactedAt: new Date(),
      status: 'contacte'
    };

    let prospect;
    try {
      prospect = await Prospect.findOneAndUpdate(
        { email: to },
        {
          $set: prospectData,
          $inc: { emailsSent: 1 }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (dbErr) {
      // Non-fatal — email was sent, just log
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

module.exports = router;
