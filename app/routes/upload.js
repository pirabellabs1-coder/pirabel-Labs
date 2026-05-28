const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminOrEmployee } = require('../middleware/auth');

// Use /tmp on Vercel (serverless), local uploads otherwise
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload directory exists
try { fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) {}

const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) {}
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 8);
    // Filename = uniquement crypto random + extension (anti-collision + anti-traversal)
    const rand = crypto.randomBytes(8).toString('hex');
    cb(null, `${rand}-${Date.now()}${ext}`);
  }
});

// SVG retire (vecteur XSS stockee). PDF garde mais valide magic-bytes apres upload.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME.has(file.mimetype) && ALLOWED_EXT.has(ext)) cb(null, true);
  else cb(new Error('Type de fichier non autorise'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB (anti-OOM lambda)
    files: 5,                    // max 5 fichiers/requete
  }
});

// Validation magic-bytes apres upload (le mimetype client est spoofable)
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png':  [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif':  [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],  // RIFF (suivi de WEBP a offset 8)
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],  // %PDF
};

function validateMagicBytes(filePath, mimetype) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    const signatures = MAGIC_BYTES[mimetype] || [];
    return signatures.some(sig => sig.every((byte, i) => buf[i] === byte));
  } catch {
    return false;
  }
}

// POST /api/upload — Upload + validation magic-bytes
router.post('/', auth, adminOrEmployee, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoye' });

  const filePath = path.join(uploadDir, req.file.filename);
  try {
    // Validation magic-bytes (le mimetype client est spoofable)
    if (!validateMagicBytes(filePath, req.file.mimetype)) {
      try { fs.unlinkSync(filePath); } catch {}
      return res.status(400).json({ error: 'Contenu fichier ne matche pas le type declare' });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    try { fs.unlinkSync(filePath); } catch(e) {}

    res.json({
      success: true,
      url: dataUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    try { fs.unlinkSync(filePath); } catch {}
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload/multiple
router.post('/multiple', auth, adminOrEmployee, upload.array('files', 5), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier envoye' });

  try {
    const files = [];
    for (const f of req.files) {
      const filePath = path.join(uploadDir, f.filename);
      if (!validateMagicBytes(filePath, f.mimetype)) {
        try { fs.unlinkSync(filePath); } catch {}
        return res.status(400).json({ error: `Fichier rejete: ${f.originalname} (signature invalide)` });
      }
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      try { fs.unlinkSync(filePath); } catch(e) {}
      files.push({
        url: `data:${f.mimetype};base64,${base64}`,
        filename: f.filename,
        size: f.size
      });
    }
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
