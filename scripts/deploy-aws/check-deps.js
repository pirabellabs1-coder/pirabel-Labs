// Vérifie que le paquet Lambda assemblé est complet et portable vers Linux :
//  1. chaque module externe requis par api/, app/ et lambda.js se résout depuis le dossier de staging ;
//  2. aucun module natif (.node) compilé sous Windows n'est embarqué ;
//  3. les require relatifs vers app/models respectent la casse exacte des fichiers (Linux est sensible à la casse).
// Usage : node check-deps.js <dossier-de-staging>
const fs = require('fs');
const path = require('path');
const { builtinModules } = require('module');

const root = path.resolve(process.argv[2] || '.');
const builtins = new Set(builtinModules.flatMap((m) => [m, 'node:' + m]));
// Fournis par le runtime Lambda nodejs22.x (SDK AWS v3), inutile de les embarquer.
const runtimeProvided = (name) => name.startsWith('@aws-sdk/');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = [path.join(root, 'lambda.js'), ...walk(path.join(root, 'api')), ...walk(path.join(root, 'app'))];
const re = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
const errors = [];

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(re)) {
    const spec = m[1];
    const rel = path.relative(root, file);
    if (spec.startsWith('.')) {
      // Casse exacte : on compare au nom réel du fichier dans son dossier.
      const target = path.resolve(path.dirname(file), spec);
      const candidates = [target, target + '.js', target + '.json', path.join(target, 'index.js')];
      const hit = candidates.find((c) => fs.existsSync(c));
      if (!hit) { errors.push(`${rel} : require('${spec}') introuvable`); continue; }
      const real = fs.readdirSync(path.dirname(hit));
      if (!real.includes(path.basename(hit))) errors.push(`${rel} : require('${spec}') — casse différente du fichier réel (plantera sous Linux)`);
      continue;
    }
    const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
    if (builtins.has(spec) || builtins.has(name) || runtimeProvided(name)) continue;
    try { require.resolve(spec, { paths: [root] }); }
    catch { errors.push(`${rel} : module '${spec}' absent du paquet (ajouter à lambda-package.json)`); }
  }
}

function findNative(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) findNative(p, out);
    else if (e.name.endsWith('.node')) out.push(path.relative(root, p));
  }
  return out;
}
const nm = path.join(root, 'node_modules');
for (const n of fs.existsSync(nm) ? findNative(nm) : []) errors.push(`module natif Windows embarqué : ${n} (incompatible Lambda Linux arm64)`);

if (errors.length) {
  console.error('ÉCHEC de la vérification du paquet :\n  - ' + [...new Set(errors)].join('\n  - '));
  process.exit(1);
}
console.log(`OK : ${files.length} fichiers JS vérifiés, dépendances résolues, aucun module natif.`);
