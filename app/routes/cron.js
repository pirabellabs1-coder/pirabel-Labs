const express = require('express');
const router = express.Router();

// GET /api/cron/reminders — Vercel Cron daily job for auto follow-ups
// This endpoint is called by Vercel Cron (see vercel.json)
router.get('/', async (req, res) => {
  try {
    // Verify cron secret
    const cronSecret = req.headers['authorization'];
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const Quote = require('../models/Quote');
    const { sendEmail, masterTemplate } = require('../config/email');
    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';
    const results = { reminders: 0, errors: 0 };

    // Find quotes sent more than 7 days ago without response and no reminder sent
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const quotesToRemind = await Quote.find({
      status: 'envoye',
      sentAt: { $lte: sevenDaysAgo },
      reminderSent: false
    }).populate('client', 'contactName email');

    for (const quote of quotesToRemind) {
      const email = quote.clientEmail || (quote.client && quote.client.email);
      if (!email) continue;

      const name = quote.clientName || (quote.client && quote.client.contactName) || '';

      const html = masterTemplate({
        preheader: `Relance : Devis ${quote.quoteNumber}`,
        title: 'Suite à notre proposition',
        subtitle: quote.quoteNumber,
        body: `
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${name},</p>
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Nous revenons vers vous concernant notre devis <strong>${quote.quoteNumber}</strong> d'un montant de <strong>${quote.total.toLocaleString('fr-FR')} €</strong> envoyé le ${new Date(quote.sentAt).toLocaleDateString('fr-FR')}.</p>
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Avez-vous eu l'occasion de l'examiner ? N'hésitez pas à nous contacter si vous avez des questions.</p>
        `,
        cta: 'Voir le devis',
        ctaUrl: `${SITE}/espace-client-4p8w1n`
      });

      try {
        const success = await sendEmail(email, `Relance : Devis ${quote.quoteNumber} — Pirabel Labs`, html);
        if (success) {
          quote.reminderSent = true;
          quote.reminderSentAt = Date.now();
          await quote.save();
          results.reminders++;
        }
      } catch (e) {
        results.errors++;
      }
    }

    // Also check overdue invoices
    const Invoice = require('../models/Invoice');
    const overdueInvoices = await Invoice.find({
      status: 'envoyee',
      dueDate: { $lte: new Date() }
    });

    for (const inv of overdueInvoices) {
      inv.status = 'en_retard';
      await inv.save();
    }

    res.json({
      success: true,
      quotesReminded: results.reminders,
      errors: results.errors,
      overdueInvoices: overdueInvoices.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cron/reminders - 15 minute interval cron to send meeting reminders
router.get('/reminders', async (req, res) => {
  try {
    const cronSecret = req.headers['authorization'];
    if (cronSecret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const Appointment = require('../models/Appointment');
    const { sendMeetingReminder } = require('../config/email');
    
    const now = new Date();
    // Look for appointments in the next 45 minutes
    const futureLimit = new Date(now.getTime() + 45 * 60000);

    const upcomingAppointments = await Appointment.find({
      status: { $in: ['planifie', 'confirme'] },
      date: { $gte: now, $lte: futureLimit },
      reminderSent: false
    });

    let sentCount = 0;
    for (const appt of upcomingAppointments) {
      if (appt.with && appt.with.email) {
        try {
          await sendMeetingReminder(appt);
          appt.reminderSent = true;
          await appt.save();
          sentCount++;
        } catch (err) {
          console.error('[CRON] Erreur envoi rappel RDV:', err.message);
        }
      }
    }

    res.json({ success: true, remindersSent: sentCount, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
