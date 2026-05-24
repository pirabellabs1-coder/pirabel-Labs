#!/usr/bin/env python3
"""Injecte du contenu unique Abomey-Calavi sur les 9 pages cluster service
qui sont actuellement >85% similaires aux pages Cotonou (risque duplicate
content Google).

Approche:
- Ajoute 3 sections originales avant le bloc newsletter :
  1. "Contexte local Abomey-Calavi" (intro service-specifique 200+ mots)
  2. "Cas d'usage typiques au Benin" (5 scenarios)
  3. "FAQ Abomey-Calavi" (5 Q/R additionnelles)
- Re-genere le Schema FAQPage pour inclure les nouvelles Q/R

Idempotent (skip si sentinel deja present)."""
import re
import json
import html as html_lib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SENTINEL = '<!-- ac-unique-content -->'

CONTENT = {
    # Each: { 'fr': {intro, cases[5], faq[5]}, 'en': {...} }
    'agence-creation-sites-web': {
        'fr': {
            'intro_h2': "POURQUOI UN SITE WEB SUR MESURE À ABOMEY-CALAVI",
            'intro': (
                "À Abomey-Calavi, deuxième agglomération du Bénin et porte d'entrée économique du département de l'Atlantique, "
                "le digital n'est plus un luxe. Les commerces de la zone Tankpè, les PME industrielles d'Akassato, "
                "les startups issues de l'écosystème universitaire de l'UAC et les enseignes nationales basées à Calavi-Kpota "
                "ont toutes besoin d'une vitrine en ligne robuste, rapide, optimisée pour les connexions 3G/4G et capable "
                "d'intégrer Mobile Money MTN et Moov Money. Pirabel Labs conçoit chaque site comme une infrastructure "
                "de revenus : non un simple catalogue, mais un système qui qualifie les prospects, déclenche les premiers "
                "contacts WhatsApp, accepte les paiements locaux et alimente votre fiche Google Business. Notre approche "
                "mobile-first n'est pas un slogan : 87% du trafic web béninois passe par le téléphone, et un site qui "
                "charge en plus de 3 secondes perd jusqu'à 53% de ses visiteurs avant même d'apparaître."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES POUR LES ENTREPRISES D'ABOMEY-CALAVI",
            'cases': [
                ("Commerce de quartier (Aïbatin, Godomey, Calavi-Kpota)",
                 "Site vitrine simple avec horaires d'ouverture en temps réel, catalogue produits, formulaire de réservation WhatsApp et intégration Mobile Money pour les acomptes. Objectif : capter le trafic 'X près de chez moi' depuis Google Maps."),
                ("PME industrielle ou agro-alimentaire",
                 "Site B2B avec catalogue technique, fiches produits téléchargeables, demande de devis en ligne, espace revendeurs sécurisé. Architecture pensée pour le SEO sur des requêtes longue traîne ('grossiste X au Bénin')."),
                ("Startup tech issue de l'UAC",
                 "Landing page de levée de fonds bilingue FR/EN, integration Stripe/Mobile Money, dashboard utilisateur, blog technique pour démontrer l'expertise. Stack moderne (Next.js, Vercel) pour scaler sans frais d'infra."),
                ("Cabinet professionnel (avocat, expert-comptable, médecin)",
                 "Site institutionnel sobre, prise de rendez-vous en ligne, page équipe avec biographies, mentions légales conformes au RGPD et à la loi béninoise sur les données personnelles."),
                ("Établissement scolaire ou formation",
                 "Site portail avec inscription en ligne, calendrier des évènements, espace parents sécurisé, paiement des frais en plusieurs tranches via Mobile Money. Boost massif des inscriptions hors campagne saisonnière."),
            ],
            'faq_title': "FAQ — Sites web à Abomey-Calavi",
            'faq': [
                ("Combien coûte un site web professionnel à Abomey-Calavi ?",
                 "Un site vitrine 5-10 pages avec design sur mesure démarre à 750 000 FCFA. Un site e-commerce complet avec paiement Mobile Money se situe entre 1,5M et 4M FCFA selon le nombre de produits et les intégrations. Un site SaaS / startup à partir de 3M FCFA. Nous proposons un devis gratuit après un brief de 30 minutes."),
                ("Hébergez-vous les sites au Bénin ou à l'international ?",
                 "Par défaut, nous déployons sur Vercel ou Cloudflare avec edge servers à Paris/Frankfurt — temps de chargement de 200ms à Abomey-Calavi via les liaisons fibre transatlantiques. Pour les clients qui exigent un hébergement local, nous travaillons avec MTN Cloud et Sycamore Networks. Les performances locales sont équivalentes pour 95% des cas d'usage."),
                ("Intégrez-vous Mobile Money MTN et Moov ?",
                 "Oui. Nous avons développé des connecteurs natifs vers MTN Mobile Money (Collection API + Disbursement), Moov Money et l'agrégateur PawaPay qui couvre les deux opérateurs. Le visiteur paie sans quitter votre site, vous recevez la confirmation en temps réel."),
                ("Le site sera-t-il compatible mobile et 3G ?",
                 "Toutes nos pages sont auditées sur Lighthouse Mobile + sur 3G simulé (400 kbps, 400ms latency). Score Performance > 85 garanti. Images compressées en WebP/AVIF, lazy loading, fonts préchargées, JavaScript découpé par route. Un site Pirabel Labs charge en moins de 2,5 secondes sur 3G."),
                ("Pouvez-vous reprendre la maintenance d'un site existant ?",
                 "Oui. Nous auditons d'abord la stack (WordPress, Wix, Shopify, custom...), proposons un plan de modernisation et prenons le relais. Tarif maintenance à partir de 95 000 FCFA / mois (mises à jour sécurité, sauvegardes, optimisations vitesse, support email)."),
            ],
        },
        'en': {
            'intro_h2': "WHY A CUSTOM WEBSITE FOR YOUR ABOMEY-CALAVI BUSINESS",
            'intro': (
                "In Abomey-Calavi — Benin's second-largest urban area and the economic gateway to the Atlantic department — "
                "digital presence is no longer optional. Retailers in the Tankpè zone, industrial SMEs in Akassato, "
                "startups born from the University of Abomey-Calavi ecosystem and national brands operating from Calavi-Kpota "
                "all need a robust web presence: fast, optimized for 3G/4G connections, and integrated with Mobile Money "
                "(MTN and Moov). Pirabel Labs designs every website as a revenue infrastructure — not a digital brochure, "
                "but a system that qualifies prospects, triggers WhatsApp first-contact, accepts local payments and feeds "
                "your Google Business Profile. Our mobile-first approach is not a tagline: 87% of Benin web traffic comes "
                "from phones, and a site that loads in more than 3 seconds loses up to 53% of visitors before appearing."
            ),
            'cases_title': "TYPICAL USE CASES FOR BUSINESSES IN ABOMEY-CALAVI",
            'cases': [
                ("Neighbourhood retailer (Aïbatin, Godomey, Calavi-Kpota)",
                 "Simple showcase site with live opening hours, product catalog, WhatsApp booking form and Mobile Money integration for deposits. Goal: capture 'X near me' traffic from Google Maps."),
                ("Industrial SME or food-processing business",
                 "B2B site with technical catalog, downloadable product sheets, online quote requests, secure reseller area. SEO-optimized for long-tail queries ('wholesaler X in Benin')."),
                ("UAC-born tech startup",
                 "Bilingual FR/EN fundraising landing page, Stripe/Mobile Money integration, user dashboard, technical blog to showcase expertise. Modern stack (Next.js, Vercel) for zero-infrastructure scaling."),
                ("Professional firm (lawyer, accountant, doctor)",
                 "Refined institutional site, online appointment booking, team page with biographies, legal notices compliant with GDPR and Benin's personal data law."),
                ("School or training organization",
                 "Portal site with online registration, event calendar, secure parent area, multi-installment payments via Mobile Money. Massive boost in registrations outside seasonal campaigns."),
            ],
            'faq_title': "FAQ — Websites in Abomey-Calavi",
            'faq': [
                ("How much does a professional website cost in Abomey-Calavi?",
                 "A 5-10 page showcase site with custom design starts at 750,000 XOF (~€1,150). A full e-commerce site with Mobile Money payments runs 1.5M-4M XOF depending on products and integrations. A SaaS / startup site starts at 3M XOF. We offer a free quote after a 30-minute briefing."),
                ("Do you host sites in Benin or internationally?",
                 "By default we deploy on Vercel or Cloudflare with edge servers in Paris/Frankfurt — 200ms load time from Abomey-Calavi via transatlantic fiber. For clients requiring local hosting, we work with MTN Cloud and Sycamore Networks. Local performance is equivalent for 95% of use cases."),
                ("Do you integrate MTN Mobile Money and Moov Money?",
                 "Yes. We have built native connectors for MTN Mobile Money (Collection + Disbursement API), Moov Money, and the PawaPay aggregator that covers both operators. Visitors pay without leaving your site, you receive real-time confirmation."),
                ("Will the site work on mobile and 3G?",
                 "Every page is audited on Lighthouse Mobile and simulated 3G (400 kbps, 400ms latency). Performance score > 85 guaranteed. Images compressed in WebP/AVIF, lazy loading, preloaded fonts, route-split JavaScript. A Pirabel Labs site loads in under 2.5 seconds on 3G."),
                ("Can you take over maintenance of an existing site?",
                 "Yes. We first audit the stack (WordPress, Wix, Shopify, custom...), propose a modernization plan and take over. Maintenance from 95,000 XOF/month (security updates, backups, speed optimizations, email support)."),
            ],
        },
    },
    'agence-design-branding': {
        'fr': {
            'intro_h2': "POURQUOI INVESTIR DANS LE BRANDING À ABOMEY-CALAVI",
            'intro': (
                "Le marché béninois est en pleine structuration : les entreprises qui investissent aujourd'hui dans une "
                "identité visuelle forte, mémorable et différenciante prennent une longueur d'avance considérable sur leurs "
                "concurrents qui se contentent encore d'un logo improvisé sur Canva. À Abomey-Calavi, où la densité "
                "commerciale explose (commerce informel à Tankpè, agro-business à Godomey, services aux entreprises à "
                "Calavi-Kpota), votre marque doit raconter une histoire en 3 secondes. Pirabel Labs construit des "
                "identités de marque conçues pour résister à l'épreuve du temps et à la traduction multicanale : "
                "panneaux d'enseigne sous le soleil de Calavi, packaging produit pour les supermarchés, posts Instagram, "
                "fiches Google Business, présentations investisseurs. Notre démarche commence par une enquête culturelle "
                "approfondie — quelles couleurs, quels codes, quels imaginaires résonnent vraiment avec votre cible "
                "béninoise ou ouest-africaine ?"
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — BRANDING À ABOMEY-CALAVI",
            'cases': [
                ("Restaurant, maquis, ou complexe hôtelier",
                 "Naming, logo, charte couleur, signalétique extérieure, menu print et digital, identité réseaux sociaux. Cohérence entre l'expérience physique et la présence en ligne pour fidéliser la clientèle locale et capter les visiteurs internationaux."),
                ("Marque agro-alimentaire (huile, riz, jus, épices)",
                 "Design packaging conforme aux normes UEMOA + ANIP, déclinaisons multi-formats (sachets 100g à bidons 5L), étude concurrence supermarchés Cotonou/Calavi, photos produits studio."),
                ("Cabinet conseil ou cabinet d'expertise",
                 "Identité institutionnelle premium : logo, papeterie, templates Word/PowerPoint pour rapports clients, site web minimaliste, signatures email harmonisées. Positionnement haut de gamme assumé."),
                ("Lancement de startup tech ou fintech",
                 "Naming disponible aux noms de domaine .bj/.com, logo system scalable (icone, monogramme, signature), design system Figma pour développement rapide, pitch deck investisseurs."),
                ("ONG ou organisation à mission",
                 "Identité chaleureuse et accessible, manuel de marque pour bénévoles et partenaires, déclinaison print pour terrain (banderoles, t-shirts, flyers), version simplifiée pour les communications de proximité."),
            ],
            'faq_title': "FAQ — Branding & design à Abomey-Calavi",
            'faq': [
                ("Combien coûte une identité visuelle complète ?",
                 "Pack starter (logo + charte 1 page) : 350 000 FCFA. Pack pro (logo + charte 15 pages + papeterie + templates) : 950 000 FCFA. Pack premium (système complet + design system Figma + déclinaisons illimitées) : à partir de 2,5M FCFA. Devis sur mesure après brief gratuit."),
                ("Le logo m'appartient-il à 100% ?",
                 "Oui. À la livraison vous recevez tous les fichiers sources (Illustrator .ai, Figma, SVG, PNG, JPG, PDF) et les droits d'utilisation commerciale cédés intégralement. Vous pouvez utiliser le logo partout, sans limite de temps ni de support."),
                ("Faites-vous le dépôt de marque OAPI ?",
                 "Nous ne sommes pas conseil en propriété industrielle, mais nous travaillons en partenariat avec un cabinet OAPI à Cotonou qui se charge du dépôt à des tarifs préférentiels pour nos clients. La protection couvre 17 pays africains."),
                ("Puis-je voir des exemples concrets de votre travail ?",
                 "Oui, sur demande. Sous NDA pour les projets sensibles. Nos cas publics sont visibles sur la page Résultats du site et incluent des marques béninoises, ivoiriennes, sénégalaises et françaises."),
                ("Combien de propositions de logo recevrai-je ?",
                 "3 directions créatives distinctes au premier rendez-vous, puis 2 cycles de révisions sur la direction choisie. Cette approche évite les tunnels de 10 propositions floues et concentre l'énergie sur la meilleure piste."),
            ],
        },
        'en': {
            'intro_h2': "WHY INVEST IN BRANDING IN ABOMEY-CALAVI",
            'intro': (
                "The Beninese market is undergoing rapid structuring: businesses that invest today in a strong, memorable, "
                "differentiating visual identity build a significant lead over competitors still using improvised Canva logos. "
                "In Abomey-Calavi, where commercial density is exploding (informal retail in Tankpè, agribusiness in Godomey, "
                "B2B services in Calavi-Kpota), your brand must tell a story in 3 seconds. Pirabel Labs builds brand "
                "identities designed to withstand time and multi-channel translation: shop signage under Calavi's sun, "
                "product packaging for supermarkets, Instagram posts, Google Business listings, investor presentations. "
                "Our process starts with deep cultural research — which colours, codes, imagery genuinely resonate with "
                "your Beninese or West African target?"
            ),
            'cases_title': "TYPICAL USE CASES — BRANDING IN ABOMEY-CALAVI",
            'cases': [
                ("Restaurant, eatery or hotel complex",
                 "Naming, logo, colour palette, exterior signage, print and digital menu, social media identity. Coherence between physical experience and online presence to retain local clientele and attract international visitors."),
                ("Food brand (oil, rice, juice, spices)",
                 "Packaging design compliant with UEMOA + ANIP standards, multi-format variations (100g sachets to 5L containers), Cotonou/Calavi supermarket competitive analysis, studio product photography."),
                ("Consulting firm or expert practice",
                 "Premium institutional identity: logo, stationery, Word/PowerPoint templates for client reports, minimalist website, harmonized email signatures. Confidently upmarket positioning."),
                ("Tech or fintech startup launch",
                 "Naming with available .bj/.com domains, scalable logo system (icon, monogram, signature), Figma design system for rapid development, investor pitch deck."),
                ("NGO or mission-driven organization",
                 "Warm and accessible identity, brand manual for volunteers and partners, print variations for field use (banners, t-shirts, flyers), simplified version for grassroots communications."),
            ],
            'faq_title': "FAQ — Branding & design in Abomey-Calavi",
            'faq': [
                ("How much does a full brand identity cost?",
                 "Starter pack (logo + 1-page guidelines): 350,000 XOF. Pro pack (logo + 15-page guidelines + stationery + templates): 950,000 XOF. Premium pack (full system + Figma design system + unlimited variations): from 2.5M XOF. Custom quote after free briefing."),
                ("Do I own the logo 100%?",
                 "Yes. On delivery you receive all source files (Illustrator .ai, Figma, SVG, PNG, JPG, PDF) and commercial usage rights are fully transferred. You can use the logo anywhere, with no time or media limit."),
                ("Do you handle OAPI trademark registration?",
                 "We are not industrial property advisors, but we partner with an OAPI firm in Cotonou that handles registration at preferential rates for our clients. Protection covers 17 African countries."),
                ("Can I see concrete examples of your work?",
                 "Yes, on request. Under NDA for sensitive projects. Our public cases are on the Results page and include Beninese, Ivorian, Senegalese and French brands."),
                ("How many logo proposals will I receive?",
                 "3 distinct creative directions at first meeting, then 2 revision cycles on the chosen direction. This approach avoids tunnels of 10 vague proposals and focuses energy on the best lead."),
            ],
        },
    },
    'agence-email-marketing-crm': {
        'fr': {
            'intro_h2': "EMAIL MARKETING & CRM POUR LE MARCHÉ D'ABOMEY-CALAVI",
            'intro': (
                "L'email marketing reste le canal d'acquisition le plus rentable avec un ROI moyen de 38€ pour 1€ investi — "
                "y compris sur le marché béninois où WhatsApp domine les conversations. Les entreprises d'Abomey-Calavi "
                "négligent souvent l'email au profit du social media, et c'est précisément cette sous-utilisation qui en "
                "fait un canal sous-coté à haut rendement. Pirabel Labs construit votre infrastructure CRM (HubSpot, "
                "Pipedrive, Brevo) et déploie des séquences automatisées : welcome email à l'inscription, nurturing "
                "prospect, rappels de panier abandonné, réactivation client inactif, demandes d'avis post-livraison. "
                "Nous travaillons aussi avec des contraintes locales spécifiques : domaines .bj qui posent parfois "
                "problème en délivrabilité, segmentation linguistique FR/EN/Fongbé pour le marché national, intégration "
                "avec WhatsApp Business API pour les flux hybrides email + WhatsApp."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — EMAIL & CRM À ABOMEY-CALAVI",
            'cases': [
                ("E-commerce local (mode, beauté, alimentation)",
                 "Sequence d'abandon panier (3 emails à J+1, J+3, J+7), upsell post-achat, réactivation client à 90 jours sans commande. ROI moyen constaté : +18% de CA récurrent."),
                ("Cabinet conseil ou agence B2B",
                 "CRM HubSpot Free configuré, pipeline de vente personnalisé, sequences de prospection cold email avec gestion de la délivrabilité (SPF, DKIM, DMARC, warm-up domaine), reporting hebdomadaire."),
                ("Restaurant ou hôtel à Abomey-Calavi",
                 "Programme fidélité par email : newsletter mensuelle promotions, anniversaire client, événements spéciaux. Synchronisation avec la base de données réservations pour personnalisation fine."),
                ("Établissement de formation (école, centre, université)",
                 "Onboarding apprenants en 5 emails, rappels de paiement échéances, communication parents en mode familial, alumni networking. Réduction du churn de 23% en moyenne."),
                ("Startup SaaS levant des fonds",
                 "Newsletter investisseurs trimestrielle, update produit mensuel, séquence d'onboarding utilisateurs gratuits vers conversion payante, drip campaign de réactivation freemium."),
            ],
            'faq_title': "FAQ — Email marketing & CRM à Abomey-Calavi",
            'faq': [
                ("Quel CRM recommandez-vous pour une PME béninoise ?",
                 "Pour démarrer : HubSpot Free (gratuit jusqu'à 1M contacts, suffisant 6-18 mois). Pour grandir : Pipedrive (47 €/utilisateur/mois) ou HubSpot Sales Hub. Pour les cabinets conseil : Notion + Airtable combiné peut suffire les 24 premiers mois."),
                ("Combien coûte une infrastructure email pro ?",
                 "Brevo (ex-Sendinblue) couvre 95% des besoins PME : 25-65 €/mois pour 20k-100k emails. Mailchimp : 13-300 €/mois. ActiveCampaign pour automation avancée : 49-400 €/mois. Nous facturons la configuration + 3 séquences livrées clés en main à partir de 450 000 FCFA."),
                ("Comment gérer la délivrabilité au Bénin ?",
                 "Configuration SPF/DKIM/DMARC sur votre domaine, warm-up progressif (50 emails J1, +30% par jour), nettoyage régulier des hard bounces, segmentation par engagement (RFM), respect strict du double opt-in. Taux délivrabilité cible : >95%."),
                ("Intégrez-vous WhatsApp dans le CRM ?",
                 "Oui via WhatsApp Business API (Twilio, MessageBird, 360dialog). Nous synchronisons CRM + WhatsApp pour que vos commerciaux voient l'historique complet par client, déclenchent des templates approuvés et automatisent les premières réponses."),
                ("Pouvez-vous reprendre une base contacts existante ?",
                 "Oui. Audit qualité (déduplication, complétude, segmentation), import structuré dans le CRM cible, configuration des champs custom, formation de votre équipe en 2 sessions. Délai standard : 2 à 4 semaines selon la taille de la base."),
            ],
        },
        'en': {
            'intro_h2': "EMAIL MARKETING & CRM FOR THE ABOMEY-CALAVI MARKET",
            'intro': (
                "Email marketing remains the most profitable acquisition channel with an average ROI of €38 for every €1 "
                "invested — including in the Beninese market where WhatsApp dominates conversations. Abomey-Calavi "
                "businesses often neglect email in favor of social media, and this very underuse makes it an undervalued "
                "high-yield channel. Pirabel Labs builds your CRM infrastructure (HubSpot, Pipedrive, Brevo) and deploys "
                "automated sequences: welcome email on signup, prospect nurturing, abandoned cart reminders, inactive "
                "customer reactivation, post-delivery review requests. We also handle specific local constraints: "
                "deliverability issues with .bj domains, FR/EN/Fongbé linguistic segmentation for the national market, "
                "WhatsApp Business API integration for hybrid email + WhatsApp flows."
            ),
            'cases_title': "TYPICAL USE CASES — EMAIL & CRM IN ABOMEY-CALAVI",
            'cases': [
                ("Local e-commerce (fashion, beauty, food)",
                 "Cart abandonment sequence (3 emails at D+1, D+3, D+7), post-purchase upsell, 90-day no-order reactivation. Measured ROI: +18% recurring revenue on average."),
                ("Consulting firm or B2B agency",
                 "HubSpot Free CRM configured, custom sales pipeline, cold email prospecting with deliverability management (SPF, DKIM, DMARC, domain warm-up), weekly reporting."),
                ("Restaurant or hotel in Abomey-Calavi",
                 "Email loyalty program: monthly promotional newsletter, customer birthday, special events. Synced with reservation database for fine personalization."),
                ("Training institution (school, center, university)",
                 "Student onboarding in 5 emails, payment deadline reminders, family-mode parent communication, alumni networking. Churn reduction of 23% on average."),
                ("SaaS startup raising funds",
                 "Quarterly investor newsletter, monthly product update, free-to-paid user onboarding sequence, freemium reactivation drip campaign."),
            ],
            'faq_title': "FAQ — Email marketing & CRM in Abomey-Calavi",
            'faq': [
                ("Which CRM do you recommend for a Beninese SME?",
                 "To start: HubSpot Free (free up to 1M contacts, sufficient 6-18 months). To grow: Pipedrive (€47/user/month) or HubSpot Sales Hub. For consulting firms: Notion + Airtable combined may suffice the first 24 months."),
                ("How much does pro email infrastructure cost?",
                 "Brevo (ex-Sendinblue) covers 95% of SME needs: €25-65/month for 20k-100k emails. Mailchimp: €13-300/month. ActiveCampaign for advanced automation: €49-400/month. We bill setup + 3 turnkey sequences from 450,000 XOF."),
                ("How do you manage deliverability in Benin?",
                 "SPF/DKIM/DMARC configuration on your domain, progressive warm-up (50 emails D1, +30% per day), regular hard bounce cleanup, engagement segmentation (RFM), strict double opt-in compliance. Target deliverability: >95%."),
                ("Do you integrate WhatsApp into the CRM?",
                 "Yes via WhatsApp Business API (Twilio, MessageBird, 360dialog). We sync CRM + WhatsApp so your sales team sees full per-client history, triggers approved templates and automates first responses."),
                ("Can you take over an existing contact database?",
                 "Yes. Quality audit (deduplication, completeness, segmentation), structured import into target CRM, custom field configuration, 2-session team training. Standard timeline: 2-4 weeks depending on database size."),
            ],
        },
    },
    'agence-ia-automatisation': {
        'fr': {
            'intro_h2': "IA & AUTOMATISATION POUR LES ENTREPRISES D'ABOMEY-CALAVI",
            'intro': (
                "L'intelligence artificielle générative transforme déjà la productivité des entreprises mondiales, et le "
                "Bénin n'est pas à la traîne — les startups de l'UAC, les cabinets conseil de Calavi-Kpota et les PME "
                "exportatrices d'Akassato adoptent ChatGPT, Claude, agents conversationnels et automatisations n8n / Make "
                "/ Zapier. Pirabel Labs vous aide à passer des expérimentations à la mise en production : architecture "
                "RAG (Retrieval-Augmented Generation) sur vos documents internes pour assistants intelligents, agents IA "
                "qui qualifient vos prospects WhatsApp 24h/24, automatisations qui synchronisent votre CRM avec votre "
                "comptabilité et vos opérateurs logistiques, scrapers de veille concurrentielle, génération de contenu "
                "marketing à la chaîne avec respect des guidelines de marque. Nous travaillons en pure stack open-source "
                "quand c'est pertinent (n8n self-hosted, LangChain, Ollama local) ou managé (Make, OpenAI API, Anthropic API) "
                "selon vos contraintes budget et confidentialité."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — IA À ABOMEY-CALAVI",
            'cases': [
                ("Chatbot WhatsApp pour commerce ou service",
                 "Agent IA qui répond aux questions fréquentes 24h/24 (prix, disponibilités, horaires, livraison), qualifie le prospect et transfère à un humain les conversations chaudes. Réduit la charge de service client de 60-70%."),
                ("Assistant interne RAG sur documents d'entreprise",
                 "Vos employés interrogent en langage naturel votre base documentaire (procédures, contrats, comptes rendus). Sécurisé, sans envoi de données à OpenAI : embeddings + LLM local ou hébergé Europe."),
                ("Automatisation comptable & administrative",
                 "Extraction automatique des factures fournisseurs (OCR + IA), classement, validation, écriture comptable, paiement Mobile Money. Économise 15-30h/mois pour une PME."),
                ("Veille concurrentielle automatisée",
                 "Scraper concurrents (prix, nouveautés, mentions presse), résumé IA quotidien envoyé par email + Slack, alertes en temps réel sur changements majeurs."),
                ("Génération de contenu marketing scalable",
                 "Pipeline qui génère 30 articles SEO par mois, posts réseaux sociaux, descriptions produits e-commerce — supervisés par votre équipe, alignés sur la voix de marque, optimisés pour les requêtes Google ciblées."),
            ],
            'faq_title': "FAQ — IA & automatisation à Abomey-Calavi",
            'faq': [
                ("Quel ROI peut-on attendre d'un projet IA ?",
                 "Pour un chatbot WhatsApp : économie 1-2 ETP service client en 3 mois. Pour une automatisation administrative : 15-30h/mois récupérées pour 1 personne. Pour la génération de contenu : coût/article divisé par 5-10 par rapport à une rédaction full humaine. ROI net positif dès le 2e-4e mois généralement."),
                ("Mes données sont-elles envoyées à OpenAI/Anthropic ?",
                 "Au choix. En mode managé (OpenAI, Anthropic), les données passent par leurs serveurs avec accord de non-réutilisation pour entraînement. En mode self-hosted (Ollama, LLaMA, Mistral local), aucune donnée ne sort de votre infrastructure. Nous recommandons selon votre niveau de sensibilité."),
                ("Combien coûte un agent IA personnalisé ?",
                 "Chatbot WhatsApp simple : 850 000 FCFA setup + 75 000 FCFA/mois (API + hosting). Assistant RAG sur documents internes : 1,8M FCFA setup + 120 000 FCFA/mois. Automatisation Make/n8n custom : 350 000 FCFA à 2M FCFA selon complexité."),
                ("Quelles compétences faut-il en interne ?",
                 "Aucune au démarrage : nous configurons, livrons et formons. Pour la maintenance autonome après 6 mois, une personne motivée avec sensibilité tech suffit (formation 3 jours incluse dans nos forfaits)."),
                ("Pouvez-vous faire un POC rapide avant un gros projet ?",
                 "Oui. POC 2 semaines à 350 000 FCFA pour valider un cas d'usage IA (chatbot, automatisation, génération contenu). Si concluant, le coût est déduit du projet final."),
            ],
        },
        'en': {
            'intro_h2': "AI & AUTOMATION FOR ABOMEY-CALAVI BUSINESSES",
            'intro': (
                "Generative AI is already transforming productivity for businesses worldwide, and Benin is not lagging — "
                "UAC startups, Calavi-Kpota consulting firms and Akassato exporting SMEs are adopting ChatGPT, Claude, "
                "conversational agents and n8n/Make/Zapier automations. Pirabel Labs helps you move from experimentation "
                "to production: RAG (Retrieval-Augmented Generation) architecture on your internal documents for "
                "intelligent assistants, AI agents that qualify your WhatsApp prospects 24/7, automations that sync your "
                "CRM with accounting and logistics operators, competitive intelligence scrapers, marketing content "
                "generation at scale while respecting brand guidelines. We work in pure open-source stack when relevant "
                "(self-hosted n8n, LangChain, local Ollama) or managed (Make, OpenAI API, Anthropic API) depending on "
                "your budget and confidentiality constraints."
            ),
            'cases_title': "TYPICAL USE CASES — AI IN ABOMEY-CALAVI",
            'cases': [
                ("WhatsApp chatbot for retail or service",
                 "AI agent that answers common questions 24/7 (prices, availability, hours, delivery), qualifies prospects and transfers hot conversations to humans. Reduces customer service load by 60-70%."),
                ("Internal RAG assistant on company documents",
                 "Your employees query your document base (procedures, contracts, minutes) in natural language. Secure, no data sent to OpenAI: embeddings + local or Europe-hosted LLM."),
                ("Accounting & administrative automation",
                 "Automatic supplier invoice extraction (OCR + AI), classification, validation, bookkeeping, Mobile Money payment. Saves 15-30h/month for an SME."),
                ("Automated competitive intelligence",
                 "Competitor scrapers (prices, new releases, press mentions), daily AI summary sent by email + Slack, real-time alerts on major changes."),
                ("Scalable marketing content generation",
                 "Pipeline generating 30 SEO articles per month, social media posts, e-commerce product descriptions — supervised by your team, aligned with brand voice, optimized for targeted Google queries."),
            ],
            'faq_title': "FAQ — AI & automation in Abomey-Calavi",
            'faq': [
                ("What ROI can be expected from an AI project?",
                 "For a WhatsApp chatbot: 1-2 customer service FTE saved in 3 months. For administrative automation: 15-30h/month recovered per person. For content generation: cost/article divided by 5-10x compared to full human writing. Net positive ROI typically by month 2-4."),
                ("Is my data sent to OpenAI/Anthropic?",
                 "Your choice. In managed mode (OpenAI, Anthropic), data passes through their servers with no-reuse-for-training agreement. In self-hosted mode (Ollama, LLaMA, local Mistral), no data leaves your infrastructure. We recommend based on your sensitivity level."),
                ("How much does a custom AI agent cost?",
                 "Simple WhatsApp chatbot: 850,000 XOF setup + 75,000 XOF/month (API + hosting). RAG assistant on internal docs: 1.8M XOF setup + 120,000 XOF/month. Custom Make/n8n automation: 350,000 XOF to 2M XOF depending on complexity."),
                ("What in-house skills are required?",
                 "None at start: we configure, deliver and train. For autonomous maintenance after 6 months, one motivated person with tech sensitivity suffices (3-day training included in our packages)."),
                ("Can you do a quick POC before a large project?",
                 "Yes. 2-week POC at 350,000 XOF to validate an AI use case (chatbot, automation, content generation). If conclusive, the cost is deducted from the final project."),
            ],
        },
    },
    'agence-publicite-payante-sea-ads': {
        'fr': {
            'intro_h2': "PUBLICITÉ PAYANTE (META, GOOGLE, TIKTOK) POUR ABOMEY-CALAVI",
            'intro': (
                "Sur le marché béninois, Meta Ads (Facebook + Instagram) capte 70% du temps publicitaire utile, suivi de "
                "Google Ads (15%) puis de TikTok Ads en forte croissance (12%). Bien gérée, la pub payante peut tripler "
                "votre CA en 90 jours — mal gérée, elle peut brûler 10M FCFA en trois mois sans aucun retour. Pirabel "
                "Labs structure chaque campagne autour d'objectifs business mesurables (CPL, CPA, ROAS), avec des tests "
                "A/B continus sur les créatifs, les audiences et les pages d'atterrissage. Notre équipe maîtrise les "
                "spécificités du marché ouest-africain : ciblage par quartier (Calavi-Kpota, Tankpè, Godomey, Aïbatin), "
                "langues mixtes FR/Fongbé dans les visuels vidéo, paiement Meta en USD via cartes prépayées africaines, "
                "Mobile Money pour le checkout, calls-to-action WhatsApp plutôt que email."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — PUB PAYANTE À ABOMEY-CALAVI",
            'cases': [
                ("Lancement produit ou ouverture commerce",
                 "Campagne notoriété + trafic Meta + Google sur les quartiers ciblés, créa vidéo native, retargeting WhatsApp 7 jours. Budget de départ : 200 000 à 500 000 FCFA/mois selon la zone et la concurrence locale."),
                ("E-commerce avec catalogue ≥50 produits",
                 "Catalogues Meta Shopping + Google Shopping, audiences lookalike sur acheteurs existants, retargeting panier abandonné, optimisation continue ROAS. Objectif ROAS standard : 3-5x net publicitaire."),
                ("Prise de RDV pour cabinet ou service",
                 "Campagnes Google Search + Meta Lead Ads, formulaire de RDV pré-rempli, intégration directe au calendrier Calendly/CRM. CPL cible : 2 000 à 6 000 FCFA selon la verticale."),
                ("Recrutement de candidats qualifiés",
                 "Meta Ads ciblées par poste/localité, landing page candidature simple, intégration ATS. CPL recrutement : 1 500 à 4 000 FCFA, qualité supérieure aux jobboards classiques."),
                ("Inscription formation ou évènement",
                 "Funnel multi-touch : Meta notoriété → Meta conversion → Google Search retargeting → email rappel. Conversion finale 8-15% sur trafic publicitaire qualifié."),
            ],
            'faq_title': "FAQ — Publicité payante à Abomey-Calavi",
            'faq': [
                ("Quel budget minimum pour démarrer ?",
                 "150 000 FCFA/mois en média + 250 000 FCFA/mois en gestion agence pour des résultats statistiquement significatifs. En dessous, les volumes sont trop faibles pour optimiser correctement. Idéal de démarrer à 500 000 FCFA/mois total pour 3 mois minimum."),
                ("Comment payez-vous Meta et Google depuis le Bénin ?",
                 "Trois options : cartes Visa/Mastercard internationales (UBA, Ecobank, Société Générale), comptes Wise / Payoneer, ou délégation à notre agence (nous facturons les frais média en FCFA + commission). Évitez les cartes prépayées non-vérifiées qui se font bloquer."),
                ("Combien de temps avant les premiers résultats ?",
                 "Première semaine : data collection (CPC, CTR, taux conversion). 2e-4e semaine : optimisation et premiers ajustements ciblage/créa. 5e-12e semaine : montée en charge progressive du budget sur ce qui performe. Résultats stables et prévisibles à partir de M3."),
                ("Faites-vous aussi TikTok Ads et LinkedIn Ads ?",
                 "Oui. TikTok Ads très rentable pour B2C jeunes (16-30 ans) et viral content. LinkedIn Ads pour B2B premium (CPL 15 000-30 000 FCFA mais qualité enterprise). Pinterest et Snapchat sur demande pour niches spécifiques."),
                ("Donnez-vous accès au compte publicitaire ?",
                 "Oui, transparence totale. Vous gardez la propriété du Business Manager Meta + compte Google Ads, nous avons un accès admin/manager limité au temps de la collaboration. Reporting hebdomadaire automatisé via Looker Studio."),
            ],
        },
        'en': {
            'intro_h2': "PAID ADVERTISING (META, GOOGLE, TIKTOK) FOR ABOMEY-CALAVI",
            'intro': (
                "In the Beninese market, Meta Ads (Facebook + Instagram) capture 70% of useful ad time, followed by "
                "Google Ads (15%) and rapidly growing TikTok Ads (12%). Properly managed, paid advertising can triple "
                "your revenue in 90 days — poorly managed, it can burn 10M XOF in three months with zero return. "
                "Pirabel Labs structures every campaign around measurable business objectives (CPL, CPA, ROAS) with "
                "continuous A/B testing on creatives, audiences and landing pages. Our team masters West African market "
                "specifics: neighborhood targeting (Calavi-Kpota, Tankpè, Godomey, Aïbatin), mixed FR/Fongbé languages "
                "in video creatives, Meta payment in USD via African prepaid cards, Mobile Money checkout, WhatsApp "
                "calls-to-action rather than email."
            ),
            'cases_title': "TYPICAL USE CASES — PAID ADS IN ABOMEY-CALAVI",
            'cases': [
                ("Product launch or store opening",
                 "Awareness + traffic Meta + Google campaign targeting specific neighborhoods, native video creative, 7-day WhatsApp retargeting. Starting budget: 200,000 to 500,000 XOF/month depending on zone and local competition."),
                ("E-commerce with catalog ≥50 products",
                 "Meta Shopping + Google Shopping catalogs, lookalike audiences on existing buyers, abandoned cart retargeting, continuous ROAS optimization. Standard ROAS target: 3-5x net of ad spend."),
                ("Appointment booking for firm or service",
                 "Google Search + Meta Lead Ads campaigns, pre-filled appointment form, direct integration to Calendly/CRM calendar. Target CPL: 2,000 to 6,000 XOF depending on vertical."),
                ("Qualified candidate recruitment",
                 "Position/locality targeted Meta Ads, simple application landing page, ATS integration. Recruitment CPL: 1,500 to 4,000 XOF, higher quality than classic job boards."),
                ("Training or event registration",
                 "Multi-touch funnel: Meta awareness → Meta conversion → Google Search retargeting → email reminder. Final conversion 8-15% on qualified paid traffic."),
            ],
            'faq_title': "FAQ — Paid advertising in Abomey-Calavi",
            'faq': [
                ("What's the minimum budget to start?",
                 "150,000 XOF/month in media + 250,000 XOF/month in agency management for statistically significant results. Below this, volumes are too small to optimize properly. Ideal to start at 500,000 XOF/month total for 3 months minimum."),
                ("How do you pay Meta and Google from Benin?",
                 "Three options: international Visa/Mastercard (UBA, Ecobank, Société Générale), Wise / Payoneer accounts, or delegation to our agency (we bill media costs in XOF + commission). Avoid unverified prepaid cards that get blocked."),
                ("How long before the first results?",
                 "Week 1: data collection (CPC, CTR, conversion rate). Weeks 2-4: optimization and first targeting/creative adjustments. Weeks 5-12: gradual budget scaling on what performs. Stable and predictable results from M3."),
                ("Do you also do TikTok Ads and LinkedIn Ads?",
                 "Yes. TikTok Ads very profitable for young B2C (16-30 yo) and viral content. LinkedIn Ads for premium B2B (CPL 15,000-30,000 XOF but enterprise quality). Pinterest and Snapchat on request for specific niches."),
                ("Do you give access to the ad account?",
                 "Yes, full transparency. You retain ownership of Meta Business Manager + Google Ads account, we have admin/manager access limited to the duration of the collaboration. Weekly automated reporting via Looker Studio."),
            ],
        },
    },
    'agence-redaction-content-marketing': {
        'fr': {
            'intro_h2': "RÉDACTION & CONTENT MARKETING POUR ABOMEY-CALAVI",
            'intro': (
                "Le content marketing est le moteur de croissance organique le plus durable : un article SEO bien rédigé "
                "continue à générer du trafic 3, 5, 10 ans après sa publication. Mais sur le marché béninois et "
                "ouest-africain, la concurrence éditoriale est encore faible — c'est précisément maintenant qu'il faut "
                "investir pour capter les requêtes que vos concurrents ignorent. Pirabel Labs produit du contenu "
                "éditorial premium : articles de blog 2000+ mots avec recherche de mots-clés rigoureuse, livres blancs "
                "B2B, fiches produits e-commerce, newsletters, scripts vidéo, descriptions Google My Business, posts "
                "LinkedIn pour dirigeants. Chaque pièce est conçue pour ranker sur Google ET convertir les lecteurs en "
                "prospects. Nous écrivons en FR mais aussi en EN pour ceux qui visent l'export, et adaptons le ton aux "
                "codes culturels locaux quand pertinent."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — CONTENT MARKETING À ABOMEY-CALAVI",
            'cases': [
                ("Cabinet conseil ou expert en pleine croissance",
                 "Stratégie éditoriale : 2 articles SEO/mois + 1 livre blanc/trimestre + posts LinkedIn fondateur 3x/semaine. Positionnement thought leadership en 12 mois. Objectif : générer 30-50 leads chauds entrants/mois."),
                ("E-commerce avec 50-500 produits",
                 "Refonte de 100% des fiches produits (description optimisée 250-400 mots, FAQ produit, comparateur, photos alt-text), création d'un blog conseil 20+ articles dans la première année."),
                ("Startup tech levant des fonds",
                 "Blog technique + études de cas clients + livres blancs sectoriels pour démontrer l'expertise auprès des investisseurs. Pages 'About', 'Mission', 'Founders' optimisées storytelling."),
                ("École, formation ou organisme de certification",
                 "Articles éducatifs longs (3000-5000 mots) sur les sujets enseignés = stratégie de notoriété + acquisition prospects à coût zéro après publication. ROI cumulé exceptionnel sur 3 ans."),
                ("Marque de produits grand public (alimentation, beauté, mode)",
                 "Blog lifestyle, recettes, tutoriels usage produit, témoignages clients narrativisés. Construction d'une communauté engagée et fidèle, qui achète à nouveau et recommande."),
            ],
            'faq_title': "FAQ — Rédaction & content marketing à Abomey-Calavi",
            'faq': [
                ("Quel est le tarif d'un article SEO ?",
                 "Article standard 1200-1500 mots (recherche + rédaction + optimisation SEO) : 85 000 FCFA. Article expert 2000-3000 mots avec interview : 145 000 FCFA. Article ultime 3000-5000 mots avec recherche approfondie : 225 000 FCFA. Forfait mensuel 4-8 articles : remise 15-25%."),
                ("Combien de temps avant qu'un article génère du trafic ?",
                 "30-90 jours pour les premiers signaux (longue traîne, requêtes faible concurrence). 3-6 mois pour les requêtes moyennes. 6-12 mois pour les requêtes très concurrentielles. Stratégie cumulative : un blog de 50 articles à 12 mois apporte 10x plus de trafic que un blog de 10 articles à 6 mois."),
                ("Vos rédacteurs sont-ils basés au Bénin ?",
                 "Notre équipe rédactionnelle est répartie entre le Bénin (Abomey-Calavi, Cotonou), la Côte d'Ivoire, le Sénégal et la France. Le rédacteur assigné dépend du sujet (expertise) et du registre attendu (institutionnel, lifestyle, technique...)."),
                ("Garantissez-vous l'unicité du contenu ?",
                 "Oui, 100% original. Chaque texte est vérifié par Copyscape + détection IA (GPTZero, Originality). Aucun copier-coller ni paraphrase. Sourcing rigoureux des informations factuelles avec liens vers sources autoritaires."),
                ("Pouvez-vous écrire en anglais et en fongbé ?",
                 "Anglais : oui, équipe bilingue native pour les marchés internationaux. Fongbé : nous traduisons les éléments-clés (CTA, headlines, posts WhatsApp) en collaboration avec des locuteurs natifs si votre cible le nécessite."),
            ],
        },
        'en': {
            'intro_h2': "CONTENT MARKETING & COPYWRITING FOR ABOMEY-CALAVI",
            'intro': (
                "Content marketing is the most durable organic growth engine: a well-written SEO article keeps generating "
                "traffic 3, 5, 10 years after publication. But in the Beninese and West African market, editorial "
                "competition is still weak — now is precisely when to invest to capture queries your competitors ignore. "
                "Pirabel Labs produces premium editorial content: 2000+ word SEO blog posts with rigorous keyword research, "
                "B2B white papers, e-commerce product sheets, newsletters, video scripts, Google My Business descriptions, "
                "LinkedIn posts for executives. Each piece is designed to rank on Google AND convert readers into prospects. "
                "We write in FR but also EN for export-focused clients, and adapt tone to local cultural codes when relevant."
            ),
            'cases_title': "TYPICAL USE CASES — CONTENT MARKETING IN ABOMEY-CALAVI",
            'cases': [
                ("Fast-growing consulting firm or expert",
                 "Editorial strategy: 2 SEO articles/month + 1 white paper/quarter + 3x/week founder LinkedIn posts. Thought leadership positioning in 12 months. Goal: generate 30-50 inbound hot leads/month."),
                ("E-commerce with 50-500 products",
                 "Rebuild of 100% product sheets (optimized 250-400 word descriptions, product FAQ, comparator, photo alt-texts), creation of an advice blog with 20+ articles in the first year."),
                ("Tech startup raising funds",
                 "Technical blog + client case studies + sector white papers to showcase expertise to investors. Story-optimized 'About', 'Mission', 'Founders' pages."),
                ("School, training program or certification body",
                 "Long educational articles (3000-5000 words) on taught subjects = awareness strategy + zero-cost prospect acquisition after publication. Outstanding cumulative ROI over 3 years."),
                ("Consumer brand (food, beauty, fashion)",
                 "Lifestyle blog, recipes, product usage tutorials, narrative customer testimonials. Building an engaged and loyal community that repurchases and recommends."),
            ],
            'faq_title': "FAQ — Content marketing & copywriting in Abomey-Calavi",
            'faq': [
                ("What's the price of an SEO article?",
                 "Standard 1200-1500 word article (research + writing + SEO optimization): 85,000 XOF. 2000-3000 word expert article with interview: 145,000 XOF. 3000-5000 word ultimate article with deep research: 225,000 XOF. Monthly package 4-8 articles: 15-25% discount."),
                ("How long until an article generates traffic?",
                 "30-90 days for first signals (long-tail, low-competition queries). 3-6 months for medium queries. 6-12 months for highly competitive queries. Cumulative strategy: a 50-article blog at 12 months brings 10x more traffic than a 10-article blog at 6 months."),
                ("Are your writers based in Benin?",
                 "Our editorial team is distributed between Benin (Abomey-Calavi, Cotonou), Côte d'Ivoire, Senegal and France. The assigned writer depends on topic (expertise) and expected register (institutional, lifestyle, technical...)."),
                ("Do you guarantee content uniqueness?",
                 "Yes, 100% original. Each text is verified via Copyscape + AI detection (GPTZero, Originality). No copy-paste or paraphrasing. Rigorous sourcing of factual information with links to authoritative sources."),
                ("Can you write in English and Fongbé?",
                 "English: yes, native bilingual team for international markets. Fongbé: we translate key elements (CTA, headlines, WhatsApp posts) in collaboration with native speakers if your target requires it."),
            ],
        },
    },
    'agence-sales-funnels-cro': {
        'fr': {
            'intro_h2': "SALES FUNNELS & CRO POUR ABOMEY-CALAVI",
            'intro': (
                "La plupart des entreprises d'Abomey-Calavi laissent 60-80% de leur revenu potentiel sur la table à cause "
                "d'un funnel de conversion mal pensé : trafic dépensé en pub mais peu de leads, leads peu qualifiés, "
                "ventes lentes, panier moyen bas. Pirabel Labs analyse votre tunnel de conversion étape par étape "
                "(awareness → considération → décision → achat → fidélisation) et identifie les points de fuite "
                "majeurs. Nous concevons et déployons des sales funnels structurés avec landing pages haute conversion "
                "(8-25% selon la verticale), formulaires courts, paiement Mobile Money intégré, séquences email/WhatsApp "
                "de relance et A/B testing continu. Notre méthodologie CRO (Conversion Rate Optimization) repose sur des "
                "tests rigoureux Hotjar + analytics + heatmaps + interviews utilisateurs — pas sur l'intuition."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — FUNNELS & CRO À ABOMEY-CALAVI",
            'cases': [
                ("Formation en ligne ou coaching premium",
                 "Funnel webinaire : pub Meta → inscription webinar gratuit → présentation 60 min → offre limitée 24h → paiement Mobile Money. Conversion moyenne 4-8% sur trafic publicitaire bien ciblé."),
                ("Logiciel SaaS ou outil B2B",
                 "Free trial 14 jours sans CB → onboarding email sequence → in-app prompts → demo personnelle → upgrade payant. Conversion free-to-paid : 6-15% selon le produit."),
                ("Cabinet conseil vendant des missions",
                 "Page services premium → audit gratuit (lead magnet) → call de découverte 30 min → proposition commerciale custom → signature contrat. Conversion lead-to-customer 25-40%."),
                ("E-commerce mode/beauté/électronique",
                 "Optimisation panier (4 étapes max, paiement Mobile Money en 1 clic), pré-checkout abandonnement (popup avec remise -10%), post-achat upsell. Augmentation panier moyen +12-25%."),
                ("Vente de prestation locale (immobilier, voitures, services)",
                 "Landing par offre, calculateur de simulation (mensualités, devis estimatif), formulaire de contact court, WhatsApp Business pour suivi commercial. Lead conversion x2 à x3."),
            ],
            'faq_title': "FAQ — Sales funnels & CRO à Abomey-Calavi",
            'faq': [
                ("Combien coûte un sales funnel complet ?",
                 "Funnel simple (landing + tunnel paiement + 3 emails) : 850 000 FCFA. Funnel avancé (webinaire + sequence multi-touch + CRM intégration + A/B testing) : 2,2M FCFA. Forfait mensuel d'optimisation continue : 350 000 FCFA/mois."),
                ("Qu'est-ce qu'un bon taux de conversion ?",
                 "Très dépendant de la verticale. E-commerce : 2-5% moyen, 6-10% bon, >10% excellent. SaaS free trial: 4-12%. Lead magnet B2B : 15-35%. Services premium : 1-3% mais panier moyen élevé. Nous benchmarkons votre situation vs concurrents avant tout."),
                ("Quel outil utilisez-vous pour les A/B tests ?",
                 "Google Optimize est mort. Nous utilisons VWO (variantes simples), Convert.com (avancé), ou parfois Webflow / Framer A/B integration pour les sites construits sur ces plateformes. Hotjar pour les heatmaps + recordings utilisateurs."),
                ("Combien de temps pour voir un impact ?",
                 "Diagnostic : 2 semaines. Première optimisation déployée : 4 semaines. Premiers résultats statistiquement significatifs : 6-10 semaines. Optimisation continue : mensuelle pendant 6-12 mois pour matériser pleinement le potentiel."),
                ("Travaillez-vous avec Shopify, WooCommerce, Wix, Webflow ?",
                 "Oui sur les 4. Spécialisation forte sur Shopify (Apps natives + Liquid customization), Webflow (interactions sophistiquées + CMS), WooCommerce (custom PHP). Wix on-demand pour les petits projets simples."),
            ],
        },
        'en': {
            'intro_h2': "SALES FUNNELS & CRO FOR ABOMEY-CALAVI",
            'intro': (
                "Most Abomey-Calavi businesses leave 60-80% of their potential revenue on the table due to poorly designed "
                "conversion funnels: traffic spent on ads but few leads, low-quality leads, slow sales, low average basket. "
                "Pirabel Labs analyzes your conversion funnel step by step (awareness → consideration → decision → "
                "purchase → retention) and identifies major leakage points. We design and deploy structured sales funnels "
                "with high-conversion landing pages (8-25% depending on vertical), short forms, integrated Mobile Money "
                "payment, email/WhatsApp follow-up sequences and continuous A/B testing. Our CRO (Conversion Rate "
                "Optimization) methodology relies on rigorous Hotjar + analytics + heatmaps + user interviews testing — "
                "not on intuition."
            ),
            'cases_title': "TYPICAL USE CASES — FUNNELS & CRO IN ABOMEY-CALAVI",
            'cases': [
                ("Online course or premium coaching",
                 "Webinar funnel: Meta ads → free webinar registration → 60-min presentation → 24h limited offer → Mobile Money payment. Average conversion 4-8% on well-targeted paid traffic."),
                ("SaaS or B2B tool",
                 "14-day free trial no CC → email onboarding → in-app prompts → personal demo → paid upgrade. Free-to-paid conversion: 6-15% depending on product."),
                ("Consulting firm selling engagements",
                 "Premium services page → free audit (lead magnet) → 30-min discovery call → custom commercial proposal → contract signing. Lead-to-customer conversion 25-40%."),
                ("Fashion/beauty/electronics e-commerce",
                 "Cart optimization (max 4 steps, 1-click Mobile Money payment), pre-checkout abandonment (popup with -10% discount), post-purchase upsell. Average basket increase +12-25%."),
                ("Local services (real estate, cars, services)",
                 "Offer landing pages, simulation calculator (monthly payments, estimated quote), short contact form, WhatsApp Business for sales follow-up. Lead conversion x2 to x3."),
            ],
            'faq_title': "FAQ — Sales funnels & CRO in Abomey-Calavi",
            'faq': [
                ("How much does a full sales funnel cost?",
                 "Simple funnel (landing + payment tunnel + 3 emails): 850,000 XOF. Advanced funnel (webinar + multi-touch sequence + CRM integration + A/B testing): 2.2M XOF. Monthly continuous optimization package: 350,000 XOF/month."),
                ("What's a good conversion rate?",
                 "Highly vertical-dependent. E-commerce: 2-5% average, 6-10% good, >10% excellent. SaaS free trial: 4-12%. B2B lead magnet: 15-35%. Premium services: 1-3% but high average basket. We benchmark your situation vs competitors first."),
                ("What tool do you use for A/B tests?",
                 "Google Optimize is dead. We use VWO (simple variants), Convert.com (advanced), or sometimes Webflow / Framer A/B integration for sites built on those platforms. Hotjar for heatmaps + user recordings."),
                ("How long to see impact?",
                 "Diagnostic: 2 weeks. First optimization deployed: 4 weeks. First statistically significant results: 6-10 weeks. Continuous optimization: monthly for 6-12 months to fully materialize potential."),
                ("Do you work with Shopify, WooCommerce, Wix, Webflow?",
                 "Yes on all 4. Strong specialization on Shopify (native Apps + Liquid customization), Webflow (sophisticated interactions + CMS), WooCommerce (custom PHP). Wix on-demand for small simple projects."),
            ],
        },
    },
    'agence-social-media': {
        'fr': {
            'intro_h2': "SOCIAL MEDIA POUR LES MARQUES D'ABOMEY-CALAVI",
            'intro': (
                "À Abomey-Calavi et au Bénin, les réseaux sociaux ne sont pas un nice-to-have : ils sont LE canal de "
                "première interaction client. Facebook reste roi (90% des internautes béninois), suivi par WhatsApp "
                "Business (essentiel pour les conversations commerciales), Instagram (montée en puissance chez les jeunes "
                "urbains), TikTok (explosion 2024-2026) et LinkedIn (B2B premium). Pirabel Labs construit votre stratégie "
                "social media sur mesure : ligne éditoriale alignée sur votre positionnement, calendrier hebdomadaire, "
                "production de visuels et vidéos, community management proactif, gestion de crise, et amplification "
                "publicitaire ciblée. Notre équipe créative produit des formats vidéo natifs verticaux pensés pour "
                "l'algorithme TikTok/Reels — pas du recyclage de campagnes télé."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — SOCIAL MEDIA À ABOMEY-CALAVI",
            'cases': [
                ("Restaurant, hôtel ou commerce visible",
                 "3-5 posts/semaine Instagram + Facebook, stories quotidiennes, 1-2 Reels/semaine, gestion des avis Google et messages. Croissance organique 200-400 nouveaux abonnés/mois en moyenne."),
                ("Marque produit (mode, beauté, alimentation)",
                 "Production photo studio + vidéos UGC + collaborations micro-influenceurs locaux. Construction d'une communauté de fans engagés qui deviennent ambassadeurs et acheteurs récurrents."),
                ("Cabinet conseil ou expert (dirigeant)",
                 "LinkedIn personal branding : 5-7 posts/semaine dirigeant + 1 article LinkedIn/mois + engagement actif. Génération de leads inbound B2B sans publicité."),
                ("Startup tech ou SaaS",
                 "Twitter/X technique + LinkedIn + TikTok founder content. Construction d'une audience de prospects + investisseurs sur 12 mois pour préparer une levée de fonds ou un lancement majeur."),
                ("Institution publique ou ONG",
                 "Communication institutionnelle multi-plateformes, gestion de la modération, réponse aux crises, valorisation des projets et impact social. Tone respectueux et accessible."),
            ],
            'faq_title': "FAQ — Social media à Abomey-Calavi",
            'faq': [
                ("Combien coûte la gestion de mes réseaux sociaux ?",
                 "Pack starter (Facebook + Instagram, 3 posts/semaine, community management basique) : 350 000 FCFA/mois. Pack pro (3 plateformes, 5 posts/semaine, stories quotidiennes, vidéos, community management actif) : 750 000 FCFA/mois. Pack premium (full stack, production studio, ads management) : 1,5M+ FCFA/mois."),
                ("Faut-il être sur TikTok pour mon business ?",
                 "Si votre cible a moins de 35 ans : OUI, c'est essentiel. Si vous êtes B2B premium ou ciblez les 45+ : pas prioritaire, restez sur LinkedIn + Facebook. Pour le commerce local visible (restaurants, beauté, mode), TikTok devient incontournable en 2026."),
                ("Comment mesurez-vous le succès ?",
                 "Pas en likes. Métriques business : leads générés, ventes attribuées, taux d'engagement réel (saves + shares plutôt que likes), croissance qualifiée de l'audience, top posts viraux, mentions de marque. Reporting mensuel sur Looker Studio."),
                ("Pouvez-vous gérer ma fiche Google Business aussi ?",
                 "Oui, c'est inclus dans nos forfaits pro et premium. Mises à jour info, ajout de photos hebdomadaires, gestion des avis (réponse à tous sous 24h), posts Google promotionnels. Le SEO local en bénéficie massivement."),
                ("Travaillez-vous avec des influenceurs béninois ?",
                 "Oui. Carnet d'adresses constitué d'influenceurs micro (10k-100k abonnés) et macro (100k+) dans la mode, beauté, food, tech, lifestyle. Brief précis, négociation tarif, monitoring de la performance. Tarifs : 75k-2M FCFA par activation selon notoriété."),
            ],
        },
        'en': {
            'intro_h2': "SOCIAL MEDIA FOR ABOMEY-CALAVI BRANDS",
            'intro': (
                "In Abomey-Calavi and Benin, social media isn't a nice-to-have: it IS the primary customer interaction "
                "channel. Facebook remains king (90% of Beninese internet users), followed by WhatsApp Business "
                "(essential for commercial conversations), Instagram (rising among urban youth), TikTok (2024-2026 "
                "explosion) and LinkedIn (premium B2B). Pirabel Labs builds your custom social media strategy: editorial "
                "line aligned with your positioning, weekly calendar, visual and video production, proactive community "
                "management, crisis management, and targeted ad amplification. Our creative team produces vertical "
                "native video formats designed for the TikTok/Reels algorithm — not recycled TV campaigns."
            ),
            'cases_title': "TYPICAL USE CASES — SOCIAL MEDIA IN ABOMEY-CALAVI",
            'cases': [
                ("Restaurant, hotel or visible storefront",
                 "3-5 posts/week Instagram + Facebook, daily stories, 1-2 Reels/week, Google reviews + message management. Organic growth 200-400 new followers/month average."),
                ("Product brand (fashion, beauty, food)",
                 "Studio photography + UGC videos + local micro-influencer collaborations. Building a community of engaged fans who become ambassadors and recurring buyers."),
                ("Consulting firm or expert (executive)",
                 "LinkedIn personal branding: 5-7 executive posts/week + 1 LinkedIn article/month + active engagement. Inbound B2B lead generation without advertising."),
                ("Tech startup or SaaS",
                 "Technical Twitter/X + LinkedIn + TikTok founder content. Building an audience of prospects + investors over 12 months to prepare a funding round or major launch."),
                ("Public institution or NGO",
                 "Multi-platform institutional communication, moderation management, crisis response, valorization of projects and social impact. Respectful and accessible tone."),
            ],
            'faq_title': "FAQ — Social media in Abomey-Calavi",
            'faq': [
                ("How much does social media management cost?",
                 "Starter pack (Facebook + Instagram, 3 posts/week, basic community management): 350,000 XOF/month. Pro pack (3 platforms, 5 posts/week, daily stories, videos, active CM): 750,000 XOF/month. Premium pack (full stack, studio production, ads management): 1.5M+ XOF/month."),
                ("Do I need to be on TikTok for my business?",
                 "If your target is under 35: YES, essential. If you're premium B2B or target 45+: not priority, stay on LinkedIn + Facebook. For visible local retail (restaurants, beauty, fashion), TikTok becomes essential in 2026."),
                ("How do you measure success?",
                 "Not in likes. Business metrics: leads generated, attributed sales, real engagement rate (saves + shares rather than likes), qualified audience growth, top viral posts, brand mentions. Monthly reporting on Looker Studio."),
                ("Can you manage my Google Business listing too?",
                 "Yes, included in pro and premium packages. Info updates, weekly photo additions, review management (response to all under 24h), promotional Google posts. Local SEO benefits massively."),
                ("Do you work with Beninese influencers?",
                 "Yes. Address book of micro (10k-100k followers) and macro (100k+) influencers in fashion, beauty, food, tech, lifestyle. Precise brief, rate negotiation, performance monitoring. Rates: 75k-2M XOF per activation depending on notoriety."),
            ],
        },
    },
    'agence-video-motion-design': {
        'fr': {
            'intro_h2': "VIDÉO & MOTION DESIGN POUR LES ENTREPRISES D'ABOMEY-CALAVI",
            'intro': (
                "La vidéo est le format roi 2026 : 87% du trafic web mondial est désormais vidéo, et les plateformes "
                "(YouTube, TikTok, Instagram Reels, LinkedIn) survalorisent les contenus natifs. Pourtant, à "
                "Abomey-Calavi, beaucoup d'entreprises se contentent encore de vidéos amateures filmées au smartphone "
                "vertical sans cadrage. Pirabel Labs produit de la vidéo professionnelle qui convertit : films corporate "
                "élégants, motion design narratif, vidéos sociales viralisables, capsules formation, tournages "
                "évènementiels, animations 2D et 3D. Notre équipe maîtrise toute la chaîne : pré-production (storyboard, "
                "casting voix-off, repérages), tournage (caméras 4K, drones DGCA, son broadcast), post-production "
                "(montage Premiere/DaVinci, étalonnage, motion After Effects, sound design Pro Tools)."
            ),
            'cases_title': "CAS D'USAGE TYPIQUES — VIDÉO À ABOMEY-CALAVI",
            'cases': [
                ("Film institutionnel d'entreprise (90 sec à 3 min)",
                 "Vidéo de présentation pour site web, salon professionnel, levée de fonds. Format soigné, voix-off pro, musique exclusive. Coût : 1,2M à 4,5M FCFA selon complexité."),
                ("Capsules vidéo réseaux sociaux (15-60 sec)",
                 "Pack mensuel 8-12 vidéos verticales pour Reels/TikTok/Shorts. Storyboard, tournage groupé, post-prod rapide. Coût : 850 000 à 2,5M FCFA/mois selon volume."),
                ("Motion design explicatif ou produit (60-120 sec)",
                 "Animation 2D pour expliquer un service, un produit ou un concept. Idéal pour les SaaS, fintech, formations. Coût : 1,5M à 5M FCFA selon style et durée."),
                ("Captation d'évènement (séminaire, lancement, conférence)",
                 "Équipe 2-3 caméras, drone, son broadcast, livraison vidéo highlights 3 min + vidéos témoignages individuels. Coût : 1,8M à 6M FCFA/jour de tournage."),
                ("Formation vidéo / cours en ligne",
                 "Production série de modules pédagogiques (5-20 vidéos), enregistrement en studio ou en intérieur soigné, intégration sur LMS ou Vimeo Premium. Coût : 350 000 FCFA/module standard."),
            ],
            'faq_title': "FAQ — Vidéo & motion design à Abomey-Calavi",
            'faq': [
                ("Quel matériel utilisez-vous ?",
                 "Caméras Sony FX3 / FX6 + objectifs G-Master + Cinéma. Stabilisation Ronin DJI. Drones Mavic 3 Pro homologués ANAC. Son Sennheiser MKH416 + Sound Devices MixPre. Éclairage Aputure 600D. Post-prod station DaVinci 12 cœurs."),
                ("Combien de temps pour produire une vidéo de 2 min ?",
                 "Pré-production (storyboard, casting, repérages) : 1-2 semaines. Tournage : 1-3 jours. Post-production (montage, étalonnage, motion, sound design) : 2-4 semaines. Total moyen : 5-7 semaines pour une vidéo corporate premium."),
                ("Faites-vous des drones et prises de vue aériennes ?",
                 "Oui, avec pilotes homologués ANAC + autorisation préfectorale obtenue pour vous (~15 jours délai). Drones Mavic 3 Pro (caméra Hasselblad 4/3 CMOS) et Inspire 2 pour productions cinéma."),
                ("Pouvez-vous filmer en région ou à l'étranger ?",
                 "Oui. Couverture régulière Bénin (Cotonou, Calavi, Porto-Novo, Parakou, Nikki), Togo, Côte d'Ivoire. Productions ponctuelles France, Maroc, Sénégal. Frais de déplacement transparents en sus."),
                ("Avez-vous une banque de musique avec licences claires ?",
                 "Oui : Artlist, Epidemic Sound, Musicbed, AudioJungle = 200 000+ pistes utilisables commercialement sans risque. Pour les projets premium, composition originale sur mesure (3 500 € en moyenne)."),
            ],
        },
        'en': {
            'intro_h2': "VIDEO & MOTION DESIGN FOR ABOMEY-CALAVI BUSINESSES",
            'intro': (
                "Video is the dominant format of 2026: 87% of global web traffic is now video, and platforms (YouTube, "
                "TikTok, Instagram Reels, LinkedIn) over-promote native content. Yet in Abomey-Calavi, many businesses "
                "still settle for amateur smartphone-shot videos with no framing. Pirabel Labs produces professional "
                "video that converts: elegant corporate films, narrative motion design, viral-ready social videos, "
                "training capsules, event shoots, 2D and 3D animations. Our team masters the entire chain: pre-production "
                "(storyboard, voice-over casting, location scouting), shooting (4K cameras, ANAC-certified drones, "
                "broadcast sound), post-production (Premiere/DaVinci editing, color grading, After Effects motion, "
                "Pro Tools sound design)."
            ),
            'cases_title': "TYPICAL USE CASES — VIDEO IN ABOMEY-CALAVI",
            'cases': [
                ("Corporate institutional film (90 sec to 3 min)",
                 "Presentation video for website, trade fair, fundraising. Polished format, pro voice-over, exclusive music. Cost: 1.2M to 4.5M XOF depending on complexity."),
                ("Social media video capsules (15-60 sec)",
                 "Monthly pack 8-12 vertical videos for Reels/TikTok/Shorts. Storyboard, grouped shooting, rapid post-prod. Cost: 850,000 to 2.5M XOF/month depending on volume."),
                ("Explainer or product motion design (60-120 sec)",
                 "2D animation to explain a service, product or concept. Ideal for SaaS, fintech, training. Cost: 1.5M to 5M XOF depending on style and duration."),
                ("Event capture (seminar, launch, conference)",
                 "2-3 camera team, drone, broadcast sound, 3-min highlights video delivery + individual testimonial videos. Cost: 1.8M to 6M XOF per shoot day."),
                ("Video training / online courses",
                 "Production of educational module series (5-20 videos), studio or polished interior recording, integration on LMS or Vimeo Premium. Cost: 350,000 XOF per standard module."),
            ],
            'faq_title': "FAQ — Video & motion design in Abomey-Calavi",
            'faq': [
                ("What equipment do you use?",
                 "Sony FX3 / FX6 cameras + G-Master & Cinema lenses. DJI Ronin stabilization. ANAC-certified Mavic 3 Pro drones. Sennheiser MKH416 + Sound Devices MixPre sound. Aputure 600D lighting. Post-prod 12-core DaVinci station."),
                ("How long to produce a 2-minute video?",
                 "Pre-production (storyboard, casting, scouting): 1-2 weeks. Shooting: 1-3 days. Post-production (editing, grading, motion, sound design): 2-4 weeks. Total average: 5-7 weeks for premium corporate video."),
                ("Do you do drones and aerial shots?",
                 "Yes, with ANAC-certified pilots + prefectural authorization obtained for you (~15 day lead time). Mavic 3 Pro drones (Hasselblad 4/3 CMOS camera) and Inspire 2 for cinema productions."),
                ("Can you shoot in regions or abroad?",
                 "Yes. Regular coverage Benin (Cotonou, Calavi, Porto-Novo, Parakou, Nikki), Togo, Côte d'Ivoire. Occasional productions France, Morocco, Senegal. Travel costs transparently billed extra."),
                ("Do you have a music library with clear licenses?",
                 "Yes: Artlist, Epidemic Sound, Musicbed, AudioJungle = 200,000+ commercially usable tracks risk-free. For premium projects, original custom composition (avg €3,500)."),
            ],
        },
    },
}

def build_html(data: dict, is_en: bool) -> str:
    intro_h2 = data['intro_h2']
    intro = data['intro']
    cases_title = data['cases_title']
    cases = data['cases']
    faq_title = data['faq_title']
    faq = data['faq']

    case_html = ''
    for title, desc in cases:
        case_html += (
            f'<div class="card card-hover-glow rv" style="padding:2rem;">'
            f'<h3 class="text-h4" style="margin-bottom:0.75rem;color:var(--primary-container);">{title}</h3>'
            f'<p class="text-body">{desc}</p>'
            f'</div>'
        )

    faq_html = ''
    for q, a in faq:
        faq_html += (
            f'<details class="faq-item rv"><summary>{q} '
            f'<span class="material-symbols-outlined icon">expand_more</span></summary>'
            f'<div class="faq-answer">{a}</div></details>'
        )

    label_intro = "Contexte local" if not is_en else "Local context"
    label_cases = "Cas d'usage Abomey-Calavi" if not is_en else "Abomey-Calavi use cases"
    label_faq = "FAQ supplémentaire" if not is_en else "Additional FAQ"

    return f'''
{SENTINEL}
<section class="section section--surface">
<div class="section-inner">
<span class="text-label rv">{label_intro}</span>
<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">{intro_h2}</h2>
<p class="text-body-lg rv" style="max-width:60rem;">{intro}</p>
</div>
</section>

<section class="section section--low">
<div class="section-inner">
<span class="text-label rv">{label_cases}</span>
<h2 class="text-h2 rv" style="margin:1rem 0 3rem;">{cases_title}</h2>
<div class="grid-2" style="gap:2rem;">
{case_html}
</div>
</div>
</section>

<section class="section section--surface">
<div class="section-inner" style="max-width:48rem;">
<span class="text-label rv">{label_faq}</span>
<h2 class="text-h2 rv" style="margin-bottom:3rem;">{faq_title.upper()}</h2>
{faq_html}
</div>
</section>
'''

def update_faq_schema(text: str, new_faq: list) -> str:
    """Append new Q&A pairs to existing FAQPage Schema."""
    pattern = re.compile(
        r'(<script type="application/ld\+json">)(\{"@context":"https://schema\.org","@type":"FAQPage","mainEntity":\[)(.*?)(\]\})(</script>)',
        re.DOTALL,
    )
    def append(m):
        prefix, start, existing, end, suffix = m.groups()
        new_items = []
        for q, a in new_faq:
            new_items.append(
                '{"@type":"Question","name":' + json.dumps(q, ensure_ascii=False) +
                ',"acceptedAnswer":{"@type":"Answer","text":' + json.dumps(a, ensure_ascii=False) + '}}'
            )
        return prefix + start + existing + ',' + ','.join(new_items) + end + suffix
    return pattern.sub(append, text, count=1)

count = 0
for category, langs in CONTENT.items():
    for lang_dir in ('', 'en/'):
        page = ROOT / (lang_dir + category) / 'abomey-calavi.html'
        if not page.exists():
            print(f"[MISS] {page}")
            continue
        text = page.read_text(encoding='utf-8', errors='ignore')
        if SENTINEL in text:
            print(f"[SKIP] {page} (deja enrichi)")
            continue
        data = langs['en' if lang_dir == 'en/' else 'fr']
        block = build_html(data, is_en=(lang_dir == 'en/'))
        new_text = re.sub(
            r'(<!-- NEWSLETTER -->|<div class="newsletter">|<footer class="footer">)',
            block + '\n\\1',
            text, count=1,
        )
        if new_text != text:
            # Append new FAQ items to the existing FAQPage Schema
            new_text = update_faq_schema(new_text, data['faq'])
            page.write_text(new_text, encoding='utf-8')
            count += 1
            print(f"[OK] {page.relative_to(ROOT)}")

print(f"\nPages enrichies: {count}")
