#!/usr/bin/env python3
"""Add proper hreflang alternate links to FR and EN pages for SEO."""
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))
DOMAIN = "https://www.pirabellabs.com"

def get_url_path(rel_path):
    """Convert file path to URL path."""
    p = rel_path.replace('\\', '/').replace('.html', '').replace('/index', '')
    if p == 'index':
        return ''
    return p

def add_hreflang_to_fr():
    """Add hreflang=en alternate to FR pages."""
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
            url_path = get_url_path(rel_path)

            with open(path, 'r', encoding='utf-8', errors='replace') as fh:
                content = fh.read()

            # Check if already has en hreflang
            if 'hreflang="en" href="' + DOMAIN + '/en/' in content:
                continue

            # Add EN alternate after existing hreflang or canonical
            en_url = f'{DOMAIN}/en/{url_path}'
            en_tag = f'    <link rel="alternate" hreflang="en" href="{en_url}">\n'

            # Insert after last hreflang or after canonical
            if 'hreflang=' in content:
                # Add after last hreflang line
                lines = content.split('\n')
                last_hreflang_idx = -1
                for i, line in enumerate(lines):
                    if 'hreflang=' in line:
                        last_hreflang_idx = i
                if last_hreflang_idx >= 0:
                    lines.insert(last_hreflang_idx + 1, en_tag.rstrip())
                    content = '\n'.join(lines)
            elif '<link rel="canonical"' in content:
                content = content.replace('<link rel="canonical"', en_tag + '<link rel="canonical"', 1)

            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1
    return count

count = add_hreflang_to_fr()
print(f"Added hreflang to {count} FR pages")
