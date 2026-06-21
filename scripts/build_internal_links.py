# -*- coding: utf-8 -*-
"""Maillage interne : relie les pages service×ville depuis les hubs services + villes
(evite les pages orphelines). Idempotent : remplace le bloc <!-- MAILLAGE-LOCAL --> si present.
Reexecutable apres regeneration de pages (ne lie que les .html existants)."""
import os, io, re, json, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(io.open(os.path.join(ROOT, "scripts", "_villes-services.json"), encoding="utf-8"))
CITY = {c["slug"]: c for c in d["villes"]}        # slug -> {nom,...}
SVC = {s["slug"]: s for s in d["services"]}        # slug -> {label,...}
SVC_ORDER = [s["slug"] for s in d["services"]]
CITY_ORDER = [c["slug"] for c in d["villes"]]

# hubs villes -> slug de ville
CITY_HUBS = {}
for f in os.listdir(ROOT):
    m = re.match(r"agence-web-([a-z-]+)\.html$", f)
    if m and m.group(1) in CITY: CITY_HUBS[f] = m.group(1)
for slug in ["cotonou", "porto-novo", "abomey-calavi"]:
    f = "agence-marketing-" + slug + ".html"
    if os.path.exists(os.path.join(ROOT, f)): CITY_HUBS[f] = slug
# hubs services
SVC_HUBS = {s + ".html": s for s in SVC if os.path.exists(os.path.join(ROOT, s + ".html"))}

def link(slug, label):
    return ('<a href="/' + slug + '" style="display:flex;justify-content:space-between;align-items:center;'
            'gap:10px;padding:13px 15px;border:1px solid rgba(255,255,255,.1);border-radius:12px;'
            'text-decoration:none;color:#eaeaea;background:rgba(255,255,255,.025)">'
            '<span style="font-size:.92rem;line-height:1.3">' + H.escape(label) + '</span>'
            '<span style="color:#FF5500;font-weight:700">&rarr;</span></a>')

def block(titre, sous, links):
    return ('\n<!-- MAILLAGE-LOCAL -->\n<section style="max-width:80rem;margin:0 auto;padding:56px 6%;'
            'border-top:1px solid rgba(255,255,255,.08)">\n'
            '<h2 style="font-family:Montserrat,sans-serif;font-weight:800;font-size:clamp(1.4rem,3vw,2rem);margin:0 0 6px">'
            + H.escape(titre) + '</h2>\n'
            '<p style="opacity:.65;margin:0 0 26px;max-width:46rem">' + H.escape(sous) + '</p>\n'
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px">\n'
            + "\n".join(links) + '\n</div>\n</section>\n<!-- /MAILLAGE-LOCAL -->\n')

def inject(path, blk):
    t = io.open(path, encoding="utf-8").read()
    t = re.sub(r"\n?<!-- MAILLAGE-LOCAL -->.*?<!-- /MAILLAGE-LOCAL -->\n?", "", t, flags=re.S)  # retire ancien
    i = t.rfind("<footer")
    if i < 0: return 0
    t = t[:i] + blk + "\n" + t[i:]
    io.open(path, "w", encoding="utf-8").write(t)
    return 1

tot_links = 0; pages = 0
# 1) hubs SERVICES -> villes
for f, s in SVC_HUBS.items():
    label = SVC[s]["label"]
    links = []
    for c in CITY_ORDER:
        slug = s + "-" + c
        if os.path.exists(os.path.join(ROOT, slug + ".html")):
            links.append(link(slug, label + " à " + CITY[c]["nom"]))
    if links:
        blk = block(label + " : dans quelle ville ?",
                    "Pirabel Labs accompagne votre projet « " + label.lower() + " » partout en Afrique francophone et en Europe. Choisissez votre ville :",
                    links)
        pages += inject(os.path.join(ROOT, f), blk); tot_links += len(links)
# 2) hubs VILLES -> services
for f, c in CITY_HUBS.items():
    nom = CITY[c]["nom"]
    links = []
    for s in SVC_ORDER:
        slug = s + "-" + c
        if os.path.exists(os.path.join(ROOT, slug + ".html")):
            links.append(link(slug, SVC[s]["label"] + " à " + nom))
    if links:
        blk = block("Nos services à " + nom,
                    "Tous les services digitaux de Pirabel Labs disponibles à " + nom + " :",
                    links)
        pages += inject(os.path.join(ROOT, f), blk); tot_links += len(links)

print("hubs maillés:", pages, "| liens internes ajoutés:", tot_links)
print("  (services:", len(SVC_HUBS), "| villes:", len(CITY_HUBS), ")")
