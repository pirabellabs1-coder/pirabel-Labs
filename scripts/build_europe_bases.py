# -*- coding: utf-8 -*-
"""Cree les 6 bases agence Europe (agence-web-<city>.html) par clonage d'agence-web-lyon
avec localisation COMPLETE : ville, gentile, neutralisation des quartiers lyonnais, head SEO,
hero unique. Sert ensuite de base au clonage par build_pages_agence pour les pages service."""
import os, io, re, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def e(s): return H.escape(str(s), quote=True)

CITIES = {
 "bordeaux": {"nom":"Bordeaux","dem":"bordelais","Dem":"Bordelais","ctx":"écosystème tech (French Tech) et capitale mondiale du vin",
   "sub":"Sites, SEO et automatisation pour les entreprises bordelaises — du château viticole à la start-up de la French Tech, un partenaire digital qui parle votre marché."},
 "toulouse": {"nom":"Toulouse","dem":"toulousain","Dem":"Toulousain","ctx":"pôle aéronautique et spatial européen et ville étudiante",
   "sub":"Du pôle aéronautique aux PME de la Ville rose : sites performants, SEO et outils sur-mesure pensés pour un marché technique et étudiant."},
 "nice": {"nom":"Nice","dem":"niçois","Dem":"Niçois","ctx":"Côte d'Azur, tourisme et clientèle internationale",
   "sub":"Visibilité sur la Côte d'Azur : sites multilingues, SEO local et contenus pour capter résidents, touristes et clientèle internationale."},
 "nantes": {"nom":"Nantes","dem":"nantais","Dem":"Nantais","ctx":"hub numérique de l'Ouest et industries créatives",
   "sub":"Hub numérique de l'Ouest : sites, applications et SEO pour les start-up, PME et acteurs culturels de la métropole nantaise."},
 "lille": {"nom":"Lille","dem":"lillois","Dem":"Lillois","ctx":"carrefour nord-européen, commerce et services",
   "sub":"Carrefour nord-européen : sites, e-commerce et SEO pour le commerce, les services et l'industrie de la métropole lilloise."},
 "montpellier": {"nom":"Montpellier","dem":"montpelliérain","Dem":"Montpelliérain","ctx":"ville tech en pleine croissance, pôle santé/numérique",
   "sub":"Ville tech en pleine croissance : sites, applications et SEO pour les start-up santé/numérique et les PME montpelliéraines."},
}
# neutralisation des quartiers lyonnais (-> termes generiques)
DISTRICTS = [("Presqu'île","centre-ville"),("Part-Dieu","quartier d'affaires"),("Confluence","centre-ville"),
             ("Croix-Rousse","quartiers historiques"),("Gerland","zones d'activité"),("Villeurbanne","la métropole"),
             ("du Rhône","de la région"),("le Rhône","la région")]

lyon = io.open(os.path.join(ROOT, "agence-web-lyon.html"), encoding="utf-8").read()

def localize(c):
    t = lyon
    # quartiers d'abord
    for a, b in DISTRICTS: t = t.replace(a, b)
    # gentile (avant Lyon)
    t = t.replace("lyonnaise", c["dem"] + "e").replace("lyonnais", c["dem"])
    t = t.replace("Lyonnaise", c["Dem"] + "e").replace("Lyonnais", c["Dem"])
    # nom + slug
    t = t.replace("LYON", c["nom"].upper()).replace("Lyon", c["nom"]).replace("lyon", c["slug"])
    # head SEO
    url = "https://www.pirabellabs.com/agence-web-" + c["slug"]
    t = re.sub(r'<title>.*?</title>', '<title>Agence web &amp; marketing à ' + e(c["nom"]) + ' - Pirabel Labs</title>', t, count=1, flags=re.S)
    t = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), t, count=1)
    t = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), t, count=1)
    # hero lead unique
    t = re.sub(r'<p class="s-hero__lead">.*?</p>', '<p class="s-hero__lead">' + e(c["sub"]) + '</p>', t, count=1, flags=re.S)
    return t

n = 0
for slug, c in CITIES.items():
    c["slug"] = slug
    io.open(os.path.join(ROOT, "agence-web-" + slug + ".html"), "w", encoding="utf-8").write(localize(c))
    n += 1
print("bases agence Europe créées:", n)
# verif residus lyon
res = 0
for slug in CITIES:
    t = io.open(os.path.join(ROOT, "agence-web-" + slug + ".html"), encoding="utf-8").read()
    for w in ["lyon", "Lyon", "Part-Dieu", "Croix-Rousse", "Gerland", "Confluence"]:
        res += t.count(w)
print("résidus lyonnais restants:", res)
