const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const crypto = require('crypto');

// Garde-fou : crash explicite au boot si JWT_SECRET manquant en prod
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
    const token = req.cookies.token || authHeader?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ error: 'Acces non autorise' });

    // 1. Essayer l'authentification par Clé API (si le token commence par pb_live_)
    if (token.startsWith('pb_live_')) {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const apiKeyDoc = await ApiKey.findOne({ key: hash, isActive: true }).populate('user');
      
      if (!apiKeyDoc || !apiKeyDoc.user || !apiKeyDoc.user.isActive) {
        return res.status(401).json({ error: 'Cle API invalide ou inactive' });
      }

      // Mettre à jour la date de dernière utilisation
      apiKeyDoc.lastUsed = new Date();
      await apiKeyDoc.save();

      req.user = apiKeyDoc.user;
      req.isApiKey = true; // Flag pour savoir que c'est une requête API
      return next();
    }

    // 2. Sinon, authentification JWT classique (algos lockes, issuer verifie)
    try {
      const decoded = jwt.verify(token, JWT_SECRET, JWT_OPTS);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return res.status(401).json({ error: 'Utilisateur invalide' });

      req.user = user;
      next();
    } catch (jwtErr) {
      return res.status(401).json({ error: 'Token invalide' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur lors de l\'authentification' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acces admin requis' });
  next();
};

const adminOrEmployee = (req, res, next) => {
  if (!['admin', 'employee'].includes(req.user.role)) return res.status(403).json({ error: 'Acces non autorise' });
  next();
};

// Employee restricted: can read but not delete/manage finance
const employeeRestricted = (action) => (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role !== 'employee') return res.status(403).json({ error: 'Acces non autorise' });

  const blocked = ['delete_client', 'delete_project', 'manage_employees', 'view_revenue', 'send_campaign', 'manage_settings'];
  if (blocked.includes(action)) {
    return res.status(403).json({ error: 'Action non autorisee pour les employes' });
  }
  next();
};

module.exports = { auth, adminOnly, adminOrEmployee, employeeRestricted };
