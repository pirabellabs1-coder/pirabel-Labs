import re, os
from pathlib import Path

ALT_RE = re.compile(r'<link\s+rel=["\']alternate["\']\s+hreflang=["\']([^"\']+)["\']\s+href=["\']([^"\']+)["\']\s*/?>', re.I)
SKIP = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n', 'Projet A')

found_broken = []
for f in Path('.').rglob("*.html"):
    s = str(f).replace(os.sep, '/')
    if any(x in s for x in SKIP):
        continue
    content = f.read_text(encoding='utf-8', errors='ignore')
    for m in ALT_RE.finditer(content):
        lang, url = m.group(1), m.group(2)
        if 'pirabellabs.com' not in url:
            continue
        path = url.split('pirabellabs.com')[1].split('?')[0].split('#')[0].rstrip('/')
        if not path or path == '/':
            continue
        rel = path.lstrip('/')
        candidates = [rel, rel + '.html', rel + '/index.html']
        if rel.endswith('.html'):
            stripped = rel[:-5]
            candidates.extend([stripped + '.html', stripped + '/index.html'])
        if any(Path(c).exists() for c in candidates):
            continue
        found_broken.append((s, lang, url))

print(f"Truly broken hreflang alternates: {len(found_broken)}")
for f, lang, url in found_broken[:30]:
    print(f"  {f} -> hreflang={lang} -> {url}")
