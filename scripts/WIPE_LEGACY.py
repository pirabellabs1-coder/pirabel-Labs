#!/usr/bin/env python3
"""WIPE LEGACY - script destructif executé une seule fois pour pivot strategique.

Conserve UNIQUEMENT les fichiers strictement necessaires au backend minimal
+ design tokens reutilisables. Tout le reste est supprime (formations, blog,
guides, pages services par ville, /en/, recrutement, LMS, etc).

Safety net : tout est dans la branche `legacy/full-site-pre-pivot` sur GitHub.
"""
import os
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# === WHITELIST : fichiers/dossiers a conserver ===
KEEP_FILES = {
    # Git config
    '.gitignore', '.gitattributes', '.git',
    # Vercel
    'vercel.json',
    # Node
    'package.json', 'package-lock.json',
    'node_modules',  # npm regenere si besoin
    # Middleware Edge
    'middleware.js',
    # Docs
    'README.md', 'CLAUDE.md',
    # Marker
    '.vercel',
}

KEEP_DIRS_FULL = {
    '.git', 'node_modules', '.vercel',
}

# Fichiers specifiques a conserver dans des sous-dossiers
KEEP_PATHS = {
    # API entry
    'api/index.js',
    'api/package.json',
    # Backend core
    'app/server.js',
    'app/models/User.js',
    'app/models/Lead.js',  # nouveau model leads simplifie (existe deja)
    'app/middleware/auth.js',
    'app/middleware/security.js',
    'app/config/db.js',
    'app/config/email.js',
    # Images essentielles
    'img/logo.png',
    'img/logo.webp',
    'img/logo.avif',
    'img/favicon.png',
    'img/og-image.png',
    'img/og-image.webp',
    # CSS base : on garde pour avoir les tokens, sera reduit ensuite
    'css/global.css',
    # Scripts essentiels
    'js/global.js',
    'js/config.js',
    # CE script lui-meme + ses logs
    'scripts/WIPE_LEGACY.py',
}

# Extensions a supprimer absolument (sauf si dans KEEP_PATHS)
DELETE_EXT = {'.html', '.htm', '.xml', '.md', '.txt', '.bat', '.sh', '.bak'}


def is_kept(path: Path) -> bool:
    """Determine si on conserve ce path."""
    rel = path.relative_to(ROOT).as_posix()
    parts = path.relative_to(ROOT).parts

    # Tout node_modules (top-level OU imbrique) : npm regenere mais on evite
    # de tout reinstaller pour rien. Aussi : preserve les deps d'app/server.js.
    if 'node_modules' in parts:
        return True
    # Preserve .git everywhere
    if '.git' in parts:
        return True
    # Top-level keep
    if rel in KEEP_FILES or (parts and parts[0] in KEEP_FILES):
        return True
    # Explicit paths
    if rel in KEEP_PATHS:
        return True
    # Top-level dirs to keep in entirety
    if parts and parts[0] in KEEP_DIRS_FULL:
        return True
    return False


def main(dry_run=False):
    deleted_files = []
    deleted_dirs = []
    kept = []

    # Phase 1 : supprimer les fichiers (deepest first pour vider les dirs)
    for p in sorted(ROOT.rglob('*'), key=lambda x: -len(x.parts)):
        if not p.exists():
            continue
        if p == ROOT:
            continue
        parts = p.relative_to(ROOT).parts
        rel = p.relative_to(ROOT).as_posix()

        # Hard-skip si node_modules ou .git n'importe ou dans le chemin
        if 'node_modules' in parts or '.git' in parts:
            continue

        if p.is_file():
            if is_kept(p):
                kept.append(rel)
            else:
                if not dry_run:
                    try:
                        p.unlink()
                    except Exception as e:
                        print(f'[err] unlink {rel}: {e}')
                deleted_files.append(rel)
        elif p.is_dir():
            try:
                if not any(p.iterdir()):
                    if not dry_run:
                        p.rmdir()
                    deleted_dirs.append(rel)
            except Exception:
                pass

    print(f'=== WIPE LEGACY ' + ('(DRY RUN)' if dry_run else '(EXECUTED)') + ' ===')
    print(f'Files deleted : {len(deleted_files)}')
    print(f'Dirs deleted  : {len(deleted_dirs)}')
    print(f'Files kept    : {len(kept)}')
    print()
    print('=== KEPT FILES ===')
    for k in sorted(kept):
        print(f'  {k}')
    if len(deleted_files) > 20:
        print()
        print('=== SAMPLE DELETED (first 20) ===')
        for d in deleted_files[:20]:
            print(f'  -{d}')
        print(f'  ... and {len(deleted_files) - 20} more')


if __name__ == '__main__':
    dry = '--dry' in sys.argv or '--dry-run' in sys.argv
    if not dry:
        print('!!! DESTRUCTIVE OPERATION !!!')
        print('Use --dry first to preview.')
        if '--yes' not in sys.argv:
            print('Add --yes to actually execute.')
            sys.exit(1)
    main(dry_run=dry)
