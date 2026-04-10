const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    // Ignore non-public html folders
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git') && !file.includes('api') && !file.includes('app')) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.html') && !file.includes('node_modules') && !file.includes('.git') && !file.includes('api') && !file.includes('app')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Pirabel Labs/temp_repo');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove any and all variations of avis links
  content = content.replace(/<a href="\/avis"[^>]*>AVIS<\/a>/gi, '');
  content = content.replace(/<a href="\/avis"[^>]*>Avis<\/a>/gi, '');

  // 2. Add precisely to Desktop Nav
  content = content.replace(/(<a href="\/?r[eé]sultats"[^>]*>RÉSULTATS<\/a>)/g, '$1<a href="/avis" class="link-underline">AVIS</a>');
  
  // 3. Add precisely to Mobile Nav
  content = content.replace(/(<a href="\/?r[eé]sultats"[^>]*>Résultats<\/a>)/g, '$1<a href="/avis">Avis</a>');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Cleaned up ${count} HTML files.`);
