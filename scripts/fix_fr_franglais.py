"""Fix Franglais (EN words) in FR pages — titles, meta descriptions, body."""
from pathlib import Path
import re
import os

REPLACEMENTS = [
    # Most specific first
    (r'\bAgence Content\b', 'Agence Rédaction'),
    (r'\bContent Marketing\b', 'Marketing de Contenu'),
    (r'\bContent\b(?! Marketing)', 'Contenu'),
    (r'\bAbout Us\b', 'À Propos'),
    (r'\bFree Audit\b', 'Audit Gratuit'),
    (r'\bPrivacy Policy\b', 'Politique de Confidentialité'),
    (r'\bContact Us\b', 'Nous Contacter'),
]

SKIP_DIRS = ('node_modules', 'admin', 'portal', 'client_portal', 'pirabel-admin')

count_files = 0
count_replacements = 0
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
    new = content
    file_count = 0
    for pattern, replacement in REPLACEMENTS:
        new2, n = re.subn(pattern, replacement, new)
        if n > 0:
            file_count += n
            new = new2
    if file_count > 0:
        f.write_text(new, encoding='utf-8')
        count_files += 1
        count_replacements += file_count
        print(f"  {s}: {file_count} replacements")

print(f"\nTotal: {count_replacements} replacements in {count_files} files")
