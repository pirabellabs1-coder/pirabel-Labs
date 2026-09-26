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

// --- IN-MEMORY RATE LIMITER (best-effort sur serverless) ---
// Note: sur Vercel multi-instance, ce store n'est PAS partage entre lambdas.
// Pour une protection forte, migrer vers Upstash Redis ou @vercel/kv.
const rateLimitStore = new Map();

// Cleanup paresseux : tous les N hits on purge les entrees expirees.
// Evite le setInterval module-load qui fuit en serverless.
let cleanupCounter = 0;
function maybeCleanup() {
  if (++cleanupCounter < 200) return;
  cleanupCounter = 0;
  const now = Date.now();
  for (const [key, data] of rateLimitStore) {
    if (now - data.windowStart > data.windowMs * 2) {
      rateLimitStore.delete(key);
    }
  }
}

function rateLimit({ windowMs = 60000, max = 10, message = 'Trop de requetes. Reessayez plus tard.', keyPrefix = 'rl' } = {}) {
  return (req, res, next) => {
    maybeCleanup();
    // Apres app.set('trust proxy', 1), req.ip est fiable (vrai client IP via X-Forwarded-For)
    const ip = req.ip || 'unknown';
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
// Strict : pour donnees affichees (commentaires, noms, etc) hors champs riches.
// Retire les balises « <…> » en temps LINÉAIRE (même effet que /<[^>]*>/g, dont le coût
// devenait quadratique sur une chaîne remplie de « < » sans « > » : ReDoS possible).
function stripTags(str) {
  let out = '';
  let i = 0;
  while (i < str.length) {
    const lt = str.indexOf('<', i);
    if (lt < 0) { out += str.slice(i); break; }
    const gt = str.indexOf('>', lt + 1);
    if (gt < 0) { out += str.slice(i); break; } // plus aucun « > » : inutile de chercher plus loin
    out += str.slice(i, lt);
    i = gt + 1;
  }
  return out;
}

function sanitize(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  // Borne le travail avant tout traitement (le résultat est de toute façon tronqué à maxLen).
  return stripTags(str.slice(0, maxLen * 2 + 200))  // Strip HTML tags
    .replace(/javascript:/gi, '')       // Block javascript: protocol
    .replace(/on\w+\s*=/gi, '')         // Block inline event handlers
    .trim()
    .slice(0, maxLen);
}
// Soft : pour champs riches (markdown articles, mots de passe avec caracteres speciaux).
// N'enleve que <> et controle long.
function sanitizeSoft(str, maxLen = 10000) {
  if (typeof str !== 'string') return '';
  return str.replace(/<script[\s\S]*?<\/script>/gi, '').slice(0, maxLen);
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
// Whitelist : routes admin (articles, templates) bypass car contenu riche legitime.
const SKIP_GLOBAL_SANITIZE = [
  '/api/admin/articles',   // contenu HTML enrichi (sanitize cible appliquee dans la route)
  '/api/admin/case-studies', // contenu HTML enrichi
  '/api/admin/media',      // upload image base64 (long) — sinon tronque a 10000 car. -> image corrompue
  '/api/admin/quotes',     // envoi de devis avec piece jointe base64 (meme piege que /media)
  '/api/admin/send-email', // message libre
  '/api/admin/email-preview', // aperçu : même texte qu'à l'envoi (échappé ou sanitizeSoft dans la route)
  '/api/admin/leads/bulk-email', // campagnes : HTML autorisé (sanitizeSoft dans la route)
  '/api/articles',         // markdown editorial
  '/api/email-templates',  // HTML templates
  '/api/case-studies',     // markdown
  '/api/auth/login',       // mot de passe peut contenir ' ; etc
  '/api/auth/register',
  '/api/auth/register-with-otp',
  '/api/auth/reset-password-confirm',
];

function globalSanitize(req, res, next) {
  if (SKIP_GLOBAL_SANITIZE.some(p => req.path.startsWith(p))) {
    return next();
  }
  // Anti NoSQL injection : strip operateurs Mongo si l'objet contient $...
  // Profondeur bornée : un JSON imbriqué sur des milliers de niveaux ferait déborder la pile.
  const MAX_DEPTH = 20;
  const stripMongo = (obj, depth = 0) => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const k of Object.keys(obj)) {
      if (k.startsWith('$') || k.includes('.')) {
        delete obj[k];
      } else if (typeof obj[k] === 'object') {
        if (depth >= MAX_DEPTH) delete obj[k];
        else stripMongo(obj[k], depth + 1);
      }
    }
    return obj;
  };
  const sanitizeValue = (val, depth = 0) => {
    if (typeof val === 'string') return sanitize(val, 10000);
    if (val && typeof val === 'object') {
      if (depth >= MAX_DEPTH) return undefined;
      stripMongo(val);
      for (let k in val) {
        val[k] = sanitizeValue(val[k], depth + 1);
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
  stripTags,
  securityHeaders,
  rateLimit,
  sanitize,
  sanitizeSoft,
  sanitizeEmail,
  isValidEmail,
  honeypotCheck,
  limitBody,
  globalSanitize
};
