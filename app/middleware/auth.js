const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Acces non autorise' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ error: 'Utilisateur invalide' });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
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
