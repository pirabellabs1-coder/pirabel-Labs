const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BACKEND = 'http://localhost:10000';
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.pdf': 'application/pdf'
};

http.createServer((req, res) => {
  const fullUrl = req.url;
  const urlPath = fullUrl.split('?')[0].split('#')[0];

  // Serve /public/* from app/public/
  if (urlPath.startsWith('/public/')) {
    const pubPath = path.join(ROOT, 'app', urlPath);
    if (fs.existsSync(pubPath)) {
      const ext = path.extname(pubPath);
      const mime = MIME[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime + (mime.startsWith('text') ? '; charset=utf-8' : ''), 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(pubPath));
      return;
    }
  }

  // Proxy /api/* to backend
  if (urlPath.startsWith('/api/')) {
    const proxyUrl = BACKEND + fullUrl;
    const proxyReq = http.request(proxyUrl, { method: req.method, headers: req.headers }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end('{"error":"Backend unavailable"}');
    });
    req.pipe(proxyReq);
    return;
  }

  let url = urlPath;
  if (url.endsWith('/')) url += 'index.html';

  let filePath = path.join(ROOT, url);

  if (!path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) filePath += '.html';
    else if (fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 Not Found</h1><p>' + url + '</p>');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  const content = fs.readFileSync(filePath);
  res.writeHead(200, {
    'Content-Type': mime + (mime.startsWith('text') ? '; charset=utf-8' : ''),
    'Cache-Control': 'no-cache'
  });
  res.end(content);
}).listen(PORT, () => {
  console.log('Dev server: http://localhost:' + PORT + ' (proxy API -> ' + BACKEND + ')');
});
