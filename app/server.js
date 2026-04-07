require('dotenv').config();
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

// Socket.io for real-time chat
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: ['https://www.pirabellabs.com', 'https://pirabellabs.com', 'http://localhost:8080', 'http://localhost:10000'], methods: ['GET', 'POST'] } });
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('visitor-message', async (data) => {
    const Message = require('./models/Message');
    const { sanitize, sanitizeEmail } = require('./middleware/security');
    const content = sanitize(data.content, 1000);
    if (!content) return;
    const msg = await Message.create({
      conversationId: sanitize(data.conversationId, 50),
      visitorName: sanitize(data.visitorName || 'Visiteur', 100),
      visitorEmail: sanitizeEmail(data.visitorEmail || ''),
      sender: 'visitor',
      content
    });
    io.emit('new-message', msg);
    socket.emit('message-saved', msg);
  });

  socket.on('admin-message', async (data) => {
    const Message = require('./models/Message');
    const { sanitize } = require('./middleware/security');
    const msg = await Message.create({
      conversationId: sanitize(data.conversationId, 50),
      sender: 'admin',
      content: sanitize(data.content, 2000),
      adminUser: data.adminUserId
    });
    io.to(data.conversationId).emit('admin-reply', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Connect to MongoDB
connectDB();

// Security middleware
const { securityHeaders } = require('./middleware/security');
app.use(securityHeaders);

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
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return callback(null, true);
    callback(null, false);
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/campaigns', require('./routes/email'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/prospects', require('./routes/prospects'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/search', require('./routes/search'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/appointments', require('./routes/appointments'));

// ============================================
// SECRET ACCESS URLs
// Admin:  /pirabel-admin-7x9k2m
// Client: /espace-client-4p8w1n
// ============================================

const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m';
const CLIENT_SECRET = process.env.CLIENT_SECRET_PATH || 'espace-client-4p8w1n';

// Admin login (secret URL)
app.get(`/${ADMIN_SECRET}`, (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));

// Client portal login (secret URL)
app.get(`/${CLIENT_SECRET}`, (req, res) => res.sendFile(path.join(__dirname, 'views', 'portal-login.html')));

// Dashboard pages
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'views', 'dashboard.html')));
app.get('/clients', (req, res) => res.sendFile(path.join(__dirname, 'views', 'clients.html')));
app.get('/projects', (req, res) => res.sendFile(path.join(__dirname, 'views', 'projects.html')));
app.get('/orders', (req, res) => res.sendFile(path.join(__dirname, 'views', 'orders.html')));
app.get('/employees', (req, res) => res.sendFile(path.join(__dirname, 'views', 'employees.html')));
app.get('/invoices', (req, res) => res.sendFile(path.join(__dirname, 'views', 'invoices.html')));
app.get('/revenue', (req, res) => res.sendFile(path.join(__dirname, 'views', 'revenue.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, 'views', 'settings.html')));
app.get('/campaigns', (req, res) => res.sendFile(path.join(__dirname, 'views', 'campaigns.html')));
app.get('/messages', (req, res) => res.sendFile(path.join(__dirname, 'views', 'messages.html')));
app.get('/portal', (req, res) => res.sendFile(path.join(__dirname, 'views', 'portal.html')));
app.get('/articles', (req, res) => res.sendFile(path.join(__dirname, 'views', 'articles.html')));
app.get('/analytics', (req, res) => res.sendFile(path.join(__dirname, 'views', 'analytics.html')));
app.get('/leads', (req, res) => res.sendFile(path.join(__dirname, 'views', 'leads.html')));
app.get('/logs', (req, res) => res.sendFile(path.join(__dirname, 'views', 'logs.html')));
app.get('/notes', (req, res) => res.sendFile(path.join(__dirname, 'views', 'notes.html')));
app.get('/prospects', (req, res) => res.sendFile(path.join(__dirname, 'views', 'prospects.html')));
app.get('/recruitment', (req, res) => res.sendFile(path.join(__dirname, 'views', 'recruitment.html')));
app.get('/candidates', (req, res) => res.sendFile(path.join(__dirname, 'views', 'candidates.html')));
app.get('/tasks', (req, res) => res.sendFile(path.join(__dirname, 'views', 'tasks.html')));
app.get('/calendar', (req, res) => res.sendFile(path.join(__dirname, 'views', 'calendar.html')));

// Blocked routes
app.get('/login', (req, res) => res.status(404).send('Page non trouvee'));
app.get('/', (req, res) => res.status(404).send('Page non trouvee'));

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

const PORT = parseInt(process.env.PORT) || 10000;
server.listen(PORT, '0.0.0.0', () => console.log(`Serveur Pirabel Labs Admin sur port ${PORT}`));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
