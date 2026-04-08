const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { auth, adminOnly, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

// GET /api/employees
router.get('/', auth, adminOrEmployee, async (req, res) => {
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

// GET /api/employees/salary-alerts — Get salary payment alerts
router.get('/salary-alerts', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const dayOfMonth = now.getDate();

    const employees = await Employee.find({ status: 'actif', salary: { $gt: 0 } });
    const alerts = [];

    employees.forEach(emp => {
      const paidThisMonth = emp.salaryPayments.some(p =>
        (p.month === currentMonth || p.mois === currentMonth) && (p.status === 'paye' || p.status === 'paid')
      );
      if (!paidThisMonth && dayOfMonth >= (emp.payDay || 5)) {
        const daysLate = dayOfMonth - (emp.payDay || 5);
        alerts.push({
          employeeId: emp._id,
          _id: emp._id,
          name: emp.name,
          employeeName: emp.name,
          salary: emp.salary,
          payDay: emp.payDay || 5,
          daysLate,
          month: currentMonth,
          message: daysLate === 0 ? `Salaire du mois en cours à payer (${emp.salary.toLocaleString('fr-FR')} €)` : `Salaire impayé depuis ${daysLate} jour(s) (${emp.salary.toLocaleString('fr-FR')} €)`,
          severity: daysLate > 5 ? 'haute' : daysLate > 2 ? 'moyenne' : 'basse'
        });
      }
    });

    // Return as array directly (frontend compatibility)
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/employees/:id
router.get('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email lastLogin');
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/employees
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

// POST /api/employees/:id/invite — Send invitation email with credentials
router.post('/:id/invite', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });

    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';

    // Check if user already exists
    const existingUser = await User.findOne({ email: employee.email });
    if (existingUser) {
      employee.user = existingUser._id;
      await employee.save();
      return res.json({ success: true, message: 'Employe deja inscrit, compte lie' });
    }

    // Create user account
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
      title: 'Bienvenue dans l\'équipe !',
      subtitle: 'Pirabel Labs',
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${employee.name},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Vous avez ete ajoute(e) a l'équipe Pirabel Labs en tant que <strong style="color:#e5e2e1;">${employee.role}</strong> dans le departement <strong style="color:#e5e2e1;">${employee.department}</strong>.</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Voici vos identifiants de connexion :</p>
        <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:20px;margin:20px 0;">
          <table width="100%">
            <tr><td style="padding:6px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:6px 0;text-align:right;font-weight:600;">${employee.email}</td></tr>
            <tr><td style="padding:6px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mot de passe</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#FF5500;">${tempPassword}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:rgba(255,180,171,0.8);"><strong>Important :</strong> Changez votre mot de passe apres votre première connexion.</p>
      `,
      cta: 'Se connecter',
      ctaUrl: `${SITE}/pirabel-admin-7x9k2m`
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

// PUT /api/employees/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/employees/:id
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

// POST /api/employees/:id/salary — Record salary payment
router.post('/:id/salary', auth, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employe non trouve' });

    // Support both mois/montant (frontend) and month/amount (legacy)
    const month = req.body.mois || req.body.month;
    const amount = req.body.montant || req.body.amount;
    const notes = req.body.notes || '';

    employee.salaryPayments.push({
      amount: amount || employee.salary,
      mois: month,
      month,
      paidAt: Date.now(),
      paidDate: Date.now(),
      status: 'paye',
      notes
    });
    await employee.save();

    // Record as expense
    const Revenue = require('../models/Revenue');
    await Revenue.create({
      type: 'expense',
      category: 'salaire',
      description: `Salaire ${month} — ${employee.name}`,
      amount: amount || employee.salary,
      date: Date.now()
    });

    res.json({ success: true, employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// (salary-alerts is defined earlier, before /:id, to avoid route conflict)

module.exports = router;
