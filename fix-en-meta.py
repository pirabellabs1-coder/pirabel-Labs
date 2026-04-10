#!/usr/bin/env python3
"""Fix remaining French text in meta tags and Schema.org across all /en/ files."""
import os, re

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")

# Meta description / og:description / twitter:description content translations
META_CONTENT_REPLACEMENTS = [
    # Common French words in meta content attributes
    ("votre agence digitale premium", "your premium digital agency"),
    ("votre agence", "your agency"),
    ("Agence digitale premium", "Premium digital agency"),
    ("Agence SEO", "SEO Agency"),
    ("Agence Sites Web", "Web Agency"),
    ("Agence Design", "Design Agency"),
    ("Agence Social Media", "Social Media Agency"),
    ("Agence Publicité", "Advertising Agency"),
    ("Agence Publicit&eacute;", "Advertising Agency"),
    ("Agence Email Marketing", "Email Marketing Agency"),
    ("Agence Vidéo", "Video Agency"),
    ("Agence Vid&eacute;o", "Video Agency"),
    ("Agence Rédaction", "Content Writing Agency"),
    ("Agence R&eacute;daction", "Content Writing Agency"),
    ("Agence IA", "AI Agency"),
    ("Agence Sales Funnels", "Sales Funnels Agency"),
    ("Agence Création", "Web Development Agency"),
    ("Agence Cr&eacute;ation", "Web Development Agency"),
    ("agence digitale premium", "premium digital agency"),
    ("a Paris, Cotonou et Casablanca", "in Paris, Cotonou and Casablanca"),
    ("à Paris, Cotonou et Casablanca", "in Paris, Cotonou and Casablanca"),
    ("&agrave; Paris, Cotonou et Casablanca", "in Paris, Cotonou and Casablanca"),
    ("Résultats mesurables", "Measurable results"),
    ("R&eacute;sultats mesurables", "Measurable results"),
    ("Resultats mesurables", "Measurable results"),
    ("création de sites web", "website creation"),
    ("cr&eacute;ation de sites web", "website creation"),
    ("creation de sites web", "website creation"),
    ("Création de Sites Web", "Website Creation"),
    ("Cr&eacute;ation de Sites Web", "Website Creation"),
    ("automatisation", "automation"),
    ("publicité digitale", "digital advertising"),
    ("publicit&eacute; digitale", "digital advertising"),
    ("sur mesure", "tailored"),
    ("Audit gratuit", "Free audit"),
    ("Audit SEO gratuit", "Free SEO audit"),
    ("spécialisée en", "specialized in"),
    ("sp&eacute;cialis&eacute;e en", "specialized in"),
    ("specialisee en", "specialized in"),
    ("les entreprises de", "businesses in"),
    ("les entreprises", "businesses"),
    ("Solutions", "Solutions"),
    ("Nous vous amenons en première page", "We get you to the first page"),
    ("Nous vous amenons en premi&egrave;re page", "We get you to the first page"),
    ("avec une stratégie sur mesure", "with a tailored strategy"),
    ("avec une strat&eacute;gie sur mesure", "with a tailored strategy"),
    # City page meta patterns
    ("Solutions Création de Sites Web sur mesure pour les entreprises de", "Tailored Website Creation solutions for businesses in"),
    ("Solutions SEO &amp; Référencement Naturel sur mesure pour les entreprises de", "Tailored SEO & Organic Search solutions for businesses in"),
    ("Solutions SEO & Référencement Naturel sur mesure pour les entreprises de", "Tailored SEO & Organic Search solutions for businesses in"),
    ("Solutions Design & Branding sur mesure pour les entreprises de", "Tailored Design & Branding solutions for businesses in"),
    ("Solutions Design &amp; Branding sur mesure pour les entreprises de", "Tailored Design & Branding solutions for businesses in"),
    ("Solutions IA & Automatisation sur mesure pour les entreprises de", "Tailored AI & Automation solutions for businesses in"),
    ("Solutions IA &amp; Automatisation sur mesure pour les entreprises de", "Tailored AI & Automation solutions for businesses in"),
    ("Solutions Publicité Payante sur mesure pour les entreprises de", "Tailored Paid Advertising solutions for businesses in"),
    ("Solutions Publicit&eacute; Payante sur mesure pour les entreprises de", "Tailored Paid Advertising solutions for businesses in"),
    ("Solutions Social Media sur mesure pour les entreprises de", "Tailored Social Media solutions for businesses in"),
    ("Solutions Email Marketing & CRM sur mesure pour les entreprises de", "Tailored Email & CRM solutions for businesses in"),
    ("Solutions Email Marketing &amp; CRM sur mesure pour les entreprises de", "Tailored Email & CRM solutions for businesses in"),
    ("Solutions Vidéo & Motion Design sur mesure pour les entreprises de", "Tailored Video & Motion Design solutions for businesses in"),
    ("Solutions Vid&eacute;o &amp; Motion Design sur mesure pour les entreprises de", "Tailored Video & Motion Design solutions for businesses in"),
    ("Solutions Rédaction & Content Marketing sur mesure pour les entreprises de", "Tailored Content Marketing solutions for businesses in"),
    ("Solutions R&eacute;daction &amp; Content Marketing sur mesure pour les entreprises de", "Tailored Content Marketing solutions for businesses in"),
    ("Solutions Sales Funnels & CRO sur mesure pour les entreprises de", "Tailored Sales Funnels & CRO solutions for businesses in"),
    ("Solutions Sales Funnels &amp; CRO sur mesure pour les entreprises de", "Tailored Sales Funnels & CRO solutions for businesses in"),
    # Schema.org descriptions
    ("Agence digitale premium specialisee en SEO, creation de sites web, IA et automatisation, branding et marketing digital.",
     "Premium digital agency specialized in SEO, website creation, AI and automation, branding and digital marketing."),
    ("Agence digitale premium a", "Premium digital agency in"),
    ("Cr&eacute;ation de sites web professionnels et performants.", "Professional and high-performance website creation."),
    ("Création de sites web professionnels et performants.", "Professional and high-performance website creation."),
    # BreadcrumbList
    ('"name":"Accueil"', '"name":"Home"'),
    ('"name":"Création de Sites Web"', '"name":"Website Creation"'),
    ('"name":"Cr&eacute;ation de Sites Web"', '"name":"Website Creation"'),
    ('"name":"SEO & Référencement"', '"name":"SEO & Organic Search"'),
    ('"name":"SEO &amp; R&eacute;f&eacute;rencement"', '"name":"SEO & Organic Search"'),
    ('"name":"Design & Branding"', '"name":"Design & Branding"'),
    # Title tag patterns
    ("Agence Création de Sites Web", "Web Development Agency"),
    ("Agence Cr&eacute;ation de Sites Web", "Web Development Agency"),
    ("Agence SEO &amp; Référencement Naturel", "SEO &amp; Organic Search Agency"),
    ("Agence SEO & Référencement Naturel", "SEO & Organic Search Agency"),
    ("Agence Design &amp; Branding", "Design &amp; Branding Agency"),
    ("Agence Design & Branding", "Design & Branding Agency"),
    ("Agence IA &amp; Automatisation", "AI &amp; Automation Agency"),
    ("Agence IA & Automatisation", "AI & Automation Agency"),
    ("Agence Publicité Payante", "Paid Advertising Agency"),
    ("Agence Publicit&eacute; Payante", "Paid Advertising Agency"),
    ("Agence Social Media", "Social Media Agency"),
    ("Agence Email Marketing &amp; CRM", "Email Marketing &amp; CRM Agency"),
    ("Agence Email Marketing & CRM", "Email Marketing & CRM Agency"),
    ("Agence Vidéo &amp; Motion Design", "Video &amp; Motion Design Agency"),
    ("Agence Vid&eacute;o &amp; Motion Design", "Video &amp; Motion Design Agency"),
    ("Agence Rédaction &amp; Content Marketing", "Content Marketing Agency"),
    ("Agence R&eacute;daction &amp; Content Marketing", "Content Marketing Agency"),
    ("Agence Sales Funnels &amp; CRO", "Sales Funnels &amp; CRO Agency"),
    ("Agence Sales Funnels & CRO", "Sales Funnels & CRO Agency"),
    ("Sites qui Convertissent", "Websites that Convert"),
    ("Dominez Google", "Dominate Google"),
    ("Identité Visuelle Premium", "Premium Visual Identity"),
    ("Identit&eacute; Visuelle Premium", "Premium Visual Identity"),
    # Page-specific title words
    ("Mentions Légales", "Legal Notice"),
    ("Politique de Confidentialité", "Privacy Policy"),
    ("Nos Résultats", "Our Results"),
    ("Nos R&eacute;sultats", "Our Results"),
    ("À Propos", "About"),
    ("&Agrave; Propos", "About"),
    ("Pirabel Labs Admin", "Pirabel Labs Admin"),
    # Service type in LocalBusiness schema
    ('"serviceType":"Création de Sites Web"', '"serviceType":"Website Creation"'),
    ('"serviceType":"Cr&eacute;ation de Sites Web"', '"serviceType":"Website Creation"'),
    ('"serviceType":"SEO & Référencement Naturel"', '"serviceType":"SEO & Organic Search"'),
    ('"serviceType":"Design & Branding"', '"serviceType":"Design & Branding"'),
    ('"serviceType":"IA & Automatisation"', '"serviceType":"AI & Automation"'),
    ('"serviceType":"Publicité Payante"', '"serviceType":"Paid Advertising"'),
    ('"serviceType":"Social Media"', '"serviceType":"Social Media"'),
]

count = 0
for root, dirs, files in os.walk(EN_DIR):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()

        original = content
        for fr, en in META_CONTENT_REPLACEMENTS:
            content = content.replace(fr, en)

        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Fixed meta/schema in {count} files")
