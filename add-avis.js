const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
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

  // Add AVIS right after RÉSULTATS
  if (!content.includes('href="/avis"')) {
    // Desktop Nav
    content = content.replace(/(<a href="\/?r[eé]sultats"[^>]*>RÉSULTATS<\/a>)/gi, '$1<a href="/avis" class="link-underline">AVIS</a>');
    
    // Mobile Nav
    content = content.replace(/(<a href="\/?r[eé]sultats"[^>]*>R[eé]sultats<\/a>)/gi, '$1<a href="/avis">Avis</a>');
  }

  // Check if "L'AGENCE" should be "ACCUEIL" in index.html, user requested "on ne vois pas avis" in "acceuil", but maybe "ACCUEIL" was the expected nav link.
  // The screenshot shows "ACCUEIL". Let's standardize L'AGENCE to ACCUEIL in index.html
  if (file.endsWith('index.html')) {
    content = content.replace(/>L'AGENCE<\/a>/g, '>ACCUEIL</a>');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});

console.log(`Updated ${count} HTML files.`);
