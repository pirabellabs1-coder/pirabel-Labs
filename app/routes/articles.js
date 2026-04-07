const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const Subscriber = require('../models/Subscriber');
const Activity = require('../models/Activity');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

// GET /api/articles - Public: list published articles
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12, status } = req.query;
    const query = {};
    if (status === 'draft') query.status = 'draft';
    else query.status = 'published';
    if (category && category !== 'all') query.category = category;

    const articles = await Article.find(query)
      .populate('author', 'name')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-content');
    const total = await Article.countDocuments(query);

    res.json({ articles, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/admin - Admin: list all articles (draft + published)
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const articles = await Article.find()
      .populate('author', 'name')
      .sort({ updatedAt: -1 });
    res.json({ articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/:slug - Public: get single article
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: 'published' })
      .populate('author', 'name');
    if (!article) return res.status(404).json({ error: 'Article non trouve' });

    // Increment views
    article.views += 1;
    await article.save();

    // Get related articles
    const related = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      category: article.category
    }).limit(3).select('title slug excerpt category readingTime');

    res.json({ article, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/articles - Admin: create article
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const article = await Article.create({ ...req.body, author: req.user._id });

    // If publishing, notify subscribers
    if (req.body.status === 'published') {
      article.publishedAt = Date.now();
      await article.save();
      notifySubscribers(article);

      await Activity.create({
        type: 'article_published',
        description: `Article publie : ${article.title}`,
        user: req.user._id,
        relatedModel: 'Article',
        relatedId: article._id
      });
    }

    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/articles/:id - Admin: update article
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article non trouve' });

    const wasNotPublished = article.status !== 'published';
    Object.assign(article, req.body);

    // If just published, set publishedAt and notify
    if (wasNotPublished && req.body.status === 'published') {
      article.publishedAt = Date.now();
      await article.save();
      notifySubscribers(article);

      await Activity.create({
        type: 'article_published',
        description: `Article publie : ${article.title}`,
        user: req.user._id,
        relatedModel: 'Article',
        relatedId: article._id
      });
    } else {
      await article.save();
    }

    res.json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/articles/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/articles/stats/popular - Top articles by views
router.get('/stats/popular', async (req, res) => {
  try {
    const popular = await Article.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(5)
      .select('title slug views category');
    res.json({ popular });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notify all active subscribers about new article
async function notifySubscribers(article) {
  try {
    const subscribers = await Subscriber.find({ isActive: true });
    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';

    const categoryLabels = { seo: 'SEO', web: 'Web', ia: 'IA', ads: 'Ads', social: 'Social', design: 'Design', video: 'Video', email: 'Email', content: 'Content', cro: 'CRO', general: 'Actualites' };

    for (const sub of subscribers) {
      const html = masterTemplate({
        headerType: 'banner',
        preheader: `Nouvel article : ${article.title}`,
        title: 'Nouvel Article',
        body: `
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${sub.name || 'cher abonne'},</p>
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Nous venons de publier un nouvel article sur notre blog :</p>
          <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:24px 0;">
            <span style="background:rgba(255,85,0,0.15);color:#FF5500;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${categoryLabels[article.category] || 'Blog'}</span>
            <h2 style="margin:12px 0 8px;font-size:22px;font-weight:700;color:#e5e2e1;">${article.title}</h2>
            <p style="margin:0;font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">${article.excerpt}</p>
            <p style="margin:12px 0 0;font-size:12px;color:rgba(229,226,225,0.3);">${article.readingTime} min de lecture</p>
          </div>
        `,
        cta: 'Lire l\'article',
        ctaUrl: `${SITE}/blog-article.html?slug=${article.slug}`
      });

      sendEmail(sub.email, `Nouvel article : ${article.title}`, html).catch(() => {});
    }
    console.log(`Notification sent to ${subscribers.length} subscribers for article: ${article.title}`);
  } catch (err) {
    console.error('Notify subscribers error:', err.message);
  }
}

module.exports = router;
