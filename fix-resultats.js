const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('\\.git') && !fullPath.includes('/api') && !fullPath.includes('\\api') && !fullPath.includes('/app') && !fullPath.includes('\\app')) {
          results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.html') && !fullPath.includes('node_modules') && !fullPath.includes('\\.git') && !fullPath.includes('\\api') && !fullPath.includes('\\app')) {
          results.push(fullPath);
        }
      } catch(e) {}
    });
  } catch(e) {}
  return results;
}

const files = walk('c:/Pirabel Labs/temp_repo');
let count = 0;
let issues = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Fix accented résultats URLs → /resultats
  const before = content;
  content = content.replace(/href=["']\/r[ée]sultats["']/g, 'href="/resultats"');
  content = content.replace(/href=['"]\/r[ée]sultats['"]>/g, 'href="/resultats">');

  // Fix: RÉSULTATS links that might use wrong href
  // ensure RÉSULTATS nav links all point to /resultats (no accent in URL)
  content = content.replace(/href="\/r\u00e9sultats"/g, 'href="/resultats"');

  // Also fix avis nav: make sure AVIS points to /avis correctly
  // Fix double Avis issue: if there are two avis links after Résultats, remove one
  // Pattern: >RÉSULTATS</a><a href="/avis" ...>AVIS</a><a href="/avis" ...>AVIS</a>
  content = content.replace(/(<a href="\/avis"[^>]*>AVIS<\/a>)\s*(<a href="\/avis"[^>]*>AVIS<\/a>)/gi, '$1');
  content = content.replace(/(<a href="\/avis"[^>]*>Avis<\/a>)\s*(<a href="\/avis"[^>]*>Avis<\/a>)/gi, '$1');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
    issues.push(path.basename(file));
  }
});

console.log(`Fixed ${count} HTML files.`);
if (issues.length) console.log('Files fixed:', issues.join(', '));
