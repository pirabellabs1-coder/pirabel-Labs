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

// Socket.io middleware : auth JWT pour les messages admin
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  // Extract token from auth header or cookie
  const token = socket.handshake.auth?.token
    || socket.handshake.headers?.cookie?.match(/token=([^;]+)/)?.[1];
  socket.isAdmin = false;
  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      socket.userId = decoded.id;
      socket.isAdmin = decoded.role === 'admin' || decoded.role === 'employee';
    } catch {}
  }
  next();
});

io.on('connection', (socket) => {
  socket.on('join-conversation', (conversationId) => {
    const sanitized = String(conversationId || '').slice(0, 50);
    if (sanitized) socket.join(sanitized);
  });

  // Visitor message : tout le monde peut emettre
  socket.on('visitor-message', async (data) => {
    try {
      const Message = require('./models/Message');
      const { sanitize, sanitizeEmail } = require('./middleware/security');
      const content = sanitize(data?.content, 1000);
      if (!content) return;
      const msg = await Message.create({
        conversationId: sanitize(data?.conversationId, 50),
        visitorName: sanitize(data?.visitorName || 'Visiteur', 100),
        visitorEmail: sanitizeEmail(data?.visitorEmail || ''),
        sender: 'visitor',
        content
      });
      io.to(msg.conversationId).emit('new-message', msg);
      socket.emit('message-saved', msg);
    } catch (err) {
      console.error('[socket] visitor-message error:', err.message);
      socket.emit('error', { message: 'Message non delivre' });
    }
  });

  // Admin message : SEULEMENT si JWT admin/employee valide (anti-impersonation)
  socket.on('admin-message', async (data) => {
    if (!socket.isAdmin) {
      return socket.emit('error', { message: 'Auth requise' });
    }
    try {
      const Message = require('./models/Message');
      const { sanitize } = require('./middleware/security');
      const conversationId = sanitize(data?.conversationId, 50);
      if (!conversationId) return;
      const msg = await Message.create({
        conversationId,
        sender: 'admin',
        content: sanitize(data?.content, 2000),
        adminUser: socket.userId,
      });
      io.to(conversationId).emit('admin-reply', msg);
    } catch (err) {
      console.error('[socket] admin-message error:', err.message);
      socket.emit('error', { message: 'Message non delivre' });
    }
  });

  socket.on('disconnect', () => {});
});

// Connect to MongoDB
connectDB();

// Security middleware
const { securityHeaders, globalSanitize } = require('./middleware/security');
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
// CORS strict : comparaison exacte (anti pirabellabs.com.attacker.com)
const ALLOWED_SET = new Set(ALLOWED_ORIGINS);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_SET.has(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Trust proxy (Vercel) pour avoir le vrai req.ip (sinon X-Forwarded-For spoofable)
app.set('trust proxy', 1);

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
app.use('/api/v2/admin', require('./routes/admin-api'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/time', require('./routes/time'));
app.use('/api/status', require('./routes/status'));
app.use('/api/outreach', require('./routes/outreach'));
app.use('/api/case-studies', require('./routes/case-studies'));
app.use('/api/lesson-comments', require('./routes/lesson-comments'));
app.use('/api/lms', require('./routes/lms'));

// ============================================
// SECRET ACCESS URLs (Move to .env on production)
// ============================================
const ADMIN_SECRET = process.env.ADMIN_SECRET_PATH || 'admin_x9k2m7v4p8w1n_secure_access_2026';
const CLIENT_SECRET = process.env.CLIENT_SECRET_PATH || 'client_portal_v4p8w1n7x9k2m_access_secure';

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
app.get('/gerer-rendez-vous.html', (req, res) => res.sendFile(path.join(__dirname, 'views', 'gerer-rendez-vous.html')));
app.get('/api-docs', (req, res) => res.sendFile(path.join(__dirname, 'views', 'api-docs.html')));
app.get('/case-studies', (req, res) => res.sendFile(path.join(__dirname, 'views', 'case-studies.html')));
app.get('/lms-students', (req, res) => res.sendFile(path.join(__dirname, 'views', 'lms-students.html')));
app.get('/lms-comments', (req, res) => res.sendFile(path.join(__dirname, 'views', 'lms-comments.html')));

// Espace etudiant : page publique (auth check cote client)
app.get('/mon-espace-eleve', (req, res) => res.sendFile(path.join(__dirname, 'views', 'student-space.html')));
app.get('/student-space', (req, res) => res.sendFile(path.join(__dirname, 'views', 'student-space.html')));

// URLs admin/client : tokens unguessable, multi-paths (env + defaults)
const ADMIN_PATHS = new Set([
  'gestion-v71k4724gxxyrmmb',
  process.env.ADMIN_SECRET_PATH,
].filter(Boolean));
const CLIENT_PATHS = new Set([
  'espace-1oiv0czkgvvm9k',
  process.env.CLIENT_SECRET_PATH,
].filter(Boolean));
ADMIN_PATHS.forEach(p => app.get(`/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html'))));
CLIENT_PATHS.forEach(p => app.get(`/${p}`, (req, res) => res.sendFile(path.join(__dirname, 'views', 'portal-login.html'))));

// Blocked routes - chemins obvious admin renvoient 404 generique (anti-bots)
const BLOCKED = ['/login', '/admin', '/admin-login', '/wp-admin', '/wp-login.php', '/administrator', '/portal-login'];
BLOCKED.forEach(r => app.get(r, (_, res) => res.status(404).send('Not Found')));
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
