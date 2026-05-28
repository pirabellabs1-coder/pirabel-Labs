#!/usr/bin/env python3
"""Subset Material Symbols : collecte les icones utilisees + remplace l'URL par version subset.

Avant : charge tout Material Symbols (~150KB)
Apres : charge seulement les icones utilisees (~10-15KB)

Gain FCP : 300-500ms.
"""
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts'}

# Pattern HTML : capture icon_name DANS un span material-symbols-outlined
# Compatible avec class="material-symbols-outlined" suivi de tous attributs (style, etc)
ICON_PATTERN_HTML = re.compile(
    r'class\s*=\s*"[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z_0-9]+)\s*<',
    re.IGNORECASE,
)
# Pattern JS : icon: 'name' dans sidebar.js / autres
ICON_PATTERN_JS = re.compile(r'icon\s*:\s*[\'"]([a-z_0-9]+)[\'"]')

# 1. Collecter tous les icones utilises (HTML + JS)
counter = Counter()
for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    for match in ICON_PATTERN_HTML.findall(text):
        counter[match] += 1

# Scan JS files (sidebar.js, etc) for icons defined as `icon: 'name'`
for p in list(ROOT.rglob('js/*.js')) + list(ROOT.rglob('app/public/js/*.js')) + list(ROOT.rglob('app/views/*.html')):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    for match in ICON_PATTERN_JS.findall(text):
        counter[match] += 1

# Ajout manuel des icones critiques (fail-safe)
FAILSAFE_ICONS = [
    'search', 'notifications', 'logout', 'flag', 'menu', 'close', 'arrow_back',
    'arrow_forward', 'arrow_upward', 'arrow_downward', 'check', 'check_circle',
    'error', 'warning', 'info', 'edit', 'delete', 'save', 'add', 'remove',
    'visibility', 'visibility_off', 'lock', 'lock_open', 'person', 'people',
    'mail', 'send', 'phone', 'home', 'settings', 'help', 'more_vert', 'more_horiz',
    'expand_more', 'expand_less', 'chevron_left', 'chevron_right', 'refresh',
    'download', 'upload', 'cloud', 'star', 'favorite', 'share', 'link', 'print',
    'calendar_today', 'event', 'access_time', 'schedule', 'history',
    'folder', 'folder_open', 'description', 'article', 'attach_file',
    'shopping_cart', 'payment', 'receipt_long', 'analytics', 'trending_up',
    'trending_down', 'bar_chart', 'pie_chart', 'show_chart', 'dashboard',
    'inbox', 'forum', 'chat', 'comment', 'thumb_up', 'thumb_down',
    'verified', 'security', 'shield', 'badge', 'key',
    'school', 'work', 'business', 'campaign', 'monitoring',
    'task_alt', 'view_kanban', 'request_quote', 'sticky_note_2',
    'group_add', 'person_add', 'person_search', 'work_history',
    'tune', 'filter_alt', 'sort', 'open_in_new', 'language',
]
for icon in FAILSAFE_ICONS:
    counter[icon] += 1  # garanti dans le subset

icons = sorted(counter.keys())
print(f"Icones uniques: {len(icons)}")
print(f"Total occurrences: {sum(counter.values())}")
print()
print("Top 20:")
for icon, count in counter.most_common(20):
    print(f"  {icon}: {count}")

# 2. Construire l'URL Google Fonts subset
# Format: ?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=icon1,icon2,...
icon_names = ','.join(icons)
new_url = (
    f"https://fonts.googleapis.com/css2?"
    f"family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    f"&icon_names={icon_names}"
    f"&display=swap"
)

# 3. Remplacer dans les HTML (inclut app/views/ cette fois)
OLD_URL_PATTERN = re.compile(
    r'https://fonts\.googleapis\.com/css2\?family=Material\+Symbols\+Outlined[^"\']*'
)

print(f"\nNouvelle URL: {len(new_url)} chars")
if len(new_url) > 2000:
    print(f"!!! URL trop longue ({len(new_url)} > 2000).")
    print(f"Solution: passer en chargement complet (sans icon_names) sur les pages admin.")
else:
    count = 0
    # IMPORTANT : inclure aussi app/views/ pour ne pas casser le dashboard
    for p in list(ROOT.rglob('*.html')):
        if any(part in EXCLUDE for part in p.parts):
            continue
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        if 'Material+Symbols+Outlined' not in text:
            continue
        new_text = OLD_URL_PATTERN.sub(new_url, text)
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            count += 1

    print(f"\nPages mises a jour: {count}")
    (ROOT / 'scripts' / 'material-icons-used.txt').write_text(
        '\n'.join(icons), encoding='utf-8'
    )
    print(f"Liste icones: scripts/material-icons-used.txt")
