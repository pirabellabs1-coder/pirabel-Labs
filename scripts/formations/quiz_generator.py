#!/usr/bin/env python3
"""Generateur de QCM (5 questions par module) deterministe."""
import hashlib
import html as html_lib

# Banques de questions par categorie (10-15 questions / categorie - on en pioche 5 par module)
QUIZ_BANK = {
    'seo': [
        {"q": "Que signifie SEO ?", "a": ["Search Engine Optimization", "Standard Email Operations", "Site Editor Online", "Strong Email Outreach"], "correct": 0},
        {"q": "Combien de pages web Google indexe-t-il (ordre de grandeur en 2026) ?", "a": ["Quelques millions", "Quelques milliards", "Plusieurs centaines de milliards", "L'integralite du web"], "correct": 2},
        {"q": "Quel pourcentage de clics se concentre sur les 5 premiers resultats organiques ?", "a": ["20%", "45%", "75%", "95%"], "correct": 2},
        {"q": "Lequel n'est PAS un Core Web Vital ?", "a": ["LCP", "FID", "BPM", "CLS"], "correct": 2},
        {"q": "EEAT signifie...", "a": ["Experience, Expertise, Authoritativeness, Trustworthiness", "Email, Ads, Analytics, Tracking", "Editorial, Engagement, Audience, Traffic", "Evergreen, Engagement, Authority, Trust"], "correct": 0},
        {"q": "Quel outil est le mieux adapte pour un audit SEO technique ?", "a": ["Microsoft Word", "Screaming Frog", "Adobe Photoshop", "PowerPoint"], "correct": 1},
        {"q": "Quel meta tag est essentiel pour le SEO d'une page ?", "a": ["meta keywords", "meta description", "meta refresh", "meta viewport"], "correct": 1},
        {"q": "Qu'est-ce qu'un backlink ?", "a": ["Un lien casse sur votre site", "Un lien entrant depuis un autre site", "Un lien interne entre vos pages", "Une redirection 301"], "correct": 1},
        {"q": "Le temps moyen pour ranker sur une requete concurrentielle est de :", "a": ["1 a 7 jours", "1 a 4 semaines", "6 a 18 mois", "5 a 10 ans"], "correct": 2},
        {"q": "Qu'est-ce que la SGE de Google ?", "a": ["Search Generative Experience", "Site Global Engine", "Standard Google Editor", "Search Granted Endpoint"], "correct": 0},
        {"q": "Quelle longueur ideale pour une meta description ?", "a": ["50 caracteres", "120-160 caracteres", "300 caracteres", "500 caracteres"], "correct": 1},
        {"q": "Le hreflang sert a :", "a": ["Crypter une page", "Indiquer la langue/region cible d'une page", "Bloquer les robots", "Forcer le HTTPS"], "correct": 1},
    ],
    'web': [
        {"q": "Quel CMS detient la plus grande part de marche en 2026 ?", "a": ["Joomla", "WordPress", "Drupal", "Wix"], "correct": 1},
        {"q": "Quelle metrique Core Web Vitals doit etre inferieure a 2.5s ?", "a": ["FID", "INP", "LCP", "CLS"], "correct": 2},
        {"q": "Quel format d'image moderne offre la meilleure compression ?", "a": ["BMP", "GIF", "WebP/AVIF", "TIFF"], "correct": 2},
        {"q": "Quel framework JS est repute le plus rapide pour des sites statiques ?", "a": ["Angular", "Astro", "React (CRA)", "Ember"], "correct": 1},
        {"q": "Quel plugin securite WordPress est recommande ?", "a": ["MailChimp", "Wordfence", "Yoast SEO", "Akismet"], "correct": 1},
        {"q": "Quel est le standard d'accessibilite a viser ?", "a": ["WCAG AA", "RGAA Basic", "Section 508", "Aucun"], "correct": 0},
        {"q": "Lequel n'est pas un page builder WordPress ?", "a": ["Elementor", "Divi", "Beaver Builder", "Photoshop"], "correct": 3},
        {"q": "Quelle solution de cache WordPress est gratuite ET performante ?", "a": ["WP Rocket", "W3 Total Cache", "WP Super Cache", "LiteSpeed Cache"], "correct": 3},
        {"q": "Quel hebergeur est le plus reconnu pour WordPress hauts trafics ?", "a": ["Wix", "GoDaddy", "WP Engine / Kinsta", "Free.fr"], "correct": 2},
        {"q": "Quel score Lighthouse Mobile viser pour un site pro ?", "a": ["> 60", "> 80", "> 90", "Peu importe"], "correct": 2},
    ],
    'marketing': [
        {"q": "Le framework AARRR signifie...", "a": ["Acquisition, Activation, Retention, Referral, Revenue", "Audit, Action, Repeat, Review, Result", "Ads, Audience, Rank, Reach, ROI", "Agree, Apply, Reach, Refer, Realize"], "correct": 0},
        {"q": "Le persona est :", "a": ["Un modele de tarif", "Une representation type d'un client cible", "Un format video", "Un email automatique"], "correct": 1},
        {"q": "Le funnel marketing classique comporte combien d'etapes principales ?", "a": ["2", "3 (TOFU, MOFU, BOFU)", "10", "Aucune, c'est lineaire"], "correct": 1},
        {"q": "Quel canal a generalement le ROI le plus eleve sur 24 mois ?", "a": ["Display ads", "SEO et contenu", "Cold calling", "Print"], "correct": 1},
        {"q": "Le CLV est :", "a": ["Customer Lifetime Value", "Click Lead Volume", "Customer Loyalty Vote", "Cross-channel Linking Value"], "correct": 0},
        {"q": "Lequel n'est PAS un modele d'attribution ?", "a": ["Last-click", "First-click", "Linear", "Pre-click"], "correct": 3},
        {"q": "Quel KPI mesure la satisfaction client de maniere simple ?", "a": ["EBITDA", "NPS (Net Promoter Score)", "CTR", "DAU"], "correct": 1},
        {"q": "Quelle methodologie est associee au marketing entrant ?", "a": ["Outbound", "Inbound (HubSpot)", "Field marketing", "ABM exclusivement"], "correct": 1},
        {"q": "Combien de touches marketing avant l'achat B2B en moyenne ?", "a": ["1", "3-5", "8-12", "50+"], "correct": 2},
        {"q": "Quel framework hierarchise les hypotheses ?", "a": ["MVP", "ICE / RICE", "JTBD", "BMC"], "correct": 1},
    ],
    'ads': [
        {"q": "Quel pixel Meta sert au tracking ?", "a": ["Meta Pixel", "Google Pixel", "Bing Pixel", "Reddit Pixel"], "correct": 0},
        {"q": "CBO signifie :", "a": ["Cost Bid Override", "Campaign Budget Optimization", "Click Based Output", "Conversion Booster Online"], "correct": 1},
        {"q": "Quel changement Apple a impacte le tracking publicitaire ?", "a": ["Android 12", "iOS 14", "iOS 7", "macOS 11"], "correct": 1},
        {"q": "Quel KPI mesure la rentabilite d'une campagne e-commerce ?", "a": ["CPM", "CTR", "ROAS", "Reach"], "correct": 2},
        {"q": "Quel format video est le plus efficace sur TikTok ?", "a": ["Horizontal 16:9", "Vertical 9:16", "Carre 1:1", "4:3"], "correct": 1},
        {"q": "Combien de creas tester en parallele par ad set ?", "a": ["1", "3 a 5", "20+", "0 (l'algo choisit)"], "correct": 1},
        {"q": "L'API Conversion (CAPI) sert a :", "a": ["Creer des conversions", "Envoyer des events server-side a Meta", "Detecter les bots", "Bloquer le tracking"], "correct": 1},
        {"q": "Quel objectif de campagne maximiser pour generer des leads ?", "a": ["Reach", "Awareness", "Lead generation", "Engagement"], "correct": 2},
        {"q": "Quel outil d'attribution est recommande pour e-commerce ?", "a": ["Google Sheets", "Triple Whale", "Photoshop", "Trello"], "correct": 1},
        {"q": "Spark Ads est une fonctionnalite de :", "a": ["Google Ads", "Meta Ads", "TikTok Ads", "LinkedIn Ads"], "correct": 2},
    ],
    'social': [
        {"q": "Reels est une fonctionnalite de :", "a": ["Facebook", "Instagram", "Twitter / X", "Pinterest"], "correct": 1},
        {"q": "Quel format performe le mieux sur LinkedIn en 2026 ?", "a": ["Articles longs", "Carousels (PDF)", "Memes", "Hashtags seuls"], "correct": 1},
        {"q": "Le taux d'engagement se calcule :", "a": ["Likes / Abonnes", "(Interactions / Portee) * 100", "Followers / 1000", "Vues / Likes"], "correct": 1},
        {"q": "Quel reseau privilegier pour le B2B ?", "a": ["Snapchat", "TikTok", "LinkedIn", "Twitch"], "correct": 2},
        {"q": "Quel rythme de publication recommande sur TikTok pour scaler ?", "a": ["1 / semaine", "1-3 / jour", "1 / mois", "Sans regle"], "correct": 1},
        {"q": "Un nano-influenceur a typiquement :", "a": ["1k-10k abonnes", "100k+ abonnes", "1M+ abonnes", "Aucun abonne"], "correct": 0},
        {"q": "Quel outil permet de planifier ses publications multi-plateformes ?", "a": ["Hubspot CRM", "Buffer / Later / Metricool", "Notion", "Zoom"], "correct": 1},
        {"q": "Une story Instagram dure :", "a": ["1 minute", "24 heures", "7 jours", "Pour toujours"], "correct": 1},
        {"q": "Le 'Reach' est :", "a": ["Le nombre total d'impressions", "Le nombre unique d'utilisateurs touches", "Le taux de clics", "Le taux d'abonnement"], "correct": 1},
        {"q": "Quel hook video performe le mieux en 2026 ?", "a": ["Long intro de 30s", "Hook < 3s + valeur immediate", "Musique seule", "Texte statique"], "correct": 1},
    ],
    'content': [
        {"q": "AIDA est un framework :", "a": ["De cuisine", "Copywriting (Attention, Interest, Desire, Action)", "SEO technique", "Bash scripting"], "correct": 1},
        {"q": "Quelle longueur ideale pour un article de blog SEO concurrentiel ?", "a": ["300 mots", "1500-3000 mots", "10000 mots", "Aucune importance"], "correct": 1},
        {"q": "Topic cluster signifie :", "a": ["Bouquet de mots-cles", "Strategie pillar page + articles satellites", "Calendrier editorial", "Outil SEO"], "correct": 1},
        {"q": "PAS est un framework :", "a": ["Problem - Agitate - Solution", "Plan - Act - Sell", "Page - Audit - Score", "Push - Ask - Send"], "correct": 0},
        {"q": "Quel outil d'optimisation editoriale SEO est reconnu ?", "a": ["Photoshop", "Frase / Surfer SEO / Clearscope", "Outlook", "Slack"], "correct": 1},
        {"q": "Une newsletter optimale envoyee a quelle frequence ?", "a": ["10 / jour", "1 / mois minimum", "1-4 / mois selon contexte", "Aucune regle"], "correct": 2},
        {"q": "L'intention de recherche se categorise en :", "a": ["Informationnelle, Navigationnelle, Transactionnelle, Commerciale", "Bon, Mauvais", "Long terme, Court terme", "Active, Passive"], "correct": 0},
        {"q": "Pour la SGE, structurer une reponse en :", "a": ["Texte unique sans formatage", "Question + reponse courte (40-60 mots) sous H2", "Image uniquement", "Tableau Excel"], "correct": 1},
        {"q": "Quel framework adapter pour decrire un benefice ?", "a": ["FAB (Features-Advantages-Benefits)", "SQL", "Agile", "MVP"], "correct": 0},
        {"q": "Le content refresh consiste a :", "a": ["Supprimer du contenu", "Mettre a jour un ancien article pour regagner du trafic", "Republier sur les reseaux", "Changer le theme du site"], "correct": 1},
    ],
    'email': [
        {"q": "SPF, DKIM, DMARC servent a :", "a": ["Designer un email", "Authentifier l'expediteur (delivrabilite)", "Tracker les ouvertures", "Compresser des images"], "correct": 1},
        {"q": "Un bon taux d'ouverture B2B est :", "a": ["5%", "15%", ">= 25%", "60%"], "correct": 2},
        {"q": "RFM signifie :", "a": ["Recence, Frequence, Montant", "Reply, Forward, Move", "Read, Format, Mark", "Reach, Funnel, Margin"], "correct": 0},
        {"q": "Le double opt-in :", "a": ["Empeche l'envoi d'email", "Demande confirmation par lien email apres inscription", "Cree un compte automatiquement", "Bloque les robots"], "correct": 1},
        {"q": "Quel outil mesurer la delivrabilite ?", "a": ["Google Analytics", "GlockApps / MXToolbox / Litmus", "Slack", "Trello"], "correct": 1},
        {"q": "Un soft bounce signifie :", "a": ["L'email est definitivement rejete", "L'email a un probleme temporaire", "L'email a ete ouvert", "L'email a ete supprime"], "correct": 1},
        {"q": "Le taux de desinscription a surveiller doit etre :", "a": ["> 5%", "< 0.5%", "= 50%", "Sans importance"], "correct": 1},
        {"q": "Une sequence Welcome ideale dure :", "a": ["1 email immediat seulement", "3 a 5 emails sur 7-14 jours", "30 emails / mois", "Sans regle"], "correct": 1},
        {"q": "Le warm-up de domaine sert a :", "a": ["Chauffer son serveur", "Etablir progressivement la reputation d'envoi", "Compresser ses images", "Crypter les mots de passe"], "correct": 1},
        {"q": "Klaviyo est specialise en :", "a": ["Email B2B uniquement", "Email & SMS e-commerce", "CRM ventes", "Comptabilite"], "correct": 1},
    ],
    'design': [
        {"q": "Le contraste minimum WCAG AA pour texte normal est :", "a": ["3:1", "4.5:1", "7:1", "20:1"], "correct": 1},
        {"q": "Auto Layout est une fonctionnalite de :", "a": ["Word", "Figma", "Photoshop", "After Effects"], "correct": 1},
        {"q": "Quels sont les 3 principes UI/UX cles ?", "a": ["Hierarchie, Contraste, Espacement", "Bold, Italic, Underline", "Rouge, Vert, Bleu", "Mac, PC, Linux"], "correct": 0},
        {"q": "Un design system inclut :", "a": ["Tokens (colors, spacing), Components, Documentation", "Photos de paysages", "Code backend", "Plan marketing"], "correct": 0},
        {"q": "Atomic Design est une methode de :", "a": ["Composition de molecules en UI", "Test chimique", "SEO local", "Cuisine"], "correct": 0},
        {"q": "Une charte graphique doit definir :", "a": ["Logo, couleurs, typographie, espacements, ton", "Uniquement le logo", "Le prix des services", "Le code source"], "correct": 0},
        {"q": "Quel outil pour creer des animations Web legeres ?", "a": ["After Effects + export PNG", "Lottie (animations JSON)", "PowerPoint", "Excel"], "correct": 1},
        {"q": "Le 'white space' (espace negatif) :", "a": ["Doit etre evite", "Ameliore la lisibilite et la hierarchie", "Coute de l'argent", "N'a aucun effet"], "correct": 1},
        {"q": "Quel format vectoriel privilegier pour le web ?", "a": ["JPG", "PNG", "SVG", "BMP"], "correct": 2},
        {"q": "Storybook est utilise pour :", "a": ["Lire des histoires", "Documenter et tester un design system", "Stocker des images", "Gerer des budgets"], "correct": 1},
    ],
    'ai': [
        {"q": "Un LLM est :", "a": ["Long Length Memory", "Large Language Model", "Linear Layered Map", "Linked Local Module"], "correct": 1},
        {"q": "RAG signifie :", "a": ["Random Algorithm Group", "Retrieval Augmented Generation", "Recurrent Adaptive Grid", "Recursive Action Graph"], "correct": 1},
        {"q": "Few-shot prompting consiste a :", "a": ["Donner peu d'exemples a l'IA", "Donner 0 exemple", "Donner 1000+ exemples", "Refaire le pre-training"], "correct": 0},
        {"q": "Lequel n'est PAS un LLM ?", "a": ["Claude", "GPT-4o", "Gemini", "PowerPoint"], "correct": 3},
        {"q": "Un agent IA peut :", "a": ["Uniquement repondre par texte", "Appeler des fonctions / outils externes", "Generer uniquement des images", "Stocker des fichiers"], "correct": 1},
        {"q": "Une 'hallucination' d'un LLM est :", "a": ["Une vraie maladie", "Une reponse plausible mais fausse", "Un bug technique", "Une feature volontaire"], "correct": 1},
        {"q": "Quelle plateforme no-code permet d'orchestrer des LLMs ?", "a": ["Excel", "Make / Zapier / n8n", "Word", "Outlook"], "correct": 1},
        {"q": "Le 'context window' d'un LLM est :", "a": ["Sa fenetre d'affichage", "La quantite max de tokens en entree+sortie", "Sa version", "Son prix"], "correct": 1},
        {"q": "Pour generer une image, on utilise :", "a": ["Claude (text)", "Midjourney / DALL-E / Stable Diffusion", "Excel", "Word"], "correct": 1},
        {"q": "Le 'fine-tuning' consiste a :", "a": ["Acheter un LLM", "Specialiser un LLM sur ses propres donnees", "Compresser le modele", "Le rendre plus lent"], "correct": 1},
    ],
    'data': [
        {"q": "GA4 a remplace :", "a": ["Google Search Console", "Universal Analytics", "Google Ads", "Looker"], "correct": 1},
        {"q": "BigQuery est :", "a": ["Une base de donnees SQL serverless de Google", "Un outil de design", "Un CMS", "Un CDN"], "correct": 0},
        {"q": "Looker Studio (anciennement Data Studio) sert a :", "a": ["Coder en JavaScript", "Creer des dashboards visuels", "Editer des photos", "Envoyer des emails"], "correct": 1},
        {"q": "Un evenement de conversion en GA4 doit etre :", "a": ["Toujours active", "Marque comme conversion manuellement", "Genere automatiquement", "Ignore"], "correct": 1},
        {"q": "Une cohort analysis observe :", "a": ["Une seule personne", "Un groupe d'utilisateurs au fil du temps", "Un produit unique", "Un revenu unique"], "correct": 1},
        {"q": "Server-side tracking via GTM permet de :", "a": ["Etre plus precis et conforme RGPD", "Coder en C++", "Eliminer le besoin de marketing", "Doubler la vitesse du site"], "correct": 0},
        {"q": "Un dashboard executif type contient :", "a": ["50+ graphiques", "3-7 KPIs critiques", "Uniquement du texte", "Aucune donnee"], "correct": 1},
        {"q": "Le Consent Mode v2 sert a :", "a": ["Gerer le consentement RGPD avec Google", "Coder en Mode v2", "Activer le mode sombre", "Diminuer la vitesse"], "correct": 0},
        {"q": "Un A/B test statistiquement significatif requiert :", "a": ["10 visiteurs", "Un nombre suffisant (souvent 1000+ conversions)", "Aucun calcul", "Plusieurs annees"], "correct": 1},
        {"q": "Mixpanel est un outil :", "a": ["De montage video", "D'analytics produit avance", "De facturation", "De compression d'images"], "correct": 1},
    ],
}


def generate_quiz(formation, module_idx):
    """Genere un QCM de 5 questions deterministe pour (formation, module_idx).
    Returns liste de dict : [{q, options[4], correct_idx, explanation_optional}, ...]
    """
    cat = formation['cat']
    bank = QUIZ_BANK.get(cat, QUIZ_BANK['marketing'])
    seed = f"{formation['slug']}-quiz-m{module_idx}"
    h = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    # Pick 5 distinct questions deterministically
    n_total = len(bank)
    picked_idx = []
    for i in range(5):
        idx = (h + i * 7) % n_total
        # Avoid duplicates
        while idx in picked_idx:
            idx = (idx + 1) % n_total
        picked_idx.append(idx)
    return [bank[i] for i in picked_idx]


def render_quiz_page(formation, module_idx, module_title, all_modules, is_en=False):
    """Genere la page HTML du QCM de fin de module."""
    quiz = generate_quiz(formation, module_idx)
    lang = 'en' if is_en else 'fr'
    base_url = '/en' if is_en else ''
    slug = formation['slug']
    f_title = formation['title_en' if is_en else 'title_fr']
    formation_url = f"{base_url}/formations/{slug}"
    canonical = f"https://www.pirabellabs.com{formation_url}/m{module_idx}-quiz"
    # SEO-friendly title cap a 65 chars
    short_title = f"Quiz Module {module_idx} - {module_title}"
    page_title = short_title[:65].rstrip()
    page_desc = f"QCM de validation du module {module_idx} ({module_title[:50]}) de {f_title[:50]}. 5 questions, valider a 70 pour avancer."
    if len(page_desc) > 160:
        page_desc = page_desc[:157].rstrip() + '...'

    # Next module link
    n_modules = len(all_modules)
    is_last_module = module_idx == n_modules
    if is_last_module:
        next_label = "Voir mon certificat" if not is_en else "View my certificate"
        next_link = f"{formation_url}/certificat"
    else:
        next_label = f"Passer au module {module_idx+1}" if not is_en else f"Go to module {module_idx+1}"
        next_link = f"{formation_url}/m{module_idx+1}-l1"

    # Questions JS data
    import json as json_lib
    quiz_json = json_lib.dumps([
        {"q": q["q"], "a": q["a"], "c": q["correct"]} for q in quiz
    ], ensure_ascii=False)

    nav_links_fr = '<a href="/">ACCUEIL</a><a href="/services">SERVICES</a><a href="/blog">BLOG</a><a href="/guides/">GUIDES</a><a href="/formations/" class="active">FORMATIONS</a><a href="/resultats">RESULTATS</a><a href="/a-propos">A PROPOS</a>'
    nav_links_en = '<a href="/en/">HOME</a><a href="/en/services">SERVICES</a><a href="/en/blog">BLOG</a><a href="/en/guides/">GUIDES</a><a href="/en/formations/" class="active">TRAININGS</a><a href="/en/resultats">RESULTS</a><a href="/en/a-propos">ABOUT</a>'
    nav_links = nav_links_en if is_en else nav_links_fr

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html_lib.escape(page_title)}</title>
<meta name="description" content="{html_lib.escape(page_desc)}">
<link rel="icon" type="image/png" href="../../img/favicon.png">
<link rel="canonical" href="{canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600&display=swap"></noscript>
<link rel="stylesheet" href="../../css/global.css">
<style>
.quiz-layout{{max-width:48rem;margin:0 auto;padding:7rem var(--px-page,5%) 3rem;}}
.quiz-h1{{font-family:var(--font-headline);font-size:clamp(1.5rem,3vw,2.25rem);font-weight:800;margin:0.5rem 0 0.5rem;letter-spacing:-0.02em;}}
.quiz-subtitle{{color:rgba(229,226,225,0.6);margin-bottom:2rem;}}
.quiz-question{{padding:1.5rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.15);margin-bottom:1rem;}}
.quiz-q-num{{font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--primary-container);margin-bottom:0.5rem;}}
.quiz-q-text{{font-weight:600;font-size:1.05rem;margin-bottom:1rem;color:var(--on-surface);}}
.quiz-option{{display:flex;gap:0.75rem;padding:0.85rem 1rem;border:1px solid rgba(92,64,55,0.2);cursor:pointer;margin-bottom:0.5rem;transition:all 0.2s;}}
.quiz-option:hover{{border-color:var(--primary-container);background:rgba(255,87,0,0.04);}}
.quiz-option.selected{{border-color:var(--primary-container);background:rgba(255,87,0,0.1);}}
.quiz-option.correct{{border-color:#4ade80;background:rgba(74,222,128,0.1);}}
.quiz-option.incorrect{{border-color:#f97316;background:rgba(249,115,22,0.1);}}
.quiz-option input{{margin-right:0.5rem;}}
.quiz-submit{{padding:1rem 2rem;background:var(--primary-container);color:#0e0e0e;border:none;font-family:var(--font-headline);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.9rem;cursor:pointer;margin-top:1.5rem;width:100%;}}
.quiz-result{{margin-top:2rem;padding:2rem;text-align:center;border:1px solid;}}
.quiz-result.pass{{border-color:#4ade80;background:rgba(74,222,128,0.06);}}
.quiz-result.fail{{border-color:#f97316;background:rgba(249,115,22,0.06);}}
.quiz-result h2{{font-family:var(--font-headline);margin-top:0;}}
.quiz-result .score-big{{font-size:3rem;font-family:var(--font-headline);font-weight:800;margin:0.5rem 0;}}
.quiz-next-btn{{display:inline-block;margin-top:1.5rem;padding:0.9rem 1.5rem;background:var(--primary-container);color:#0e0e0e;text-decoration:none;font-family:var(--font-headline);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.85rem;}}
</style>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="{base_url}/" class="nav-logo"><img src="../../img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links}</div>
<a class="nav-login" href="{base_url}/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> {"My Account" if is_en else "Mon Espace"}</a>
<a href="{base_url}/contact" class="nav-cta">{"Free Audit" if is_en else "Audit Gratuit"}</a>
<div class="nav-hamburger"><span></span><span></span><span></span></div>
</div></nav>

<main class="quiz-layout">
<nav class="lesson-breadcrumb" style="font-size:0.85rem;color:rgba(229,226,225,0.5);margin-bottom:1rem;">
<a href="{base_url}/formations/" style="color:rgba(229,226,225,0.7);">{"Trainings" if is_en else "Formations"}</a> &rarr;
<a href="{formation_url}" style="color:rgba(229,226,225,0.7);">{html_lib.escape(f_title)}</a> &rarr;
<span>Quiz Module {module_idx}</span>
</nav>
<h1 class="quiz-h1">Quiz Module {module_idx} : {html_lib.escape(module_title)}</h1>
<p class="quiz-subtitle">{"Validate your knowledge with 5 questions. You need 70% to pass and unlock the next module." if is_en else "Validez vos acquis avec 5 questions. Il vous faut 70% pour valider et debloquer le module suivant."}</p>

<form id="quiz-form"></form>

<script>
const QUIZ_DATA = {quiz_json};
const FORMATION_SLUG = "{slug}";
const MODULE_IDX = {module_idx};
const PASSING_SCORE = 0.7;
const IS_LAST = {str(is_last_module).lower()};
const NEXT_LINK = "{next_link}";
const NEXT_LABEL = "{next_label}";
const LANG = "{lang}";

function renderQuiz() {{
  const form = document.getElementById('quiz-form');
  let html = '';
  QUIZ_DATA.forEach((q, qi) => {{
    html += `<div class="quiz-question" data-q="${{qi}}">
<div class="quiz-q-num">{"Question" if is_en else "Question"} ${{qi+1}}/5</div>
<div class="quiz-q-text">${{q.q}}</div>`;
    q.a.forEach((opt, oi) => {{
      html += `<label class="quiz-option" data-q="${{qi}}" data-o="${{oi}}">
<input type="radio" name="q${{qi}}" value="${{oi}}" required>
<span>${{opt}}</span>
</label>`;
    }});
    html += '</div>';
  }});
  html += `<button type="submit" class="quiz-submit">{"Submit quiz" if is_en else "Valider mes reponses"}</button>`;
  html += '<div id="quiz-result"></div>';
  form.innerHTML = html;

  // Visual selected feedback
  form.querySelectorAll('.quiz-option').forEach(opt => {{
    opt.addEventListener('click', () => {{
      const qi = opt.dataset.q;
      form.querySelectorAll(`.quiz-option[data-q="${{qi}}"]`).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    }});
  }});

  form.addEventListener('submit', async (e) => {{
    e.preventDefault();
    let correct = 0;
    QUIZ_DATA.forEach((q, qi) => {{
      const selected = parseInt(form.querySelector(`input[name="q${{qi}}"]:checked`)?.value);
      if (selected === q.c) correct++;
      // Show feedback
      form.querySelectorAll(`.quiz-option[data-q="${{qi}}"]`).forEach((o, oi) => {{
        if (oi === q.c) o.classList.add('correct');
        else if (oi === selected) o.classList.add('incorrect');
      }});
    }});
    const score = correct / QUIZ_DATA.length;
    const passed = score >= PASSING_SCORE;
    document.getElementById('quiz-result').innerHTML = `
<div class="quiz-result ${{passed ? 'pass' : 'fail'}}">
  <div class="score-big">${{correct}}/${{QUIZ_DATA.length}}</div>
  <h2>${{passed ? '{"Module passed !" if is_en else "Module valide !"}' : '{"Try again" if is_en else "Reessayez"}'}}</h2>
  <p>${{passed ? '{"Congratulations! You have validated this module." if is_en else "Felicitations ! Vous avez valide ce module."}' : '{"You need 70% to pass. Review the lessons and try again." if is_en else "Il vous faut 70 pourcent pour valider. Revoyez les lecons et reessayez."}'}}</p>
  ${{passed ? `<a href="${{NEXT_LINK}}" class="quiz-next-btn">${{NEXT_LABEL}} &rarr;</a>` : '<button onclick="location.reload()" class="quiz-next-btn">{"Retake" if is_en else "Recommencer"}</button>'}}
</div>`;
    document.getElementById('quiz-result').scrollIntoView({{ behavior: 'smooth' }});

    // Submit to backend if logged in
    try {{
      await fetch('/api/lms/quiz/submit', {{
        method: 'POST',
        credentials: 'include',
        headers: {{'Content-Type': 'application/json'}},
        body: JSON.stringify({{
          formationSlug: FORMATION_SLUG,
          moduleIdx: MODULE_IDX,
          score: correct,
          total: QUIZ_DATA.length,
          passed
        }})
      }});
    }} catch (e) {{ /* not logged in, ignore */ }}
  }});
}}
renderQuiz();
</script>

</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">{"Premium digital agency. Headquartered in Abomey-Calavi, Benin." if is_en else "Agence digitale premium. Siege : Abomey-Calavi, Benin."}</p></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span></div>
</footer>
<script src="../../js/global.js?v=5"></script>
</body>
</html>
"""


def render_certificate_page(formation, all_modules, is_en=False):
    """Genere la page certificat (la verification serveur est faite cote API)."""
    lang = 'en' if is_en else 'fr'
    base_url = '/en' if is_en else ''
    slug = formation['slug']
    f_title = formation['title_en' if is_en else 'title_fr']
    formation_url = f"{base_url}/formations/{slug}"
    canonical = f"https://www.pirabellabs.com{formation_url}/certificat"

    nav_links_fr = '<a href="/">ACCUEIL</a><a href="/services">SERVICES</a><a href="/blog">BLOG</a><a href="/guides/">GUIDES</a><a href="/formations/" class="active">FORMATIONS</a><a href="/resultats">RESULTATS</a><a href="/a-propos">A PROPOS</a>'
    nav_links_en = '<a href="/en/">HOME</a><a href="/en/services">SERVICES</a><a href="/en/blog">BLOG</a><a href="/en/guides/">GUIDES</a><a href="/en/formations/" class="active">TRAININGS</a><a href="/en/resultats">RESULTS</a><a href="/en/a-propos">ABOUT</a>'
    nav_links = nav_links_en if is_en else nav_links_fr

    total_lessons = sum(len(m.get('lessons', [])) for m in all_modules)
    n_modules = len(all_modules)

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{"Certificate" if is_en else "Certificat"} - {html_lib.escape(f_title)} | Pirabel Labs</title>
<meta name="description" content="{"Generate and download your Pirabel Labs Academy certificate." if is_en else "Generez et telechargez votre certificat Pirabel Labs Academy."}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="{canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap"></noscript>
<link rel="stylesheet" href="../../css/global.css">
<style>
.cert-wrap{{max-width:60rem;margin:0 auto;padding:7rem var(--px-page,5%) 3rem;}}
.cert-h1{{font-family:var(--font-headline);font-size:2rem;font-weight:800;margin-bottom:0.5rem;}}
.cert-subtitle{{color:rgba(229,226,225,0.6);margin-bottom:2rem;}}
.cert-status{{padding:1.5rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.15);margin-bottom:2rem;}}
.cert-status.locked{{border-color:#f97316;}}
.cert-status.unlocked{{border-color:#4ade80;}}
.cert-preview{{background:#fff;color:#0e0e0e;padding:3rem 2rem;border:8px double #c69c52;text-align:center;margin:2rem 0;font-family:'Playfair Display',serif;position:relative;}}
.cert-preview .cert-ribbon{{position:absolute;top:0;left:50%;transform:translateX(-50%);background:#c69c52;color:#fff;padding:0.5rem 2rem;font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;font-family:var(--font-headline);}}
.cert-preview h2{{font-family:'Playfair Display',serif;font-size:2rem;color:#0e0e0e;margin:2rem 0 0.5rem;}}
.cert-preview .cert-name{{font-size:2.5rem;font-family:'Playfair Display',serif;color:#c69c52;margin:1.5rem 0;border-bottom:1px solid #c69c52;display:inline-block;padding:0 2rem 0.5rem;min-width:60%;}}
.cert-preview .cert-formation{{font-style:italic;color:#333;margin:1rem 0;font-size:1.15rem;}}
.cert-preview .cert-stats{{display:flex;justify-content:center;gap:2rem;margin:1.5rem 0;font-family:var(--font-body);font-size:0.85rem;color:#666;}}
.cert-preview .cert-sig{{margin-top:2.5rem;display:flex;justify-content:space-around;font-family:var(--font-body);font-size:0.85rem;color:#666;}}
.cert-preview .cert-sig .sig-block{{text-align:center;border-top:1px solid #666;padding-top:0.5rem;min-width:12rem;}}
.cert-download{{display:inline-block;padding:1rem 2rem;background:var(--primary-container);color:#0e0e0e;text-decoration:none;font-family:var(--font-headline);font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-size:0.9rem;margin-top:1rem;}}
@media print{{nav,footer,.cert-status,.cert-download{{display:none!important;}}.cert-preview{{padding:4rem 3rem;border-color:#c69c52;}}body{{background:#fff;color:#0e0e0e;}}}}
</style>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="{base_url}/" class="nav-logo"><img src="../../img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links}</div>
<a class="nav-login" href="{base_url}/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> {"My Account" if is_en else "Mon Espace"}</a>
<a href="{base_url}/contact" class="nav-cta">{"Free Audit" if is_en else "Audit Gratuit"}</a>
</div></nav>

<main class="cert-wrap">
<h1 class="cert-h1">{"Your certificate" if is_en else "Votre certificat"}</h1>
<p class="cert-subtitle">{html_lib.escape(f_title)}</p>

<div id="cert-status-box" class="cert-status">{"Checking your progress..." if is_en else "Verification de votre progression..."}</div>

<div id="cert-preview-wrap"></div>

<script>
const FORMATION_SLUG = "{slug}";
const FORMATION_TITLE = {repr(f_title)};
const N_MODULES = {n_modules};
const N_LESSONS = {total_lessons};
const LANG = "{lang}";

(async () => {{
  const box = document.getElementById('cert-status-box');
  const wrap = document.getElementById('cert-preview-wrap');
  try {{
    const r = await fetch('/api/lms/certificate-data?formation=' + encodeURIComponent(FORMATION_SLUG), {{ credentials: 'include' }});
    if (!r.ok) {{
      if (r.status === 401) {{
        box.className = 'cert-status locked';
        box.innerHTML = `<strong>{"Sign in required" if is_en else "Connexion requise"}.</strong> {"Sign in to view your certificate." if is_en else "Connectez-vous pour acceder a votre certificat."} <a href="{base_url}/espace-client-4p8w1n" style="color:var(--primary-container);">{"Sign in" if is_en else "Se connecter"} &rarr;</a>`;
        return;
      }}
      throw new Error('fail');
    }}
    const data = await r.json();
    if (!data.eligible) {{
      box.className = 'cert-status locked';
      box.innerHTML = `<strong>{"Certificate not yet available." if is_en else "Certificat pas encore accessible."}</strong><br>{"Progression" if is_en else "Progression"} : ${{data.lessonsCompleted}} / ${{N_LESSONS}} {"lessons completed" if is_en else "lecons terminees"}, ${{data.modulesPassed}} / ${{N_MODULES}} {"quizzes passed" if is_en else "quiz valides"}.<br><a href="{formation_url}/m1-l1" style="color:var(--primary-container);">{"Resume training" if is_en else "Reprendre la formation"} &rarr;</a>`;
      return;
    }}
    box.className = 'cert-status unlocked';
    box.innerHTML = `<strong>{"Certificate unlocked." if is_en else "Certificat debloque."}</strong> {"Click below to print or save as PDF (use your browser's Print dialog and select 'Save as PDF')." if is_en else "Cliquez sur le bouton ci-dessous pour imprimer ou sauvegarder en PDF (utilisez la fonction d'impression de votre navigateur et selectionnez Enregistrer au format PDF)."}<br><a href="javascript:window.print()" class="cert-download">{"Print / Save as PDF" if is_en else "Imprimer / Enregistrer en PDF"}</a>`;
    const issued = new Date(data.issuedAt || Date.now()).toLocaleDateString(LANG, {{ year: 'numeric', month: 'long', day: 'numeric' }});
    const certNum = (data.certificateId || 'PL-' + FORMATION_SLUG.toUpperCase()).slice(0, 32);
    wrap.innerHTML = `
<div class="cert-preview">
<div class="cert-ribbon">{"Pirabel Labs Academy" if is_en else "Pirabel Labs Academy"}</div>
<h2>{"Certificate of Completion" if is_en else "Certificat de Reussite"}</h2>
<p>{"Awarded to" if is_en else "Decerne a"}</p>
<div class="cert-name">${{data.studentName || (LANG === 'en' ? 'Student' : 'Etudiant')}}</div>
<p class="cert-formation">{"For successfully completing the training" if is_en else "Pour avoir suivi avec succes la formation"}<br><strong>${{FORMATION_TITLE}}</strong></p>
<div class="cert-stats">
<div>${{N_MODULES}} {"modules" if is_en else "modules"}</div>
<div>${{N_LESSONS}} {"lessons" if is_en else "lecons"}</div>
<div>{"Issued" if is_en else "Emis le"} : ${{issued}}</div>
</div>
<div class="cert-sig">
<div class="sig-block"><strong>Lissanon Gildas</strong><br>{"Co-founder" if is_en else "Cofondateur"} Pirabel Labs</div>
<div class="sig-block"><strong>Fidah Imorou</strong><br>{"Co-founder" if is_en else "Cofondateur"} Pirabel Labs</div>
</div>
<p style="margin-top:2rem;font-size:0.7rem;color:#999;">{"Certificate ID" if is_en else "ID certificat"} : ${{certNum}}<br>{"Verify at" if is_en else "Verifier sur"} pirabellabs.com/verify/${{certNum}}</p>
</div>`;
  }} catch (e) {{
    box.className = 'cert-status locked';
    box.textContent = "{"Error loading certificate." if is_en else "Erreur de chargement."}";
  }}
}})();
</script>

</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">{"Premium digital agency. Headquartered in Abomey-Calavi, Benin." if is_en else "Agence digitale premium. Siege : Abomey-Calavi, Benin."}</p></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span></div>
</footer>
<script src="../../js/global.js?v=5"></script>
</body>
</html>
"""
