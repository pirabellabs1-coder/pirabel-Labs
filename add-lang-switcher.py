#!/usr/bin/env python3
"""Add FR/EN language switcher to all public HTML pages (both FR and EN versions)."""
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))

# CSS for the language switcher (minimal, fits the dark theme)
SWITCHER_CSS = """
<style>
.lang-switch{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;gap:0;border:1px solid rgba(255,85,0,.4);background:rgba(10,10,10,.9);backdrop-filter:blur(10px);font-family:'Space Grotesk',sans-serif;}
.lang-switch a{padding:.5rem .85rem;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:rgba(255,255,255,.5);transition:all .2s;}
.lang-switch a:hover{color:#fff;}
.lang-switch a.active{background:#FF5500;color:#fff;}
</style>
"""

def get_en_path(fr_rel_path):
    """Get the /en/ equivalent path for a FR page."""
    return '/en/' + fr_rel_path.replace('\\', '/')

def get_fr_path(en_rel_path):
    """Get the FR equivalent path for an EN page (strip the en/ prefix)."""
    return '/' + en_rel_path.replace('\\', '/')

def add_switcher_to_fr_pages():
    """Add switcher to all French pages pointing to /en/ equivalents."""
    skip_dirs = {'app', 'en', 'node_modules', '.git', 'espace-client-4p8w1n',
                 'pirabel-admin-7x9k2m', 'api', 'Projet A', 'projet claude B'}
    skip_files = {'Projet A.html'}
    count = 0

    for root, dirs, files in os.walk(BASE):
        rel_root = os.path.relpath(root, BASE)
        if rel_root != '.' and rel_root.split(os.sep)[0] in skip_dirs:
            continue
        dirs[:] = [d for d in dirs if d not in skip_dirs]

        for f in files:
            if not f.endswith('.html') or f in skip_files:
                continue
            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, BASE)
            en_href = get_en_path(rel_path)

            with open(path, 'r', encoding='utf-8', errors='replace') as fh:
                content = fh.read()

            # Skip if already has switcher
            if 'lang-switch' in content:
                continue

            # Add CSS before </head>
            content = content.replace('</head>', SWITCHER_CSS + '</head>', 1)

            # Add switcher HTML before </body>
            switcher = f'\n<div class="lang-switch"><a href="#" class="active">FR</a><a href="{en_href}">EN</a></div>\n'
            content = content.replace('</body>', switcher + '</body>', 1)

            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

    return count

def add_switcher_to_en_pages():
    """Add switcher to all English pages pointing to FR equivalents."""
    en_dir = os.path.join(BASE, 'en')
    count = 0

    for root, dirs, files in os.walk(en_dir):
        for f in files:
            if not f.endswith('.html'):
                continue
            path = os.path.join(root, f)
            rel_path = os.path.relpath(path, en_dir)
            fr_href = '/' + rel_path.replace('\\', '/')
            if fr_href == '/index.html':
                fr_href = '/'

            with open(path, 'r', encoding='utf-8', errors='replace') as fh:
                content = fh.read()

            if 'lang-switch' in content:
                continue

            content = content.replace('</head>', SWITCHER_CSS + '</head>', 1)

            switcher = f'\n<div class="lang-switch"><a href="{fr_href}">FR</a><a href="#" class="active">EN</a></div>\n'
            content = content.replace('</body>', switcher + '</body>', 1)

            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

    return count

fr_count = add_switcher_to_fr_pages()
en_count = add_switcher_to_en_pages()
print(f"Added switcher to {fr_count} FR pages and {en_count} EN pages")
