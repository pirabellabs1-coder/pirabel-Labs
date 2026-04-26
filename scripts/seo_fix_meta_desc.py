"""
Smart meta description truncation for descriptions > 160 chars.

Strategy:
- Target 155 chars max (Google shows ~155-160 in SERP)
- Cut at last sentence (.!?) before 155 if available
- Otherwise cut at last word boundary before 155
- Always end with proper punctuation or "…"
"""
import re, os
from pathlib import Path

DESC_RE = re.compile(
    r'(<meta\s+name=["\']description["\']\s+content=)("([^"]*)"|\'([^\']*)\')',
    re.I
)

MAX_LEN = 155


def truncate_smart(desc: str) -> str:
    """Cut to ≤155 chars at sentence or word boundary."""
    if len(desc) <= 160:
        return desc
    cut = desc[:MAX_LEN]
    # Try sentence boundary (last . ! ? before MAX_LEN)
    for sep in ['. ', '! ', '? ']:
        idx = cut.rfind(sep)
        if idx > MAX_LEN - 60:  # only if reasonably close to end
            return cut[:idx + 1]
    # Try word boundary
    idx = cut.rfind(' ')
    if idx > MAX_LEN - 30:
        return cut[:idx].rstrip(' ,;:-') + '…'
    # Hard fallback (shouldn't happen)
    return cut.rstrip() + '…'


sitemap_raw = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap_raw)
public_files = set()
for u in locs:
    rel = u.lstrip('/').rstrip('/')
    for c in ([rel + '.html', rel + '/index.html'] if rel else ['index.html']):
        if Path(c).exists():
            public_files.add(c.replace(os.sep, '/'))


def html_escape_attr(s: str) -> str:
    """Escape for use inside an HTML attribute value (quote already chosen)."""
    return s.replace('&', '&amp;').replace('"', '&quot;').replace("'", '&#39;')


fixed = 0
for f in sorted(public_files):
    p = Path(f)
    content = p.read_text(encoding='utf-8')
    m = DESC_RE.search(content)
    if not m:
        continue
    quote = '"' if m.group(2) and m.group(2).startswith('"') else "'"
    desc = m.group(3) if m.group(3) is not None else m.group(4)
    if not desc or len(desc) <= 160:
        continue
    new_desc = truncate_smart(desc)
    # Replace
    if quote == '"':
        new_attr = f'content="{new_desc.replace(chr(34), "&quot;")}"'
    else:
        new_attr = f"content='{new_desc.replace(chr(39), '&#39;')}'"
    new_full = m.group(1) + new_attr
    new_content = content[:m.start()] + new_full + content[m.end():]
    if new_content != content:
        p.write_text(new_content, encoding='utf-8')
        fixed += 1

print(f"Truncated meta descriptions in {fixed} files")
