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

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve dashboard static files
app.use('/public', express.static(path.join(__dirname, '..', 'app', 'public')));

// Connect to DB before every request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Load models path fix for Vercel
const modelsPath = path.join(__dirname, '..', 'app', 'models');
const configPath = path.join(__dirname, '..', 'app', 'config');
const routesPath = path.join(__dirname, '..', 'app', 'routes');
const middlewarePath = path.join(__dirname, '..', 'app', 'middleware');
const viewsPath = path.join(__dirname, '..', 'app', 'views');

// Override require paths for the app modules
const Module = require('module');
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) {
  // Redirect relative requires from routes to the app directory
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

// Secret admin/client URLs
const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m';
const CLIENT_SECRET = process.env.CLIENT_SECRET_PATH || 'espace-client-4p8w1n';

app.get(`/${ADMIN_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get(`/${CLIENT_SECRET}`, (req, res) => res.sendFile(path.join(viewsPath, 'portal-login.html')));

// Dashboard views
const views = ['dashboard', 'clients', 'projects', 'orders', 'employees', 'invoices', 'revenue', 'settings', 'campaigns', 'messages', 'articles', 'analytics', 'portal'];
views.forEach(v => {
  app.get(`/${v}`, (req, res) => res.sendFile(path.join(viewsPath, `${v}.html`)));
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: isConnected }));

module.exports = app;
