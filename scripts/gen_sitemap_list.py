# -*- coding: utf-8 -*-
"""Genere app/sitemap-pages.json (liste des pages) pour le sitemap (bundle dans la fonction).

Depuis la migration Astro, les pages vivent a deux endroits :
  - src/pages/*.astro   : pages natives (rendues en HTML au build)
  - src/legacy/*.html   : contenu historique rendu par src/pages/[slug].astro
  - public/*.html       : pages statiques eventuelles (servies telles quelles)
"""
import os, io, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE = {"404"}
slugs = set()
for d, ext in ((os.path.join(ROOT, "src", "pages"), ".astro"), (os.path.join(ROOT, "src", "legacy"), ".html"), (os.path.join(ROOT, "public"), ".html")):
    if not os.path.isdir(d):
        continue
    for f in os.listdir(d):
        if f.endswith(ext) and not f.startswith("[") and not f.startswith("_"):
            slug = f[: -len(ext)]
            if slug not in EXCLUDE:
                slugs.add(slug)
pages = sorted("/" if s == "index" else "/" + s for s in slugs)
io.open(os.path.join(ROOT, "app", "sitemap-pages.json"), "w", encoding="utf-8").write(json.dumps(pages, ensure_ascii=False, indent=0))
print("pages listees:", len(pages))
