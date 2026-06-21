# -*- coding: utf-8 -*-
"""Genere app/sitemap-pages.json (liste des pages .html) pour le sitemap (bundle dans la fonction)."""
import os, io, json
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pages=[]
for f in sorted(os.listdir(ROOT)):
    if f.endswith(".html") and f!="404.html":
        pages.append("/" if f=="index.html" else "/"+f[:-5])
io.open(os.path.join(ROOT,"app","sitemap-pages.json"),"w",encoding="utf-8").write(json.dumps(pages,ensure_ascii=False,indent=0))
print("pages listees:",len(pages))
