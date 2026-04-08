const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.vercel')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.html')) results.push(file);
    }
  });
  return results;
}

const htmlFiles = walk(__dirname);
let changedFiles = 0;

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Gérer index.html
  content = content.replace(/href="([^"]*)\/index\.html"/g, 'href="$1/"');
  content = content.replace(/href="index\.html"/g, 'href="/"');

  // 2. Gérer tous les autres .html dans les liens internes (ne commençant pas par http)
  // et en ne modifiant pas les liens externes
  content = content.replace(/href="((?!http)[^"]+)\.html"/g, 'href="$1"');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log('✅ ' + changedFiles + ' fichiers corrigés (Urls propres sans .html)');
