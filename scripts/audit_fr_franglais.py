"""Find FR pages with Franglais (English words) in <title> or meta description."""
import re
import os
from pathlib import Path

EN_WORDS = [
    'Agency', 'Content', 'Marketing Strategy', 'Privacy Policy', 'Free Audit',
    'About Us', 'Contact Us', 'Premium Digital', 'Custom', 'Local',
    'Optimization', 'Performance', 'Web Design', 'Service'
]

SKIP_DIRS = ('node_modules', 'admin', 'portal', 'client_portal', 'pirabel-admin')
title_re = re.compile(r'<title>([^<]*)</title>', re.I)

bad = []
for f in Path('.').rglob('*.html'):
    s = str(f).replace(os.sep, '/')
    if any(x in s for x in SKIP_DIRS):
        continue
    if 'Projet A' in s:
        continue
    if s.startswith('en/'):
        continue
    content = f.read_text(encoding='utf-8', errors='ignore')
    if 'lang="fr"' not in content[:500]:
        continue
    m = title_re.search(content)
    if not m:
        continue
    title = m.group(1)
    issues = []
    for w in EN_WORDS:
        if re.search(r'\b' + re.escape(w) + r'\b', title, re.I):
            issues.append(w)
    if issues:
        bad.append((s, title, issues))

print(f"FR pages with English words in <title>: {len(bad)}\n")
for s, t, w in bad[:30]:
    print(f"  {s}")
    print(f"    title: {t}")
    print(f"    words: {w}")
if len(bad) > 30:
    print(f"\n  ... and {len(bad)-30} more")
