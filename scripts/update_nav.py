# -*- coding: utf-8 -*-
"""Ajoute au mega-menu (toutes les pages) les 6 nouveaux services + les 6 villes Europe.
Idempotent : n'insere que si absent. Ancres = dernier service (agents-ia-chatbots) et
derniere ville (Marseille) du nav existant."""
import os, io, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SVC_ANCHOR = '<a href="/agents-ia-chatbots" class="nav-mega__link"><span class="material-symbols-outlined">forum</span><div><div class="nav-mega__link-title">Agents IA &amp; chatbots</div></div></a>'
CITY_ANCHOR = '<a href="/agence-web-marseille" class="nav-mega__link"><div><div class="nav-mega__link-title">Marseille</div></div></a>'

def slink(href, icon, title, desc):
    return ('<a href="' + href + '" class="nav-mega__link"><span class="material-symbols-outlined">' + icon +
            '</span><div><div class="nav-mega__link-title">' + title + '</div>'
            '<div class="nav-mega__link-desc">' + desc + '</div></div></a>')

def clink(slug, nom):
    return ('<a href="/agence-web-' + slug + '" class="nav-mega__link"><div>'
            '<div class="nav-mega__link-title">' + nom + '</div></div></a>')

NEW_SVC = "".join([
    slink("/creation-site-wordpress", "language", "Site WordPress", "WordPress &amp; Elementor sur-mesure"),
    slink("/creation-application-web", "developer_board", "Application web", "Portails &amp; outils métier"),
    slink("/seo-local", "location_on", "SEO local", "Pack local &amp; Google Maps"),
    slink("/fiche-google-business", "storefront", "Fiche Google Business", "Profil &amp; avis optimisés"),
    slink("/email-marketing-crm", "mail", "Email marketing &amp; CRM", "Campagnes, séquences, CRM"),
    slink("/montage-video", "movie", "Montage vidéo", "Reels &amp; vidéos pour le web"),
])
NEW_CITY = "".join([
    clink("bordeaux", "Bordeaux"), clink("toulouse", "Toulouse"), clink("nice", "Nice"),
    clink("nantes", "Nantes"), clink("lille", "Lille"), clink("montpellier", "Montpellier"),
])

svc_done = city_done = 0
for f in glob.glob(os.path.join(ROOT, "*.html")):
    t = io.open(f, encoding="utf-8").read(); orig = t
    if SVC_ANCHOR in t and '/seo-local" class="nav-mega__link"' not in t:
        t = t.replace(SVC_ANCHOR, SVC_ANCHOR + NEW_SVC, 1); svc_done += 1
    if CITY_ANCHOR in t and '/agence-web-bordeaux" class="nav-mega__link"' not in t:
        t = t.replace(CITY_ANCHOR, CITY_ANCHOR + NEW_CITY, 1); city_done += 1
    if t != orig:
        io.open(f, "w", encoding="utf-8").write(t)
print("nav mis a jour -> services ajoutes sur", svc_done, "pages | villes sur", city_done, "pages")
