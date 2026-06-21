# -*- coding: utf-8 -*-
"""Assembleur de pages service x ville. Lit le contenu unique (JSON par page) + le gabarit
(CSS/nav/footer extraits) et ecrit des pages completes, accents+devise+SEO corrects."""
import os, io, re, json, html as htmllib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "creation-site-web-cotonou.html")
CONTENT_DIR = os.path.join(ROOT, "scripts", "_pages")

tpl = io.open(TPL, encoding="utf-8").read()
CSS = re.search(r"<style>(.*?)</style>", tpl, re.S).group(1)
NAV = re.search(r'(<nav class="nav-mega".*?</nav>)', tpl, re.S).group(1)
FOOTER = re.search(r"(<footer.*?</footer>)", tpl, re.S).group(1)
# script de nav (burger/menus) : 1er <script> sans attribut
NAVJS = ""
for m in re.finditer(r"<script>(.*?)</script>", tpl, re.S):
    NAVJS = m.group(0); break

def e(s):  # echappe HTML pour le texte
    return htmllib.escape(str(s), quote=True)

def jdump(o):
    return json.dumps(o, ensure_ascii=False)

TOOLS = {
  "default":[("code","WordPress"),("web","Webflow"),("rocket_launch","Next.js"),("shopping_cart","Shopify"),("draw","Figma"),("cloud","Vercel"),("shield","Cloudflare"),("linked_services","Make")],
}

def build(p):
    """p: dict avec service{sl,label,focus}, city{sl,nom,pays,dev,pay,ctx}, content{...}"""
    s, c, ct = p["service"], p["city"], p["content"]
    slug = s["sl"] + "-" + c["sl"]
    url = "https://www.pirabellabs.com/" + slug
    H = "Création de site web"  # placeholder non utilise
    title = e(ct["meta_title"]); desc = e(ct["meta_desc"]); kw = e(ct["keywords"])
    # ---- JSON-LD ----
    faq_ld = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":f["q"],"acceptedAnswer":{"@type":"Answer","text":f["a"]}} for f in ct["faq"]]}
    svc_ld = {"@context":"https://schema.org","@type":"Service","provider":{"@type":"LocalBusiness","name":"Pirabel Labs","address":{"@type":"PostalAddress","addressLocality":"Abomey-Calavi","addressCountry":"BJ"},"telephone":"+16139273067","email":"contact@pirabellabs.com"},"areaServed":{"@type":"City","name":c["nom"]},"serviceType":s["label"],"name":ct["meta_title"],"description":ct["meta_desc"],"offers":{"@type":"Offer","priceCurrency":c["dev"],"availability":"https://schema.org/InStock"}}
    bc_ld = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Accueil","item":"https://www.pirabellabs.com/"},
        {"@type":"ListItem","position":2,"name":s["label"],"item":"https://www.pirabellabs.com/"+s["sl"]},
        {"@type":"ListItem","position":3,"name":"À "+c["nom"],"item":url}]}
    head = ("<!doctype html>\n<html lang=\"fr\">\n<head>\n<meta charset=\"utf-8\">\n"
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
      "<title>"+title+"</title>\n<meta name=\"description\" content=\""+desc+"\">\n"
      "<meta name=\"keywords\" content=\""+kw+"\">\n"
      "<link rel=\"canonical\" href=\""+url+"\">\n<link rel=\"alternate\" hreflang=\"fr\" href=\""+url+"\">\n"
      "<meta name=\"robots\" content=\"index, follow, max-image-preview:large, max-snippet:-1\">\n"
      "<meta property=\"og:type\" content=\"website\">\n<meta property=\"og:title\" content=\""+title+"\">\n"
      "<meta property=\"og:description\" content=\""+desc+"\">\n<meta property=\"og:url\" content=\""+url+"\">\n"
      "<meta property=\"og:image\" content=\"https://www.pirabellabs.com/img/og-image.png?v=elan\">\n"
      "<meta property=\"og:locale\" content=\"fr_FR\">\n<meta name=\"twitter:card\" content=\"summary_large_image\">\n"
      "<link rel=\"icon\" type=\"image/png\" href=\"/img/logo.png?v=elan2\">\n"
      "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
      "<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap\">\n"
      "<link rel=\"stylesheet\" href=\"/css/global.css?v=elan2\">\n"
      "<style>"+CSS+"</style>\n"
      "<script type=\"application/ld+json\">"+jdump(svc_ld)+"</script>\n"
      "<script type=\"application/ld+json\">"+jdump(bc_ld)+"</script>\n"
      "<script type=\"application/ld+json\">"+jdump(faq_ld)+"</script>\n"
      "</head>\n<body>\n")
    # ---- breadcrumb ----
    bc = ('<nav class="bc" aria-label="Fil d\'Ariane"><div class="bc__inner" style="max-width:80rem;margin:0 auto;">'
      '<a href="/">Accueil</a> &rsaquo; <a href="/'+s["sl"]+'">'+e(s["label"])+'</a> &rsaquo; <span>À '+e(c["nom"])+'</span></div></nav>\n')
    icons=["rocket_launch","smartphone","trending_up","bolt","verified","insights"]
    def cards(arr):
        out=""
        for i,cd in enumerate(arr):
            out+=('<div class="rich-card"><div class="rich-card__icon"><span class="material-symbols-outlined">'+
                  (cd.get("icon") or icons[i%len(icons)])+'</span></div><div class="rich-card__title">'+e(cd["title"])+
                  '</div><div class="rich-card__desc">'+e(cd["desc"])+'</div></div>')
        return out
    # ---- HERO ----
    hero=('<section class="rich-hero"><span class="rich-hero__eyebrow"><span class="material-symbols-outlined">bolt</span> '+e(s["label"])+' &middot; '+e(c["nom"])+', '+e(c["pays"])+'</span>'
      '<h1>'+e(s["label"])+' à <em>'+e(c["nom"])+'</em></h1>'
      '<p class="rich-hero__sub">'+e(ct["hero_sub"])+'</p>'
      '<div class="rich-hero__cta"><a href="/contact?service='+s["sl"]+'&amp;ville='+c["sl"]+'" class="btn btn--primary btn--lg"><span class="material-symbols-outlined">today</span> Demander un devis ferme</a>'
      '<a href="https://wa.me/16139273067" target="_blank" rel="noopener" class="btn btn--ghost btn--lg"><span class="material-symbols-outlined">chat</span> WhatsApp direct</a></div>'
      '<div class="rich-hero__trust"><div class="rich-hero__trust-item"><span class="material-symbols-outlined">star</span> 4.9/5 (47 avis)</div>'
      '<div class="rich-hero__trust-item"><span class="material-symbols-outlined">verified</span> Depuis 2020</div>'
      '<div class="rich-hero__trust-item"><span class="material-symbols-outlined">handshake</span> 150+ projets livrés</div>'
      '<div class="rich-hero__trust-item"><span class="material-symbols-outlined">schedule</span> Devis sous 48h</div></div></section>\n')
    def sec(h2, intro, body):
        return '<section class="rich-section"><h2>'+h2+'</h2>'+('<p class="rich-section__intro">'+e(intro)+'</p>' if intro else '')+body+'</section>\n'
    pourquoi=sec('Pourquoi <em>'+e(s["label"])+'</em> à '+e(c["nom"])+' ?', ct["pourquoi_intro"], '<div class="rich-cards">'+cards(ct["pourquoi_cards"])+'</div>')
    # approche (5 etapes) depuis content si fourni, sinon generique
    steps=ct.get("approche_steps") or []
    steps_html='<div class="rich-cards">'+cards([{"title":st["title"],"desc":st["desc"]} for st in steps])+'</div>' if steps else ''
    approche=sec('Notre approche en <em>5 étapes</em>', ct.get("approche_intro",""), steps_html)
    # offre
    offre_items=ct.get("offre_items") or []
    offre_html='<div class="rich-cards">'+cards(offre_items)+'</div>' if offre_items and isinstance(offre_items[0],dict) else ''
    offre=sec('Ce que vous obtenez : <em>notre offre</em>', ct.get("offre_intro",""), offre_html)
    # tarifs
    tar=ct["tarifs"]
    tarifs=sec('Tarifs <em>'+e(s["label"])+'</em> à '+e(c["nom"]), tar.get("intro",""),
       '<div class="rich-pricing"><div class="rich-pricing__card"><div class="rich-pricing__label">Fourchette de prix</div><div class="rich-pricing__price">'+e(tar["fourchette"])+'</div><div class="rich-pricing__desc">'+e(tar["desc"])+'</div></div></div>')
    # outils
    tools=TOOLS["default"]
    tools_html='<div class="rich-tools">'+''.join('<div class="rich-tool"><span class="rich-tool__icon material-symbols-outlined">'+ic+'</span><span class="rich-tool__label">'+lb+'</span></div>' for ic,lb in tools)+'</div>'
    outils=sec('Outils &amp; technologies <em>utilisés</em>', "Des outils fiables, performants et bien intégrés, choisis selon votre projet.", tools_html)
    # mots-cles
    kws=ct["mots_cles"]
    mc=sec('Mots-clés <em>ciblés à '+e(c["nom"])+'</em>', ct.get("mots_cles_intro","Ces requêtes Google ramènent des prospects qualifiés ; nous positionnons votre site dessus."),
       '<div class="rich-kws">'+''.join('<span class="rich-kw">'+e(k)+'</span>' for k in kws)+'</div>')
    # delais
    dc=ct.get("delais_cards") or []
    delais=sec('Délais <em>&amp; livrables</em>', ct.get("delais_intro",""), '<div class="rich-cards">'+cards(dc)+'</div>' if dc else '')
    # temoignage
    t=ct["temoignage"]
    temo=('<section class="rich-section"><h2>Résultats <em>clients à '+e(c["nom"])+'</em></h2><div class="rich-testimonial">'
      '<div class="rich-testimonial__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
      '<div class="rich-testimonial__quote">&laquo; '+e(t["quote"])+' &raquo;</div>'
      '<div class="rich-testimonial__author"><div class="rich-testimonial__avatar">'+e(t["initials"])+'</div>'
      '<div><div class="rich-testimonial__name">'+e(t["name"])+'</div><div class="rich-testimonial__role">'+e(t["role"])+'</div></div></div></div></section>\n')
    # faq
    faqs=''.join('<details class="rich-faq"><summary class="rich-faq__q"><span>'+e(f["q"])+'</span><span class="material-symbols-outlined">expand_more</span></summary><div class="rich-faq__a">'+e(f["a"])+'</div></details>' for f in ct["faq"])
    faq=sec('Questions <em>fréquentes</em>', "", '<div class="rich-faqs">'+faqs+'</div>')
    # autres services
    OTH=[("creation-site-web","Création de site web"),("seo","Référencement SEO"),("community-management","Community management"),("automatisation-marketing","Automatisation marketing"),("fiche-google-business","Fiche Google Business"),("tunnels-de-vente","Tunnels de vente"),("creation-site-wordpress","Site WordPress"),("agents-ia-chatbots","Agents IA & chatbots")]
    rel=[(sl,lb) for sl,lb in OTH if sl!=s["sl"]][:5]
    autres=sec('Autres services <em>à '+e(c["nom"])+'</em>', "Pirabel Labs accompagne aussi votre activité à "+c["nom"]+" sur ces leviers.",
       '<div class="rich-related-grid">'+''.join('<a class="rich-related" href="/'+sl+'-'+c["sl"]+'">'+e(lb)+' à '+e(c["nom"])+' <span class="material-symbols-outlined">arrow_forward</span></a>' for sl,lb in rel)+'</div>')
    cta=('<section class="rich-cta-band"><h2>Prêt à lancer votre projet <em>'+e(s["label"])+'</em> à '+e(c["nom"])+' ?</h2>'
      '<p>Devis ferme sous 48h, sans engagement. Parlons de votre projet dès aujourd\'hui.</p>'
      '<div class="rich-hero__cta"><a href="/contact?service='+s["sl"]+'&amp;ville='+c["sl"]+'" class="btn btn--primary btn--lg"><span class="material-symbols-outlined">today</span> Demander mon devis</a>'
      '<a href="https://wa.me/16139273067" target="_blank" rel="noopener" class="btn btn--ghost btn--lg"><span class="material-symbols-outlined">chat</span> WhatsApp</a></div></section>\n')
    body = NAV + "\n" + bc + hero + pourquoi + approche + offre + tarifs + outils + mc + delais + temo + faq + autres + cta + FOOTER + "\n" + NAVJS + '\n<script defer src="/js/track.js"></script>\n</body>\n</html>\n'
    return head + body

if __name__ == "__main__":
    files = [f for f in os.listdir(CONTENT_DIR) if f.endswith(".json")] if os.path.isdir(CONTENT_DIR) else []
    n=0
    for jf in files:
        try:
            p = json.load(io.open(os.path.join(CONTENT_DIR, jf), encoding="utf-8"))
            out = build(p)
            io.open(os.path.join(ROOT, p["service"]["sl"]+"-"+p["city"]["sl"]+".html"), "w", encoding="utf-8").write(out)
            n+=1
        except Exception as ex:
            print("ERREUR", jf, "->", ex)
    print("pages assemblees:", n)
