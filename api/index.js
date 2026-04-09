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
const { securityHeaders, globalSanitize } = require(path.join(__dirname, '..', 'app', 'middleware', 'security'));
app.use(securityHeaders);
app.use(globalSanitize); // Global XSS protection

// CORS — restrict to known origins
const ALLOWED_ORIGINS = [
  process.env.SITE_URL || 'https://www.pirabellabs.com',
  'https://www.pirabellabs.com',
  'https://pirabellabs.com',
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
app.use('/api/logs', require(path.join(routesPath, 'logs')));
app.use('/api/recruitment', require(path.join(routesPath, 'recruitment')));
app.use('/api/notifications', require(path.join(routesPath, 'notifications')));
app.use('/api/search', require(path.join(routesPath, 'search')));
app.use('/api/tasks', require(path.join(routesPath, 'tasks')));
app.use('/api/appointments', require(path.join(routesPath, 'appointments')));
app.use('/api/v2/admin', require(path.join(routesPath, 'admin-api')));
app.use('/api/quotes', require(path.join(routesPath, 'quotes')));
app.use('/api/deals', require(path.join(routesPath, 'deals')));
app.use('/api/email-templates', require(path.join(routesPath, 'email-templates')));
app.use('/api/time-entries', require(path.join(routesPath, 'time-entries')));
app.use('/api/reviews', require(path.join(routesPath, 'reviews')));
app.use('/api/cron', require(path.join(routesPath, 'cron')));
app.use('/api/status', require(path.join(routesPath, 'status')));

// Secret admin/client URLs (Consistent with server.js)
const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || 'admin_x9k2m7v4p8w1n_secure_access_2026';
const CLIENT_SECRET = process.env.CLIENT_SECRET_PATH || 'client_portal_v4p8w1n7x9k2m_access_secure';

app.get(`/${ADMIN_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get(`/${CLIENT_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'portal-login.html')));

// Portal login route
app.get('/portal-login', (req, res) => res.sendFile(path.join(viewsPath, 'portal-login.html')));

// Dashboard views
const views = ['dashboard', 'clients', 'projects', 'orders', 'employees', 'invoices', 'revenue', 'settings', 'campaigns', 'messages', 'articles', 'analytics', 'portal', 'notes', 'prospects', 'leads', 'logs', 'recruitment', 'candidates', 'tasks', 'calendar', 'quotes', 'pipeline', 'email-templates', 'time-tracking', 'reviews-admin', 'api-docs', 'gerer-rendez-vous'];
views.forEach(v => {
  app.get(`/${v}`, (req, res) => res.sendFile(path.join(viewsPath, `${v}.html`)));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', db: isConnected, timestamp: new Date().toISOString() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: isConnected, timestamp: new Date().toISOString() }));

// SMTP diagnostic endpoint — test connection and env vars
app.get('/api/email-diagnostic', async (req, res) => {
  const nodemailer = require('nodemailer');
  const clean = (v) => (v || '').toString().replace(/[\s\r\n]+$/g, '').replace(/^[\s\r\n]+/, '');
  
  const SMTP_HOST = clean(process.env.SMTP_HOST) || 'smtp-relay.brevo.com';
  const SMTP_PORT = parseInt(clean(process.env.SMTP_PORT)) || 587;
  const SMTP_USER = clean(process.env.SMTP_USER);
  const SMTP_PASS = clean(process.env.SMTP_PASS);
  const FROM_EMAIL = clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com';
  const ADMIN_EMAIL = clean(process.env.ADMIN_EMAIL) || FROM_EMAIL;
  
  const diagnostic = {
    smtp_host: SMTP_HOST,
    smtp_port: SMTP_PORT,
    smtp_user_set: !!SMTP_USER,
    smtp_user_preview: SMTP_USER ? SMTP_USER.substring(0, 8) + '...' : 'NOT SET',
    smtp_pass_set: !!SMTP_PASS,
    smtp_pass_length: SMTP_PASS ? SMTP_PASS.length : 0,
    from_email: FROM_EMAIL,
    admin_email: ADMIN_EMAIL,
    connection_test: null
  };
  
  if (SMTP_USER && SMTP_PASS) {
    try {
      const testTransport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        connectionTimeout: 8000,
        greetingTimeout: 5000,
        tls: { rejectUnauthorized: false }
      });
      await testTransport.verify();
      diagnostic.connection_test = 'SUCCESS — SMTP connected OK';
    } catch (err) {
      diagnostic.connection_test = `FAILED — ${err.code || ''} ${err.message}`;
    }
  } else {
    diagnostic.connection_test = 'SKIPPED — SMTP credentials missing';
  }
  
  res.json(diagnostic);
});


// Admin hard reset endpoint — clears all DB but keeps Ultimauto & Ronan
// Usage: GET /api/admin/hard-reset-db
app.all('/api/admin/hard-reset-db', async (req, res) => {
  try {
    const { auth, adminOnly } = require(path.join(middlewarePath, 'auth'));
    // Ensure admin only (even GET is protected)
    await new Promise((resolve, reject) => auth(req, res, (err) => err ? reject(err) : resolve()));
    if (res.headersSent) return;
    await new Promise((resolve, reject) => adminOnly(req, res, (err) => err ? reject(err) : resolve()));
    if (res.headersSent) return;

    const modelsToKeep = ['ultimauto', 'ronan'];
    const keepRegex = new RegExp(modelsToKeep.join('|'), 'i');

    const Order = require(path.join(modelsPath, 'Order'));
    const Lead = require(path.join(modelsPath, 'Lead'));
    const Client = require(path.join(modelsPath, 'Client'));
    const Quote = require(path.join(modelsPath, 'Quote'));
    const Invoice = require(path.join(modelsPath, 'Invoice'));
    const Project = require(path.join(modelsPath, 'Project'));
    const Task = require(path.join(modelsPath, 'Task'));
    const Revenue = require(path.join(modelsPath, 'Revenue'));
    const Deal = require(path.join(modelsPath, 'Deal'));
    const Appointment = require(path.join(modelsPath, 'Appointment'));

    // Keep IDs
    const ordersToKeep = await Order.find({ $or: [{ name: keepRegex }, { email: keepRegex }] });
    const leadsToKeep = await Lead.find({ $or: [{ 'visitor.name': keepRegex }, { 'visitor.email': keepRegex }] });
    const clientsToKeep = await Client.find({ $or: [{ name: keepRegex }, { email: keepRegex }, { company: keepRegex }] });
    
    const clientIdsToKeep = clientsToKeep.map(c => c._id);
    const quotesToKeep = await Quote.find({ client: { $in: clientIdsToKeep } });
    const invoicesToKeep = await Invoice.find({ client: { $in: clientIdsToKeep } });
    const projectsToKeep = await Project.find({ client: { $in: clientIdsToKeep } });

    // Perform deletions
    const deleted = {
      orders: await Order.deleteMany({ _id: { $nin: ordersToKeep.map(o => o._id) } }),
      leads: await Lead.deleteMany({ _id: { $nin: leadsToKeep.map(l => l._id) } }),
      clients: await Client.deleteMany({ _id: { $nin: clientIdsToKeep } }),
      quotes: await Quote.deleteMany({ _id: { $nin: quotesToKeep.map(q => q._id) } }),
      invoices: await Invoice.deleteMany({ _id: { $nin: invoicesToKeep.map(i => i._id) } }),
      projects: await Project.deleteMany({ _id: { $nin: projectsToKeep.map(p => p._id) } }),
      tasks: await Task.deleteMany({}), // Clear all tasks
      revenue: await Revenue.deleteMany({}), // Wipes revenue counters
      deals: await Deal.deleteMany({}), // Wipes Pipeline CRM
      appointments: await Appointment.deleteMany({}) // Clear Calendar
    };

    res.json({
      success: true,
      message: "Database strongly reset. Kept Ultimauto & Ronan.",
      kept: {
        clients: clientsToKeep.length,
        orders: ordersToKeep.length,
        quotes: quotesToKeep.length,
        invoices: invoicesToKeep.length,
        projects: projectsToKeep.length
      },
      deleted: {
        orders: deleted.orders.deletedCount,
        leads: deleted.leads.deletedCount,
        clients: deleted.clients.deletedCount,
        quotes: deleted.quotes.deletedCount,
        invoices: deleted.invoices.deletedCount,
        projects: deleted.projects.deletedCount,
        tasks: deleted.tasks.deletedCount,
        revenue: deleted.revenue.deletedCount,
        deals: deleted.deals.deletedCount,
        appointments: deleted.appointments.deletedCount,
      }
    });

  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Email diagnostic endpoint
app.get('/api/test-email', async (req, res) => {
  const cleanEnv = (v) => (v || '').toString().replace(/[\s\r\n]+$/g, '').replace(/^[\s\r\n]+/, '');
  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp-relay.brevo.com';
  const port = parseInt(cleanEnv(process.env.SMTP_PORT)) || 587;
  const user = cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(process.env.SMTP_PASS);
  const from = cleanEnv(req.query.from || process.env.FROM_EMAIL) || 'contact@pirabellabs.com';
  const adminEmail = cleanEnv(process.env.ADMIN_EMAIL) || from;
  const to = cleanEnv(req.query.to) || adminEmail;

  // Diagnostic snapshot of what config we're actually using
  const config = {
    host, port,
    secure: port === 465,
    user: user ? (user.slice(0, 4) + '***@' + (user.split('@')[1] || '?')) : '(MANQUANT)',
    passLength: pass ? pass.length : 0,
    from, adminEmail, to
  };

  if (!user || !pass) {
    return res.json({
      success: false,
      error: 'SMTP_USER ou SMTP_PASS manquant dans les variables Vercel',
      config
    });
  }

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host, port,
      secure: port === 465,
      auth: { user, pass },
      debug: true,
      logger: false
    });

    // Verify the connection first (catches most auth errors clearly)
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"Pirabel Labs" <${from}>`,
      to,
      subject: 'Test Email Pirabel Labs — ' + new Date().toISOString(),
      html: '<h1 style="color:#FF5500;">Test Pirabel Labs</h1><p>Email envoye le ' + new Date().toLocaleString('fr-FR') + '</p><p>FROM: ' + from + '</p><p>TO: ' + to + '</p>'
    });
    res.json({
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      config
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      code: err.code,
      command: err.command,
      responseCode: err.responseCode,
      config
    });
  }
});

module.exports = app;
