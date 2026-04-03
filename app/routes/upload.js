const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { auth, adminOrEmployee } = require('../middleware/auth');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// POST /api/upload - Upload single image
router.post('/', auth, adminOrEmployee, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier envoye' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename, size: req.file.size });
});

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', auth, adminOrEmployee, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Aucun fichier envoye' });
  const files = req.files.map(f => ({ url: `/uploads/${f.filename}`, filename: f.filename, size: f.size }));
  res.json({ success: true, files });
});

module.exports = router;
