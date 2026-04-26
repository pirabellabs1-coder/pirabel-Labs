"""Fix asset paths on EN articles 2-levels-deep using ../ instead of ../../."""
from pathlib import Path
import os

candidates = list(Path('en/blog').glob('*.html')) + list(Path('en/guides').glob('*.html'))
fixed = []

REPLACEMENTS = [
    ('href="../css/', 'href="../../css/'),
    ('href="../img/', 'href="../../img/'),
    ('src="../img/', 'src="../../img/'),
    ('src="../js/', 'src="../../js/'),
    ('src="../public/', 'src="../../public/'),
    ('href="../public/', 'href="../../public/'),
]

for f in candidates:
    if f.stem == 'index':
        continue
    content = f.read_text(encoding='utf-8')
    new = content
    for old, replacement in REPLACEMENTS:
        new = new.replace(old, replacement)
    if new != content:
        f.write_text(new, encoding='utf-8')
        fixed.append(str(f).replace(os.sep, '/'))

print(f"Fixed asset paths in {len(fixed)} files:")
for x in fixed:
    print(f"  {x}")
