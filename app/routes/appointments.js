const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, honeypotCheck, limitBody } = require('../middleware/security');

const bookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de demandes. Reessayez dans 15 minutes.', keyPrefix: 'book' });

// ============ PUBLIC BOOKING ============

// GET /api/appointments/availability?date=YYYY-MM-DD
router.get('/availability', async (req, res) => {
  try {
    const dateStr = req.query.date;
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ error: 'Date invalide (YYYY-MM-DD)' });
    }
    const start = new Date(dateStr + 'T00:00:00');
    const end = new Date(dateStr + 'T23:59:59');
    const day = start.getDay();
    if (day === 0 || day === 6) return res.json({ slots: [], message: 'Weekend ferme' });

    const taken = await Appointment.find({
      date: { $gte: start, $lte: end },
      status: { $nin: ['annule', 'no_show'] }
    }).select('date duration');

    const allSlots = [];
    for (let h = 9; h < 18; h++) {
      if (h === 12 || h === 13) continue;
      ['00', '30'].forEach(m => allSlots.push(`${h.toString().padStart(2, '0')}:${m}`));
    }

    const slots = allSlots.filter(slot => {
      const [hh, mm] = slot.split(':').map(Number);
      const slotDate = new Date(start);
      slotDate.setHours(hh, mm, 0, 0);
      if (slotDate < new Date()) return false;
      return !taken.some(t => {
        const tStart = new Date(t.date);
        const tEnd = new Date(tStart.getTime() + (t.duration || 30) * 60000);
        return slotDate >= tStart && slotDate < tEnd;
      });
    });

    res.json({ date: dateStr, slots });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments/book — public booking
router.post('/book', bookLimiter, honeypotCheck('website_url'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 100);
    const email = sanitizeEmail(req.body.email);
    if (!name) return res.status(400).json({ error: 'Nom requis' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!req.body.date) return res.status(400).json({ error: 'Date requise' });

    const appt = await Appointment.create({
      title: sanitize(req.body.title || `Rendez-vous - ${name}`, 200),
      type: ['consultation', 'demo', 'kickoff', 'review', 'autre'].includes(req.body.type) ? req.body.type : 'consultation',
      date: new Date(req.body.date),
      duration: parseInt(req.body.duration) || 30,
      with: {
        name,
        email,
        phone: sanitize(req.body.phone || '', 30),
        company: sanitize(req.body.company || '', 200)
      },
      notes: sanitize(req.body.notes || '', 2000),
      location: sanitize(req.body.location || 'Visioconférence', 200),
      source: 'public_form'
    });

    Notification.create({
      forRole: 'admin',
      type: 'appointment',
      title: `Nouveau rendez-vous : ${name}`,
      message: `${appt.type} le ${new Date(appt.date).toLocaleString('fr-FR')}`,
      link: `/calendar?id=${appt._id}`,
      icon: 'event'
    }).catch(() => {});

    // Await emails to ensure delivery on Vercel serverless
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'contact@pirabellabs.com',
        `Nouveau rendez-vous : ${name}`,
        `<h2>Nouveau rendez-vous</h2>
        <p><strong>Avec :</strong> ${name} (${email})</p>
        <p><strong>Date :</strong> ${new Date(appt.date).toLocaleString('fr-FR')}</p>
        <p><strong>Type :</strong> ${appt.type}</p>
        <p><strong>Notes :</strong> ${appt.notes || '-'}</p>`
      );
      await sendEmail(
        email,
        `Rendez-vous confirme - Pirabel Labs`,
        `<h2>Bonjour ${name},</h2>
        <p>Votre rendez-vous est planifie pour le <strong>${new Date(appt.date).toLocaleString('fr-FR')}</strong>.</p>
        <p>Vous recevrez le lien de visio par email avant le rendez-vous.</p>
        <p>A bientot,<br>L'equipe Pirabel Labs</p>`
      );
    } catch (err) { console.error('Appointment email error:', err); }

    if (req.app.get('io')) req.app.get('io').emit('new-appointment', { id: appt._id, name });

    res.status(201).json({ success: true, appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ ADMIN ============

// GET /api/appointments
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const query = {};
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (status) query.status = status;
    if (req.user.role === 'employee') query.assignedTo = req.user._id;
    const appointments = await Appointment.find(query)
      .populate('client', 'company contactName')
      .populate('assignedTo', 'name')
      .sort({ date: 1 });
    res.json({ appointments });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments — create from admin
router.post('/', auth, adminOrEmployee, limitBody(20), async (req, res) => {
  try {
    const appt = await Appointment.create({ ...req.body, source: 'admin', assignedTo: req.body.assignedTo || req.user._id });
    res.status(201).json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/appointments/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
