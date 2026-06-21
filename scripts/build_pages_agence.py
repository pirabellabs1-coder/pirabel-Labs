# -*- coding: utf-8 -*-
"""Assembleur DESIGN AGENCE pour les pages service x ville.
Clone la page agence de la ville (chrome/CSS/sections ville correctes) et remplace les
sections SPECIFIQUES AU SERVICE depuis le contenu JSON unique (scripts/_pages/<slug>.json).
Sections ville gardees : comparatif, grille services, etapes, accordion ns-B.
"""
import os, io, re, json, html as H

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "scripts", "_pages")
def e(s): return H.escape(str(s), quote=True)

# city slug -> fichier base agence
def base_file(city):
    for cand in ("agence-web-" + city + ".html", "agence-marketing-" + city + ".html"):
        if os.path.exists(os.path.join(ROOT, cand)): return cand
    return None

def repl(html, start, end, new):
    i = html.find(start)
    if i < 0: return html
    j = html.find(end, i + len(start))
    if j < 0: return html
    return html[:i] + new + html[j:]

ICONS = ["rocket_launch", "verified", "trending_up", "bolt", "groups", "insights"]

def hero(s, c, ct):
    lead = ct.get("hero_sub", "")
    tag = ct.get("tarifs", {}).get("intro", "") or (s["label"] + " sur mesure à " + c["nom"])
    return ('  <!-- 1. HERO COMPACT -->\n  <section class="s-hero">\n    <div class="s-hero__inner">\n'
      '      <div class="s-hero__txt">\n'
      '        <span class="s-hero__eyebrow"><span class="material-symbols-outlined">location_on</span> ' + e(c["nom"]) + ', ' + e(c["pays"]) + '</span>\n'
      '        <h1>' + e(s["label"]) + ' à <em>' + e(c["nom"]) + '</em></h1>\n'
      '        <p class="s-hero__tagline">' + e(s["focus"]) + '</p>\n'
      '        <p class="s-hero__lead">' + e(lead) + '</p>\n'
      '        <div class="s-hero__cta">\n'
      '          <a href="/contact?service=' + s["sl"] + '&amp;ville=' + c["sl"] + '" class="btn btn--primary btn--lg">Demander un devis <span class="material-symbols-outlined">arrow_forward</span></a>\n'
      '          <a href="https://wa.me/16139273067" target="_blank" rel="noopener" class="btn btn--ghost btn--lg" style="border-color:#25D366;color:#25D366;"><span class="material-symbols-outlined">chat</span> WhatsApp</a>\n'
      '        </div>\n      </div>\n'
      '      <div class="s-hero__visual">\n        <div class="hero-photo"><div class="hero-photo__scene">\n'
      '          <div class="hero-photo__avatars"><div class="hero-photo__av"><span class="material-symbols-outlined">smartphone</span></div>'
      '<div class="hero-photo__av hero-photo__av--main"><span class="material-symbols-outlined">location_city</span></div>'
      '<div class="hero-photo__av"><span class="material-symbols-outlined">trending_up</span></div></div>\n'
      '          <div class="hero-photo__caption"><span class="material-symbols-outlined">verified</span> ' + e(s["label"]) + ' à ' + e(c["nom"]) + '</div>\n'
      '        </div></div>\n'
      '        <span class="s-hero__chip s-hero__chip--1"><span class="material-symbols-outlined">payments</span> ' + e(c["pay"].split(",")[0]) + '</span>\n'
      '        <span class="s-hero__chip s-hero__chip--2"><span class="material-symbols-outlined">speed</span> Optimisé mobile</span>\n'
      '        <span class="s-hero__chip s-hero__chip--3"><span class="material-symbols-outlined">star</span> 4,9 / 5 &middot; 47 avis</span>\n'
      '      </div>\n    </div>\n  </section>\n\n')

def pourquoi(s, c, ct):
    cards = ct.get("pourquoi_cards", [])
    n = len(cards)
    rows = ""
    for i, cd in enumerate(cards):
        rows += ('          <div class="reason">\n'
          '            <div class="reason__num">' + ("%02d" % (i + 1)) + ' / ' + ("%02d" % n) + '</div>\n'
          '            <div class="reason__icon"><span class="material-symbols-outlined">' + (cd.get("icon") or ICONS[i % len(ICONS)]) + '</span></div>\n'
          '            <div class="reason__title">' + e(cd.get("title", "")) + '</div>\n'
          '            <p class="reason__desc">' + e(cd.get("desc", "")) + '</p>\n          </div>\n')
    rid = "reasons" + re.sub(r'[^a-z]', '', s["sl"] + c["sl"])
    return ('  <!-- 2. POURQUOI ' + s["label"].upper() + ' A ' + c["nom"].upper() + ' -->\n  <section class="section">\n    <div class="container">\n'
      '      <div class="sec-h">\n        <h2>Pourquoi ' + e(s["label"].lower()) + ' à <em>' + e(c["nom"]) + '</em>&nbsp;?</h2>\n'
      '        <p class="sec-h__sub">' + e(ct.get("pourquoi_intro", "")) + '</p>\n      </div>\n'
      '      <div class="reasons-wrap">\n        <div class="reasons-row" id="' + rid + '">\n' + rows +
      '        </div>\n        <div class="reasons-nav">\n'
      '          <button type="button" data-target="' + rid + '" data-dir="-1" aria-label="Précédent"><span class="material-symbols-outlined">arrow_back</span></button>\n'
      '          <button type="button" data-target="' + rid + '" data-dir="1" aria-label="Suivant"><span class="material-symbols-outlined">arrow_forward</span></button>\n'
      '        </div>\n      </div>\n    </div>\n  </section>\n\n')

def methode(s, c, ct):
    steps = ct.get("approche_steps", [])
    tags = ["Audit gratuit", "Stratégie", "Production", "Lancement", "Suivi"]
    times = ["Sous 24&nbsp;h", "3 à 5 jours", "Selon le scope", "Garantie 30&nbsp;j", "Mensuel"]
    icons = ["schedule", "map", "build", "rocket_launch", "support_agent"]
    zz = ""
    for i, st in enumerate(steps):
        side = "left" if i % 2 == 0 else "right"
        zz += ('        <div class="zz-step zz-step--' + side + '">\n          <div class="zz-step__num">' + ("%02d" % (i + 1)) + '</div>\n'
          '          <div class="zz-step__card">\n            <span class="zz-step__tag">' + tags[i % 5] + '</span>\n'
          '            <div class="zz-step__title">' + e(st.get("title", "")) + '</div>\n'
          '            <p class="zz-step__desc">' + e(st.get("desc", "")) + '</p>\n'
          '            <span class="zz-step__time"><span class="material-symbols-outlined">' + icons[i % 5] + '</span> ' + times[i % 5] + '</span>\n          </div>\n        </div>\n')
    return ('  <!-- 5. NOTRE METHODE EN 5 ETAPES (ZIGZAG) -->\n  <section class="section" style="background:var(--bg-2);" id="methode-' + c["sl"] + '">\n    <div class="container">\n'
      '      <div class="sec-h">\n        <h2>Notre <em>méthode</em> à ' + e(c["nom"]) + ' en ' + str(len(steps)) + ' étapes</h2>\n'
      '        <p class="sec-h__sub">' + e(ct.get("approche_intro", "")) + '</p>\n      </div>\n      <div class="zigzag">\n' + zz + '      </div>\n    </div>\n  </section>\n\n')

def tarifs(s, c, ct):
    t = ct.get("tarifs", {})
    feats = ct.get("offre_items", [])
    li = "".join('<li>' + e((f.get("title", "") + " — " + f.get("desc", "")) if isinstance(f, dict) else f) + '</li>' for f in feats[:7])
    return ('  <!-- 6. TARIFS -->\n  <section class="section">\n    <div class="container">\n'
      '      <div class="sec-h">\n        <h2>Nos <em>tarifs ' + e(s["label"].lower()) + ' à ' + e(c["nom"]) + '</em></h2>\n'
      '        <p class="sec-h__sub">' + e(t.get("intro", "")) + '</p>\n      </div>\n'
      '      <div class="prest-grid">\n        <div class="prest prest--featured">\n          <span class="prest__badge">Sur mesure</span>\n'
      '          <div class="prest__icon"><span class="material-symbols-outlined">workspace_premium</span></div>\n'
      '          <div class="prest__title">' + e(s["label"]) + '</div>\n'
      '          <p class="prest__lead">' + e(ct.get("offre_intro", "")) + '</p>\n'
      '          <ul class="prest__feat">' + li + '</ul>\n'
      '          <div class="prest__price"><strong>' + e(t.get("fourchette", "sur devis")) + '</strong></div>\n'
      '          <a href="/contact?service=' + s["sl"] + '&amp;ville=' + c["sl"] + '" class="prest__cta">Demander un devis</a>\n'
      '        </div>\n'
      '        <div class="prest">\n          <div class="prest__icon"><span class="material-symbols-outlined">verified</span></div>\n'
      '          <div class="prest__title">Ce qui est inclus</div>\n          <p class="prest__lead">' + e(t.get("desc", "")) + '</p>\n'
      '          <ul class="prest__feat"><li>Devis ferme sous 48&nbsp;h</li><li>Paiement : ' + e(c["pay"]) + '</li><li>Suivi et garantie 30&nbsp;jours</li><li>Interlocuteur dédié, réponse sous 24&nbsp;h</li></ul>\n'
      '          <a href="/contact?service=' + s["sl"] + '&amp;ville=' + c["sl"] + '" class="prest__cta">Parler du projet</a>\n        </div>\n'
      '      </div>\n    </div>\n  </section>\n\n')

def preuve(s, c, ct):
    t = ct.get("temoignage", {})
    return ('  <!-- 8. PREUVE -->\n  <section class="section">\n    <div class="container">\n'
      '      <div class="sec-h"><h2>Des résultats concrets <em>à ' + e(c["nom"]) + '</em></h2></div>\n'
      '      <div class="syn-grid"><div class="syn" style="cursor:default;">\n'
      '        <div class="syn__icon"><span class="material-symbols-outlined">format_quote</span></div>\n'
      '        <div class="syn__title" style="color:var(--accent);font-size:0.95rem;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>\n'
      '        <p class="syn__desc" style="font-style:italic;color:var(--text);">&laquo;&nbsp;' + e(t.get("quote", "")) + '&nbsp;&raquo;</p>\n'
      '        <span class="syn__link" style="color:var(--text-muted);text-transform:none;letter-spacing:0;">' + e(t.get("name", "")) + ' &middot; ' + e(t.get("role", "")) + '</span>\n'
      '      </div></div>\n    </div>\n  </section>\n\n')

def faq(s, c, ct):
    items = ct.get("faq", [])
    li = ""
    for i, f in enumerate(items):
        op = "true" if i == 0 else "false"
        li += ('        <div class="faq-i" data-open="' + op + '">\n'
          '          <button class="faq-i__q" type="button" aria-expanded="' + op + '"><span>' + e(f.get("q", "")) + '</span><span class="faq-i__q-icon">+</span></button>\n'
          '          <div class="faq-i__inner"><div class="faq-i__a-inner">' + e(f.get("a", "")) + '</div></div>\n        </div>\n')
    return ('  <!-- 9. FAQ LOCALE -->\n  <section class="section" style="background:var(--bg-2);" id="faq">\n    <div class="container">\n'
      '      <div class="sec-h"><h2>FAQ&nbsp;: ' + e(s["label"].lower()) + ' à <em>' + e(c["nom"]) + '</em></h2></div>\n'
      '      <div class="faq-list" id="faqList">\n' + li + '      </div>\n    </div>\n  </section>\n\n')

def ns_a(s, c, ct):
    return ('<!-- === NOIISE-STYLE SECTION A: Editorial 2-col === -->\n<section class="ns-section ns-section--a">\n  <div class="ns-container">\n    <div class="ns-split">\n'
      '      <div class="ns-split__text">\n        <span class="ns-eyebrow">Définition</span>\n'
      '        <h2 class="ns-h2">' + e(s["label"]) + ' à <em>' + e(c["nom"]) + '</em>&nbsp;: en quoi ça consiste&nbsp;?</h2>\n'
      '        <p>' + e(ct.get("pourquoi_intro", "")) + '</p>\n        <p>' + e(ct.get("hero_sub", "")) + '</p>\n'
      '        <p>' + e(ct.get("approche_intro", "")) + ' ' + e(ct.get("offre_intro", "")) + '</p>\n      </div>\n'
      '      <div class="ns-split__media"><img src="https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80" alt="' + e(s["label"]) + ' à ' + e(c["nom"]) + '" loading="lazy" /></div>\n'
      '    </div>\n  </div>\n</section>\n')

def ns_c(s, c, ct):
    return ('<!-- === NOIISE-STYLE SECTION C: Editorial 2-col reversed === -->\n<section class="ns-section ns-section--c">\n  <div class="ns-container">\n    <div class="ns-split ns-split--rev">\n'
      '      <div class="ns-split__media"><img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80" alt="Méthode ' + e(s["label"]) + ' à ' + e(c["nom"]) + '" loading="lazy" /></div>\n'
      '      <div class="ns-split__text">\n        <span class="ns-eyebrow">Notre approche</span>\n        <h2 class="ns-h2">Notre <em>méthode</em> orientée résultats.</h2>\n'
      '        <p>' + e(ct.get("approche_intro", "")) + '</p>\n        <p>' + e(ct.get("delais_intro", "")) + '</p>\n'
      '        <p>' + e(ct.get("tarifs", {}).get("desc", "")) + '</p>\n      </div>\n    </div>\n  </div>\n</section>\n')

def ns_d(s, c, ct):
    items = ct.get("faq", [])
    fq = ""
    for f in items:
        fq += ('      <details class="ns-faq">\n        <summary class="ns-faq__sum"><span class="ns-faq__q">' + e(f.get("q", "")) + '</span><span class="material-symbols-outlined ns-faq__chev">expand_more</span></summary>\n'
          '        <div class="ns-faq__a">' + e(f.get("a", "")) + '</div>\n      </details>\n')
    return ('<!-- === NOIISE-STYLE SECTION D: FAQ 2-col === -->\n<section class="ns-section ns-section--d">\n  <div class="ns-container">\n'
      '    <div class="ns-head"><span class="ns-eyebrow">FAQ</span><h2 class="ns-h2 ns-h2--center">Questions <em>fréquentes</em> — ' + e(s["label"].lower()) + ' à ' + e(c["nom"]) + '</h2></div>\n'
      '    <div class="ns-faq-grid">\n' + fq + '    </div>\n  </div>\n</section>\n')

def head_meta(html, s, c, ct):
    slug = s["sl"] + "-" + c["sl"]; url = "https://www.pirabellabs.com/" + slug
    title = ct.get("meta_title") or (s["label"] + " à " + c["nom"] + " - Pirabel Labs")
    desc = ct.get("meta_desc", "")
    html = re.sub(r'<title>.*?</title>', '<title>' + e(title) + '</title>', html, 1, flags=re.S)
    html = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + e(desc) + m.group(2), html, 1)
    html = re.sub(r'(<link rel="canonical" href=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), html, 1)
    html = re.sub(r'(<meta property="og:url" content=")[^"]*(")', lambda m: m.group(1) + url + m.group(2), html, 1)
    html = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + e(title) + m.group(2), html, 1)
    # JSON-LD: retire ceux du head, ajoute 3 frais
    head_end = html.find("</head>")
    head, rest = html[:head_end], html[head_end:]
    head = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', head, flags=re.S)
    faqld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": f.get("q", ""), "acceptedAnswer": {"@type": "Answer", "text": f.get("a", "")}} for f in ct.get("faq", [])]}
    svcld = {"@context": "https://schema.org", "@type": "Service", "serviceType": s["label"], "name": title, "description": desc,
             "areaServed": {"@type": "City", "name": c["nom"]},
             "provider": {"@type": "LocalBusiness", "name": "Pirabel Labs", "address": {"@type": "PostalAddress", "addressLocality": "Abomey-Calavi", "addressCountry": "BJ"}, "telephone": "+16139273067", "email": "contact@pirabellabs.com"},
             "offers": {"@type": "Offer", "priceCurrency": c["dev"], "availability": "https://schema.org/InStock"}}
    bcld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://www.pirabellabs.com/"},
        {"@type": "ListItem", "position": 2, "name": s["label"], "item": "https://www.pirabellabs.com/" + s["sl"]},
        {"@type": "ListItem", "position": 3, "name": "À " + c["nom"], "item": url}]}
    ld = "".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + '</script>\n' for x in (svcld, bcld, faqld))
    return head + ld + rest

def build(slug):
    p = json.load(io.open(os.path.join(CONTENT, slug + ".json"), encoding="utf-8"))
    s, c, ct = p["service"], p["city"], p["content"]
    bf = base_file(c["sl"])
    if not bf: return "NO_BASE"
    html = io.open(os.path.join(ROOT, bf), encoding="utf-8").read()
    html = head_meta(html, s, c, ct)
    html = repl(html, "<!-- 1. HERO", "<!-- 2.", hero(s, c, ct))
    html = repl(html, "<!-- 2.", "<!-- 3.", pourquoi(s, c, ct))
    html = repl(html, "<!-- 5.", "<!-- 6.", methode(s, c, ct))
    html = repl(html, "<!-- 6.", "<!-- 7.", tarifs(s, c, ct))
    html = repl(html, "<!-- 8.", "<!-- 9.", preuve(s, c, ct))
    html = repl(html, "<!-- 9.", "<!-- 10.", faq(s, c, ct))
    html = repl(html, "<!-- === NOIISE-STYLE SECTION A", "<!-- === NOIISE-STYLE SECTION B", ns_a(s, c, ct))
    html = repl(html, "<!-- === NOIISE-STYLE SECTION C", "<!-- === NOIISE-STYLE SECTION D", ns_c(s, c, ct))
    html = repl(html, "<!-- === NOIISE-STYLE SECTION D", "<!-- === NOIISE-STYLE SECTION E", ns_d(s, c, ct))
    io.open(os.path.join(ROOT, slug + ".html"), "w", encoding="utf-8").write(html)
    return "OK"

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        for slug in sys.argv[1:]: print(slug, build(slug))
    else:
        n = 0; nb = 0
        for jf in os.listdir(CONTENT):
            if not jf.endswith(".json"): continue
            r = build(jf[:-5])
            if r == "OK": n += 1
            elif r == "NO_BASE": nb += 1
        print("assemblées:", n, "| sans base ville:", nb)
