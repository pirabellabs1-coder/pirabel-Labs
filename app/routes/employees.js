const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

router.get('/', auth, async (req, res) => {
  try {
    const { department, status } = req.query;
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    const employees = await Employee.find(query).populate('user', 'name email lastLogin').sort({ name: 1 });
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email lastLogin');
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.create(req.body);

    await Activity.create({
      type: 'employee_invited',
      description: `Employe ajoute : ${employee.name}`,
      user: req.user._id,
      relatedModel: 'Employee',
      relatedId: employee._id
    });

    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees/:id/invite - Send invitation email
router.post('/:id/invite', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });

    // Generate invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const SITE = process.env.SITE_URL || 'https://pirabellabs.com';

    // Check if user already exists
    const existingUser = await User.findOne({ email: employee.email });
    if (existingUser) {
      employee.user = existingUser._id;
      await employee.save();
      return res.json({ success: true, message: 'Employe deja inscrit, compte lie' });
    }

    // Create user account with temporary password (employee must change it)
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const user = await User.create({
      name: employee.name,
      email: employee.email,
      password: tempPassword,
      role: 'employee',
      isActive: true
    });

    employee.user = user._id;
    await employee.save();

    // Send invitation email
    const html = masterTemplate({
      headerType: 'hero',
      preheader: 'Vous etes invite a rejoindre Pirabel Labs',
      title: `Bienvenue dans l'\u00e9quipe !`,
      subtitle: 'Pirabel Labs',
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${employee.name},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Vous avez \u00e9t\u00e9 ajout\u00e9(e) \u00e0 l'\u00e9quipe Pirabel Labs en tant que <strong style="color:#e5e2e1;">${employee.role}</strong> dans le d\u00e9partement <strong style="color:#e5e2e1;">${employee.department}</strong>.</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Voici vos identifiants de connexion :</p>
        <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:20px;margin:20px 0;">
          <table width="100%">
            <tr><td style="padding:6px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:6px 0;text-align:right;font-weight:600;">${employee.email}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mot de passe temporaire</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#FF5500;">${tempPassword}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:rgba(255,180,171,0.8);"><strong>Important :</strong> Changez votre mot de passe apr\u00e8s votre premi\u00e8re connexion.</p>
      `,
      cta: 'Se connecter',
      ctaUrl: `${SITE}:3000/pirabel-admin-7x9k2m`
    });

    await sendEmail(employee.email, 'Bienvenue chez Pirabel Labs — Vos identifiants', html);

    await Activity.create({
      type: 'employee_invited',
      description: `Invitation envoyee a ${employee.name} (${employee.email})`,
      user: req.user._id,
      relatedModel: 'Employee',
      relatedId: employee._id
    });

    res.json({ success: true, message: `Invitation envoyee a ${employee.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (employee && employee.user) {
      await User.findByIdAndUpdate(employee.user, { isActive: false });
    }
    await Employee.findByIdAndUpdate(req.params.id, { status: 'inactif' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
