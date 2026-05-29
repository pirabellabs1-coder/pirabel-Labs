#!/usr/bin/env python3
"""Integration des fichiers content_<slug>.py produits par l armee trainer.

1. Scanne scripts/formations/content_<slug>.py
2. Pour chaque fichier ayant un contenu valide (variable PYVAR non vide),
   l ajoute au dict DETAILED_CONTENT de build.py
3. Re-execute build.py
"""
import importlib
import re
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from catalog import FORMATIONS


def slug_to_pyvar(slug):
    return slug.upper().replace('-', '_') + '_MODULES'


def slug_to_pyfile(slug):
    return 'content_' + slug.replace('-', '_') + '.py'


def slug_to_module_name(slug):
    return 'content_' + slug.replace('-', '_')


def main():
    # Find all valid content files
    valid = {}
    invalid = []
    for f in FORMATIONS:
        slug = f['slug']
        if slug == 'seo-debutant':
            continue  # already in DETAILED_CONTENT
        pyfile = SCRIPT_DIR / slug_to_pyfile(slug)
        if not pyfile.exists():
            invalid.append((slug, 'fichier absent'))
            continue
        try:
            text = pyfile.read_text(encoding='utf-8')
        except Exception as e:
            invalid.append((slug, f'lecture erreur: {e}'))
            continue
        pyvar = slug_to_pyvar(slug)
        # Detection : on cherche pyvar = [
        if f'{pyvar} = [' not in text:
            invalid.append((slug, f'pas de variable {pyvar} = [ ...'))
            continue
        # Test import
        try:
            mod_name = slug_to_module_name(slug)
            if mod_name in sys.modules:
                del sys.modules[mod_name]
            mod = importlib.import_module(mod_name)
            modules = getattr(mod, pyvar, None)
            if not modules or not isinstance(modules, list) or len(modules) == 0:
                invalid.append((slug, f'{pyvar} = [] (vide)'))
                continue
            # Check contenu lecons
            total_lessons = 0
            total_chars = 0
            for m in modules:
                lessons = m.get('lessons', [])
                total_lessons += len(lessons)
                for l in lessons:
                    total_chars += len(l.get('content_html', ''))
            if total_lessons < f['lessons']:
                invalid.append((slug, f'lecons {total_lessons}/{f["lessons"]} incomplet'))
                continue
            if total_chars < 50000:  # 50KB minimum total HTML
                invalid.append((slug, f'contenu insuffisant: {total_chars} chars'))
                continue
            valid[slug] = {
                'pyvar': pyvar,
                'module_name': mod_name,
                'modules_count': len(modules),
                'lessons_count': total_lessons,
                'chars': total_chars,
            }
        except Exception as e:
            invalid.append((slug, f'import erreur: {type(e).__name__}: {e}'))

    print(f'==> Valid : {len(valid)} formations')
    for slug, info in valid.items():
        print(f'  OK : {slug} - {info["modules_count"]} modules, {info["lessons_count"]} lecons, {info["chars"]} chars')
    print(f'==> Invalid : {len(invalid)} formations')
    for slug, reason in invalid:
        print(f'  KO : {slug} - {reason}')

    if not valid:
        print('\nRien a integrer. Sortie sans modification de build.py.')
        return 0

    # Update build.py DETAILED_CONTENT dict
    build_py = SCRIPT_DIR / 'build.py'
    text = build_py.read_text(encoding='utf-8')

    # Find DETAILED_CONTENT dict and rewrite
    pattern = re.compile(
        r"# Cap des contenus detailles par slug\nDETAILED_CONTENT = \{[^}]*\}",
        re.DOTALL,
    )

    # Build new DETAILED_CONTENT block
    imports_lines = []
    dict_lines = ["    'seo-debutant': SEO_DEBUTANT_MODULES,"]
    for slug, info in sorted(valid.items()):
        imports_lines.append(f"from {info['module_name']} import {info['pyvar']}")
        dict_lines.append(f"    '{slug}': {info['pyvar']},")

    new_block = (
        "# Cap des contenus detailles par slug\n"
        "DETAILED_CONTENT = {\n" +
        "\n".join(dict_lines) +
        "\n}"
    )

    new_text = pattern.sub(new_block, text)

    # Add imports near existing content_seo import (after content_generator import)
    import_pattern = re.compile(
        r'(from content_seo import SEO_DEBUTANT_MODULES\n)'
    )
    new_imports = '\n'.join(imports_lines) + '\n'
    if new_imports.strip():
        new_text = import_pattern.sub(r'\1' + new_imports, new_text, count=1)

    if new_text != text:
        build_py.write_text(new_text, encoding='utf-8')
        print(f'\nbuild.py mis a jour : {len(valid)} formations wirees dans DETAILED_CONTENT')
    else:
        print('\nbuild.py inchange (deja a jour ?)')

    return 0


if __name__ == '__main__':
    sys.exit(main())
