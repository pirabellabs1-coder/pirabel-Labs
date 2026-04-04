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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try { fs.mkdirSync(uploadDir, { recursive: true }); } catch(e) {}
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Type de fichier non autorise'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /api/upload — Upload and return base64 data URL (works on Vercel)
router.post('/', auth, adminOrEmployee, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoye' });

  try {
    // Read the file and return as base64 data URL
    const filePath = path.join(uploadDir, req.file.filename);
    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

    // Clean up temp file
    try { fs.unlinkSync(filePath); } catch(e) {}

    res.json({
      success: true,
      url: dataUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload/multiple
router.post('/multiple', auth, adminOrEmployee, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier envoye' });

  try {
    const files = req.files.map(f => {
      const filePath = path.join(uploadDir, f.filename);
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      try { fs.unlinkSync(filePath); } catch(e) {}
      return {
        url: `data:${f.mimetype};base64,${base64}`,
        filename: f.filename,
        size: f.size
      };
    });
    res.json({ success: true, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
