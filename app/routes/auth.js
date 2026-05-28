const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const Subscriber = require('../models/Subscriber');
const { auth } = require('../middleware/auth');
const { sendOTP } = require('../config/email');

// Anti-NoSQL injection: force string + lowercase + trim
const cleanEmail = (v) => String(v || '').toLowerCase().trim().slice(0, 254);
const cleanStr = (v) => String(v || '').trim().slice(0, 500);
// Crypto-secure 6-digit OTP
const genOTP = () => String(crypto.randomInt(100000, 1000000));
// Cookie config commun
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
// In-memory rate-limit (best-effort; pour prod Vercel utiliser Upstash KV)
const attempts = new Map();
const checkRate = (key, max = 5, windowMs = 15 * 60 * 1000) => {
  const now = Date.now();
  const rec = attempts.get(key) || { count: 0, reset: now + windowMs };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + windowMs; }
  rec.count++;
  attempts.set(key, rec);
  return rec.count <= max;
};

// POST /api/auth/register
// POST /api/auth/register - DESACTIVE (spam). Utiliser /register-with-otp uniquement.
router.post('/register', (_req, res) => {
  return res.status(410).json({ error: 'Endpoint desactive. Utilisez /api/auth/send-otp puis /api/auth/register-with-otp.' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    // Brute-force protection (5 essais / 15min par email + IP)
    const rateKey = 'login:' + email + ':' + (req.ip || 'unknown');
    if (!checkRate(rateKey, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de tentatives. Reessayez dans 15 minutes.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    user.lastLogin = Date.now();
    await user.save();

    const token = user.generateToken();
    res.cookie('token', token, COOKIE_OPTS);
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
    const email = cleanEmail(req.body.email);
    const purpose = cleanStr(req.body.purpose) || 'register';
    if (!email) return res.status(400).json({ error: 'Email requis' });

    // Rate-limit (3 OTP par 15min par email pour anti-spam)
    if (!checkRate('otp:' + email, 3, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de demandes. Reessayez dans 15 minutes.' });
    }

    const code = genOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.updateMany({ email, used: false }, { used: true });
    await OTP.create({ email, code, purpose, expiresAt });
    await sendOTP(email, code);

    res.json({ success: true, message: 'Code envoye par email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp - Verify OTP code
router.post('/verify-otp', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    const code = cleanStr(req.body.code).slice(0, 6);
    const purpose = cleanStr(req.body.purpose) || 'register';
    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Code invalide' });

    // Brute-force OTP (5 essais max par email)
    if (!checkRate('verify:' + email, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de tentatives. Demandez un nouveau code.' });
    }

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
    const email = cleanEmail(req.body.email);
    const name = cleanStr(req.body.name);
    const password = String(req.body.password || '');
    const otpCode = cleanStr(req.body.otpCode).slice(0, 6);
    if (!email || !name || password.length < 8 || !/^\d{6}$/.test(otpCode)) {
      return res.status(400).json({ error: 'Champs invalides' });
    }

    const otp = await OTP.findOne({
      email,
      code: otpCode,
      purpose: 'register',
      used: true,
      expiresAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) }
    });

    if (!otp) return res.status(400).json({ error: 'Veuillez verifier votre email d\'abord' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Cet email est deja utilise' });

    const user = await User.create({ name, email, password, role: 'client' });

    await Subscriber.findOneAndUpdate(
      { email },
      { email, name, type: 'client', source: 'register' },
      { upsert: true }
    );

    const token = user.generateToken();
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password - Request password reset
router.post('/reset-password', async (req, res) => {
  try {
    const email = cleanEmail(req.body.email);
    if (!email) return res.json({ success: true, message: 'Si ce compte existe, un code a ete envoye' });

    // Anti-spam : 3 reset par 15min par email
    if (!checkRate('reset:' + email, 3, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de demandes. Reessayez dans 15 minutes.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: true, message: 'Si ce compte existe, un code a ete envoye' });

    const code = genOTP();
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
    const email = cleanEmail(req.body.email);
    const code = cleanStr(req.body.code).slice(0, 6);
    const newPassword = String(req.body.newPassword || '');
    if (!email || !/^\d{6}$/.test(code) || newPassword.length < 8) {
      return res.status(400).json({ error: 'Champs invalides (password min 8)' });
    }

    // Brute-force OTP confirm (5 essais max)
    if (!checkRate('confirm:' + email, 5, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Trop de tentatives. Demandez un nouveau code.' });
    }

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
