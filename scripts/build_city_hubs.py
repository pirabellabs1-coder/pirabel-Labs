# -*- coding: utf-8 -*-
"""Cree les hubs villes Europe (agence-web-<slug>.html) en design rich-*, contenu localise
ecrit a la main (unique, sans agent). Chaque hub = intro localisee + annuaire des 12 services
de la ville + infos locales + CTA. Reutilise CSS/nav/footer de build_city_pages."""
import os, io, json
import build_city_pages as B

ROOT = B.ROOT
e = B.e
d = json.load(io.open(os.path.join(ROOT, "scripts", "_villes-services.json"), encoding="utf-8"))
CITY = {c["slug"]: c for c in d["villes"]}
SVC = [(s["slug"], s["label"]) for s in d["services"]]

# Contenu UNIQUE par ville (ecrit a la main)
CONTENT = {
 "bordeaux": {
   "sub": "Sites, SEO et automatisation pour les entreprises bordelaises — du château viticole à la start-up de la French Tech, un partenaire digital qui parle votre marché.",
   "intro": "Bordeaux conjugue art de vivre, négoce du vin et un écosystème tech (French Tech Bordeaux) en pleine expansion. Pour exister dans cette concurrence, un site rapide et un référencement local solide ne sont pas optionnels.",
   "cards": [
     ("wine_bar", "Vin, tourisme & art de vivre", "Vitrines élégantes et multilingues pour châteaux, négociants, restaurants et acteurs du tourisme œnologique."),
     ("rocket_launch", "French Tech Bordeaux", "Applications web, tunnels de vente et automatisations pour les start-up et PME en croissance."),
     ("location_on", "Visibilité locale", "SEO local et fiche Google Business pour capter une clientèle bordelaise et néo-aquitaine qualifiée."),
   ],
 },
 "toulouse": {
   "sub": "Du pôle aéronautique aux PME de la Ville rose : sites performants, SEO et outils sur-mesure pensés pour un marché technique et étudiant.",
   "intro": "Toulouse, capitale européenne de l'aéronautique et de l'espace, abrite un tissu d'industriels, de sous-traitants et de start-up deep-tech, plus une immense population étudiante. Un digital crédible et technique fait la différence.",
   "cards": [
     ("flight", "Industrie & aéronautique", "Sites institutionnels et portails métier pour l'écosystème aéro-spatial et ses sous-traitants."),
     ("school", "Marché étudiant", "Campagnes et contenus social media adaptés à la forte démographie étudiante toulousaine."),
     ("trending_up", "Croissance PME", "SEO, tunnels et automatisation pour accélérer l'acquisition des PME de la Ville rose."),
   ],
 },
 "nice": {
   "sub": "Visibilité sur la Côte d'Azur : sites multilingues, SEO local et contenus pour capter résidents, touristes et clientèle internationale.",
   "intro": "Nice vit au rythme du tourisme, du commerce de proximité et d'une clientèle internationale exigeante. La saisonnalité et le multilinguisme imposent une stratégie digitale précise et bien référencée localement.",
   "cards": [
     ("beach_access", "Tourisme & saisonnalité", "Sites et campagnes calés sur les pics de la saison azuréenne pour capter visiteurs et nouveaux résidents."),
     ("language", "Clientèle internationale", "Visibilité multilingue (dont anglais) pour une demande très internationale."),
     ("storefront", "Commerce de proximité", "SEO local et fiche Google Business pour figurer dans le pack local niçois."),
   ],
 },
 "nantes": {
   "sub": "Hub numérique de l'Ouest : sites, applications et SEO pour les start-up, PME et acteurs culturels de la métropole nantaise.",
   "intro": "Nantes est l'un des écosystèmes numériques les plus dynamiques de l'Ouest, porté par les start-up, l'industrie créative et une qualité de vie qui attire les talents. La concurrence digitale y est réelle.",
   "cards": [
     ("hub", "Écosystème start-up", "Applications web, MVP et tunnels de vente pour les jeunes pousses nantaises."),
     ("palette", "Industries créatives", "Sites soignés pour la culture, l'événementiel et les agences de la métropole."),
     ("insights", "Acquisition PME", "SEO, automatisation et CRM pour structurer la croissance commerciale."),
   ],
 },
 "lille": {
   "sub": "Carrefour nord-européen : sites, e-commerce et SEO pour le commerce, les services et l'industrie de la métropole lilloise.",
   "intro": "Lille, porte d'entrée de l'Europe du Nord, mêle commerce, services, retail et un tissu industriel dense, avec une proximité immédiate de la Belgique. Un digital efficace ouvre un marché transfrontalier.",
   "cards": [
     ("shopping_bag", "Commerce & retail", "Sites e-commerce et vitrines performants pour le commerce et la distribution."),
     ("public", "Marché transfrontalier", "Visibilité orientée métropole lilloise et bassin nord-européen."),
     ("bolt", "Services & B2B", "SEO, tunnels et automatisation pour les sociétés de services et le B2B."),
   ],
 },
 "montpellier": {
   "sub": "Ville tech en pleine croissance : sites, applications et SEO pour les start-up santé/numérique et les PME montpelliéraines.",
   "intro": "Montpellier est l'une des villes françaises les plus dynamiques sur le plan démographique et technologique, avec un pôle santé/numérique reconnu. Se démarquer y demande un digital à la hauteur.",
   "cards": [
     ("health_and_safety", "HealthTech & numérique", "Applications et sites crédibles pour les acteurs santé et tech montpelliérains."),
     ("groups", "Forte croissance", "Acquisition (SEO, tunnels, CRM) calibrée pour une population et un marché en expansion."),
     ("location_on", "Ancrage local", "SEO local et fiche Google Business pour rayonner sur la métropole."),
   ],
 },
}

def build_hub(slug):
    c = CITY[slug]; ct = CONTENT[slug]; nom = c["nom"]
    url = "https://www.pirabellabs.com/agence-web-" + slug
    title = "Agence web & marketing à " + nom + " - Pirabel Labs"
    desc = ("Agence web & marketing digital à " + nom + " : création de site, SEO, automatisation et IA. "
            "Tous nos services pour les entreprises de " + nom + ". Devis ferme sous 48 h.")
    kw = "agence web " + nom.lower() + ", agence digitale " + nom.lower() + ", création site internet " + nom.lower() + ", agence seo " + nom.lower() + ", agence marketing " + nom.lower()
    import json as J
    lb = {"@context":"https://schema.org","@type":"ProfessionalService","name":"Pirabel Labs — "+nom,
          "description":desc,"areaServed":{"@type":"City","name":nom},
          "provider":{"@type":"Organization","name":"Pirabel Labs"},
          "address":{"@type":"PostalAddress","addressLocality":"Abomey-Calavi","addressCountry":"BJ"},
          "telephone":"+16139273067","email":"contact@pirabellabs.com","url":url}
    bc = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.pirabellabs.com/"},
        {"@type":"ListItem","position":2,"name":"Villes","item":"https://www.pirabellabs.com/"},
        {"@type":"ListItem","position":3,"name":nom,"item":url}]}
    head = ("<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n"
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
      "<title>"+e(title)+"</title>\n<meta name=\"description\" content=\""+e(desc)+"\">\n"
      "<meta name=\"keywords\" content=\""+e(kw)+"\">\n<link rel=\"canonical\" href=\""+url+"\">\n"
      "<link rel=\"alternate\" hreflang=\"fr\" href=\""+url+"\">\n"
      "<meta name=\"robots\" content=\"index, follow, max-image-preview:large, max-snippet:-1\">\n"
      "<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\""+e(title)+"\">\n"
      "<meta property=\"og:description\" content=\""+e(desc)+"\">\n<meta property=\"og:url\" content=\""+url+"\">\n"
      "<meta property=\"og:image\" content=\"https://www.pirabellabs.com/img/og-image.png?v=elan\">\n"
      "<meta property=\"og:locale\" content=\"fr_FR\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
      "<link rel=\"icon\" type=\"image/png\" href=\"/img/logo.png?v=elan2\">\n"
      "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
      "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap\">\n"
      "<link rel=\"stylesheet\" href=\"/css/global.css?v=elan2\">\n<style>"+B.CSS+"</style>\n"
      "<script type=\"application/ld+json\">"+J.dumps(lb,ensure_ascii=False)+"</script>\n"
      "<script type=\"application/ld+json\">"+J.dumps(bc,ensure_ascii=False)+"</script>\n"
      "</head>\n<body>\n")
    bcnav = ('<nav class="bc" aria-label="Fil d\'Ariane"><div class="bc__inner" style="max-width:80rem;margin:0 auto;">'
      '<a href="/">Accueil</a> &rsaquo; <span>'+e(nom)+'</span></div></nav>\n')
    hero=('<section class="rich-hero"><span class="rich-hero__eyebrow"><span class="material-symbols-outlined">location_city</span> Agence digitale &middot; '+e(nom)+', France</span>'
      '<h1>Agence web &amp; marketing à <em>'+e(nom)+'</em></h1>'
      '<p class="rich-hero__sub">'+e(ct["sub"])+'</p>'
      '<div class="rich-hero__cta"><a href="/contact?ville='+slug+'" class="btn btn--primary btn--lg"><span class="material-symbols-outlined">today</span> Demander un devis</a>'
      '<a href="https://wa.me/16139273067" target="_blank" rel="noopener" class="btn btn--ghost btn--lg"><span class="material-symbols-outlined">chat</span> WhatsApp</a></div></section>\n')
    # pourquoi
    cards="".join('<div class="rich-card"><div class="rich-card__icon"><span class="material-symbols-outlined">'+ic+'</span></div><div class="rich-card__title">'+e(t)+'</div><div class="rich-card__desc">'+e(ds)+'</div></div>' for ic,t,ds in ct["cards"])
    pourquoi=('<section class="rich-section"><h2>Pourquoi Pirabel Labs à <em>'+e(nom)+'</em> ?</h2>'
      '<p class="rich-section__intro">'+e(ct["intro"])+'</p><div class="rich-cards">'+cards+'</div></section>\n')
    # annuaire services
    rel=[(sl,lb2) for sl,lb2 in SVC if os.path.exists(os.path.join(ROOT, sl+"-"+slug+".html"))]
    grid="".join('<a class="rich-related" href="/'+sl+'-'+slug+'">'+e(lb2)+' à '+e(nom)+' <span class="material-symbols-outlined">arrow_forward</span></a>' for sl,lb2 in rel)
    services=('<section class="rich-section"><h2>Nos services <em>à '+e(nom)+'</em></h2>'
      '<p class="rich-section__intro">Tous les leviers digitaux de Pirabel Labs, déclinés pour le marché de '+e(nom)+' :</p>'
      '<div class="rich-related-grid">'+grid+'</div></section>\n')
    cta=('<section class="rich-cta-band"><h2>Votre projet digital à <em>'+e(nom)+'</em> ?</h2>'
      '<p>Paiement par CB (Stripe) ou virement SEPA. Devis ferme sous 48 h, sans engagement.</p>'
      '<div class="rich-hero__cta"><a href="/contact?ville='+slug+'" class="btn btn--primary btn--lg"><span class="material-symbols-outlined">today</span> Demander mon devis</a>'
      '<a href="https://wa.me/16139273067" target="_blank" rel="noopener" class="btn btn--ghost btn--lg"><span class="material-symbols-outlined">chat</span> WhatsApp</a></div></section>\n')
    body = B.NAV+"\n"+bcnav+hero+pourquoi+services+cta+B.FOOTER+"\n"+B.NAVJS+'\n<script defer src="/js/track.js"></script>\n</body>\n</html>\n'
    return head+body

n=0
for slug in CONTENT:
    io.open(os.path.join(ROOT, "agence-web-"+slug+".html"), "w", encoding="utf-8").write(build_hub(slug))
    n+=1
print("hubs villes Europe créés:", n)
