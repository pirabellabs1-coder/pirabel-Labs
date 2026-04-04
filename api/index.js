const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB (singleton)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB error:', err.message);
  }
}

// Security middleware
const { securityHeaders } = require(path.join(__dirname, '..', 'app', 'middleware', 'security'));
app.use(securityHeaders);

// CORS — restrict to known origins
const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://pirabellabs.com',
  'https://www.pirabellabs.com',
  'http://localhost:8080',
  'http://localhost:10000',
  'http://127.0.0.1:8080'
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Serve dashboard static files
app.use('/public', express.static(path.join(__dirname, '..', 'app', 'public')));

// Connect to DB before every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Load paths for Vercel
const modelsPath = path.join(__dirname, '..', 'app', 'models');
const configPath = path.join(__dirname, '..', 'app', 'config');
const routesPath = path.join(__dirname, '..', 'app', 'routes');
const middlewarePath = path.join(__dirname, '..', 'app', 'middleware');
const viewsPath = path.join(__dirname, '..', 'app', 'views');

// Override require paths for the app modules
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) {
  if (request.startsWith('../models/')) {
    return originalResolve.call(this, path.join(modelsPath, request.replace('../models/', '')), parent, ...args);
  }
  if (request.startsWith('../config/')) {
    return originalResolve.call(this, path.join(configPath, request.replace('../config/', '')), parent, ...args);
  }
  if (request.startsWith('../middleware/')) {
    return originalResolve.call(this, path.join(middlewarePath, request.replace('../middleware/', '')), parent, ...args);
  }
  return originalResolve.call(this, request, parent, ...args);
};

// API Routes
app.use('/api/auth', require(path.join(routesPath, 'auth')));
app.use('/api/clients', require(path.join(routesPath, 'clients')));
app.use('/api/projects', require(path.join(routesPath, 'projects')));
app.use('/api/orders', require(path.join(routesPath, 'orders')));
app.use('/api/employees', require(path.join(routesPath, 'employees')));
app.use('/api/invoices', require(path.join(routesPath, 'invoices')));
app.use('/api/dashboard', require(path.join(routesPath, 'dashboard')));
app.use('/api/campaigns', require(path.join(routesPath, 'email')));
app.use('/api/chat', require(path.join(routesPath, 'chat')));
app.use('/api/articles', require(path.join(routesPath, 'articles')));
app.use('/api/analytics', require(path.join(routesPath, 'analytics')));
app.use('/api/upload', require(path.join(routesPath, 'upload')));
app.use('/api/settings', require(path.join(routesPath, 'settings')));
app.use('/api/notes', require(path.join(routesPath, 'notes')));
app.use('/api/prospects', require(path.join(routesPath, 'prospects')));
app.use('/api/revenue', require(path.join(routesPath, 'revenue')));

// Secret admin/client URLs
const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m';
const CLIENT_SECRET = process.env.CLIENT_SECRET_PATH || 'espace-client-4p8w1n';

app.get(`/${ADMIN_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get(`/${CLIENT_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'portal-login.html')));

// Portal login route
app.get('/portal-login', (req, res) => res.sendFile(path.join(viewsPath, 'portal-login.html')));

// Dashboard views
const views = ['dashboard', 'clients', 'projects', 'orders', 'employees', 'invoices', 'revenue', 'settings', 'campaigns', 'messages', 'articles', 'analytics', 'portal', 'notes', 'prospects'];
views.forEach(v => {
  app.get(`/${v}`, (req, res) => res.sendFile(path.join(viewsPath, `${v}.html`)));
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: isConnected }));


// Email diagnostic endpoint
app.get('/api/test-email', async (req, res) => {
  const to = req.query.to;
  const from = req.query.from || process.env.FROM_EMAIL;
  if (!to) return res.json({ error: 'Ajoutez ?to=email@example.com' });
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      debug: true,
      logger: false
    });
    const info = await transporter.sendMail({
      from: `"Pirabel Labs" <${from}>`,
      to,
      subject: 'Test Email Pirabel Labs — ' + new Date().toISOString(),
      html: '<h1 style="color:#FF5500;">Test Pirabel Labs</h1><p>Email envoye le ' + new Date().toLocaleString('fr-FR') + '</p><p>FROM: ' + from + '</p><p>TO: ' + to + '</p>'
    });
    res.json({ success: true, messageId: info.messageId, response: info.response, accepted: info.accepted, rejected: info.rejected, from });
  } catch (err) {
    res.json({ success: false, error: err.message, code: err.code, command: err.command, responseCode: err.responseCode, from });
  }
});

module.exports = app;
