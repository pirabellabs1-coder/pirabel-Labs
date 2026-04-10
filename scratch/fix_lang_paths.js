const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else if (file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('.');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Remplacements ciblés
    content = content.replace(/\/public\/js\/language-manager\.js/g, '/js/language-manager.js');
    content = content.replace(/\.\.\/public\/js\/language-manager\.js/g, '/js/language-manager.js');
    content = content.replace(/\.\.\/app\/public\/js\/language-manager\.js/g, '/js/language-manager.js');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nSuccess: ${count} files updated.`);
