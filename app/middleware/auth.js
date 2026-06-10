const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Garde-fou : crash explicite en prod si JWT_SECRET manquant
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET env var missing in production');
  }
  console.warn('[WARN] JWT_SECRET missing — using dev fallback (DO NOT use in production)');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-production';
const JWT_OPTS = { algorithms: ['HS256'], issuer: 'pirabel-labs' };

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = (req.cookies && req.cookies.token) || (authHeader && authHeader.replace('Bearer ', ''));
    if (!token) return res.status(401).json({ error: 'Acces non autorise' });
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET, JWT_OPTS);
    } catch (e) {
      return res.status(401).json({ error: 'Token invalide ou expire' });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Utilisateur invalide' });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur authentification' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Acces admin requis' });
  next();
};

module.exports = { auth, adminOnly };
