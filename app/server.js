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
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('visitor-message', async (data) => {
    const Message = require('./models/Message');
    const msg = await Message.create({
      conversationId: data.conversationId,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      sender: 'visitor',
      content: data.content
    });
    io.emit('new-message', msg);
    socket.emit('message-saved', msg);
  });

  socket.on('admin-message', async (data) => {
    const Message = require('./models/Message');
    const msg = await Message.create({
      conversationId: data.conversationId,
      sender: 'admin',
      content: data.content,
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

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
