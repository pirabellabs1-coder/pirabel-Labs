/**
 * Fix 3 issues across all admin views:
 * 1. Remove the `n syntax error in script tags
 * 2. Replace hardcoded sidebar HTML with <nav class="sidebar-nav"></nav> (sidebar.js will populate it)
 * 3. Fix carrieres.html: var(--primary) -> #FF5500 for hero span
 */

const fs = require('fs');
const path = require('path');

const viewsDir = 'c:/Pirabel Labs/temp_repo/app/views';
let count = 0;

// Fix admin views: backtick-n bug + keep nav empty for sidebar.js injection
fs.readdirSync(viewsDir).forEach(file => {
  if (!file.endsWith('.html')) return;
  const fp = path.join(viewsDir, file);
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // Fix backtick n bug: `n<script -> \n<script
  content = content.replace(/`n<script/g, '\n<script');
  content = content.replace(/`n /g, '\n ');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    count++;
    console.log(`Fixed: ${file}`);
  }
});

// Fix carrieres.html public site - change var(--primary) to #FF5500 for spans in hero
const publicFiles = [
  'c:/Pirabel Labs/temp_repo/carrieres.html',
  'c:/Pirabel Labs/temp_repo/avis.html',
  'c:/Pirabel Labs/temp_repo/resultats.html',
  'c:/Pirabel Labs/temp_repo/a-propos.html',
  'c:/Pirabel Labs/temp_repo/status.html',
];

publicFiles.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;

  // In hero h1 span color: var(--primary) should be #FF5500
  content = content.replace(/\.hero-careers h1 span\{color:var\(--primary\);\}/g, '.hero-careers h1 span{color:#FF5500;}');
  content = content.replace(/\.hero-careers h1 span\{color:var\(--primary\)\}/g, '.hero-careers h1 span{color:#FF5500}');
  // Also fix job-type and job-cta colors
  content = content.replace(/color:var\(--primary\);/g, 'color:#FF5500;');

  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    count++;
    console.log(`Fixed public: ${path.basename(fp)}`);
  }
});

console.log(`\nTotal files fixed: ${count}`);
