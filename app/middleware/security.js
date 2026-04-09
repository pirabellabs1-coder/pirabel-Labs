/* ========================================================================
   PIRABEL LABS — Security Middleware
   Rate limiting, input sanitization, honeypot, security headers
   ======================================================================== */

// --- SECURITY HEADERS ---
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  next();
}

// --- IN-MEMORY RATE LIMITER ---
const rateLimitStore = new Map();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore) {
    if (now - data.windowStart > data.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function rateLimit({ windowMs = 60000, max = 10, message = 'Trop de requetes. Reessayez plus tard.', keyPrefix = 'rl' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const key = keyPrefix + ':' + ip;
    const now = Date.now();

    let entry = rateLimitStore.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 0, windowStart: now, windowMs };
      rateLimitStore.set(key, entry);
    }

    entry.count++;

    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }

    next();
  };
}

// --- INPUT SANITIZATION ---
function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[<>"'`;(){}]/g, '')       // Remove dangerous characters
    .replace(/javascript:/gi, '')       // Block javascript: protocol
    .replace(/on\w+\s*=/gi, '')         // Block inline event handlers
    .trim()
    .slice(0, maxLen);
}

function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  return email.replace(/[<>"'`;(){}]/g, '').trim().toLowerCase().slice(0, 254);
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email) && email.length <= 254;
}

// --- HONEYPOT CHECK ---
// If the hidden honeypot field has a value, it's a bot
function honeypotCheck(fieldName = 'website_url') {
  return (req, res, next) => {
    if (req.body && req.body[fieldName]) {
      // Bot detected — return success silently (don't reveal detection)
      return res.json({ success: true, message: 'Merci !' });
    }
    next();
  };
}

// --- REQUEST SIZE LIMITER ---
function limitBody(maxFields = 20) {
  return (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      const keys = Object.keys(req.body);
      if (keys.length > maxFields) {
        return res.status(400).json({ error: 'Requete invalide' });
      }
    }
    next();
  };
}

// --- GLOBAL RECURSIVE SANITIZATION ---
function globalSanitize(req, res, next) {
  const sanitizeValue = (val) => {
    if (typeof val === 'string') return sanitize(val, 10000);
    if (val && typeof val === 'object') {
      for (let k in val) {
        val[k] = sanitizeValue(val[k]);
      }
    }
    return val;
  };

  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}

module.exports = {
  securityHeaders,
  rateLimit,
  sanitize,
  sanitizeEmail,
  isValidEmail,
  honeypotCheck,
  limitBody,
  globalSanitize
};
