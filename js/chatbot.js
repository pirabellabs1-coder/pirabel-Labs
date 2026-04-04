/* ========================================================================
   PIRABEL LABS — Chatbot IA Intelligent
   Client-side conversational engine + fire-and-forget server persistence
   ======================================================================== */
(function() {
  'use strict';

  // ─── KNOWLEDGE BASE ──────────────────────────────────────────
  // Each topic: id, kw (keywords/phrases), responses (array), buttons
  // Matching: normalize input → find best keyword match → pick random response
  // {name} placeholder is replaced with visitor name

  var TOPICS = [
    // ── SALUTATIONS ──
    {
      id: 'hello',
      kw: ['bonjour', 'salut', 'hello', 'hey', 'bonsoir', 'coucou', 'yo', 'hi', 'bonne journee', 'bonne soiree'],
      responses: [
        "Bonjour {name} ! Ravi de vous accueillir chez Pirabel Labs. Je suis la pour repondre a toutes vos questions sur nos services, nos tarifs ou notre facon de travailler. Qu'est-ce qui vous amene aujourd'hui ?",
        "Salut {name} ! Bienvenue sur Pirabel Labs. Que ce soit pour un site web, du SEO, de la pub ou autre chose, je suis la pour vous guider. Comment puis-je vous aider ?",
        "Hey {name} ! Content de vous voir ici. Dites-moi ce que vous cherchez et je vous oriente au mieux. On a pas mal de cordes a notre arc !"
      ],
      buttons: ['Decouvrir nos services', 'Obtenir un devis gratuit', 'Tarifs indicatifs']
    },

    // ── REMERCIEMENTS / AU REVOIR ──
    {
      id: 'thanks',
      kw: ['merci', 'super', 'parfait', 'genial', 'top', 'excellent', 'cool', 'au revoir', 'bye', 'a bientot', 'bonne journee', 'bravo', 'nickel', 'impeccable'],
      responses: [
        "Avec plaisir {name} ! N'hesitez vraiment pas si une autre question vous vient. Toute l'equipe Pirabel Labs est la pour vous accompagner. A tres bientot !",
        "Merci a vous {name} ! Si vous avez besoin de quoi que ce soit, je suis la 24h/24. Bonne continuation et a bientot !",
        "Ca fait plaisir de pouvoir aider ! Si vous souhaitez aller plus loin, notre equipe sera ravie de discuter de votre projet. Passez une excellente journee {name} !"
      ],
      buttons: []
    },

    // ── SERVICES OVERVIEW ──
    {
      id: 'services',
      kw: ['services', 'proposez', 'faites', 'offres', 'prestations', 'expertise', 'specialite', 'domaines', 'quoi', 'activite', 'metier'],
      responses: [
        "Chez Pirabel Labs, on couvre vraiment tout le spectre du digital. Voici nos <strong>12 poles d'expertise</strong> :<br><br>🔍 <strong>SEO & Referencement</strong> — pour dominer Google<br>🌐 <strong>Creation de sites web</strong> — WordPress, Shopify, Webflow, sur-mesure<br>🎨 <strong>Design & Branding</strong> — logo, charte graphique, identite visuelle<br>📱 <strong>Social Media</strong> — community management, strategie, influence<br>📢 <strong>Publicite payante</strong> — Google Ads, Meta Ads, TikTok, LinkedIn<br>📧 <strong>Email Marketing & CRM</strong> — Brevo, Mailchimp, HubSpot<br>🤖 <strong>IA & Automatisation</strong> — chatbots, agents IA, Make, Zapier<br>✍️ <strong>Redaction & Content</strong> — articles SEO, copywriting<br>🎬 <strong>Video & Motion Design</strong> — corporate, reseaux sociaux<br>🚀 <strong>Sales Funnels & CRO</strong> — tunnels, landing pages, A/B testing<br>💼 <strong>Consulting Digital</strong> — strategie, audit, transformation<br>🎓 <strong>Formation Digitale</strong> — SEO, marketing, Google Ads, IA<br><br>Quel domaine vous interesse le plus ?",
      ],
      buttons: ['Je veux un site web', 'Je veux du SEO', 'Publicite en ligne', 'IA & Automatisation']
    },

    // ── SEO ──
    {
      id: 'seo',
      kw: ['seo', 'referencement', 'referencement naturel', 'google', 'position', 'visibilite', 'netlinking', 'backlinks', 'mots cles', 'trafic organique', 'premiere page', 'search console', 'serp', 'indexation', 'audit seo', 'seo local', 'seo technique'],
      responses: [
        "Le SEO, c'est notre passion {name} ! On aide nos clients a se positionner en premiere page de Google de maniere durable. Notre approche inclut :<br><br>• <strong>Audit SEO complet</strong> — analyse technique, semantique et concurrentielle<br>• <strong>SEO technique</strong> — vitesse, Core Web Vitals, structure du site<br>• <strong>Strategie de contenu</strong> — recherche de mots-cles, articles optimises<br>• <strong>Netlinking</strong> — acquisition de backlinks de qualite<br>• <strong>SEO local</strong> — fiche Google Business, avis, geolocalisation<br><br>Nos clients voient en moyenne <strong>+45% de trafic organique</strong> en 6 mois. Le SEO, c'est un investissement a long terme qui rapporte gros ! Vous avez deja un site en place ?",
        "Excellent choix ! Le SEO, c'est le levier d'acquisition le plus rentable a long terme. Chez Pirabel Labs, on travaille sur les 3 piliers :<br><br>1. <strong>Technique</strong> — votre site doit etre rapide, mobile et bien structure<br>2. <strong>Contenu</strong> — des pages et articles qui repondent aux recherches de vos clients<br>3. <strong>Popularite</strong> — des backlinks de sites de confiance<br><br>On propose aussi des <a href='/formation-digitale/formation-seo.html'>formations SEO</a> si vous voulez monter en competences en interne. Qu'est-ce qui vous interesse le plus ?"
      ],
      buttons: ['Tarif SEO ?', 'Audit SEO gratuit', 'Formation SEO', 'Obtenir un devis']
    },

    // ── CREATION DE SITES WEB ──
    {
      id: 'web',
      kw: ['site web', 'site internet', 'creation site', 'developpement web', 'refonte', 'wordpress', 'shopify', 'webflow', 'sur mesure', 'ecommerce', 'e-commerce', 'boutique en ligne', 'vitrine', 'landing page', 'application web', 'responsive'],
      responses: [
        "Bien sur {name} ! On cree des sites web qui ne sont pas juste beaux — ils convertissent. Voici ce qu'on propose :<br><br>• <strong>WordPress</strong> — ideal pour les sites vitrines, blogs et portails (+43% du web mondial)<br>• <strong>Shopify</strong> — parfait pour les boutiques e-commerce<br>• <strong>Webflow</strong> — pour les designs premium et sur-mesure<br>• <strong>Developpement sur-mesure</strong> — applications web complexes en React, Node.js<br><br>Chaque projet inclut le <strong>design responsive</strong>, le SEO de base, la formation et le support. On intervient partout : Paris, Lyon, Marseille, Bruxelles, Montreal, Dakar, Abidjan... Quel type de site vous interesse ?",
        "La creation de site, c'est le coeur de notre metier {name} ! Que vous partiez de zero ou que vous vouliez refondre un site existant, on s'adapte :<br><br>• <strong>Site vitrine</strong> — a partir de 1 500€, livre en 2-4 semaines<br>• <strong>E-commerce</strong> — a partir de 3 000€, livre en 4-8 semaines<br>• <strong>Application web</strong> — sur devis, selon la complexite<br><br>On inclut toujours : hebergement, SSL, formation pour que vous soyez autonome, et 30 jours de support apres livraison. Vous avez deja une idee de ce que vous cherchez ?"
      ],
      buttons: ['Combien ca coute ?', 'Quel CMS choisir ?', 'Delai de realisation ?', 'Demander un devis']
    },

    // ── DESIGN & BRANDING ──
    {
      id: 'design',
      kw: ['design', 'branding', 'logo', 'charte graphique', 'identite visuelle', 'packaging', 'direction artistique', 'maquette', 'figma', 'ui', 'ux', 'graphisme', 'graphique'],
      responses: [
        "L'identite visuelle, c'est la premiere impression que vous laissez {name}. Notre equipe design cree des identites qui marquent les esprits :<br><br>• <strong>Creation de logo</strong> — 3 propositions, revisions illimitees<br>• <strong>Charte graphique complete</strong> — couleurs, typographies, pictogrammes, regles d'utilisation<br>• <strong>Direction artistique</strong> — pour vos supports print et digitaux<br>• <strong>UI/UX Design</strong> — maquettes Figma pour vos sites et applications<br>• <strong>Packaging</strong> — design produit<br><br>Un bon branding, c'est ce qui vous differencie de la concurrence. Quel est votre besoin principal ?"
      ],
      buttons: ['Tarif logo ?', 'Charte graphique', 'Demander un devis']
    },

    // ── SOCIAL MEDIA ──
    {
      id: 'social',
      kw: ['social media', 'reseaux sociaux', 'community', 'community management', 'instagram', 'facebook', 'tiktok', 'linkedin', 'influence', 'influenceur', 'contenu social', 'publication', 'stories', 'reels', 'followers', 'abonnes'],
      responses: [
        "Les reseaux sociaux, c'est un vrai levier de croissance quand c'est bien fait {name} ! Chez Pirabel Labs, on gere :<br><br>• <strong>Community Management</strong> — creation de contenu, planification, interaction avec votre communaute<br>• <strong>Strategie Social Media</strong> — choix des plateformes, ligne editoriale, calendrier<br>• <strong>Instagram</strong> — Reels, Stories, carousels optimises<br>• <strong>LinkedIn</strong> — personal branding, generation de leads B2B<br>• <strong>TikTok</strong> — videos virales et tendances<br>• <strong>Influence Marketing</strong> — identification et collaboration avec des influenceurs<br><br>On propose aussi des <a href='/formation-digitale/formation-reseaux-sociaux.html'>formations reseaux sociaux</a> pour vos equipes. Quelles plateformes utilisez-vous actuellement ?"
      ],
      buttons: ['Tarif community management ?', 'Formation reseaux sociaux', 'Demander un devis']
    },

    // ── PUBLICITE PAYANTE ──
    {
      id: 'ads',
      kw: ['publicite', 'pub', 'ads', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'tiktok ads', 'linkedin ads', 'campagne', 'sea', 'sponsor', 'ppc', 'cpc', 'cpa', 'roas', 'budget pub', 'remarketing', 'retargeting', 'display', 'shopping ads'],
      responses: [
        "La publicite en ligne, c'est de l'acquisition rapide et mesurable {name}. On gere vos campagnes sur toutes les plateformes :<br><br>• <strong>Google Ads</strong> — Search, Display, Shopping, YouTube Ads<br>• <strong>Meta Ads</strong> — Facebook & Instagram (le duo incontournable en B2C)<br>• <strong>TikTok Ads</strong> — pour toucher une audience jeune et engagee<br>• <strong>LinkedIn Ads</strong> — ideal pour le B2B et le recrutement<br><br>Notre approche : on optimise en continu pour maximiser votre ROI. En moyenne, nos clients obtiennent <strong>3x de retour sur investissement</strong>. Quel est votre budget publicitaire actuel ?",
        "Bonne idee de s'interesser a la pub en ligne ! C'est le moyen le plus rapide de generer des leads et des ventes. On propose :<br><br>• Setup complet de vos campagnes<br>• A/B testing des annonces et audiences<br>• Tracking des conversions (Google Tag Manager)<br>• Optimisation quotidienne<br>• Reporting mensuel detaille<br><br>Budget minimum recommande : <strong>300-500€/mois</strong> pour demarrer. On propose aussi une <a href='/formation-digitale/formation-google-ads.html'>formation Google Ads</a>. Qu'est-ce qui vous interesse ?"
      ],
      buttons: ['Budget minimum ?', 'Google Ads vs Meta Ads ?', 'Formation Google Ads', 'Demander un devis']
    },

    // ── EMAIL MARKETING & CRM ──
    {
      id: 'email',
      kw: ['email marketing', 'emailing', 'newsletter', 'crm', 'brevo', 'sendinblue', 'mailchimp', 'hubspot', 'automation', 'marketing automation', 'nurturing', 'lead scoring', 'sequence', 'campagne email', 'deliverabilite', 'activecampaign', 'klaviyo'],
      responses: [
        "L'email marketing, c'est le canal avec le meilleur ROI : <strong>36€ pour chaque euro investi</strong> en moyenne ! Chez Pirabel Labs, on maitrise les grandes plateformes :<br><br>• <strong>Brevo (ex-Sendinblue)</strong> — notre recommandation pour le marche francophone, RGPD natif<br>• <strong>Mailchimp</strong> — tres populaire, bon pour demarrer<br>• <strong>HubSpot CRM</strong> — l'ecosysteme complet CRM + marketing<br>• <strong>ActiveCampaign</strong> — le champion de l'automatisation avancee<br><br>On gere tout : setup, templates, sequences automatisees, segmentation et reporting. Vous utilisez deja un outil d'emailing ?"
      ],
      buttons: ['Brevo ou Mailchimp ?', 'Setup CRM HubSpot', 'Tarifs ?', 'Demander un devis']
    },

    // ── IA & AUTOMATISATION ──
    {
      id: 'ia',
      kw: ['ia', 'intelligence artificielle', 'automatisation', 'chatbot', 'agent ia', 'make', 'zapier', 'n8n', 'chatgpt', 'claude', 'gpt', 'openai', 'anthropic', 'midjourney', 'dall-e', 'prompt', 'workflow', 'robot', 'bot'],
      responses: [
        "L'IA et l'automatisation, c'est notre specialite de pointe {name} ! On aide les entreprises a travailler plus intelligemment :<br><br>🤖 <strong>Chatbots IA</strong> — des assistants conversationnels qui repondent a vos clients 24h/24 (comme moi !)<br>🧠 <strong>Agents IA</strong> — automatisation de taches complexes avec ChatGPT, Claude ou des modeles sur-mesure<br>⚡ <strong>Make / Zapier / n8n</strong> — workflows automatises pour connecter tous vos outils<br>📝 <strong>IA pour le contenu</strong> — generation d'articles, emails, visuels assistes par IA<br><br>L'IA, c'est pas de la magie — c'est un outil puissant quand il est bien utilise. On a aussi une <a href='/formation-digitale/formation-ia-marketing.html'>formation IA Marketing</a> si ca vous interesse. Quel usage de l'IA vous attire ?",
        "Super sujet ! L'IA transforme le business en 2026. Concretement, voici ce qu'on peut faire pour vous :<br><br>• Creer un <strong>chatbot intelligent</strong> pour votre site (service client, qualification de leads)<br>• Automatiser vos <strong>workflows repetitifs</strong> (facturation, relances, reporting)<br>• Integrer l'IA dans votre <strong>creation de contenu</strong> (articles, emails, visuels)<br>• Connecter vos outils avec <strong>Make ou Zapier</strong> pour que tout communique<br><br>En moyenne, nos clients gagnent <strong>40% de productivite</strong> avec nos solutions d'automatisation. Dites-moi plus sur votre activite !"
      ],
      buttons: ['Chatbot pour mon site', 'Automatiser mes taches', 'Formation IA', 'Demander un devis']
    },

    // ── REDACTION & CONTENT ──
    {
      id: 'content',
      kw: ['redaction', 'content marketing', 'copywriting', 'article', 'blog', 'page de vente', 'strategie editoriale', 'fiche produit', 'contenu', 'redacteur', 'texte', 'seo content'],
      responses: [
        "Le contenu, c'est ce qui fait vivre votre site et nourrit votre SEO {name}. Notre equipe de redacteurs cree :<br><br>• <strong>Articles de blog SEO</strong> — optimises pour Google, qui attirent du trafic qualifie<br>• <strong>Pages de vente</strong> — copywriting persuasif qui convertit<br>• <strong>Fiches produits</strong> — descriptions qui donnent envie d'acheter<br>• <strong>Strategie editoriale</strong> — calendrier, piliers de contenu, ligne editoriale<br>• <strong>Newsletters</strong> — contenu email qui engage<br><br>On maitrise aussi l'IA pour accelerer la production sans perdre en qualite. Quel type de contenu vous interesse ?"
      ],
      buttons: ['Articles de blog', 'Pages de vente', 'Tarifs ?', 'Demander un devis']
    },

    // ── VIDEO & MOTION DESIGN ──
    {
      id: 'video',
      kw: ['video', 'motion design', 'montage', 'corporate', 'youtube', 'miniature', 'animation', 'tournage', 'clip', 'reel video', 'video reseaux'],
      responses: [
        "La video, c'est le format roi en 2026 {name} ! On produit :<br><br>🎬 <strong>Videos corporate</strong> — presentation entreprise, temoignages clients<br>📱 <strong>Contenu video social</strong> — Reels, TikToks, Shorts YouTube<br>✨ <strong>Motion design</strong> — animations, infographies animees, explainer videos<br>🎞️ <strong>Montage professionnel</strong> — post-production, sous-titrage, habillage<br>🖼️ <strong>Miniatures YouTube</strong> — pour maximiser vos clics<br><br>De la conceptualisation au produit final, on gere tout le processus. Quel type de video vous interesse ?"
      ],
      buttons: ['Video corporate', 'Contenu social', 'Tarifs ?', 'Demander un devis']
    },

    // ── SALES FUNNELS & CRO ──
    {
      id: 'funnel',
      kw: ['funnel', 'tunnel de vente', 'landing page', 'conversion', 'cro', 'a/b test', 'taux de conversion', 'systeme.io', 'clickfunnels', 'kajabi', 'page de capture', 'opt-in', 'upsell', 'downsell'],
      responses: [
        "Les tunnels de vente, c'est la ou la magie de la conversion opère {name} ! On cree des parcours d'achat optimises :<br><br>• <strong>Landing pages</strong> — pages de capture qui convertissent a +30%<br>• <strong>Tunnels complets</strong> — page de vente → checkout → upsell → merci<br>• <strong>A/B Testing</strong> — on teste tout pour trouver ce qui marche le mieux<br>• <strong>CRO</strong> — optimisation continue du taux de conversion<br><br>On maitrise les plateformes comme <strong>Systeme.io</strong>, <strong>ClickFunnels</strong> et <strong>Kajabi</strong>. Vous vendez des produits, des services ou des formations ?"
      ],
      buttons: ['Systeme.io', 'Landing page', 'Tarifs ?', 'Demander un devis']
    },

    // ── CONSULTING DIGITAL ──
    {
      id: 'consulting',
      kw: ['consulting', 'conseil', 'strategie digitale', 'audit digital', 'transformation digitale', 'startup', 'ecommerce conseil', 'diagnostic', 'accompagnement', 'consultant'],
      responses: [
        "Notre pole consulting aide les entreprises a prendre les bonnes decisions digitales {name}. On propose :<br><br>• <strong><a href='/consulting-digital/strategie-digitale.html'>Strategie digitale</a></strong> — roadmap complete sur 6-12 mois<br>• <strong><a href='/consulting-digital/audit-digital.html'>Audit digital</a></strong> — diagnostic 360° de votre presence en ligne<br>• <strong><a href='/consulting-digital/transformation-digitale.html'>Transformation digitale</a></strong> — modernisation des processus et outils<br>• <strong><a href='/consulting-digital/conseil-ecommerce.html'>Conseil e-commerce</a></strong> — lancement ou optimisation de boutique en ligne<br>• <strong><a href='/consulting-digital/conseil-startup.html'>Conseil startup</a></strong> — growth hacking, MVP, acquisition rapide<br><br>Quel est votre principal defi aujourd'hui ?"
      ],
      buttons: ['Audit digital gratuit', 'Strategie digitale', 'Conseil startup', 'Demander un devis']
    },

    // ── FORMATION ──
    {
      id: 'formation',
      kw: ['formation', 'apprendre', 'cours', 'coaching', 'former', 'competences', 'certifiant', 'certificat', 'cpf', 'opco'],
      responses: [
        "On propose des formations pour rendre vos equipes autonomes sur le digital {name} ! Voici notre catalogue :<br><br>🔍 <strong><a href='/formation-digitale/formation-seo.html'>Formation SEO</a></strong> — 14h, de debutant a avance<br>📱 <strong><a href='/formation-digitale/formation-reseaux-sociaux.html'>Formation Reseaux Sociaux</a></strong> — Instagram, LinkedIn, TikTok<br>📢 <strong><a href='/formation-digitale/formation-google-ads.html'>Formation Google Ads</a></strong> — 18h, prep certif Google<br>🤖 <strong><a href='/formation-digitale/formation-ia-marketing.html'>Formation IA Marketing</a></strong> — ChatGPT, Claude, automatisation<br>🌐 <strong><a href='/formation-digitale/formation-wordpress.html'>Formation WordPress</a></strong> — creer et gerer son site<br>📊 <strong><a href='/formation-digitale/formation-analytics.html'>Formation Google Analytics</a></strong> — maitriser GA4<br>📈 <strong><a href='/formation-digitale/formation-marketing-digital.html'>Formation Marketing Digital</a></strong> — 28h, tous les leviers<br><br>Toutes nos formations sont disponibles en ligne et en presentiel. Quelle competence voulez-vous developper ?"
      ],
      buttons: ['Formation SEO', 'Formation IA', 'Formation Google Ads', 'Tarifs formation ?']
    },

    // ── TARIFS / PRIX ──
    {
      id: 'pricing',
      kw: ['tarif', 'prix', 'cout', 'combien', 'budget', 'investissement', 'devis', 'estimation', 'forfait', 'pack', 'abonnement', 'mensuel', 'grille tarifaire'],
      responses: [
        "Bonne question {name} ! Nos tarifs dependent du projet, mais voici des <strong>fourchettes indicatives</strong> :<br><br>🌐 <strong>Site vitrine</strong> — a partir de 1 500€<br>🛒 <strong>E-commerce</strong> — a partir de 3 000€<br>🔍 <strong>SEO mensuel</strong> — a partir de 500€/mois<br>📱 <strong>Social Media</strong> — a partir de 400€/mois<br>📢 <strong>Google/Meta Ads</strong> — gestion a partir de 300€/mois + budget pub<br>🎨 <strong>Logo & Branding</strong> — a partir de 800€<br>📧 <strong>Email Marketing</strong> — a partir de 300€/mois<br>🤖 <strong>Chatbot IA</strong> — a partir de 1 500€<br>🎓 <strong>Formations</strong> — a partir de 500€<br><br>Pour un devis precis et personnalise, decrivez-moi votre projet ou remplissez notre <a href='/contact.html'>formulaire de contact</a>. On repond sous 24h !",
        "Les prix varient selon la complexite du projet {name}, mais pour vous donner une idee :<br><br>• <strong>Petit projet</strong> (site vitrine, logo) — 800€ a 3 000€<br>• <strong>Projet moyen</strong> (e-commerce, refonte + SEO) — 3 000€ a 10 000€<br>• <strong>Gros projet</strong> (application web, strategie complete) — 10 000€+<br>• <strong>Abonnements</strong> (SEO, social media, ads) — 300€ a 2 000€/mois<br><br>On s'adapte a tous les budgets. L'important, c'est de trouver la solution qui vous apporte le meilleur retour sur investissement. Quel est votre budget approximatif ?"
      ],
      buttons: ['Je veux un devis', 'Parler a un humain', 'Quels services ?']
    },

    // ── DEVIS / PROPOSITION ──
    {
      id: 'devis',
      kw: ['devis', 'proposition', 'offre commerciale', 'gratuit'],
      responses: [
        "Bien sur {name} ! Pour obtenir un <strong>devis gratuit et personnalise</strong>, vous avez 3 options :<br><br>1. <strong>Remplir notre formulaire</strong> — <a href='/contact.html'>cliquez ici</a> (reponse sous 24h)<br>2. <strong>M'envoyer un email</strong> — <a href='mailto:pirabellabs@gmail.com'>pirabellabs@gmail.com</a><br>3. <strong>Me decrire votre projet ici</strong> — je transmettrai a notre equipe<br><br>On ne fait pas de devis generiques — chaque proposition est taillee sur mesure pour votre situation. Dites-moi en plus sur votre projet !"
      ],
      buttons: ['Formulaire de contact', 'Decrire mon projet']
    },

    // ── CONTACT ──
    {
      id: 'contact',
      kw: ['contact', 'joindre', 'appeler', 'telephone', 'mail', 'email', 'adresse', 'localisation', 'ou etes', 'bureau', 'whatsapp'],
      responses: [
        "Vous pouvez nous joindre facilement {name} :<br><br>📧 <strong>Email</strong> — <a href='mailto:pirabellabs@gmail.com'>pirabellabs@gmail.com</a><br>📝 <strong>Formulaire</strong> — <a href='/contact.html'>page contact</a><br>💬 <strong>WhatsApp</strong> — <a href='https://wa.me/16139273067' target='_blank'>+1 613 927 3067</a><br>💬 <strong>Ce chat</strong> — decrivez votre besoin et je transmets !<br><br>Pirabel Labs est une agence digitale internationale. On travaille avec des clients en <strong>France, Belgique, Canada, Maroc, Senegal, Cote d'Ivoire, Benin, Tunisie</strong> et partout dans le monde. Reponse garantie sous 24h !"
      ],
      buttons: ['Formulaire de contact', 'Envoyer un email', 'Quels services ?']
    },

    // ── DELAIS ──
    {
      id: 'delai',
      kw: ['delai', 'combien de temps', 'duree', 'livraison', 'quand', 'rapide', 'urgent', 'planning', 'semaines'],
      responses: [
        "Les delais varient selon le type de projet {name}, mais voici nos moyennes :<br><br>⚡ <strong>Logo</strong> — 1 a 2 semaines<br>🌐 <strong>Site vitrine</strong> — 2 a 4 semaines<br>🛒 <strong>E-commerce</strong> — 4 a 8 semaines<br>📢 <strong>Setup campagne Ads</strong> — 3 a 5 jours<br>🔍 <strong>Audit SEO</strong> — 3 a 5 jours<br>🤖 <strong>Chatbot IA</strong> — 2 a 3 semaines<br><br>On respecte toujours les delais convenus et on vous tient informe a chaque etape. Si c'est urgent, dites-le nous — on a des solutions pour accelerer certains projets."
      ],
      buttons: ['Je veux un devis', 'Parler a un humain']
    },

    // ── PROCESSUS / METHODOLOGIE ──
    {
      id: 'process',
      kw: ['processus', 'comment fonctionne', 'etape', 'methodologie', 'deroulement', 'comment travaillez', 'methode', 'approche'],
      responses: [
        "Notre processus est simple et transparent {name} :<br><br><strong>1. Decouverte</strong> — On discute de votre projet, vos objectifs et votre budget lors d'un appel gratuit de 30 min<br><strong>2. Proposition</strong> — On vous envoie un devis detaille avec strategie, delais et budget<br><strong>3. Realisation</strong> — On lance le projet avec des points reguliers pour que vous suiviez l'avancement<br><strong>4. Livraison</strong> — Mise en ligne, formation pour que vous soyez autonome, et 30 jours de support inclus<br><br>Vous avez un chef de projet dedie du debut a la fin. Pas de mauvaise surprise, tout est clair des le depart. On commence ?"
      ],
      buttons: ['Demander un appel', 'Obtenir un devis', 'Quels services ?']
    },

    // ── RESULTATS / PORTFOLIO ──
    {
      id: 'results',
      kw: ['resultats', 'portfolio', 'references', 'clients', 'temoignage', 'cas', 'prouver', 'exemples', 'experience', 'etude de cas', 'realisations'],
      responses: [
        "Nos resultats parlent d'eux-memes {name} :<br><br>📊 <strong>150+ projets livres</strong> avec succes<br>📈 <strong>+45% de trafic organique</strong> en moyenne pour nos clients SEO<br>💰 <strong>3x de ROI moyen</strong> sur les campagnes publicitaires<br>⭐ <strong>98% de clients satisfaits</strong><br>🌍 <strong>Clients dans 10+ pays</strong><br><br>Consultez nos etudes de cas detaillees sur notre <a href='/resultats.html'>page resultats</a>. On est fier de chaque projet qu'on livre !"
      ],
      buttons: ['Voir les resultats', 'Je veux un devis', 'Quels services ?']
    },

    // ── QUI ETES-VOUS / A PROPOS ──
    {
      id: 'about',
      kw: ['qui etes', 'pirabel', 'equipe', 'presentation', 'about', 'a propos', 'fondateur', 'histoire', 'valeurs', 'mission'],
      responses: [
        "<strong>Pirabel Labs</strong>, c'est une agence digitale 360° qui aide les entreprises a se developper en ligne {name}.<br><br>• <strong>Equipe multidisciplinaire</strong> — developpeurs, designers, marketeurs, experts IA, redacteurs<br>• <strong>Presence internationale</strong> — clients en France, Belgique, Canada et Afrique<br>• <strong>+150 projets livres</strong> depuis notre creation<br>• <strong>Approche sur-mesure</strong> — chaque client est unique, chaque strategie aussi<br><br>Notre mission : rendre le digital accessible et rentable pour toutes les entreprises, de la startup a la grande entreprise. Decouvrez-en plus sur notre <a href='/a-propos.html'>page a propos</a>."
      ],
      buttons: ['Nos services', 'Nos resultats', 'Nous contacter']
    },

    // ── HUMAIN / RDV ──
    {
      id: 'human',
      kw: ['humain', 'vraie personne', 'parler quelqu', 'equipe commerciale', 'rendez-vous', 'rdv', 'appel telephonique', 'visio', 'zoom', 'meet'],
      responses: [
        "Bien sur {name}, je comprends ! Pour parler directement a un membre de notre equipe :<br><br>📧 Envoyez un email a <a href='mailto:pirabellabs@gmail.com'>pirabellabs@gmail.com</a><br>📝 Remplissez notre <a href='/contact.html'>formulaire de contact</a><br>💬 Ecrivez-nous sur <a href='https://wa.me/16139273067' target='_blank'>WhatsApp</a><br><br>Un membre de l'equipe vous recontactera sous <strong>24h ouvrees</strong> pour discuter de vive voix. En attendant, est-ce que je peux deja vous renseigner sur quelque chose ?"
      ],
      buttons: ['Formulaire de contact', 'Envoyer un email']
    },

    // ── OUTILS / COMPARATIFS ──
    {
      id: 'tools',
      kw: ['outil', 'outils', 'comparatif', 'logiciel', 'plateforme', 'semrush', 'ahrefs', 'screaming frog', 'canva', 'notion', 'monday', 'asana'],
      responses: [
        "On a justement des guides complets sur les outils digitaux {name} ! Consultez nos comparatifs :<br><br>🔍 <strong><a href='/outils-digitaux/outils-seo.html'>Outils SEO</a></strong> — Semrush vs Ahrefs vs alternatives<br>📧 <strong><a href='/outils-digitaux/outils-email-marketing.html'>Outils Email Marketing</a></strong> — Brevo vs Mailchimp vs ActiveCampaign<br>📚 <strong><a href='/outils-digitaux/'>Tous nos guides outils</a></strong><br><br>Nos recommandations sont independantes — on teste chaque outil en conditions reelles. Quel type d'outil cherchez-vous ?"
      ],
      buttons: ['Outils SEO', 'Outils Email', 'Recommandation personnalisee']
    },

    // ── BLOG ──
    {
      id: 'blog',
      kw: ['blog', 'articles', 'lire', 'actualites', 'ressources', 'guides'],
      responses: [
        "On publie regulierement des articles et guides sur le marketing digital {name} ! Rendez-vous sur notre <a href='/blog.html'>blog</a> pour decouvrir nos derniers contenus sur le SEO, l'IA, les reseaux sociaux et plus encore. On a aussi des <a href='/guides/'>guides detailles</a> sur plein de sujets. Bonne lecture !"
      ],
      buttons: ['Voir le blog', 'Guides pratiques', 'Nos services']
    },

    // ── VILLES / LOCALISATION ──
    {
      id: 'cities',
      kw: ['paris', 'lyon', 'marseille', 'bruxelles', 'montreal', 'cotonou', 'casablanca', 'dakar', 'abidjan', 'tunis', 'france', 'belgique', 'canada', 'afrique', 'maroc', 'senegal', 'benin', 'tunisie', 'ville', 'pays', 'international'],
      responses: [
        "Pirabel Labs travaille a l'international {name} ! On accompagne des clients dans :<br><br>🇫🇷 <strong>France</strong> — Paris, Lyon, Marseille, Lille, Toulouse, Nantes, Bordeaux...<br>🇧🇪 <strong>Belgique</strong> — Bruxelles, Anvers, Liege<br>🇨🇦 <strong>Canada</strong> — Montreal, Quebec, Toronto<br>🇲🇦 <strong>Maroc</strong> — Casablanca, Rabat, Marrakech<br>🇸🇳 <strong>Senegal</strong> — Dakar<br>🇨🇮 <strong>Cote d'Ivoire</strong> — Abidjan<br>🇧🇯 <strong>Benin</strong> — Cotonou<br>🇹🇳 <strong>Tunisie</strong> — Tunis<br><br>On travaille a distance, donc on peut collaborer ou que vous soyez dans le monde !"
      ],
      buttons: ['Nos services', 'Obtenir un devis', 'Nous contacter']
    },

    // ── TECHNOLOGIES ──
    {
      id: 'tech',
      kw: ['react', 'node', 'javascript', 'php', 'python', 'laravel', 'html', 'css', 'api', 'base de donnees', 'mongodb', 'mysql', 'aws', 'vercel', 'heroku', 'hebergement', 'serveur', 'ssl', 'https'],
      responses: [
        "Cote technologie, on maitrise un large stack {name} :<br><br>💻 <strong>Frontend</strong> — HTML/CSS, JavaScript, React, Vue.js, Next.js<br>⚙️ <strong>Backend</strong> — Node.js, Express, PHP, Laravel, Python<br>📦 <strong>CMS</strong> — WordPress, Shopify, Webflow, Strapi<br>🗄️ <strong>Bases de donnees</strong> — MongoDB, MySQL, PostgreSQL<br>☁️ <strong>Cloud</strong> — Vercel, AWS, DigitalOcean<br>🔐 <strong>Securite</strong> — SSL, HTTPS, RGPD, OAuth<br><br>On choisit la technologie la plus adaptee a votre projet — pas celle qu'on prefere. Parlez-moi de votre besoin technique !"
      ],
      buttons: ['Je veux un site', 'Application web', 'Demander un devis']
    },

    // ── OUI / CONFIRMATION ──
    {
      id: 'yes',
      kw: ['oui', 'ok', 'daccord', 'd accord', 'ouais', 'yep', 'bien sur', 'tout a fait', 'exactement', 'absolument', 'volontiers', 'avec plaisir', 'allons-y'],
      responses: [
        "Super {name} ! Alors, comment est-ce que je peux vous aider concretement ? Dites-moi ce qui vous interesse et je vous guide.",
        "Parfait ! On avance. Qu'est-ce qui vous ferait plaisir ? Un devis, des infos sur un service specifique, ou autre chose ?",
        "Genial ! Je suis la pour vous. Posez-moi votre question ou dites-moi ce que vous cherchez !"
      ],
      buttons: ['Nos services', 'Obtenir un devis', 'Tarifs']
    },

    // ── NON / REFUS ──
    {
      id: 'no',
      kw: ['non', 'pas vraiment', 'non merci', 'ca ira', 'rien', 'pas besoin'],
      responses: [
        "Pas de souci {name} ! Si jamais une question vous vient plus tard, je serai la. Bonne continuation !",
        "Aucun probleme ! N'hesitez pas a revenir quand vous voulez. Je suis disponible 24h/24 pour vous aider."
      ],
      buttons: ['Nos services', 'Blog']
    },

    // ── PROJET / DESCRIPTION ──
    {
      id: 'project',
      kw: ['mon projet', 'besoin de', 'je cherche', 'jai besoin', 'je veux', 'je voudrais', 'je souhaite', 'je recherche', 'on aurait besoin', 'nous cherchons', 'notre projet'],
      responses: [
        "Excellent {name} ! J'adorerais en savoir plus sur votre projet. Pour que notre equipe puisse vous preparer une proposition personnalisee, dites-moi :<br><br>• Quel est votre <strong>secteur d'activite</strong> ?<br>• Quel est votre <strong>objectif principal</strong> ? (plus de clients, plus de visibilite, automatiser...)<br>• Avez-vous un <strong>budget</strong> en tete ?<br>• Quel est votre <strong>delai souhaite</strong> ?<br><br>Prenez votre temps, je ne suis pas presse ! Chaque detail m'aide a mieux vous orienter."
      ],
      buttons: []
    },

    // ── FAQ ──
    {
      id: 'faq',
      kw: ['faq', 'questions frequentes', 'questions courantes'],
      responses: [
        "Consultez notre <a href='/faq.html'>FAQ complete</a> pour les questions les plus courantes {name}. Sinon, posez-moi directement votre question ici — je connais nos services sur le bout des doigts !"
      ],
      buttons: ['Nos services', 'Tarifs', 'Nous contacter']
    },

    // ── RGPD / CONFIDENTIALITE ──
    {
      id: 'rgpd',
      kw: ['rgpd', 'donnees personnelles', 'confidentialite', 'cookies', 'vie privee', 'gdpr', 'protection donnees'],
      responses: [
        "La protection de vos donnees est une priorite {name}. Pirabel Labs respecte strictement le RGPD :<br><br>• Vos donnees ne sont jamais revendues a des tiers<br>• Vous pouvez demander la suppression de vos donnees a tout moment<br>• Notre banniere cookies vous permet de gerer vos preferences<br><br>Consultez notre <a href='/politique-confidentialite.html'>politique de confidentialite</a> pour tous les details."
      ],
      buttons: ['Politique de confidentialite', 'Nos services']
    },

    // ── WORDPRESS specifique ──
    {
      id: 'wordpress_detail',
      kw: ['wordpress theme', 'wordpress plugin', 'elementor', 'gutenberg', 'woocommerce', 'yoast', 'rank math', 'wordpress maintenance', 'wordpress securite', 'wordpress lent'],
      responses: [
        "WordPress, c'est notre specialite {name} ! On maitrise l'ecosysteme complet :<br><br>• <strong>Elementor & Gutenberg</strong> — page builders pour un design sans code<br>• <strong>WooCommerce</strong> — boutique en ligne complete<br>• <strong>Yoast / Rank Math</strong> — plugins SEO essentiels<br>• <strong>Securite</strong> — Wordfence, sauvegardes automatiques, mises a jour<br>• <strong>Performance</strong> — optimisation vitesse, cache, CDN<br><br>On propose aussi une <a href='/formation-digitale/formation-wordpress.html'>formation WordPress</a> pour vous rendre 100% autonome. Quel est votre besoin WordPress ?"
      ],
      buttons: ['Formation WordPress', 'Creer un site WordPress', 'Demander un devis']
    },

    // ── SYSTEME.IO / CLICKFUNNELS / KAJABI ──
    {
      id: 'funnel_tools',
      kw: ['systeme io', 'systeme.io', 'clickfunnels', 'kajabi', 'learnybox', 'podia', 'teachable', 'formation en ligne', 'vendre en ligne', 'infoproduit'],
      responses: [
        "On maitrise les plateformes de vente en ligne {name} :<br><br>• <strong><a href='/agence-sales-funnels-cro/systeme-io.html'>Systeme.io</a></strong> — la solution francaise tout-en-un (tunnels, email, formations)<br>• <strong><a href='/agence-sales-funnels-cro/clickfunnels.html'>ClickFunnels</a></strong> — le leader mondial des tunnels de vente<br>• <strong><a href='/agence-sales-funnels-cro/kajabi.html'>Kajabi</a></strong> — ideal pour vendre des formations en ligne<br><br>On vous aide a choisir la bonne plateforme, configurer vos tunnels et optimiser vos conversions. Vous vendez quoi exactement ?"
      ],
      buttons: ['Systeme.io', 'ClickFunnels', 'Kajabi', 'Demander un devis']
    },

    // ── GOOGLE ANALYTICS ──
    {
      id: 'analytics',
      kw: ['analytics', 'google analytics', 'ga4', 'tracking', 'mesure', 'donnees', 'statistiques', 'tag manager', 'gtm', 'kpi', 'tableau de bord', 'reporting'],
      responses: [
        "La data, c'est le nerf de la guerre {name} ! Sans bonnes donnees, impossible de prendre les bonnes decisions. On vous aide avec :<br><br>• <strong>Configuration GA4</strong> — installation, evenements, conversions<br>• <strong>Google Tag Manager</strong> — tracking avance sans toucher au code<br>• <strong>Tableaux de bord</strong> — reporting automatise et visuel<br>• <strong>Analyse de donnees</strong> — identifier ce qui marche et ce qui ne marche pas<br><br>On a aussi une <a href='/formation-digitale/formation-analytics.html'>formation Google Analytics 4</a> si vous voulez etre autonome."
      ],
      buttons: ['Formation Analytics', 'Setup GA4', 'Demander un devis']
    }
  ];

  // ── DEFAULT REPLY ──
  var DEFAULT_RESPONSES = [
    "Merci pour votre message {name} ! Je n'ai pas de reponse precise a cette question, mais je peux vous aider sur plein d'autres sujets. Essayez de me demander :<br><br>• Nos <strong>services</strong> (SEO, site web, pub, IA...)<br>• Nos <strong>tarifs</strong> indicatifs<br>• Notre <strong>processus</strong> de travail<br>• Comment <strong>nous contacter</strong><br><br>Ou decrivez-moi votre projet et je ferai de mon mieux pour vous orienter !",
    "Hmm, je ne suis pas sur de bien comprendre {name}. Mais pas de panique ! Voici ce que je sais faire :<br><br>• Vous presenter nos <strong>services digitaux</strong><br>• Vous donner des <strong>fourchettes de prix</strong><br>• Vous expliquer notre <strong>methode de travail</strong><br>• Vous mettre en contact avec notre <strong>equipe</strong><br><br>Reformulez votre question ou choisissez une des options ci-dessous !"
  ];
  var DEFAULT_BUTTONS = ['Decouvrir nos services', 'Tarifs', 'Nous contacter'];

  // ─── MATCHING ENGINE ────────────────────────────────────────
  var lastTopicId = null;

  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/['']/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function findBestTopic(input) {
    var norm = normalize(input);
    var bestScore = 0;
    var bestTopic = null;

    for (var i = 0; i < TOPICS.length; i++) {
      var topic = TOPICS[i];
      var score = 0;

      for (var j = 0; j < topic.kw.length; j++) {
        var kw = topic.kw[j];
        if (norm.indexOf(kw) !== -1) {
          // Multi-word keywords get higher score
          score += kw.split(' ').length * 2;
        }
      }

      // Context bonus: if user continues on same topic
      if (score > 0 && topic.id === lastTopicId) {
        score += 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestTopic = topic;
      }
    }

    if (bestTopic) {
      lastTopicId = bestTopic.id;
    }

    return bestTopic;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function generateReply(input, visitorName) {
    var name = visitorName || 'ami(e)';
    var topic = findBestTopic(input);

    var reply, buttons;
    if (topic) {
      reply = pickRandom(topic.responses);
      buttons = topic.buttons || [];
    } else {
      reply = pickRandom(DEFAULT_RESPONSES);
      buttons = DEFAULT_BUTTONS;
    }

    reply = reply.replace(/\{name\}/g, name);
    return { reply: reply, buttons: buttons };
  }

  // ─── PAGE CONTEXT ──────────────────────────────────────────
  function getPageContext() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf('seo') !== -1) return 'seo';
    if (path.indexOf('site') !== -1 || path.indexOf('web') !== -1) return 'web';
    if (path.indexOf('social') !== -1) return 'social';
    if (path.indexOf('ads') !== -1 || path.indexOf('pub') !== -1) return 'ads';
    if (path.indexOf('email') !== -1 || path.indexOf('crm') !== -1) return 'email';
    if (path.indexOf('ia') !== -1 || path.indexOf('auto') !== -1) return 'ia';
    if (path.indexOf('design') !== -1 || path.indexOf('brand') !== -1) return 'design';
    if (path.indexOf('video') !== -1 || path.indexOf('motion') !== -1) return 'video';
    if (path.indexOf('funnel') !== -1 || path.indexOf('cro') !== -1) return 'funnel';
    if (path.indexOf('formation') !== -1) return 'formation';
    if (path.indexOf('consulting') !== -1) return 'consulting';
    if (path.indexOf('blog') !== -1) return 'blog';
    return null;
  }

  function getContextualButtons() {
    var ctx = getPageContext();
    switch(ctx) {
      case 'seo': return ['Audit SEO gratuit', 'Tarif SEO ?', 'Obtenir un devis'];
      case 'web': return ['Combien coute un site ?', 'Delai de realisation ?', 'Obtenir un devis'];
      case 'social': return ['Tarif community management ?', 'Formation reseaux sociaux', 'Obtenir un devis'];
      case 'ads': return ['Budget minimum ?', 'ROI moyen ?', 'Obtenir un devis'];
      case 'email': return ['Brevo ou Mailchimp ?', 'Setup CRM', 'Obtenir un devis'];
      case 'ia': return ['Chatbot pour mon site', 'Automatisation', 'Obtenir un devis'];
      case 'formation': return ['Programme de formation', 'Tarifs', 'Inscription'];
      default: return ['Decouvrir nos services', 'Obtenir un devis', 'Tarifs indicatifs'];
    }
  }

  // ─── SERVER PERSISTENCE (fire-and-forget) ──────────────────
  function saveToServer(conversationId, visitorName, visitorEmail, content, sender) {
    try {
      fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId,
          visitorName: visitorName,
          visitorEmail: visitorEmail,
          content: content,
          sender: sender
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // ─── INJECT CSS ────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#pb-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#FF5500,#ff7733);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(255,85,0,0.4);display:flex;align-items:center;justify-content:center;transition:transform .3s,box-shadow .3s;}',
    '#pb-chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(255,85,0,0.5);}',
    '#pb-chat-btn svg{width:28px;height:28px;fill:#fff;}',
    '#pb-chat-btn .pb-badge{position:absolute;top:-2px;right:-2px;background:#25D366;color:#fff;font-size:11px;font-weight:700;min-width:20px;height:20px;border-radius:10px;display:none;align-items:center;justify-content:center;font-family:"Inter",sans-serif;}',
    '#pb-chat-widget{position:fixed;bottom:96px;right:24px;z-index:9998;width:400px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 10px 50px rgba(0,0,0,0.25);display:none;flex-direction:column;overflow:hidden;font-family:"Inter",sans-serif;animation:pbSlideUp .3s ease;}',
    '#pb-chat-widget.open{display:flex;}',
    '@keyframes pbSlideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}',
    '.pb-chat-head{background:linear-gradient(135deg,#FF5500,#ff7733);padding:16px 20px;display:flex;align-items:center;gap:12px;color:#fff;}',
    '.pb-chat-avatar{width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;}',
    '.pb-chat-head-info h4{font-size:15px;font-weight:700;margin:0;}',
    '.pb-chat-head-info p{font-size:12px;opacity:0.85;margin:0;}',
    '.pb-chat-close{margin-left:auto;background:none;border:none;color:#fff;cursor:pointer;font-size:22px;line-height:1;opacity:0.8;transition:opacity .2s;}',
    '.pb-chat-close:hover{opacity:1;}',
    '.pb-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#f7f8fa;}',
    '.pb-chat-body::-webkit-scrollbar{width:4px;}',
    '.pb-chat-body::-webkit-scrollbar-thumb{background:#ccc;border-radius:2px;}',
    '.pb-msg{max-width:85%;padding:10px 14px;font-size:13.5px;line-height:1.6;border-radius:16px;word-wrap:break-word;}',
    '.pb-msg.bot{background:#fff;color:#1a1a2e;border:1px solid #e8e8e8;border-bottom-left-radius:4px;align-self:flex-start;}',
    '.pb-msg.user{background:linear-gradient(135deg,#FF5500,#ff7733);color:#fff;border-bottom-right-radius:4px;align-self:flex-end;}',
    '.pb-msg a{color:#FF5500;text-decoration:underline;font-weight:500;}',
    '.pb-msg.user a{color:#fff;}',
    '.pb-typing{align-self:flex-start;padding:10px 14px;background:#fff;border:1px solid #e8e8e8;border-radius:16px;border-bottom-left-radius:4px;display:none;gap:4px;align-items:center;}',
    '.pb-typing.show{display:flex;}',
    '.pb-typing span{width:7px;height:7px;background:#FF5500;border-radius:50%;animation:pbDot 1.2s infinite;}',
    '.pb-typing span:nth-child(2){animation-delay:0.2s;}',
    '.pb-typing span:nth-child(3){animation-delay:0.4s;}',
    '@keyframes pbDot{0%,80%,100%{opacity:0.3;transform:scale(0.8);}40%{opacity:1;transform:scale(1.1);}}',
    '.pb-chat-input{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #e8e8e8;background:#fff;}',
    '.pb-chat-input input{flex:1;border:1px solid #ddd;border-radius:24px;padding:10px 16px;font-size:13.5px;font-family:"Inter",sans-serif;outline:none;transition:border-color .2s;}',
    '.pb-chat-input input:focus{border-color:#FF5500;}',
    '.pb-chat-input button{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#FF5500,#ff7733);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s;}',
    '.pb-chat-input button:hover{transform:scale(1.05);}',
    '.pb-chat-input button svg{width:18px;height:18px;fill:#fff;}',
    '.pb-intro-form{padding:20px;text-align:center;}',
    '.pb-intro-form h4{font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px;}',
    '.pb-intro-form p{font-size:12.5px;color:#6b7280;margin-bottom:16px;line-height:1.5;}',
    '.pb-intro-form input{width:100%;border:1px solid #ddd;border-radius:8px;padding:10px 14px;font-size:13px;font-family:"Inter",sans-serif;margin-bottom:10px;outline:none;box-sizing:border-box;transition:border-color .2s;}',
    '.pb-intro-form input:focus{border-color:#FF5500;}',
    '.pb-intro-form button{width:100%;padding:11px;border:none;border-radius:8px;background:linear-gradient(135deg,#FF5500,#ff7733);color:#fff;font-weight:600;font-size:14px;cursor:pointer;transition:transform .2s;font-family:"Inter",sans-serif;}',
    '.pb-intro-form button:hover{transform:scale(1.02);}',
    '.pb-quick-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}',
    '.pb-quick-btn{background:#fff;border:1px solid #e0e0e0;border-radius:20px;padding:6px 14px;font-size:12px;color:#FF5500;cursor:pointer;transition:all .2s;font-family:"Inter",sans-serif;}',
    '.pb-quick-btn:hover{background:#FF5500;color:#fff;border-color:#FF5500;}',
    '.pb-time{font-size:10px;color:#aaa;text-align:center;margin:4px 0;}',
    '@media(max-width:480px){#pb-chat-widget{bottom:0;right:0;width:100%;max-width:100%;height:100vh;max-height:100vh;border-radius:0;}#pb-chat-btn{bottom:16px;right:16px;width:54px;height:54px;}}'
  ].join('\n');
  document.head.appendChild(style);

  // ─── INJECT HTML ───────────────────────────────────────────
  var widget = document.createElement('div');
  widget.innerHTML = '<button id="pb-chat-btn" aria-label="Chat">' +
    '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>' +
    '<span class="pb-badge">1</span>' +
    '</button>' +
    '<div id="pb-chat-widget">' +
    '<div class="pb-chat-head">' +
    '<div class="pb-chat-avatar">PL</div>' +
    '<div class="pb-chat-head-info">' +
    '<h4>Pirabel Labs</h4>' +
    '<p>Assistant IA &bull; En ligne 24h/24</p>' +
    '</div>' +
    '<button class="pb-chat-close">&times;</button>' +
    '</div>' +
    '<div class="pb-chat-body" id="pb-chat-body">' +
    '<div id="pb-intro" class="pb-intro-form">' +
    '<h4>Bienvenue chez Pirabel Labs !</h4>' +
    '<p>Je suis votre assistant personnel. Posez-moi vos questions sur nos services, tarifs, delais... Je connais tout sur le bout des doigts !</p>' +
    '<input type="text" id="pb-name" placeholder="Votre prenom" />' +
    '<input type="email" id="pb-email" placeholder="Votre email (optionnel)" />' +
    '<button id="pb-start-btn">Demarrer la conversation</button>' +
    '</div>' +
    '</div>' +
    '<div class="pb-chat-input" id="pb-input-area" style="display:none;">' +
    '<input type="text" id="pb-msg-input" placeholder="Tapez votre message..." />' +
    '<button id="pb-send-btn"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(widget);

  // ─── ELEMENTS ──────────────────────────────────────────────
  var chatBtn = document.getElementById('pb-chat-btn');
  var chatWidget = document.getElementById('pb-chat-widget');
  var chatBody = document.getElementById('pb-chat-body');
  var introForm = document.getElementById('pb-intro');
  var inputArea = document.getElementById('pb-input-area');
  var msgInput = document.getElementById('pb-msg-input');
  var sendBtn = document.getElementById('pb-send-btn');
  var startBtn = document.getElementById('pb-start-btn');
  var closeBtn = chatWidget.querySelector('.pb-chat-close');

  var isOpen = false;
  var isTyping = false;
  var conversationId = localStorage.getItem('pb_chat_id') || null;
  var visitorName = localStorage.getItem('pb_chat_name') || '';
  var visitorEmail = localStorage.getItem('pb_chat_email') || '';

  // ─── TOGGLE ────────────────────────────────────────────────
  chatBtn.addEventListener('click', function() {
    isOpen = !isOpen;
    chatWidget.classList.toggle('open', isOpen);
    if (isOpen && visitorName) msgInput.focus();
  });
  closeBtn.addEventListener('click', function() {
    isOpen = false;
    chatWidget.classList.remove('open');
  });

  // ─── RESTORE SESSION ──────────────────────────────────────
  if (visitorName && conversationId) {
    introForm.style.display = 'none';
    inputArea.style.display = 'flex';
    // Welcome back message
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';
    addBotMessage(greeting + ' ' + visitorName + ' ! Content de vous revoir. Comment puis-je vous aider ?');
    addQuickButtons(getContextualButtons());
  }

  // ─── START CONVERSATION ────────────────────────────────────
  startBtn.addEventListener('click', function() {
    var name = document.getElementById('pb-name').value.trim();
    var email = document.getElementById('pb-email').value.trim();
    if (!name) {
      document.getElementById('pb-name').style.borderColor = '#ff3333';
      return;
    }
    visitorName = name;
    visitorEmail = email;
    localStorage.setItem('pb_chat_name', name);
    localStorage.setItem('pb_chat_email', email);
    conversationId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    localStorage.setItem('pb_chat_id', conversationId);
    introForm.style.display = 'none';
    inputArea.style.display = 'flex';

    // Personalized welcome based on time and page
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';
    var ctx = getPageContext();
    var welcome = greeting + ' ' + name + ' ! Enchante de faire votre connaissance. ';

    if (ctx === 'seo') {
      welcome += "Je vois que vous vous interessez au SEO — excellent choix ! C'est notre specialite. Comment puis-je vous aider ?";
    } else if (ctx === 'web') {
      welcome += "Vous cherchez a creer ou ameliorer un site web ? Vous etes au bon endroit ! Dites-moi ce dont vous avez besoin.";
    } else if (ctx === 'ads') {
      welcome += "La publicite en ligne vous interesse ? On est experts la-dessus. Qu'est-ce que vous aimeriez savoir ?";
    } else if (ctx === 'ia') {
      welcome += "L'IA et l'automatisation, c'est le futur (et le present !). Comment puis-je vous aider sur ce sujet ?";
    } else if (ctx === 'formation') {
      welcome += "Vous cherchez a monter en competences sur le digital ? Nos formations sont faites pour ca. Quel domaine vous interesse ?";
    } else {
      welcome += "Je suis la pour repondre a toutes vos questions sur nos services, nos tarifs, nos delais... Demandez-moi ce que vous voulez !";
    }

    addBotMessage(welcome);
    addQuickButtons(getContextualButtons());
    msgInput.focus();

    // Save to server
    saveToServer(conversationId, visitorName, visitorEmail, welcome, 'admin');
  });

  // ─── SEND MESSAGE ──────────────────────────────────────────
  function sendMessage() {
    var text = msgInput.value.trim();
    if (!text || isTyping) return;
    msgInput.value = '';
    addUserMessage(text);

    // Save visitor message to server
    saveToServer(conversationId, visitorName, visitorEmail, text, 'visitor');

    // Show typing indicator
    showTyping();

    // Generate reply with natural delay
    var response = generateReply(text, visitorName);
    var delay = Math.min(600 + response.reply.length * 2, 2000);

    setTimeout(function() {
      hideTyping();
      addBotMessage(response.reply);
      if (response.buttons && response.buttons.length > 0) {
        addQuickButtons(response.buttons);
      }
      // Save bot reply to server
      saveToServer(conversationId, visitorName, visitorEmail, response.reply, 'admin');
    }, delay);
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendMessage(); });

  // ─── MESSAGE HELPERS ───────────────────────────────────────
  function addBotMessage(html) {
    var div = document.createElement('div');
    div.className = 'pb-msg bot';
    div.innerHTML = html;
    chatBody.appendChild(div);
    scrollBottom();
  }

  function addUserMessage(text) {
    var div = document.createElement('div');
    div.className = 'pb-msg user';
    div.textContent = text;
    chatBody.appendChild(div);
    scrollBottom();
  }

  function addQuickButtons(buttons) {
    if (!buttons || buttons.length === 0) return;
    var wrap = document.createElement('div');
    wrap.className = 'pb-quick-btns';
    buttons.forEach(function(label) {
      var btn = document.createElement('button');
      btn.className = 'pb-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', function() {
        wrap.remove();
        msgInput.value = label;
        sendMessage();
      });
      wrap.appendChild(btn);
    });
    chatBody.appendChild(wrap);
    scrollBottom();
  }

  function showTyping() {
    isTyping = true;
    var el = document.getElementById('pb-typing');
    if (!el) {
      el = document.createElement('div');
      el.id = 'pb-typing';
      el.className = 'pb-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      chatBody.appendChild(el);
    }
    el.classList.add('show');
    scrollBottom();
  }

  function hideTyping() {
    isTyping = false;
    var el = document.getElementById('pb-typing');
    if (el) el.classList.remove('show');
  }

  function scrollBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

})();
