"""Find broken internal links on public site (excluding admin SPA)."""
import re, os, json
from pathlib import Path

SKIP_DIRS = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n',
             'Projet A', 'pirabel-admin', 'app/views', 'app\\views')

vercel = json.load(open('vercel.json'))
api_routes = set()
REGEX_CHARS = set("()[]^$|+*?\\")
for r in vercel.get('routes', []):
    src = r.get('src', '')
    dest = r.get('dest', '')
    if dest == '/api/index.js':
        if src.startswith('/') and not any(c in REGEX_CHARS for c in src):
            api_routes.add(src.lstrip('/'))

sitemap = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap)
public_paths = set(u.rstrip('/').lstrip('/') for u in locs)

href_re = re.compile(r'href=["\']([^"\'#?]+)["\']')
broken = {}

for f in Path('.').rglob("*.html"):
    s = str(f).replace(os.sep, '/')
    if any(x in s for x in SKIP_DIRS):
        continue
    src_dir = str(f.parent).replace(os.sep, '/')
    if src_dir == '.': src_dir = ''
    content = f.read_text(encoding='utf-8', errors='ignore')
    for m in href_re.finditer(content):
        href = m.group(1).strip()
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:', '#', '${')):
            continue
        if href.startswith('/'):
            target = href.lstrip('/')
        else:
            target = (src_dir + '/' + href) if src_dir else href
            parts = []
            for p in target.split('/'):
                if p == '..':
                    if parts: parts.pop()
                elif p and p != '.': parts.append(p)
            target = '/'.join(parts)
        target = target.rstrip('/')
        if not target:
            continue
        if target in api_routes or target.startswith('api/'):
            continue
        candidates = [target, target + '.html', target + '/index.html']
        if target.endswith('.html'):
            stripped = target[:-5]
            candidates.extend([stripped, stripped + '/index.html'])
        if any(Path(c).exists() for c in candidates):
            continue
        if target in public_paths:
            continue
        broken.setdefault(s, set()).add(href)

print(f"Files with broken links (public site): {len(broken)}")
print(f"Total broken hrefs: {sum(len(v) for v in broken.values())}\n")

for f, hrefs in sorted(broken.items(), key=lambda x: -len(x[1]))[:20]:
    print(f"  {f}: {len(hrefs)} broken")
    for h in sorted(hrefs)[:6]:
        print(f"    {h}")
