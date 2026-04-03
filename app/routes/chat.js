const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/chat/conversations - List all conversations (admin)
router.get('/conversations', auth, adminOrEmployee, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$conversationId',
        visitorName: { $first: '$visitorName' },
        visitorEmail: { $first: '$visitorEmail' },
        lastMessage: { $first: '$content' },
        lastSender: { $first: '$sender' },
        lastDate: { $first: '$createdAt' },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ['$sender', 'visitor'] }, { $eq: ['$read', false] }] }, 1, 0] } },
        messageCount: { $sum: 1 }
      }},
      { $sort: { lastDate: -1 } }
    ]);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/messages/:conversationId - Get messages for a conversation
router.get('/messages/:conversationId', auth, adminOrEmployee, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .limit(100);
    // Mark visitor messages as read
    await Message.updateMany(
      { conversationId: req.params.conversationId, sender: 'visitor', read: false },
      { read: true }
    );
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/message - Send message (public for visitor, auth for admin)
router.post('/message', async (req, res) => {
  try {
    const { conversationId, visitorName, visitorEmail, content, sender } = req.body;
    const message = await Message.create({
      conversationId: conversationId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      visitorName: visitorName || 'Visiteur',
      visitorEmail: visitorEmail || '',
      sender: sender || 'visitor',
      content
    });

    // Emit to socket.io if available
    if (req.app.get('io')) {
      req.app.get('io').emit('new-message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/admin-reply - Admin reply to conversation
router.post('/admin-reply', auth, adminOrEmployee, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const message = await Message.create({
      conversationId,
      sender: 'admin',
      content,
      adminUser: req.user._id
    });

    if (req.app.get('io')) {
      req.app.get('io').to(conversationId).emit('admin-reply', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/unread-count
router.get('/unread-count', auth, adminOrEmployee, async (req, res) => {
  try {
    const count = await Message.countDocuments({ sender: 'visitor', read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
