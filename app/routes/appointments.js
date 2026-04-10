const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, honeypotCheck, limitBody } = require('../middleware/security');

const bookLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de demandes. Reessayez dans 15 minutes.', keyPrefix: 'book' });

// ============ PUBLIC MANAGEMENT ============

// GET /api/appointments/manage/:token
router.get('/manage/:token', async (req, res) => {
  try {
    const appt = await Appointment.findOne({ secretToken: req.params.token });
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    res.json(appt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments/cancel/:token
router.post('/cancel/:token', limitBody(5), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Raison requise pour l\'annulation' });
    const appt = await Appointment.findOneAndUpdate(
      { secretToken: req.params.token },
      { status: 'annule', cancelReason: sanitize(reason, 500) },
      { new: true }
    );
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });
    
    Notification.create({
      forRole: 'admin',
      type: 'appointment',
      title: `RDV Annulé : ${appt.with?.name}`,
      message: `Raison : ${reason}`,
      link: `/calendar?id=${appt._id}`,
      icon: 'cancel'
    }).catch(() => {});

    res.json({ success: true, appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/appointments/reschedule/:token
router.post('/reschedule/:token', limitBody(10), async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !reason) return res.status(400).json({ error: 'Date et raison requises' });
    
    const appt = await Appointment.findOne({ secretToken: req.params.token });
    if (!appt) return res.status(404).json({ error: 'Rendez-vous introuvable' });

    const oldDate = appt.date;
    appt.history.push({ oldDate, newDate: new Date(date), reason: sanitize(reason, 500) });
    appt.date = new Date(date);
    appt.rescheduleReason = sanitize(reason, 500);
    appt.status = 'planifie'; // Reset to planifie if it was confirmed before
    await appt.save();

    Notification.create({
      forRole: 'admin',
      type: 'appointment',
      title: `RDV Reporté : ${appt.with?.name}`,
      message: `Nouvelle date : ${new Date(date).toLocaleString('fr-FR')}`,
      link: `/calendar?id=${appt._id}`,
      icon: 'event_repeat'
    }).catch(() => {});

    res.json({ success: true, appointment: appt });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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

    // Dynamic import for crypto
    const crypto = require('crypto');
    const secretToken = crypto.randomBytes(32).toString('hex');

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
      source: 'public_form',
      secretToken
    });

    Notification.create({
      forRole: 'admin',
      type: 'appointment',
      title: `Nouveau rendez-vous : ${name}`,
      message: `${appt.type} le ${new Date(appt.date).toLocaleString('fr-FR')}`,
      link: `/calendar?id=${appt._id}`,
      icon: 'event'
    }).catch(() => {});

    // Use refined email template system
    const { sendEmail, sendAppointmentConfirmation } = require('../config/email');
    try {
      // Admin notification (keep simple or use template)
      await sendEmail(
        process.env.ADMIN_EMAIL || 'contact@pirabellabs.com',
        `Nouveau rendez-vous : ${name}`,
        `<h2>Nouveau rendez-vous</h2>
        <p><strong>Avec :</strong> ${name} (${email})</p>
        <p><strong>Date :</strong> ${new Date(appt.date).toLocaleString('fr-FR')}</p>
        <p><strong>Type :</strong> ${appt.type}</p>
        <p><strong>Notes :</strong> ${appt.notes || '-'}</p>`
      );
      
      // Client PREMIUM confirmation
      await sendAppointmentConfirmation(email, appt);
      
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
