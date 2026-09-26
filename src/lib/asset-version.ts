/** Empreinte courte du contenu d'un fichier public : /js/x.js?v=<empreinte> (cache d'un an sans risque). */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map<string, string>();
export function assetVersion(relPath: string): string {
  let v = cache.get(relPath);
  if (!v) {
    v = createHash('sha256').update(readFileSync(join(process.cwd(), relPath))).digest('hex').slice(0, 10);
    cache.set(relPath, v);
  }
  return v;
}
