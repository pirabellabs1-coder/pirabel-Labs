#!/usr/bin/env python3
"""Fix ALL structural issues across EN pages:
1. Lang-switch: EN must be active, FR links to French version
2. hreflang: add both fr and en alternates
3. Relative links in footer/nav pointing to FR
4. Nav text still in French
5. Footer text still in French
6. Canonical URLs
"""
import os, re

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")
DOMAIN = "https://www.pirabellabs.com"

SWITCHER_CSS = """.lang-switch{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;gap:0;border:1px solid rgba(255,85,0,.4);background:rgba(10,10,10,.9);backdrop-filter:blur(10px);font-family:'Space Grotesk',sans-serif;}
.lang-switch a{padding:.5rem .85rem;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:rgba(255,255,255,.5);transition:all .2s;}
.lang-switch a:hover{color:#fff;}
.lang-switch a.active{background:#FF5500;color:#fff;}"""

# Nav/footer translations that may have been missed
NAV_FOOTER_FIXES = [
    # Nav items
    (">ACCUEIL<", ">HOME<"),
    (">Accueil<", ">Home<"),
    (">SERVICES<", ">SERVICES<"),
    (">BLOG<", ">BLOG<"),
    (">GUIDES<", ">GUIDES<"),
    (">RÉSULTATS<", ">RESULTS<"),
    (">R&Eacute;SULTATS<", ">RESULTS<"),
    (">Résultats<", ">Results<"),
    (">R&eacute;sultats<", ">Results<"),
    (">À PROPOS<", ">ABOUT<"),
    (">&Agrave; PROPOS<", ">ABOUT<"),
    (">À propos<", ">About<"),
    (">A propos<", ">About<"),
    (">Mon Espace<", ">My Account<"),
    (">Mon espace<", ">My Account<"),
    (">Audit SEO Gratuit<", ">Free SEO Audit<"),
    (">Audit Gratuit<", ">Free Audit<"),
    (">Audit gratuit<", ">Free Audit<"),
    (">AUDIT GRATUIT<", ">FREE AUDIT<"),
    (">Avis<", ">Reviews<"),

    # Footer sections
    (">Nos services<", ">Our Services<"),
    (">Nos Services<", ">Our Services<"),
    (">Liens rapides<", ">Quick Links<"),
    (">Liens Rapides<", ">Quick Links<"),
    (">Nous suivre<", ">Follow Us<"),
    (">Nous contacter<", ">Contact Us<"),
    (">Nous Contacter<", ">Contact Us<"),
    (">Ressources<", ">Resources<"),
    (">Villes<", ">Cities<"),
    (">Etudes de cas<", ">Case Studies<"),
    (">Études de cas<", ">Case Studies<"),

    # Footer text
    ("Tous droits réservés", "All rights reserved"),
    ("Tous droits reserves", "All rights reserved"),
    ("Tous droits r&eacute;serv&eacute;s", "All rights reserved"),
    (">Mentions légales<", ">Legal Notice<"),
    (">Mentions legales<", ">Legal Notice<"),
    (">Mentions l&eacute;gales<", ">Legal Notice<"),
    (">Politique de confidentialité<", ">Privacy Policy<"),
    (">Politique de confidentialite<", ">Privacy Policy<"),
    (">Confidentialité<", ">Privacy<"),
    (">Confidentialite<", ">Privacy<"),

    # Newsletter
    ("Restez informé", "Stay informed"),
    ("Restez informe", "Stay informed"),
    ("Restez inform&eacute;", "Stay informed"),
    ("Recevez nos guides, conseils et actualités directement dans votre boîte mail",
     "Receive our guides, tips and news directly in your inbox"),
    ("Recevez nos guides, conseils et actualites directement dans votre boite mail",
     "Receive our guides, tips and news directly in your inbox"),
    ("Recevez our guides, conseils and actualites directement in your boite mail",
     "Receive our guides, tips and news directly in your inbox"),
    ("Pas de spam, que de la valeur", "No spam, only value"),
    ("Pas de spam, that de la valeur", "No spam, only value"),
    ("Inscription réussie", "Successfully subscribed"),
    ("Inscription reussie", "Successfully subscribed"),
    ("S'inscrire", "Subscribe"),
    ("S&#39;inscrire", "Subscribe"),

    # Footer tagline
    ("L'agence digitale premium au service de votre croissance",
     "The premium digital agency for your growth"),
    ("L'agency digitale premium au service de your growth",
     "The premium digital agency for your growth"),
    ("L&#39;agence digitale premium au service de votre croissance",
     "The premium digital agency for your growth"),
    ("L&#39;agency digitale premium au service de your growth",
     "The premium digital agency for your growth"),

    # CTA buttons
    (">Demander un devis gratuit<", ">Request a free quote<"),
    (">Demander un devis<", ">Request a quote<"),
    (">Obtenir mon audit gratuit<", ">Get my free audit<"),
    (">Obtenir un devis gratuit<", ">Get a free quote<"),
    (">Réserver un appel stratégique<", ">Book a strategy call<"),
    (">Reserver un appel strategique<", ">Book a strategy call<"),
    (">Réserver un appel<", ">Book a call<"),
    (">En savoir plus<", ">Learn more<"),
    (">Lire la suite<", ">Read more<"),
    (">Lire l'article<", ">Read the article<"),
    (">Commencer maintenant<", ">Get started now<"),
    (">Voir nos résultats<", ">See our results<"),
    (">Voir nos results<", ">See our results<"),
    (">Voir nos services<", ">See our services<"),
    (">Découvrir nos services<", ">Discover our services<"),
    (">Decouvrir nos services<", ">Discover our services<"),
    (">Contactez-nous<", ">Contact us<"),
    (">Contactez nous<", ">Contact us<"),
    (">Planifier un appel<", ">Schedule a call<"),

    # Form labels
    ("Email professionnel", "Business email"),
    ("Votre email", "Your email"),
    ("Votre nom", "Your name"),
    ("Nom complet", "Full name"),
    ("Votre message", "Your message"),
    ("Votre téléphone", "Your phone"),
    ("Votre telephone", "Your phone"),
    ("Téléphone", "Phone"),
    ("Telephone", "Phone"),
    ("Envoyer le message", "Send message"),
    (">Envoyer<", ">Send<"),
    ("Réponse sous 24h", "Response within 24h"),
    ("Reponse sous 24h", "Response within 24h"),
    ("Données sécurisées", "Secure data"),
    ("Donnees securisees", "Secure data"),
    ("Données securisees", "Secure data"),

    # Marquee / ticker text
    ("REFERENCEMENT LOCAL", "LOCAL SEO"),
    ("REFERENCEMENT NATUREL", "ORGANIC SEO"),
    ("REDACTION SEO", "SEO WRITING"),
    ("MOTS-CLES", "KEYWORDS"),
    ("MOTS CLES", "KEYWORDS"),
    ("TRAFIC ORGANIQUE", "ORGANIC TRAFFIC"),
    ("CROISSANCE", "GROWTH"),
    ("STRATEGIE", "STRATEGY"),
    ("CONTENU", "CONTENT"),
    ("FORMATION SEO", "SEO TRAINING"),
    ("FORMATION", "TRAINING"),
    ("REFERENCEMENT", "SEO"),

    # Common section labels
    (">Le probleme<", ">The problem<"),
    (">Le problème<", ">The problem<"),
    (">Notre approche<", ">Our approach<"),
    (">Notre Approche<", ">Our Approach<"),
    (">Nos expertises<", ">Our expertise<"),
    (">Nos Expertises<", ">Our Expertise<"),
    (">Notre processus<", ">Our process<"),
    (">Notre Processus<", ">Our Process<"),
    (">Résultats concrets<", ">Concrete results<"),
    (">Questions fréquentes<", ">Frequently Asked Questions<"),
    (">Questions frequentes<", ">Frequently Asked Questions<"),
    ("QUESTIONS FREQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("QUESTIONS FRÉQUENTES", "FREQUENTLY ASKED QUESTIONS"),
]

def get_fr_url(en_rel_path):
    """Get the FR URL for an EN page."""
    path = en_rel_path.replace('\\', '/').replace('.html', '').replace('/index', '')
    if path == 'index':
        return '/'
    return '/' + path

def get_en_url(en_rel_path):
    """Get the EN URL for an EN page."""
    path = en_rel_path.replace('\\', '/').replace('.html', '').replace('/index', '')
    if path == 'index':
        return '/en/'
    return '/en/' + path

def fix_lang_switch(content, fr_url):
    """Replace any existing lang-switch with correct EN-active version."""
    # Remove ALL existing lang-switch divs and their CSS
    content = re.sub(r'<div class="lang-switch">.*?</div>', '', content, flags=re.DOTALL)
    # Remove old lang-switch CSS style blocks
    content = re.sub(r'<style>\s*\.lang-switch\{.*?\}\s*</style>', '', content, flags=re.DOTALL)

    # Add correct switcher
    css = f'<style>{SWITCHER_CSS}</style>'
    html = f'\n<div class="lang-switch"><a href="{fr_url}">FR</a><a href="#" class="active">EN</a></div>\n'

    content = content.replace('</head>', css + '\n</head>', 1)
    content = content.replace('</body>', html + '</body>', 1)
    return content

def fix_hreflang(content, en_rel_path):
    """Add proper hreflang tags for both FR and EN."""
    fr_path = en_rel_path.replace('\\', '/')
    fr_url_path = fr_path.replace('.html', '').replace('/index', '')
    if fr_url_path == 'index':
        fr_url_path = ''

    fr_full = f'{DOMAIN}/{fr_url_path}'
    en_full = f'{DOMAIN}/en/{fr_url_path}'

    # Remove ALL existing hreflang tags
    content = re.sub(r'\s*<link[^>]*hreflang[^>]*/?>\s*', '\n', content)
    # Remove duplicate x-default tags
    content = re.sub(r'\s*<link[^>]*x-default[^>]*/?>\s*', '\n', content)

    # Build correct hreflang block
    hreflang_block = f"""
    <link rel="alternate" hreflang="fr" href="{fr_full}">
    <link rel="alternate" hreflang="en" href="{en_full}">
    <link rel="alternate" hreflang="x-default" href="{fr_full}">"""

    # Insert after canonical or before first <link rel="preconnect
    if '<link rel="canonical"' in content:
        content = re.sub(
            r'(<link rel="canonical"[^>]*>)',
            r'\1' + hreflang_block,
            content, count=1
        )
    elif '<link rel="preconnect"' in content:
        content = content.replace(
            '<link rel="preconnect"',
            hreflang_block + '\n<link rel="preconnect"',
            1
        )

    return content

def fix_canonical(content, en_rel_path):
    """Fix canonical URL to point to EN version."""
    fr_path = en_rel_path.replace('\\', '/')
    url_path = fr_path.replace('.html', '').replace('/index', '')
    if url_path == 'index':
        url_path = ''

    en_canonical = f'{DOMAIN}/en/{url_path}'

    # Replace canonical
    content = re.sub(
        r'<link rel="canonical" href="[^"]*"',
        f'<link rel="canonical" href="{en_canonical}"',
        content, count=1
    )

    # Fix og:url
    content = re.sub(
        r'property="og:url" content="[^"]*"',
        f'property="og:url" content="{en_canonical}"',
        content, count=1
    )

    return content

def fix_relative_links(content):
    """Fix relative links in footer/nav that bypass /en/."""
    # Fix relative links like ../../agence-* that escape /en/
    # These should be absolute /en/agence-* links instead
    for prefix in ['agence-creation-sites-web', 'agence-seo-referencement-naturel',
                    'agence-design-branding', 'agence-social-media',
                    'agence-publicite-payante-sea-ads', 'agence-email-marketing-crm',
                    'agence-ia-automatisation', 'agence-redaction-content-marketing',
                    'agence-sales-funnels-cro', 'agence-video-motion-design',
                    'consulting-digital', 'formation-digitale', 'outils-digitaux',
                    'guides', 'blog']:
        # Fix ../../prefix and ../../../prefix etc.
        content = re.sub(
            rf'href="(?:\.\./)+{prefix}',
            f'href="/en/{prefix}',
            content
        )

    # Fix /avis -> /en/avis
    content = content.replace('href="/avis"', 'href="/en/avis"')
    content = content.replace('href="/avis/', 'href="/en/avis/')

    # Fix /status -> /en/status
    content = content.replace('href="/status"', 'href="/en/status"')

    return content

def fix_nav_footer_text(content):
    """Apply nav/footer text translations."""
    for fr, en in NAV_FOOTER_FIXES:
        content = content.replace(fr, en)
    return content

def fix_language_manager_script(content):
    """Remove Antigravity's language-manager.js reference if present."""
    content = re.sub(r'<script[^>]*language-manager\.js[^>]*></script>\s*', '', content)
    return content

count = 0
for root, dirs, files in os.walk(EN_DIR):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        rel_path = os.path.relpath(path, EN_DIR)

        with open(path, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        original = content

        fr_url = get_fr_url(rel_path)

        # 1. Fix lang-switch (most critical visual issue)
        content = fix_lang_switch(content, fr_url)

        # 2. Fix hreflang tags
        content = fix_hreflang(content, rel_path)

        # 3. Fix canonical/og:url
        content = fix_canonical(content, rel_path)

        # 4. Fix relative links
        content = fix_relative_links(content)

        # 5. Fix nav/footer text
        content = fix_nav_footer_text(content)

        # 6. Remove language-manager.js
        content = fix_language_manager_script(content)

        # 7. Ensure lang="en"
        content = content.replace('lang="fr"', 'lang="en"')
        content = content.replace("lang='fr'", "lang='en'")

        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Structural fixes applied to {count} EN files")
