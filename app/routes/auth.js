const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const Subscriber = require('../models/Subscriber');
const { auth } = require('../middleware/auth');
const { sendOTP } = require('../config/email');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Cet email est deja utilise' });

    const user = await User.create({ name, email, password, role: role || 'client' });
    const token = user.generateToken();

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    user.lastLogin = Date.now();
    await user.save();

    const token = user.generateToken();
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// POST /api/auth/send-otp - Send OTP to email
router.post('/send-otp', async (req, res) => {
  try {
    const { email, purpose = 'register' } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate previous OTPs for this email
    await OTP.updateMany({ email, used: false }, { used: true });

    // Save new OTP
    await OTP.create({ email, code, purpose, expiresAt });

    // Send email
    await sendOTP(email, code);

    res.json({ success: true, message: 'Code envoye par email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp - Verify OTP code
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code, purpose = 'register' } = req.body;

    const otp = await OTP.findOne({
      email,
      code,
      purpose,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) return res.status(400).json({ error: 'Code invalide ou expire' });

    otp.used = true;
    await otp.save();

    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register-with-otp - Register after OTP verification
router.post('/register-with-otp', async (req, res) => {
  try {
    const { name, email, password, otpCode } = req.body;

    // Verify OTP first
    const otp = await OTP.findOne({
      email,
      code: otpCode,
      purpose: 'register',
      used: true, // Must be already verified
      expiresAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) } // Within 10 min of verification
    });

    if (!otp) return res.status(400).json({ error: 'Veuillez verifier votre email d\'abord' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Cet email est deja utilise' });

    const user = await User.create({ name, email, password, role: 'client' });

    // Auto-add to subscribers
    await Subscriber.findOneAndUpdate(
      { email },
      { email, name, type: 'client', source: 'register' },
      { upsert: true }
    );

    const token = user.generateToken();
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password - Request password reset
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'Si ce compte existe, un code a ete envoye' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, code, purpose: 'reset_password', expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
    await sendOTP(email, code);

    res.json({ success: true, message: 'Code envoye par email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password-confirm
router.post('/reset-password-confirm', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const otp = await OTP.findOne({ email, code, purpose: 'reset_password', used: false, expiresAt: { $gt: new Date() } });
    if (!otp) return res.status(400).json({ error: 'Code invalide ou expire' });

    otp.used = true;
    await otp.save();

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouve' });

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Mot de passe mis a jour' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
