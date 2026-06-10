/**
 * Pirabel Labs - serveur local de dev (mirror de api/index.js pour Vercel).
 *
 * Usage : node app/server.js
 * URL   : http://localhost:10000
 *
 * NOTE : en production, c'est api/index.js qui est invoque par Vercel.
 * Ce fichier sert UNIQUEMENT au developpement local.
 */
require('dotenv').config();
const express = require('express');
const path = require('path');

// Reutilise toute la logique du serverless handler
const apiApp = require('../api/index');

const app = express();

// Serve static files (HTML, CSS, JS, images) from project root
const ROOT = path.join(__dirname, '..');
app.use(express.static(ROOT, {
  extensions: ['html'],
  index: 'index.html',
}));

// Toutes les routes /api/* + admin views deleguent au handler partage
app.use(apiApp);

// Fallback : 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT, '404.html'), (err) => {
    if (err) res.status(404).send('404 Not Found');
  });
});

const PORT = parseInt(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Pirabel Labs serveur local sur http://localhost:' + PORT);
  console.log('Admin login : http://localhost:' + PORT + '/pirabel-admin-7x9k2m');
});

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err.message));
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err && err.message));
