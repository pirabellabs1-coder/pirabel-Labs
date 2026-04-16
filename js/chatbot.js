/* ========================================================================
   PIRABEL LABS — LEA: AI Sales Closer & Conversational Agent
   The ultimate sales assistant chatbot. French language.
   Name: Lea — Consultante digitale chez Pirabel Labs

   Features:
   - 6-phase conversation engine (Greeting > Discovery > Qualification >
     Solution > Closing > Post-conversation)
   - State machine with context tracking
   - Smart input detection (email, phone, budget, sector, problems)
   - 200+ response variations
   - Objection handling
   - Personalized offer generation
   - Lead scoring (0-100)
   - API integration for lead capture & follow-up
   - Beautiful dark-themed UI with animations
   - Message queue with natural typing delays
   - Mobile responsive
   ======================================================================== */
(function () {
  'use strict';

  // =====================================================================
  //  SECTION 1 — CONFIGURATION
  // =====================================================================
  var isEn = window.location.pathname.indexOf('/en/') !== -1;
  var conversationId = localStorage.getItem('pb_chat_id') || '';

  var CONFIG = {
    botName: isEn ? 'Lea' : 'Lea',
    companyName: 'Pirabel Labs',
    accentColor: '#FF5500',
    accentGradient: 'linear-gradient(135deg, #FF5500, #ff7733)',
    bgDark: '#0e0e0e',
    bgCard: '#1a1a1a',
    bgInput: '#141414',
    textLight: '#e0e0e0',
    textMuted: '#888',
    typingDelayBase: 600,
    typingDelayPerChar: 1.8,
    typingDelayMax: 3000,
    messageQueueGap: 800,
    autoOpenDelay: 12000,
    contactEmail: 'contact@pirabellabs.com',
    contactWhatsApp: '+1 613-927-3067',
    whatsAppLink: 'https://wa.me/16139273067',
    siteUrl: 'pirabellabs.com',
    cities: isEn ? 'Paris, London, Montreal, New York, Casablanca' : 'Paris, Lyon, Marseille, Cotonou, Abidjan, Dakar, Casablanca, Tunis, Montreal, Bruxelles'
  };

  // =====================================================================
  //  SECTION 2 — STATE MACHINE
  // =====================================================================
  var PHASES = {
    GREETING: 'greeting',
    DISCOVERY: 'discovery',
    QUALIFICATION: 'qualification',
    SOLUTION: 'solution',
    CLOSING: 'closing',
    POST: 'post'
  };

  var STATE = {
    phase: PHASES.GREETING,
    messageCount: 0,
    userMessageCount: 0,
    qualifyAsked: {},
    closingAttempted: false,
    closingCount: 0,
    summaryGenerated: false,
    offerGenerated: false,
    lastTopicId: null,
    topicsDiscussed: [],
    usedResponses: {},
    history: [],
    discoveryDepth: 0,
    objectionCount: 0,
    tutoyement: false,
    hasGreeted: false,
    waitingForEmail: false,
    waitingForPhone: false,
    waitingForName: false,
    lastBotMessageTime: 0,
    visitor: {
      name: '',
      email: '',
      phone: '',
      company: '',
      sector: '',
      website: ''
    },
    problems: [],
    interests: [],
    qualification: {
      score: 0,
      level: 'cold',
      budget: '',
      budgetRange: null,
      timeline: '',
      decisionMaker: null,
      urgency: 0
    },
    offer: null,
    conversationHistory: []
  };

  // Rehydrate persisted state from localStorage so memory survives page reloads.
  try {
    var savedState = localStorage.getItem('pb_chat_state');
    if (savedState) {
      var parsed = JSON.parse(savedState);
      if (parsed && typeof parsed === 'object') {
        if (parsed.visitor) Object.assign(STATE.visitor, parsed.visitor);
        if (parsed.qualification) Object.assign(STATE.qualification, parsed.qualification);
        if (Array.isArray(parsed.problems)) STATE.problems = parsed.problems.slice(0, 20);
        if (Array.isArray(parsed.interests)) STATE.interests = parsed.interests.slice(0, 20);
        if (Array.isArray(parsed.topicsDiscussed)) STATE.topicsDiscussed = parsed.topicsDiscussed.slice(0, 30);
        if (typeof parsed.phase === 'string') STATE.phase = parsed.phase;
        if (typeof parsed.userMessageCount === 'number') STATE.userMessageCount = parsed.userMessageCount;
        if (typeof parsed.messageCount === 'number') STATE.messageCount = parsed.messageCount;
      }
    }
  } catch (e) { /* noop */ }

  function persistState() {
    try {
      localStorage.setItem('pb_chat_state', JSON.stringify({
        visitor: STATE.visitor,
        qualification: STATE.qualification,
        problems: STATE.problems,
        interests: STATE.interests,
        topicsDiscussed: STATE.topicsDiscussed,
        phase: STATE.phase,
        userMessageCount: STATE.userMessageCount,
        messageCount: STATE.messageCount
      }));
    } catch (e) { /* noop */ }
  }

  var conversationId = localStorage.getItem('pb_chat_id') || null;
  var messageQueue = [];
  var isProcessingQueue = false;
  var isTyping = false;
  var isOpen = false;
  var soundEnabled = true;

  // =====================================================================
  //  SECTION 3 — KNOWLEDGE BASE: SERVICES & PRICING
  // =====================================================================
  var SERVICES = {
    seo: {
      name: isEn ? 'SEO & Search Engine Visibility' : 'SEO & Référencement',
      icon: '&#128269;',
      priceRange: isEn ? '800 - 3,000\u20ac/month' : '800 - 3 000\u20ac/mois',
      priceMin: 800,
      priceMax: 3000,
      monthly: true,
      description: isEn ? 'Dominate Google sustainably' : 'Dominer Google durablement',
    },
    web: {
      name: isEn ? 'Web Design & Development' : 'Création de Sites Web',
      icon: '&#127760;',
      priceRange: isEn ? '2,000 - 15,000\u20ac' : '2 000 - 15 000\u20ac',
      priceMin: 2000,
      priceMax: 15000,
      monthly: false,
      description: isEn ? 'Sites that convert visitors' : 'Sites qui convertissent',
    },
    ia: {
      name: isEn ? 'AI & Automation' : 'IA & Automatisation',
      icon: '&#129302;',
      priceRange: isEn ? '1,500 - 5,000\u20ac' : '1 500 - 5 000\u20ac',
      priceMin: 1500,
      priceMax: 5000,
      monthly: false,
      description: isEn ? 'Work smarter with AI' : 'Travailler plus intelligemment',
    },
    ads: {
      name: isEn ? 'Paid Advertising' : 'Publicité en Ligne',
      icon: '&#128226;',
      priceRange: isEn ? '500 - 5,000\u20ac/month' : '500 - 5 000\u20ac/mois + budget pub',
      priceMin: 500,
      priceMax: 5000,
      monthly: true,
      description: isEn ? 'Fast and measurable acquisition' : 'Acquisition rapide et mesurable',
    },
    social: {
      name: 'Social Media',
      icon: '&#128241;',
      priceRange: '600 - 2 500\u20ac/mois',
      priceMin: 600,
      priceMax: 2500,
      monthly: true,
      description: 'Communauté engagée',
      details: [
        'Community management complet',
        'Création de contenu (visuels, vidéos, textes)',
        'Stratégie éditoriale et calendrier',
        'Instagram, Facebook, LinkedIn, TikTok',
        'Influence marketing',
        'Reporting et analytics'
      ],
      timeline: 'Croissance visible en 2-3 mois',
      caseStudy: 'Un restaurant a triplé sa fréquentation grâce à une stratégie Instagram + influence locale.'
    },
    branding: {
      name: 'Branding & Design',
      icon: '&#127912;',
      priceRange: '1 500 - 8 000\u20ac',
      priceMin: 1500,
      priceMax: 8000,
      monthly: false,
      description: 'Identité visuelle marquante',
      details: [
        'Logo (3 propositions, révisions illimitées)',
        'Charte graphique complète',
        'Typographies, couleurs, pictogrammes',
        'UI/UX Design (maquettes Figma)',
        'Packaging et design produit',
        'Direction artistique'
      ],
      timeline: '1-3 semaines',
      caseStudy: 'Un rebranding complet a augmenté la reconnaissance de marque de 85% pour un de nos clients.'
    },
    email: {
      name: 'Email Marketing & CRM',
      icon: '&#128231;',
      priceRange: '500 - 2 000\u20ac/mois',
      priceMin: 500,
      priceMax: 2000,
      monthly: true,
      description: 'ROI de 36\u20ac pour chaque 1\u20ac investi',
      details: [
        'Setup et configuration CRM (Brevo, Mailchimp, HubSpot)',
        'Templates emails professionnels',
        'Séquences d\'automatisation',
        'Segmentation de la base',
        'Newsletters régulières',
        'Lead scoring et nurturing'
      ],
      timeline: 'Setup en 1-2 semaines, premiers résultats en 1 mois',
      caseStudy: 'Un e-commerce a augmenté son CA de 28% uniquement via l\'email marketing automatisé.'
    },
    video: {
      name: 'Vidéo & Motion Design',
      icon: '&#127908;',
      priceRange: '1 000 - 5 000\u20ac',
      priceMin: 1000,
      priceMax: 5000,
      monthly: false,
      description: 'Le format roi de 2026',
      details: [
        'Vidéos corporate et témoignages',
        'Contenu pour réseaux sociaux (Reels, TikTok, Shorts)',
        'Motion design et animations',
        'Montage professionnel',
        'Sous-titrage et localisation'
      ],
      timeline: '1-3 semaines par production',
      caseStudy: 'Une série de Reels a généré 2M de vues organiques pour un de nos clients.'
    },
    content: {
      name: 'Content Marketing',
      icon: '&#9997;',
      priceRange: '500 - 2 000\u20ac/mois',
      priceMin: 500,
      priceMax: 2000,
      monthly: true,
      description: 'Contenu qui attire et convertit',
      details: [
        'Articles de blog SEO',
        'Copywriting persuasif (pages de vente)',
        'Fiches produits optimisées',
        'Stratégie éditoriale',
        'Calendrier de publication',
        'IA-assisted content creation'
      ],
      timeline: 'Publication régulière dès la 2e semaine',
      caseStudy: 'Un blog SEO a généré 15 000 visites/mois en 6 mois pour un cabinet de conseil.'
    },
    funnel: {
      name: 'Sales Funnels & CRO',
      icon: '&#128640;',
      priceRange: '1 500 - 5 000\u20ac',
      priceMin: 1500,
      priceMax: 5000,
      monthly: false,
      description: 'Optimiser chaque conversion',
      details: [
        'Landing pages haute conversion',
        'Tunnels de vente complets',
        'A/B testing systématique',
        'CRO (Conversion Rate Optimization)',
        'Systeme.io, ClickFunnels, Kajabi'
      ],
      timeline: '2-4 semaines',
      caseStudy: 'Un tunnel de vente optimisé a doublé le taux de conversion (de 2.1% à 4.8%).'
    },
    consulting: {
      name: 'Consulting Digital',
      icon: '&#128188;',
      priceRange: '150 - 300\u20ac/h',
      priceMin: 150,
      priceMax: 300,
      monthly: false,
      description: 'Stratégie et accompagnement',
      details: [
        'Audit digital 360',
        'Stratégie digitale (roadmap 6-12 mois)',
        'Transformation digitale',
        'Conseil e-commerce',
        'Conseil startup et growth hacking'
      ],
      timeline: 'Sessions à la demande',
      caseStudy: 'Un accompagnement stratégique de 3 mois a permis à un client de tripler ses leads.'
    },
    formation: {
      name: 'Formations Digitales',
      icon: '&#127891;',
      priceRange: '500 - 3 000\u20ac/session',
      priceMin: 500,
      priceMax: 3000,
      monthly: false,
      description: 'Monter en compétences',
      details: [
        'Formation SEO (14h)',
        'Formation Google Ads (18h)',
        'Formation réseaux sociaux',
        'Formation IA & Marketing',
        'Formation WordPress',
        'Formation Google Analytics',
        'En ligne et en présentiel'
      ],
      timeline: 'Sessions planifiées ou sur demande',
      caseStudy: 'Après notre formation SEO, une équipe interne a augmenté le trafic de 200% en autonomie.'
    }
  };

  // =====================================================================
  //  SECTION 4 — CASE STUDIES & RESULTS
  // =====================================================================
  var CASE_STUDIES = [
    { sector: 'E-commerce', result: 'CA augmenté de 340% en 8 mois', services: ['seo', 'ads'], detail: 'Grâce à notre stratégie SEO combinée à des campagnes Google Shopping, ce client e-commerce a explosé ses ventes.' },
    { sector: 'PME locale', result: '0 à 2 500 visites/mois en 6 mois', services: ['seo'], detail: 'Le SEO local a transformé cette PME en leader de sa zone géographique sur Google.' },
    { sector: 'SaaS B2B', result: '180 leads qualifiés en 3 mois', services: ['ads', 'content'], detail: 'LinkedIn Ads + content marketing = machine à leads pour ce SaaS B2B.' },
    { sector: 'Startup', result: 'Coût d\'acquisition réduit de 65%', services: ['ia', 'email'], detail: 'L\'automatisation marketing a permis de diviser les coûts par presque 3.' },
    { sector: 'Restaurant', result: 'Fréquentation triplée', services: ['social'], detail: 'Stratégie Instagram + micro-influence locale = salle pleine tous les soirs.' },
    { sector: 'E-commerce', result: 'CA email +28%', services: ['email'], detail: 'Les séquences email automatisées génèrent des ventes en autopilot.' },
    { sector: 'Cabinet conseil', result: '15 000 visites/mois via le blog', services: ['content', 'seo'], detail: 'Une stratégie de content marketing SEO qui attire les bons profils.' },
    { sector: 'SaaS', result: 'Taux de conversion doublé (2.1% à 4.8%)', services: ['funnel'], detail: 'L\'optimisation du tunnel de vente et l\'A/B testing ont fait des merveilles.' },
    { sector: 'Retail', result: 'Reconnaissance de marque +85%', services: ['branding'], detail: 'Un rebranding complet qui a transformé la perception de la marque.' },
    { sector: 'Formation', result: '2M de vues organiques', services: ['video', 'social'], detail: 'Du contenu vidéo stratégique qui est devenu viral.' }
  ];

  // =====================================================================
  //  SECTION 5 — RESPONSE BA  // -- Greetings (phase 1) --
  var GREETINGS = {
    default: isEn ? [
      "Hi! I'm Lea, consultant at Pirabel Labs. Are you looking to boost your online presence?",
      "Hey! I'm Lea from Pirabel Labs. Tell me, what brings you here today?",
      "Hello! Lea here, digital consultant. How can I help you grow your business online?",
      "Hi! I'm Lea. I'm here to help you find the best solution for your business. Shall we talk?"
    ] : [
      "Salut ! Moi c'est Lea, consultante chez Pirabel Labs. Tu cherches à booster ta présence en ligne ?",
      "Hey ! Je suis Lea de Pirabel Labs. Dis-moi, qu'est-ce qui t'amène aujourd'hui ?",
      "Salut ! Lea ici, consultante digitale. Comment je peux t'aider à développer ton business en ligne ?",
      "Hello ! Moi c'est Lea. Je suis là pour t'aider à trouver la meilleure solution pour ton activité. On discute ?"
    ],
    returning: isEn ? [
      "Hi again {name}! Good to see you back. Shall we pick up where we left off?",
      "Hey {name}! Back for more? I'm here. What can I do for you?",
      "{name}! It's a pleasure to see you again. Have new questions?"
    ] : [
      "Re-salut {name} ! Contente de te revoir. On reprend où on en était ?",
      "Hey {name} ! De retour ? Super, je suis là. Qu'est-ce que je peux faire pour toi ?",
      "{name} ! Ça fait plaisir de te revoir. Tu as de nouvelles questions ?"
    ],
    seo: isEn ? [
      "Hi! Interested in SEO? You're in the right place, it's our specialty. Tell me what's blocking you right now.",
      "Hey! SEO is our passion at Pirabel Labs. Want more organic traffic? Let's talk about it."
    ] : [
      "Salut ! Tu t'intéresses au SEO ? Tu es au bon endroit, c'est notre spécialité. Dis-moi ce qui te bloque en ce moment.",
      "Hey ! Le SEO, c'est notre passion chez Pirabel Labs. Tu veux plus de trafic organique ? On en parle ?"
    ],
    web: isEn ? [
      "Hi! Looking to create or redesign a website? Tell me what you have in mind, I'll guide you.",
      "Hey! A web project in sight? I'm Lea, and I can help you find the best technical and design solution."
    ] : [
      "Salut ! Tu cherches à créer ou refaire un site web ? Dis-moi ce que tu as en tête, je te guide.",
      "Hey ! Un projet web en vue ? Je suis Lea, et je peux t'aider à trouver la meilleure solution technique et design."
    ],
    ads: isEn ? [
      "Hi! Want to launch online ads? We manage this every day. Tell me your objective.",
      "Hey! Online advertising is direct acquisition. Do you want to generate leads or sales?"
    ] : [
      "Salut ! Tu veux lancer de la pub en ligne ? On gère ça tous les jours. Dis-moi ton objectif.",
      "Hey ! La publicité en ligne, c'est de l'acquisition directe. Tu veux générer des leads ou des ventes ?"
    ],
    services: isEn ? [
      "Hi! Exploring our services? Tell me what interests you and I'll give you the details.",
      "Hey! I'm Lea. Want to discover what we can do for you? Ask me your questions!"
    ] : [
      "Salut ! Tu explores nos services ? Dis-moi ce qui t'intéresse et je te donne les détails.",
      "Hey ! Je suis Lea. Tu veux découvrir ce qu'on peut faire pour toi ? Pose-moi tes questions !"
    ],
    ia: isEn ? [
      "Hi! Interested in AI? We're doing amazing things with it. Tell me what you'd like to automate.",
      "Hey! Automation and AI is our cutting-edge domain. Want a chatbot, workflows...?"
    ] : [
      "Salut ! L'IA te tente ? On fait des trucs incroyables avec. Dis-moi ce que tu aimerais automatiser.",
      "Hey ! L'automatisation et l'IA, c'est notre domaine de pointe. Tu veux un chatbot, des workflows... ?"
    ],
    blog: isEn ? [
      "Hi! Reading our blog? If you have questions on a topic, I'm here to go deeper.",
      "Hey! Interested in content marketing? I can tell you more about our strategies."
    ] : [
      "Salut ! Tu lis notre blog ? Si tu as des questions sur un sujet, je suis là pour approfondir.",
      "Hey ! Le content marketing t'intéresse ? Je peux t'en dire plus sur nos stratégies."
    ]
  };

  // -- Discovery responses (phase 2) --
  var DISCOVERY_RESPONSES = {
    askSector: isEn ? [
      "To give you the best advice, tell me... what's your industry?",
      "What is your line of work? It helps me suggest the right solutions.",
      "What exactly do you do? Every sector has its specificities and I love adapting to them.",
      "Tell me about your business! What do you do?"
    ] : [
      "Pour bien te conseiller, dis-moi un peu... tu es dans quel domaine ?",
      "C'est quoi ton secteur d'activité ? Ça m'aide à te proposer les bonnes solutions.",
      "Tu bosses dans quoi exactement ? Chaque secteur a ses spécificités et j'adore m'y adapter.",
      "Parle-moi de ton business ! Tu fais quoi comme activité ?"
    ],
    askChallenge: isEn ? [
      "And what's your biggest challenge right now on the digital side?",
      "What frustrates you most about your online presence currently?",
      "If you could solve ONE single problem in your digital marketing, which would it be?",
      "What's not working as you'd like at the moment?"
    ] : [
      "Et c'est quoi ton plus gros défi en ce moment côté digital ?",
      "Qu'est-ce qui te frustre le plus dans ta présence en ligne actuellement ?",
      "Si tu pouvais régler UN seul problème dans ton marketing digital, ce serait lequel ?",
      "Qu'est-ce qui marche pas comme tu voudrais en ce moment ?"
    ],
    askPastEfforts: isEn ? [
      "Have you already tried things? Agency, freelance, in-house...?",
      "Have you attempted marketing actions before, or is it a new start?",
      "Tell me, have you invested in digital before, or is it your first time?",
      "Are you already working with someone on this or are you managing it yourself?"
    ] : [
      "Tu as déjà essayé des choses ? Agence, freelance, en interne... ?",
      "T'as déjà tenté des actions marketing avant, ou c'est un nouveau départ ?",
      "Dis-moi, tu as déjà investi dans le digital avant, ou c'est ta première fois ?",
      "Tu travaille déjà avec quelqu'un là-dessus ou tu gères tout seul ?"
    ],
    askWorkingNot: isEn ? [
      "And right now, are there things working well in your marketing?",
      "Do you have channels that already perform, even a little?",
      "What gives you results today, even modest ones?"
    ] : [
      "Et en ce moment, y'a des trucs qui marchent bien dans ton marketing ?",
      "Tu as des canaux qui performent déjà, même un peu ?",
      "Qu'est-ce qui te donne des résultats aujourd'hui, même modestes ?"
    ],
    empathize: isEn ? [
      "I totally understand. It's a problem we often see, and the good news is we know exactly how to solve it.",
      "Oh yeah, that's frustrating. But you're not alone, many of our clients had the same worry before working with us.",
      "I see the picture perfectly. It's a classic, and we have proven solutions for that.",
      "That's a real hurdle, I understand. We've supported many clients with the same problem, and the results are always there.",
      "Ok, I get it. It's exactly the kind of situation where we can make a real difference.",
      "I understand you, it's a very common blocker. The good news? We know how to unblock it.",
      "Ah yes, that's a sensitive point for many companies. But it's completely fixable."
    ] : [
      "Je comprends totalement. C'est un problème qu'on voit souvent, et la bonne nouvelle c'est qu'on sait exactement comment le résoudre.",
      "Ah ouais, ça c'est frustrant. Mais t'es pas seul, beaucoup de nos clients avaient le même souci avant de bosser avec nous.",
      "Je vois parfaitement le tableau. C'est un classique, et on a des solutions éprouvées pour ça.",
      "C'est un vrai frein, je comprends. On a accompagné pas mal de clients avec le même problème, et les résultats sont toujours au rendez-vous.",
      "Ok, je saisis. C'est exactement le genre de situation où on peut faire une vraie différence.",
      "Je te comprends, c'est super courant comme blocage. La bonne nouvelle ? On sait débloquer ça.",
      "Ah oui, ça c'est un point sensible pour beaucoup d'entreprises. Mais c'est tout à fait réglable."
    ],
    projectDescription: isEn ? [
      "Super interesting! Your project is clearly in our wheelhouse. We've supported clients with similar needs and it worked very well.",
      "I love it! This is exactly the type of project where we excel. Let me ask you a few questions to refine.",
      "Excellent! I see exactly what you need. We have all the expertise for that.",
      "Very good, I have a good vision of your project. It's exciting and we have the experience to see it through."
    ] : [
      "Super intéressant ! Ton projet est clairement dans nos cordes. On a accompagné des clients avec des besoins similaires et ça a très bien marché.",
      "J'adore ! C'est exactement le type de projet où on excelle. Laisse-moi te poser quelques questions pour affiner.",
      "Excellent ! Je vois bien ce dont tu as besoin. On a toute l'expertise pour ça.",
      "Très bien, j'ai une bonne vision de ton projet. C'est passionnant et on a l'expérience pour le mener à bien."
    ],
    acknowledge: isEn ? [
      "Ok, I'm taking note. This is super useful for making a tailored recommendation.",
      "Perfect, thanks for the detail. It really helps me grasp your need.",
      "Great, I understand better. We're moving forward well!",
      "Message received! The more context you give me, the better my advice will be."
    ] : [
      "Ok, je note. C'est super utile pour te faire une recommandation sur mesure.",
      "Parfait, merci pour le détail. Ça m'aide vraiment à cerner ton besoin.",
      "Super, je comprends mieux. On avance bien !",
      "Bien reçu ! Plus tu me donnes de contexte, meilleur sera mon conseil."
    ]
  };

  // -- Qualification responses (phase 3) --
  var QUALIFICATION_RESPONSES = {
    askBudget: isEn ? [
      "And on the budget side, do you have a range in mind? Even approximate, it helps me propose the right formula.",
      "To make a realistic recommendation, would you have a budget idea? No need to be precise, a range is enough.",
      "Budget question, where do you roughly stand? We adapt to all sizes, I'm just asking to frame it well."
    ] : [
      "Et côté budget, tu as une enveloppe en tête ? Même approximative, ça m'aide à te proposer la bonne formule.",
      "Pour te faire une reco réaliste, t'aurais une idée de budget ? Pas besoin d'être précis, une fourchette suffit.",
      "Question budget, tu te situes où à peu près ? On s'adapte à toutes les tailles, je te demande juste pour bien cadrer."
    ],
    askTimeline: isEn ? [
      "And in terms of timing, when is it for? Are you on a short term or planning ahead?",
      "Is it an urgent project or do you have a bit of time in front of you?",
      "When would you ideally like to launch this?"
    ] : [
      "Et en termes de timing, c'est pour quand ? Tu es sur du court terme ou tu planifies à l'avance ?",
      "C'est un projet urgent ou tu as un peu de temps devant toi ?",
      "Tu voudrais lancer ça quand idéalement ?"
    ],
    askDecisionMaker: isEn ? [
      "And is it you who decides on this project or do you need to talk to someone else?",
      "Are you managing this yourself or are there other people involved in the decision?",
      "Quick question: the final decision, is it you or must it be validated with a partner/boss?"
    ] : [
      "Et c'est toi qui décides sur ce projet ou tu dois en parler à quelqu'un d'autre ?",
      "Tu gères ça tout seul ou y'a d'autres personnes impliquées dans la décision ?",
      "Question rapide : la décision finale, c'est toi ou faut valider avec un associé/boss ?"
    ],
    budgetSmall: isEn ? [
      "No problem, we have solutions for all budgets. The important thing is to start intelligently and scale later.",
      "Small budget doesn't mean small results! We can start smart and increase as results come in."
    ] : [
      "Pas de souci, on a des formules pour tous les budgets. L'important c'est de commencer intelligemment et de scaler ensuite.",
      "Petit budget ne veut pas dire petits résultats ! On peut démarrer malin et augmenter au fur et à mesure des résultats."
    ],
    budgetMedium: isEn ? [
      "It's a good budget to start seriously. We can do really impactful things with that.",
      "With this envelope, we have enough to build something solid. I'll propose an optimal plan."
    ] : [
      "C'est un bon budget pour démarrer sérieusement. On peut faire des choses vraiment impactantes avec ça.",
      "Avec cette enveloppe, on a de quoi construire quelque chose de solide. Je vais te proposer un plan optimal."
    ],
    budgetLarge: isEn ? [
      "Excellent! With this budget, we can really deploy a complete and aggressive strategy. Results will follow.",
      "Top! That leaves us room to go for ambitious results. I already have ideas for you."
    ] : [
      "Excellent ! Avec ce budget, on peut vraiment déployer une stratégie complète et aggressive. Les résultats vont suivre.",
      "Top ! Ça nous laisse de la marge pour aller chercher des résultats ambitieux. J'ai déjà des idées pour toi."
    ]
  };

  // -- Solution presentation (phase 4) --
  var SOLUTION_INTROS = [
    "Ok, j'ai bien compris ta situation. Voici ce que je te recommande :",
    "Après tout ce que tu m'as dit, voici mon plan pour toi :",
    "Avec ce que je sais de ton projet, voici la stratégie que je te propose :",
    "Bon, j'ai une vision claire de tes besoins. Voici ma recommandation :"
  ];

  // -- Closing responses (phase 5) --
  var CLOSING_RESPONSES = {
    hot: isEn ? [
      "{name}, your project is very clear and we're perfectly equipped to help you. The most effective next step is a 15-min call with our expert to make a concrete proposal. How does that sound?",
      "Listen {name}, I think we're really meant to work together. What would you say to a quick call to map everything out?",
      "{name}, we have everything you need. A small 15-20 min call and we'll make you a tailored offer. Shall we schedule that?",
      "I feel we can really bring you results {name}. Next step? A free call with our expert to take action."
    ] : [
      "{name}, ton projet est hyper clair et on est parfaitement équipés pour t'aider. Le plus efficace maintenant, c'est un appel de 15 min avec notre expert pour te faire une proposition concrète. Ça te dit ?",
      "Écoute {name}, je pense qu'on est vraiment faits pour bosser ensemble. Qu'est-ce que tu dirais d'un call rapide pour tout mettre à plat ?",
      "{name}, on a tout ce qu'il faut pour toi. Un petit appel de 15-20 min et on te fait une offre sur mesure. On planifie ça ?",
      "Je sens qu'on peut vraiment t'apporter des résultats {name}. Prochaine étape ? Un appel gratuit avec notre expert pour passer à l'action."
    ],
    warm: isEn ? [
      "Thanks for all this info {name}! To move forward concretely, two options: a quick call with the team, or a quote by email within 24h. What do you prefer?",
      "{name}, we can clearly bring you value. A chat with an expert or a quote by email? You choose.",
      "We've made good progress {name}! To take the next step, I suggest either a call or a detailed quote by email. What works for you?",
      "{name}, I can either schedule a call for you with one of our experts, or send you a personalized quote. Your choice?"
    ] : [
      "Merci pour toutes ces infos {name} ! Pour avancer concrètement, deux options : un appel rapide avec l'équipe, ou un devis par email sous 24h. Tu préfères quoi ?",
      "{name}, on peut clairement t'apporter de la valeur. Un échange avec un expert ou un devis par email ? À toi de choisir.",
      "On a bien avancé {name} ! Pour passer à l'étape suivante, je te propose soit un call, soit un devis détaillé par email. Qu'est-ce qui t'arrange ?",
      "{name}, je peux soit te planifier un appel avec un de nos experts, soit t'envoyer un devis personnalisé. Tu choisis ?"
    ],
    cold: isEn ? [
      "Don't hesitate to come back when you're ready {name}. If you want, I can send you a summary of our exchange by email?",
      "We stay available {name}! In the meantime, do you want me to send you a summary with some personalized recommendations?",
      "No pressure {name}. If you want to think about it, I can send you a recap by email so you have everything in front of you."
    ] : [
      "N'hésite pas à revenir quand tu seras prêt {name}. Si tu veux, je peux t'envoyer un recapitulatif de notre échange par email ?",
      "On reste dispo {name} ! En attendant, tu veux que je t'envoie un résumé avec quelques recommandations personnalisées ?",
      "Pas de pression {name}. Si tu veux réfléchir, je peux t'envoyer un recap par email pour que tu aies tout sous les yeux."
    ],
    askEmail: isEn ? [
      "To send you all that, what's your email?",
      "Give me your email and I'll send it directly.",
      "Your email address so I can transmit everything?"
    ] : [
      "Pour t'envoyer tout ça, c'est quoi ton email ?",
      "File-moi ton email et je t'envoie ça direct.",
      "Ton adresse email pour que je te transmette tout ?"
    ],
    askPhone: isEn ? [
      "And a number to call you back? That way our expert can contact you directly.",
      "A quick phone number so we can call you back?",
      "Can you leave me your phone so our team can get back to you?"
    ] : [
      "Et un numéro où te rappeler ? Comme ça notre expert te contacte directement.",
      "Un petit numéro de tel pour qu'on puisse te rappeler ?",
      "Tu peux me laisser ton téléphone pour que notre équipe te recontacte ?"
    ],
    askName: isEn ? [
      "By the way, what's your name? It's nicer for chatting!",
      "Tell me, what's your first name?",
      "How should I call you?"
    ] : [
      "Au fait, tu t'appelles comment ? C'est plus sympa pour discuter !",
      "Dis-moi, c'est quoi ton prénom ?",
      "Comment je dois t'appeler ?"
    ]
  };

  // -- Thank you / goodbye --
  var GOODBYE_RESPONSES = isEn ? [
    "Thank you {name}! It was a great exchange. If more questions come up, I'm here 24/7.",
    "With pleasure {name}! Don't hesitate to come back. We're here to support you in your digital success.",
    "Great exchange {name}! Talk soon. Until then, don't hesitate if you need anything.",
    "Thank you {name}! It was a pleasure. See you soon!"
  ] : [
    "Merci à toi {name} ! C'était un super échange. Si d'autres questions te viennent, je suis là 24h/24.",
    "Avec plaisir {name} ! N'hésite vraiment pas à revenir. On est là pour t'accompagner dans ta réussite digitale.",
    "Super échange {name} ! On se parle bientôt. D'ici là, n'hésite pas si tu as besoin de quoi que ce soit.",
    "Merci {name} ! C'était un plaisir. À très vite !"
  ];

  // -- Objection handling --
  var OBJECTION_HANDLERS = {
    tooExpensive: isEn ? [
      "I understand that budget is important. But think about this: how much does it cost you NOT to be visible online? We always work in ROI mode. Every euro invested must bring back more.",
      "It's normal to wonder about the price. We offer formulas adapted to every budget, and we can start small then scale when results are there.",
      "I hear you. The thing is, our clients recover on average 3x their investment. And we have payment facilities if needed.",
      "Tight budget? We can start with the essentials and ramp up progressively. The important thing is to start."
    ] : [
      "Je comprends que le budget soit important. Mais pense à ça : combien te coûte le fait de NE PAS être visible en ligne ? On travaille toujours en mode ROI. Chaque euro investi doit en rapporter plus.",
      "C'est normal de se poser la question du prix. On propose des formules adaptées à chaque budget, et on peut commencer petit puis scaler quand les résultats sont là.",
      "Je t'entends. Le truc, c'est que nos clients récupèrent en moyenne 3x leur investissement. Et on a des facilités de paiement si besoin.",
      "Budget serre ? On peut démarrer avec l'essentiel et monter en puissance progressivement. L'important c'est de commencer."
    ],
    alreadyHaveAgency: isEn ? [
      "Ok, and are you satisfied with what they do? If I ask you, it's because often clients who come to us are looking for a step up.",
      "No problem! You can keep your agency and take us for a specific service. Or tell me what's missing and we'll see if we can complement.",
      "It's good to already have someone. But if you're here, maybe there's an unmet need? Tell me what could be improved.",
      "Ok! And concretely, what's not working with your current situation? We can intervene as a complement or replacement, you decide."
    ] : [
      "Ok, et tu es satisfait de ce qu'ils font ? Si je te pose la question, c'est que souvent les clients qui viennent vers nous cherchent un cran au-dessus.",
      "Pas de souci ! Tu peux garder ton agence et nous prendre pour un service spécifique. Ou alors, dis-moi ce qui te manque et on voit si on peut compléter.",
      "C'est bien d'avoir déjà quelqu'un. Mais si tu es ici, c'est qu'il y a peut-être un besoin non couvert ? Dis-moi ce qui pourrait être amélioré.",
      "Ok ! Et concrètement, qu'est-ce qui ne va pas avec ta situation actuelle ? On peut intervenir en complément ou en remplacement, c'est toi qui décides."
    ],
    noTime: isEn ? [
      "Exactly! That's precisely why you need us. We manage everything from A to Z, you just validate. You save time, not the other way around.",
      "Lack of time is the number one problem for our clients. And that's precisely where we step in: we free you from all digital marketing.",
      "I understand, you're overwhelmed. But it's precisely our job to take charge of that for you. Our clients tell us it's the best investment they've made.",
      "No time = even more need to delegate. We take care of everything, and you just have a monthly report to read. 10 minutes a month is all we ask of you."
    ] : [
      "Justement ! C'est exactement pour ça que tu as besoin de nous. On gère tout de A à Z, tu n'as qu'à valider. Tu gagnes du temps, pas l'inverse.",
      "Le manque de temps, c'est le problème numéro 1 de nos clients. Et c'est précisément là où on intervient : on te libère de tout le marketing digital.",
      "Je comprends, tu es débordé. Mais c'est justement notre job de prendre ça en charge pour toi. Nos clients nous disent que c'est le meilleur investissement qu'ils aient fait.",
      "Pas de temps = encore plus besoin de déléguer. On s'occupe de tout, et tu as juste un reporting mensuel à lire. 10 minutes par mois, c'est tout ce qu'on te demande."
    ],
    notSure: isEn ? [
      "It's completely normal to hesitate. What if we started with a free audit? Zero commitment, we just show you what we can do for you.",
      "No problem! We don't force you into anything. Start with a free audit, it's non-binding, and you decide then.",
      "I understand. To help you decide, we offer a free audit and an offered consulting session. That way you see concretely what we can bring you.",
      "No pressure. Let me send you a mini-analysis of your situation, it's free and non-binding. It will help you see more clearly."
    ] : [
      "C'est tout à fait normal d'hésiter. Et si on commençait par un audit gratuit ? Zéro engagement, on te montre juste ce qu'on peut faire pour toi.",
      "Aucun problème ! On ne te force à rien. Commence par un audit gratuit, c'est sans engagement, et tu décides ensuite.",
      "Je comprends. Pour t'aider à te décider, on propose un audit gratuit et une session de conseil offerte. Comme ça tu vois concrètement ce qu'on peut t'apporter.",
      "Pas de pression. Laisse-moi t'envoyer une mini-analyse de ta situation, c'est gratuit et sans engagement. Ça t'aidera à y voir plus clair."
    ],
    willThinkAboutIt: isEn ? [
      "Of course, take time to think! In the meantime, here's what I advise you to keep in mind: every day without a digital strategy is lost opportunities. We're here when you're ready.",
      "Completely normal. Thinking is important. Want me to send you a recap by email so you can come back to it with a rested mind?",
      "No problem! I'll prepare a small document for you with my personalized recommendations. That way you have everything in front of you to think.",
      "Take your time. But keep in mind that the audit is free and non-binding. It can precisely help you decide."
    ] : [
      "Bien sûr, prends le temps de réfléchir ! En attendant, voici ce que je te conseille de garder en tête : chaque jour sans stratégie digitale, c'est des opportunités perdues. On est là quand tu es prêt.",
      "Tout à fait normal. Réfléchir c'est important. Tu veux que je t'envoie un recap par email pour que tu puisses y revenir à tête reposée ?",
      "Pas de souci ! Je te prépare un petit document avec mes recommandations personnalisées. Comme ça tu as tout sous les yeux pour réfléchir.",
      "Prends ton temps. Mais garde en tête que l'audit est gratuit et sans engagement. Ça peut justement t'aider à te décider."
    ],
    tooSmall: isEn ? [
      "We work with all company sizes! We have adapted solutions, and often it's the smallest structures that have the best return on investment.",
      "Not a problem at all! Our best success stories often come from small structures. We adapt strategy and budget to your reality.",
      "It's precisely the right time to invest in digital. Small businesses that get started early take a huge lead over the competition.",
      "Size means nothing! What counts is ambition. We have clients who started alone and are now at 50 employees thanks to digital."
    ] : [
      "On travaille avec toutes les tailles d'entreprises ! On a des solutions adaptées, et souvent c'est les plus petites structures qui ont le meilleur retour sur investissement.",
      "Pas du tout un problème ! Nos meilleures success stories viennent souvent de petites structures. On adapte la stratégie et le budget à ta réalité.",
      "C'est justement le bon moment pour investir dans le digital. Les petites entreprises qui s'y mettent tôt prennent une avance énorme sur la concurrence.",
      "Taille ne veut rien dire ! Ce qui compte c'est l'ambition. On a des clients qui ont commencé seuls et qui sont maintenant à 50 employés grâce au digital."
    ]
  };

  // -- Topic-specific deep responses --
  var TOPIC_RESPONSES = {
    seo: [
      "Le SEO, c'est notre passion. On aide nos clients à dominer Google de manière durable. Audit technique, contenu optimisé, netlinking de qualité... On maîtrise les 3 piliers.",
      "Le SEO c'est le levier le plus rentable à long terme. On voit en moyenne +45% de trafic organique en 6 mois. Et ça continue de croître ensuite.",
      "En SEO, on travaille sur 3 axes : le technique (vitesse, structure), le contenu (mots-clés, articles) et la popularité (backlinks). C'est ce trio qui fait la différence.",
      "Le SEO local, c'est un game-changer pour les business physiques. Google Business Profile, avis, géolocalisation... On a fait passer une PME de 0 à 2500 visites en 6 mois."
    ],
    web: [
      "On crée des sites qui ne sont pas juste beaux, ils convertissent. WordPress, Shopify, Webflow ou sur-mesure, on choisit la techno la plus adaptée à ton projet.",
      "Un site vitrine démarre à 2000\u20ac, un e-commerce à 3000\u20ac. Chaque projet inclut le design responsive, le SEO de base, la formation et 30 jours de support.",
      "Le secret d'un bon site, c'est pas juste le design. C'est la stratégie derrière : l'UX, les parcours utilisateur, les call-to-action, la vitesse. On pense à tout.",
      "On bosse sur WordPress, Shopify, Webflow et du dev React/Node.js. Le choix dépend de ton besoin : simplicité, personnalisation, e-commerce... On t'oriente."
    ],
    ads: [
      "La pub en ligne, c'est de l'acquisition rapide et mesurable. Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads... On gère tout avec un ROI moyen de 3x.",
      "Nos clients obtiennent en moyenne 3 fois leur investissement en pub. Le secret ? Un setup propre, du A/B testing continu et un tracking précis.",
      "Google Ads pour capter l'intention de recherche, Meta Ads pour la notoriété et le retargeting, LinkedIn pour le B2B. Chaque plateforme a sa force.",
      "Budget minimum recommandé : 300-500\u20ac/mois. En dessous, c'est difficile d'avoir assez de données pour optimiser. Mais avec 500\u20ac, on peut déjà faire des miracles."
    ],
    ia: [
      "L'IA en 2026, c'est un avantage compétitif énorme. Chatbots intelligents, automatisation des tâches, création de contenu... On aide les entreprises à bosser plus malin.",
      "On crée des chatbots IA sur mesure, des workflows automatisés avec Make/Zapier/n8n, et on intègre l'IA dans tes process. Nos clients gagnent 40% de productivité en moyenne.",
      "Un chatbot IA pour ton site, c'est un commercial qui bosse 24h/24. Il qualifie les leads, répond aux questions et prend des RDV. Comme moi en ce moment !",
      "L'automatisation, c'est le meilleur investissement que tu puisses faire. On connecte tes outils entre eux et on crée des workflows qui te font gagner des heures chaque semaine."
    ],
    social: [
      "Les réseaux sociaux, c'est un vrai levier quand c'est bien fait. Community management, contenu stratégique, influence... On gère Instagram, Facebook, LinkedIn, TikTok.",
      "Le secret du social media, c'est la régularité et la qualité. On crée un calendrier éditorial, du contenu engageant et on interagit avec ta communauté.",
      "Instagram Reels, TikTok, LinkedIn Articles... Chaque plateforme a ses codes. On adapte le contenu pour maximiser l'engagement sur chacune.",
      "Le community management, ça va au-delà de poster des photos. C'est de la stratégie, de la veille, de l'interaction, du branding. On prend tout en charge."
    ],
    branding: [
      "L'identité visuelle, c'est ta première impression. Logo, charte graphique, UI/UX... On crée des identités qui marquent et qui différencient.",
      "Un bon branding, ça change tout. Ça inspire confiance, ça te différencie de la concurrence et ça crée une connexion émotionnelle avec tes clients.",
      "On propose 3 propositions de logo avec révisions illimitées. La charte graphique complète inclut couleurs, typographies, pictogrammes et guidelines d'utilisation.",
      "Notre équipe design maîtrise Figma, et on crée des maquettes détaillées avant le développement. Pas de surprise, tu valides chaque étape."
    ],
    email: [
      "L'email marketing a le meilleur ROI de tous les canaux : 36\u20ac pour chaque euro investi. C'est insensé de ne pas l'utiliser.",
      "On maîtrise Brevo, Mailchimp, HubSpot, ActiveCampaign... Setup, templates, séquences d'automatisation, segmentation, tout le package.",
      "L'automatisation email, c'est la magie. Bienvenue, abandon de panier, relance, nurturing... Tes emails travaillent pendant que tu dors.",
      "Le lead scoring intégré au CRM, c'est game-changing. On identifie automatiquement tes leads les plus chauds pour que ton équipe commerciale se concentre sur les bons contacts."
    ],
    video: [
      "La vidéo, c'est le format roi en 2026. Corporate, Reels, TikTok, YouTube... On produit du contenu vidéo qui capte l'attention et convertit.",
      "Du concept au produit final, on gère toute la chaîne : script, tournage, montage, motion design, sous-titrage. Qualité pro à chaque étape.",
      "Les Reels et les TikTok, c'est là où se passe l'attention en ce moment. On crée du contenu court, impactant et viral.",
      "Le motion design, c'est parfait pour expliquer un produit ou un service complexe de manière simple et attractive."
    ],
    content: [
      "Le contenu est le carburant du SEO et du social media. Articles de blog, pages de vente, fiches produits... On crée du contenu qui attire et qui convertit.",
      "On utilise l'IA pour accélérer la production sans sacrifier la qualité. Chaque contenu est révisé par un expert humain.",
      "Un bon article SEO, c'est minimum 1500 mots, bien structuré, avec les bons mots-clés et une vraie valeur ajoutée. C'est comme ça qu'on monte sur Google.",
      "Le copywriting, c'est un art. Nos pages de vente convertissent parce qu'on comprend la psychologie du client et on écrit pour déclencher l'action."
    ],
    funnel: [
      "Les tunnels de vente, c'est de la science. Landing page, page de vente, checkout, upsell... Chaque étape est optimisée pour maximiser la conversion.",
      "L'A/B testing, c'est ce qui fait la différence. On teste les titres, les visuels, les CTA, les prix... Et on garde ce qui performe.",
      "On maîtrise Systeme.io, ClickFunnels et Kajabi. Le choix dépend de ton business : infoproduits, services, e-commerce...",
      "Le CRO (Conversion Rate Optimization), c'est notre obsession. Chaque amélioration de 1% de conversion peut représenter des milliers d'euros."
    ],
    consulting: [
      "Notre consulting, c'est pas de la théorie. C'est de la stratégie actionnnable, avec des KPIs, des deadlines et des résultats mesurables.",
      "L'audit digital 360, c'est le point de départ idéal. On analyse tout : site, SEO, social, ads, CRM... Et on te donne une roadmap claire.",
      "On accompagne les startups en growth hacking, les PME en transformation digitale et les grands comptes en stratégie. Chaque approche est sur mesure.",
      "150 à 300\u20ac/h en consulting. C'est un investissement qui se rentabilise très vite quand on prend les bonnes décisions."
    ],
    formation: [
      "Nos formations rendent tes équipes autonomes. SEO, Ads, Social Media, IA, WordPress, Analytics... On couvre tous les sujets.",
      "Formation de 14h à 28h selon le sujet. En ligne ou en présentiel, c'est toi qui choisis. Et c'est ultra pratique, pas de la théorie.",
      "Après notre formation SEO, une équipe interne a augmenté son trafic de 200% en total autonomie. C'est la preuve que ça marche.",
      "On forme aussi sur l'IA et le marketing. C'est un des sujets les plus demandés en ce moment."
    ]
  };

  // -- Process explanation --
  var PROCESS_RESPONSES = isEn ? [
    "Our 4-step method:<br><br><strong>1. Audit</strong> - We analyze your current situation deeply<br><strong>2. Strategy</strong> - We create a tailored action plan<br><strong>3. Execution</strong> - We deploy with regular checkpoints<br><strong>4. Optimization</strong> - We measure and improve continuously<br><br>Dedicated project manager from start to finish.",
    "It's simple:<br>First a free 30-min call to understand your need. Then we make you a detailed proposal. If you like it, we launch. And we optimize continuously with regular reporting.",
    "We operate in agile mode. That means short cycles, regular points, and total transparency. You know exactly where your project stands at all times."
  ] : [
    "Notre méthode en 4 étapes :<br><br><strong>1. Audit</strong> - On analyse ta situation actuelle en profondeur<br><strong>2. Stratégie</strong> - On crée un plan d'action sur mesure<br><strong>3. Exécution</strong> - On déploie avec des points réguliers<br><strong>4. Optimisation</strong> - On mesure et on améliore en continu<br><br>Chef de projet dédié du début à la fin.",
    "C'est simple :<br>D'abord un appel de 30 min gratuit pour comprendre ton besoin. Ensuite on te fait une proposition détaillée. Si ça te plaît, on lance. Et on optimise en continu avec des reportings réguliers.",
    "On fonctionne en mode agile. Ça veut dire des cycles courts, des points réguliers, et de la transparence totale. Tu sais exactement où en est ton projet à tout moment."
  ];

  // -- Why Pirabel is différent --
  var WHY_US_RESPONSES = isEn ? [
    "What sets us apart? We are <strong>data-driven</strong> and <strong>IA-powered</strong>. We do nothing by feeling. Every action is measured and optimized for ROI.",
    "3 things that make us different:<br>1. We're obsessed with results, not likes<br>2. We use AI to be more efficient<br>3. We have a multidisciplinary team (dev, design, marketing, data)",
    "We're not just another agency. We're a growth partner. Our success is measured by your results. If you don't grow, we failed.",
    "Total transparency, detailed reporting, and a team that responds in less than 24h. That's the Pirabel Labs difference."
  ] : [
    "Ce qui nous différencie ? On est <strong>data-driven</strong> et <strong>IA-powered</strong>. On ne fait rien au feeling. Chaque action est mesurée et optimisée pour le ROI.",
    "3 trucs qui nous rendent différents :<br>1. On est obsédés par les résultats, pas par les likes<br>2. On utilise l'IA pour être plus efficaces<br>3. On a une équipe multidisciplinaire (dev, design, marketing, data)",
    "On est pas une agence de plus. On est un partenaire de croissance. Notre succès se mesure à tes résultats. Si tu grandis pas, on a échoué.",
    "Transparence totale, reporting détaillé, et une équipe qui répond en moins de 24h. C'est ça la différence Pirabel Labs."
  ];

  // -- Default fallback --
  var DEFAULT_RESPONSES = isEn ? [
    "Hmm, I'm not sure I understood well. \ud83e\udd14 Could you rephrase your question? I'm here to help you on anything digital marketing related!",
    "Sorry, I didn't quite catch that. Do you want to talk about your website, your online visibility, your social media, or something else?",
    "I want to make sure I answer you correctly! Does your question concern one of our services (SEO, web creation, advertising, social media, AI) or something else?",
    "Sorry, can you clarify a bit? For example, are you looking to get more customers, improve your site, or be more visible on Google?",
    "I want to be sure I'm helping you! Tell me in a few words what your main need is: more traffic? A new site? Online ads? I adapt to you \ud83d\ude0a"
  ] : [
    "Hmm, je ne suis pas sûre d'avoir bien compris. \ud83e\udd14 Tu pourrais reformuler ta question ? Je suis là pour t'aider sur tout ce qui touche au marketing digital !",
    "Pardon, je n'ai pas bien saisi. Tu veux qu'on parle de ton site web, de ta visibilité en ligne, de tes réseaux sociaux, ou d'autre chose ?",
    "Je veux m'assurer de bien te répondre ! Est-ce que ta question concerne un de nos services (SEO, création de site, publicité, réseaux sociaux, IA) ou autre chose ?",
    "Désolée, peux-tu préciser un peu ? Par exemple, tu cherches à avoir plus de clients, améliorer ton site, ou être plus visible sur Google ?",
    "Je veux être sûre de bien t'aider ! Dis-moi en quelques mots quel est ton besoin principal : plus de trafic ? Un nouveau site ? De la pub en ligne ? Je m'adapte à toi \ud83d\ude0a"
  ];
  var DEFAULT_BUTTONS = isEn ? ['See services', 'I have a project', 'Pricing', 'Talk to a human'] : ['Voir les services', 'J\'ai un projet', 'Tarifs', 'Parler à un humain'];

  // =====================================================================
  //  SECTION 6 — SECTOR DETECTION
  // =====================================================================
  var SECTOR_KEYWORDS = {
    'restaurant': 'Restauration', 'restau': 'Restauration', 'cuisine': 'Restauration',
    'traiteur': 'Restauration', 'brasserie': 'Restauration', 'pizzeria': 'Restauration',
    'boutique': 'Commerce/Retail', 'magasin': 'Commerce/Retail', 'commerce': 'Commerce/Retail',
    'retail': 'Commerce/Retail', 'vetement': 'Mode', 'mode': 'Mode', 'pret a porter': 'Mode',
    'bijou': 'Mode/Bijoux', 'cosmetique': 'Beaute/Cosmetique',
    'cabinet': 'Services professionnels', 'avocat': 'Juridique', 'comptable': 'Comptabilite',
    'notaire': 'Juridique', 'expert comptable': 'Comptabilite', 'juridique': 'Juridique',
    'clinique': 'Sante', 'medecin': 'Sante', 'medical': 'Sante', 'dentist': 'Sante',
    'pharma': 'Sante/Pharma', 'kine': 'Sante', 'osteo': 'Sante', 'psychologue': 'Sante',
    'salon': 'Beaute', 'coiffure': 'Beaute', 'esthetique': 'Beaute', 'spa': 'Beaute/Bien-etre',
    'bien etre': 'Bien-etre', 'yoga': 'Bien-etre', 'meditation': 'Bien-etre',
    'immobilier': 'Immobilier', 'agence immobili': 'Immobilier', 'promoteur': 'Immobilier',
    'startup': 'Startup/Tech', 'saas': 'Tech/SaaS', 'tech': 'Tech', 'logiciel': 'Tech/SaaS',
    'app': 'Tech/Mobile', 'application': 'Tech', 'digital': 'Tech/Digital',
    'formation': 'Formation/Education', 'coaching': 'Coaching', 'coach': 'Coaching',
    'formateur': 'Formation', 'ecole': 'Education', 'universite': 'Education',
    'ecommerce': 'E-commerce', 'e-commerce': 'E-commerce', 'vente en ligne': 'E-commerce',
    'dropshipping': 'E-commerce', 'marketplace': 'E-commerce',
    'artisan': 'Artisanat', 'btp': 'BTP/Construction', 'batiment': 'BTP/Construction',
    'construction': 'BTP/Construction', 'plombier': 'BTP/Services', 'electricien': 'BTP/Services',
    'association': 'Associatif/ONG', 'ong': 'Associatif/ONG', 'non profit': 'Associatif/ONG',
    'hotel': 'Hotellerie', 'tourisme': 'Tourisme', 'voyage': 'Tourisme', 'agence de voyage': 'Tourisme',
    'fitness': 'Sport/Fitness', 'sport': 'Sport/Fitness', 'salle de sport': 'Sport/Fitness',
    'transport': 'Transport/Logistique', 'logistique': 'Transport/Logistique',
    'livraison': 'Transport/Logistique',
    'finance': 'Finance', 'banque': 'Finance', 'assurance': 'Assurance', 'fintech': 'Finance/Fintech',
    'alimentaire': 'Agroalimentaire', 'bio': 'Agroalimentaire', 'agriculture': 'Agriculture',
    'musique': 'Art/Musique', 'art': 'Art/Culture', 'culture': 'Art/Culture',
    'media': 'Media/Presse', 'presse': 'Media/Presse', 'journalisme': 'Media/Presse',
    'agence': 'Agence/Services', 'freelance': 'Freelance', 'consultant': 'Consulting',
    'crypto': 'Crypto/Blockchain', 'blockchain': 'Crypto/Blockchain', 'nft': 'Crypto/Blockchain',
    'energie': 'Energie', 'solaire': 'Energie/Renouvelable', 'environnement': 'Environnement',
    'securite': 'Securite', 'rh': 'Ressources Humaines', 'recrutement': 'RH/Recrutement',
    'industrie': 'Industrie', 'usine': 'Industrie', 'manufacture': 'Industrie'
  };

  // =====================================================================
  //  SECTION 7 — PROBLEM DETECTION PATTERNS
  // =====================================================================
  var PROBLEM_PATTERNS = [
    { re: /pas de (site|visibilite|client|trafic|presence|lead|prospect)/i, p: 'Manque de presence en ligne' },
    { re: /pas (assez|suffisamment) de (client|vente|trafic|lead|prospect|commande|chiffre)/i, p: 'Insuffisance de leads/ventes' },
    { re: /(trop cher|depense|cout eleve|perd de l.argent|ruine|hors de prix)/i, p: 'Cout marketing eleve' },
    { re: /concurren/i, p: 'Forte concurrence' },
    { re: /(personne|nobody).*(trouve|connait|voit|cherche)/i, p: 'Manque de visibilite' },
    { re: /invisible|introuvable|pas (sur|dans) google/i, p: 'Invisible sur Google' },
    { re: /(galere|difficulte|complique|probleme|bloque|coince|rame|merde)/i, p: 'Difficultes operationnelles' },
    { re: /(lent|vitesse|performance|charge|bug|plante)/i, p: 'Site lent / problemes techniques' },
    { re: /(pas de temps|deborde|surcharge|overbooking|submerg)/i, p: 'Manque de temps/ressources' },
    { re: /(ne sais pas|comprends pas|perdu|confus|paume|nul en)/i, p: 'Besoin d\'accompagnement' },
    { re: /(ancien|vieux|demod|obsolete|date|moche|laid|horrible)/i, p: 'Site/outils obsoletes' },
    { re: /(converti|conversion|abandon|rebond|fuit|quitte)/i, p: 'Faible taux de conversion' },
    { re: /(reputation|avis negatif|e-reputation|bad buzz)/i, p: 'Problemes d\'e-reputation' },
    { re: /(reseaux sociaux|instagram|facebook|tiktok|linkedin).*(mort|rien|plat|stagne|zero)/i, p: 'Reseaux sociaux inactifs' },
    { re: /(email|newsletter).*(personne|ouvre|spam|zero)/i, p: 'Emails inefficaces' },
    { re: /(pub|ads|publicite).*(marche pas|perd|cher|rien|zero)/i, p: 'Publicite non rentable' },
    { re: /(agence|prestataire|freelance).*(nul|arnaque|pas content|decu|mediocre|incompetent)/i, p: 'Mauvaise experience avec un prestataire' },
    { re: /(pas d.identite|pas de logo|pas de marque|branding)/i, p: 'Identite de marque faible' },
    { re: /(automatiser|automation|repetitif|manuel|perte de temps)/i, p: 'Besoin d\'automatisation' },
    { re: /(former|formation|apprendre|monter en competence|comprendre)/i, p: 'Besoin de formation' }
  ];

  // =====================================================================
  //  SECTION 8 — TOPIC/INTENT DETECTION
  // =====================================================================
  var INTENT_KEYWORDS = {
    seo: ['seo', 'referencement', 'google', 'position', 'visibilite', 'netlinking', 'backlink', 'mots cles', 'trafic organique', 'premiere page', 'serp', 'indexation', 'audit seo', 'seo local', 'seo technique', 'rank', 'classement'],
    web: ['site web', 'site internet', 'creation site', 'developpement web', 'refonte', 'wordpress', 'shopify', 'webflow', 'ecommerce', 'e-commerce', 'boutique en ligne', 'vitrine', 'application web', 'responsive', 'landing page'],
    ads: ['publicite', 'pub', 'ads', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'tiktok ads', 'linkedin ads', 'campagne', 'sea', 'ppc', 'cpc', 'roas', 'budget pub', 'remarketing', 'retargeting', 'sponsor'],
    ia: ['ia', 'intelligence artificielle', 'automatisation', 'chatbot', 'agent ia', 'make', 'zapier', 'n8n', 'chatgpt', 'claude', 'gpt', 'openai', 'anthropic', 'workflow', 'robot', 'bot', 'automation'],
    social: ['social media', 'reseaux sociaux', 'community', 'instagram', 'facebook', 'tiktok', 'linkedin', 'influence', 'contenu social', 'publication', 'stories', 'reels', 'followers', 'abonnes', 'community management'],
    branding: ['design', 'branding', 'logo', 'charte graphique', 'identite visuelle', 'packaging', 'figma', 'ui', 'ux', 'graphisme', 'direction artistique'],
    email: ['email marketing', 'emailing', 'newsletter', 'crm', 'brevo', 'sendinblue', 'mailchimp', 'hubspot', 'marketing automation', 'nurturing', 'lead scoring', 'sequence', 'activecampaign'],
    video: ['video', 'motion design', 'montage', 'corporate', 'youtube', 'animation', 'tournage', 'clip', 'reel video', 'shorts'],
    content: ['redaction', 'content marketing', 'copywriting', 'article', 'blog', 'page de vente', 'strategie editoriale', 'fiche produit', 'contenu', 'redacteur'],
    funnel: ['funnel', 'tunnel de vente', 'conversion', 'cro', 'a/b test', 'taux de conversion', 'systeme.io', 'clickfunnels', 'kajabi', 'page de capture', 'upsell'],
    consulting: ['consulting', 'conseil', 'strategie digitale', 'audit digital', 'transformation digitale', 'diagnostic', 'accompagnement'],
    formation: ['formation', 'apprendre', 'cours', 'coaching', 'former', 'competences', 'certifiant'],
    pricing: ['tarif', 'prix', 'cout', 'combien', 'budget', 'investissement', 'forfait', 'pack', 'abonnement', 'grille tarifaire'],
    contact: ['contact', 'joindre', 'appeler', 'telephone', 'mail', 'adresse', 'whatsapp', 'rendez-vous', 'rdv', 'appel'],
    process: ['processus', 'comment fonctionne', 'etape', 'methodologie', 'deroulement', 'methode', 'approche'],
    results: ['resultats', 'portfolio', 'references', 'clients', 'temoignage', 'cas', 'exemples', 'realisations', 'experience'],
    about: ['qui etes', 'pirabel', 'equipe', 'presentation', 'a propos', 'fondateur', 'histoire', 'valeurs'],
    whyUs: ['pourquoi vous', 'difference', 'avantage', 'concurrent', 'comparaison', 'mieux que', 'unique'],
    guarantee: ['garantie', 'resultat garanti', 'rembours', 'assurance', 'risque', 'engagement'],
    timeline: ['delai', 'combien de temps', 'duree', 'livraison', 'quand', 'urgent', 'planning'],
    tools: ['outil', 'logiciel', 'plateforme', 'semrush', 'ahrefs', 'canva', 'screaming frog'],
    tech: ['react', 'node', 'javascript', 'php', 'python', 'laravel', 'api', 'mongodb', 'mysql', 'aws', 'vercel'],
    cities: ['paris', 'lyon', 'marseille', 'bruxelles', 'montreal', 'cotonou', 'casablanca', 'dakar', 'abidjan', 'tunis', 'france', 'belgique', 'canada', 'afrique', 'maroc', 'senegal', 'benin'],
    hello: ['bonjour', 'salut', 'hello', 'hey', 'bonsoir', 'coucou', 'yo', 'hi'],
    thanks: ['merci', 'super', 'parfait', 'genial', 'top', 'excellent', 'cool', 'bravo', 'nickel', 'impeccable', 'au revoir', 'bye', 'a bientot'],
    yes: ['oui', 'ok', 'daccord', 'd accord', 'ouais', 'yep', 'bien sur', 'tout a fait', 'exactement', 'absolument', 'volontiers', 'allons-y', 'ca marche', 'on y va', 'let go', 'parfait', 'je veux bien'],
    no: ['non', 'pas vraiment', 'non merci', 'ca ira', 'rien', 'pas besoin', 'pas maintenant', 'plus tard', 'peut etre', 'on verra']
  };

  // =====================================================================
  //  SECTION 9 — OBJECTION DETECTION
  // =====================================================================
  var OBJECTION_PATTERNS = [
    { re: /(trop cher|cher|hors budget|pas les moyens|economiser|reduire|depenses)/i, type: 'tooExpensive' },
    { re: /(deja.*agence|agence actuel|prestataire|freelance|deja quelqu|travaille deja avec)/i, type: 'alreadyHaveAgency' },
    { re: /(pas le temps|pas de temps|trop occupe|deborde|quand est.ce que|chronophage)/i, type: 'noTime' },
    { re: /(pas sur|hesite|hesitation|pas convaincu|sais pas si|me demande si|doute)/i, type: 'notSure' },
    { re: /(reflechir|y penser|reviens|plus tard|pas maintenant|on verra|peut etre)/i, type: 'willThinkAboutIt' },
    { re: /(trop petit|petite entreprise|pas assez gros|micro|solo|seul|independant|auto.?entrepreneur)/i, type: 'tooSmall' }
  ];

  // =====================================================================
  //  SECTION 10 — UTILITY FUNCTIONS
  // =====================================================================
  function normalize(str) {
    return str.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/['']/g, ' ')
      .replace(/[^a-z0-9\s@.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function pick(arr) {
    if (!arr || arr.length === 0) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickUnused(arr, key) {
    if (!arr || arr.length === 0) return '';
    if (!STATE.usedResponses[key]) STATE.usedResponses[key] = [];
    var unused = arr.filter(function (r, i) {
      return STATE.usedResponses[key].indexOf(i) === -1;
    });
    if (unused.length === 0) {
      STATE.usedResponses[key] = [];
      unused = arr;
    }
    var idx = arr.indexOf(unused[Math.floor(Math.random() * unused.length)]);
    STATE.usedResponses[key].push(idx);
    return arr[idx];
  }

  function replaceName(text) {
    var name = STATE.visitor.name || '';
    if (!name) return text.replace(/\{name\}\s*/g, '');
    return text.replace(/\{name\}/g, name);
  }

  function getTypingDelay(text) {
    var clean = text.replace(/<[^>]*>/g, '');
    var delay = CONFIG.typingDelayBase + clean.length * CONFIG.typingDelayPerChar;
    return Math.min(delay, CONFIG.typingDelayMax);
  }

  function formatTimestamp() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // =====================================================================
  //  SECTION 11 — INPUT ANALYSIS ENGINE
  // =====================================================================
  function detectEmail(text) {
    var m = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
    return m ? m[0] : null;
  }

  function detectPhone(text) {
    var m = text.match(/(?:\+\d{1,3}\s?)?\(?\d{1,4}\)?[\d\s.\-]{6,}/);
    if (m) {
      var digits = m[0].replace(/[^\d+]/g, '');
      if (digits.replace('+', '').length >= 8) return m[0].trim();
    }
    return null;
  }

  function detectBudget(text) {
    var norm = normalize(text);
    // Explicit number with currency
    var m = text.match(/(\d[\d\s.,]*)\s*(?:\u20ac|eur|euro|dollars|\$|cad|fcfa|xof|mad|dh)/i);
    if (m) {
      var num = parseFloat(m[1].replace(/[\s.,]/g, ''));
      return { raw: m[0], value: num };
    }
    // "budget de X"
    m = text.match(/budget\s*(?:de\s*)?(\d[\d\s.,]*)/i);
    if (m) {
      var numB = parseFloat(m[1].replace(/[\s.,]/g, ''));
      return { raw: m[0], value: numB };
    }
    // Qualitative
    if (/petit budget|pas cher|economique|limite|modeste|serre/i.test(norm)) return { raw: 'Petit budget', value: 500 };
    if (/gros budget|investir|grosse enveloppe|illimite|pas un probleme/i.test(norm)) return { raw: 'Budget important', value: 10000 };
    if (/moyen|modere|raisonnable|correct/i.test(norm) && /budget/i.test(norm)) return { raw: 'Budget moyen', value: 3000 };
    return null;
  }

  function detectSector(text) {
    var norm = normalize(text);
    for (var key in SECTOR_KEYWORDS) {
      if (norm.indexOf(key) !== -1) return SECTOR_KEYWORDS[key];
    }
    return null;
  }

  function detectProblems(text) {
    var found = [];
    PROBLEM_PATTERNS.forEach(function (pp) {
      if (pp.re.test(text) && STATE.problems.indexOf(pp.p) === -1) {
        STATE.problems.push(pp.p);
        found.push(pp.p);
      }
    });
    return found;
  }

  function detectObjection(text) {
    for (var i = 0; i < OBJECTION_PATTERNS.length; i++) {
      if (OBJECTION_PATTERNS[i].re.test(text)) return OBJECTION_PATTERNS[i].type;
    }
    return null;
  }

  function detectIntent(text) {
    var norm = normalize(text);
    var bestIntent = null;
    var bestScore = 0;
    for (var intent in INTENT_KEYWORDS) {
      var kws = INTENT_KEYWORDS[intent];
      var score = 0;
      for (var j = 0; j < kws.length; j++) {
        if (norm.indexOf(kws[j]) !== -1) {
          score += kws[j].split(' ').length * 2;
        }
      }
      if (score > 0 && intent === STATE.lastTopicId) score += 1;
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
    return bestIntent;
  }

  function detectTimeline(text) {
    var norm = normalize(text);
    if (/urgent|rapide|asap|presse|vite|immedia|des que possible|maintenant/i.test(norm)) return { label: 'Urgent', urgency: 5 };
    if (/(cette|prochaine) semaine/i.test(text)) return { label: 'Cette semaine', urgency: 4 };
    if (/semaine|jours|jour/i.test(norm)) return { label: 'Court terme (jours/semaines)', urgency: 3 };
    if (/mois prochain|ce mois|le mois/i.test(norm)) return { label: 'Ce mois-ci', urgency: 3 };
    if (/mois/i.test(norm)) return { label: 'Moyen terme (1-3 mois)', urgency: 2 };
    if (/trimestre|annee|an\b|long terme/i.test(norm)) return { label: 'Long terme', urgency: 1 };
    return null;
  }

  function detectWebsite(text) {
    var m = text.match(/(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.]{2,}/i);
    if (m && m[0].indexOf('@') === -1) return m[0];
    return null;
  }

  function detectCompany(text) {
    var m = text.match(/(?:je suis chez|je travaille chez|mon entreprise|ma boite|ma societe|mon cabinet|mon agence)\s+([A-Za-z\u00C0-\u024F\s&'-]+)/i);
    if (m) return m[1].trim();
    return null;
  }

  function detectName(text) {
    var m = text.match(/(?:je m.appelle|moi c.est|mon (?:prenom|nom)(?:\s+c.est)?)\s+([A-Za-z\u00C0-\u024F-]+)/i);
    if (m) return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    // If they just sent one word that looks like a name (capitalized, 2-15 chars)
    var trimmed = text.trim();
    if (/^[A-Za-z\u00C0-\u024F-]{2,15}$/.test(trimmed) && STATE.waitingForName) {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
    }
    return null;
  }

  // =====================================================================
  //  SECTION 12 — PROFILE EXTRACTION & SCORING
  // =====================================================================
  function extractAllInfo(text) {
    // Email
    var email = detectEmail(text);
    if (email) {
      STATE.visitor.email = email;
      STATE.waitingForEmail = false;
      localStorage.setItem('pb_chat_email', email);
    }
    // Phone
    var phone = detectPhone(text);
    if (phone && !STATE.visitor.phone) {
      STATE.visitor.phone = phone;
      STATE.waitingForPhone = false;
    }
    // Name
    var name = detectName(text);
    if (name && !STATE.visitor.name) {
      STATE.visitor.name = name;
      STATE.waitingForName = false;
      localStorage.setItem('pb_chat_name', name);
    }
    // Budget
    var budget = detectBudget(text);
    if (budget) {
      STATE.qualification.budget = budget.raw;
      STATE.qualification.budgetRange = budget.value;
    }
    // Timeline
    var timeline = detectTimeline(text);
    if (timeline) {
      STATE.qualification.timeline = timeline.label;
      STATE.qualification.urgency = timeline.urgency;
    }
    // Sector
    var sector = detectSector(text);
    if (sector && !STATE.visitor.sector) STATE.visitor.sector = sector;
    // Website
    var website = detectWebsite(text);
    if (website && !STATE.visitor.website) STATE.visitor.website = website;
    // Company
    var company = detectCompany(text);
    if (company && !STATE.visitor.company) STATE.visitor.company = company;
    // Problems
    detectProblems(text);
    // Decision maker
    if (/je decide|c.est moi qui|seul a décider|patron|directeur|fondateur|ceo|gerant/i.test(text)) {
      STATE.qualification.decisionMaker = true;
    }
    if (/demander a|valider avec|mon boss|mon associe|le comite|la direction|pas seul/i.test(text)) {
      STATE.qualification.decisionMaker = false;
    }

    updateLeadScore();
    persistState();
  }

  function updateLeadScore() {
    var s = 0;
    var v = STATE.visitor;
    var q = STATE.qualification;
    // Contact info
    if (v.name) s += 8;
    if (v.email) s += 15;
    if (v.phone) s += 18;
    if (v.company) s += 5;
    if (v.sector) s += 7;
    if (v.website) s += 4;
    // Qualification
    if (q.budget) s += 12;
    if (q.timeline) s += 8;
    if (q.decisionMaker === true) s += 8;
    if (q.urgency >= 3) s += 5;
    if (q.urgency >= 4) s += 5;
    // Engagement
    if (STATE.problems.length > 0) s += 5;
    if (STATE.problems.length >= 2) s += 3;
    if (STATE.interests.length > 0) s += 5;
    if (STATE.interests.length >= 2) s += 3;
    if (STATE.topicsDiscussed.length >= 2) s += 3;
    if (STATE.topicsDiscussed.length >= 4) s += 3;
    if (STATE.userMessageCount >= 3) s += 3;
    if (STATE.userMessageCount >= 6) s += 3;
    // Objection handling success
    if (STATE.objectionCount > 0 && STATE.userMessageCount > STATE.objectionCount + 2) s += 5;

    q.score = Math.min(s, 100);
    q.level = q.score >= 55 ? 'hot' : q.score >= 30 ? 'warm' : 'cold';
  }

  // =====================================================================
  //  SECTION 13 — PHASE MANAGEMENT
  // =====================================================================
  function determinePhase() {
    if (STATE.userMessageCount <= 1) return PHASES.GREETING;
    if (STATE.phase === PHASES.POST) return PHASES.POST;
    if (STATE.phase === PHASES.CLOSING && STATE.closingCount > 0) return PHASES.CLOSING;

    // Auto-advance based on conversation progress
    var q = STATE.qualification;
    if (q.score >= 55 && STATE.userMessageCount >= 5 && !STATE.closingAttempted) return PHASES.CLOSING;
    if (STATE.interests.length > 0 && (q.budget || STATE.userMessageCount >= 6)) return PHASES.SOLUTION;
    if (STATE.visitor.sector || STATE.problems.length > 0 || STATE.userMessageCount >= 3) return PHASES.QUALIFICATION;
    return PHASES.DISCOVERY;
  }

  function getPhaseQuestion() {
    var phase = STATE.phase;
    var qa = STATE.qualifyAsked;

    // Don't ask back-to-back qualifying questions
    if (STATE.history.length > 0) {
      var lastBot = null;
      for (var i = STATE.history.length - 1; i >= 0; i--) {
        if (STATE.history[i].role === 'bot') { lastBot = STATE.history[i]; break; }
      }
      if (lastBot && lastBot.hadQuestion) return null;
    }

    if (phase === PHASES.DISCOVERY) {
      if (!STATE.visitor.sector && !qa.sector) {
        qa.sector = true;
        return pickUnused(DISCOVERY_RESPONSES.askSector, 'askSector');
      }
      if (STATE.problems.length === 0 && !qa.challenge) {
        qa.challenge = true;
        return pickUnused(DISCOVERY_RESPONSES.askChallenge, 'askChallenge');
      }
      if (!qa.pastEfforts && STATE.userMessageCount >= 3) {
        qa.pastEfforts = true;
        return pickUnused(DISCOVERY_RESPONSES.askPastEfforts, 'askPastEfforts');
      }
    }

    if (phase === PHASES.QUALIFICATION) {
      if (!STATE.qualification.budget && !qa.budget && STATE.userMessageCount >= 3) {
        qa.budget = true;
        return pickUnused(QUALIFICATION_RESPONSES.askBudget, 'askBudget');
      }
      if (!STATE.qualification.timeline && !qa.timeline && STATE.userMessageCount >= 4) {
        qa.timeline = true;
        return pickUnused(QUALIFICATION_RESPONSES.askTimeline, 'askTimeline');
      }
      if (STATE.qualification.decisionMaker === null && !qa.decisionMaker && STATE.userMessageCount >= 5) {
        qa.decisionMaker = true;
        return pickUnused(QUALIFICATION_RESPONSES.askDecisionMaker, 'askDecisionMaker');
      }
    }

    if (phase === PHASES.CLOSING) {
      if (!STATE.visitor.name && !qa.closingName) {
        qa.closingName = true;
        STATE.waitingForName = true;
        return pickUnused(CLOSING_RESPONSES.askName, 'askName');
      }
      if (!STATE.visitor.email && !qa.closingEmail) {
        qa.closingEmail = true;
        STATE.waitingForEmail = true;
        return pickUnused(CLOSING_RESPONSES.askEmail, 'askEmail');
      }
      if (!STATE.visitor.phone && !qa.closingPhone) {
        qa.closingPhone = true;
        STATE.waitingForPhone = true;
        return pickUnused(CLOSING_RESPONSES.askPhone, 'askPhone');
      }
    }

    return null;
  }

  // =====================================================================
  //  SECTION 14 — OFFER GENERATION
  // =====================================================================
  function generateOffer() {
    if (STATE.offerGenerated) return STATE.offer;

    var recommendedServices = [];
    var totalMin = 0;
    var totalMax = 0;
    var monthlyMin = 0;
    var monthlyMax = 0;

    // Map problems and interests to services
    var serviceMapping = {
      'Invisible sur Google': ['seo'],
      'Manque de présence en ligne': ['web', 'seo'],
      'Insuffisance de leads/ventes': ['ads', 'funnel', 'seo'],
      'Coût marketing eleve': ['seo', 'email', 'ia'],
      'Forte concurrence': ['seo', 'ads', 'branding'],
      'Manque de visibilité': ['seo', 'social', 'ads'],
      'Site lent / problemes techniques': ['web'],
      'Manque de temps/ressources': ['ia', 'social'],
      'Besoin d\'accompagnement': ['consulting', 'formation'],
      'Site/outils obsoletes': ['web', 'branding'],
      'Faible taux de conversion': ['funnel', 'web'],
      'Reseaux sociaux inactifs': ['social', 'content'],
      'Emails inefficaces': ['email'],
      'Publicité non rentable': ['ads', 'funnel'],
      'Mauvaise experience avec un prestataire': ['consulting'],
      'Identité de marque faible': ['branding'],
      'Besoin d\'automatisation': ['ia'],
      'Besoin de formation': ['formation'],
      'Difficultes operationnelles': ['consulting', 'ia'],
      'Problèmes d\'e-reputation': ['social', 'seo']
    };

    // From problems
    STATE.problems.forEach(function (p) {
      var mapped = serviceMapping[p] || [];
      mapped.forEach(function (s) {
        if (recommendedServices.indexOf(s) === -1) recommendedServices.push(s);
      });
    });

    // From expressed interests
    STATE.interests.forEach(function (i) {
      var key = i.toLowerCase();
      for (var sKey in SERVICES) {
        if (SERVICES[sKey].name.toLowerCase().indexOf(key) !== -1 || sKey === key) {
          if (recommendedServices.indexOf(sKey) === -1) recommendedServices.push(sKey);
        }
      }
    });

    // From discussed topics
    STATE.topicsDiscussed.forEach(function (t) {
      if (SERVICES[t] && recommendedServices.indexOf(t) === -1) {
        recommendedServices.push(t);
      }
    });

    // Default if nothing detected
    if (recommendedServices.length === 0) recommendedServices = ['consulting', 'seo'];

    // Calculate budget
    var serviceDetails = [];
    recommendedServices.forEach(function (sKey) {
      var svc = SERVICES[sKey];
      if (!svc) return;
      serviceDetails.push({
        key: sKey,
        name: svc.name,
        icon: svc.icon,
        priceRange: svc.priceRange,
        monthly: svc.monthly,
        timeline: svc.timeline
      });
      if (svc.monthly) {
        monthlyMin += svc.priceMin;
        monthlyMax += svc.priceMax;
      } else {
        totalMin += svc.priceMin;
        totalMax += svc.priceMax;
      }
    });

    var offer = {
      id: 'OFF-' + Date.now().toString(36).toUpperCase(),
      date: new Date().toLocaleDateString('fr-FR'),
      visitor: Object.assign({}, STATE.visitor),
      problems: STATE.problems.slice(),
      services: serviceDetails,
      budgetOneTime: totalMin > 0 ? totalMin + ' - ' + totalMax + '\u20ac' : null,
      budgetMonthly: monthlyMin > 0 ? monthlyMin + ' - ' + monthlyMax + '\u20ac/mois' : null,
      objectives: generateObjectives(),
      timeline: generateTimeline(recommendedServices),
      nextSteps: [
        'Appel de découverte gratuit (30 min)',
        'Proposition détaillée sous 48h',
        'Lancement du projet après validation'
      ]
    };

    STATE.offer = offer;
    STATE.offerGenerated = true;
    return offer;
  }

  function generateObjectives() {
    var objectives = [];
    if (STATE.problems.indexOf('Invisible sur Google') !== -1 || STATE.problems.indexOf('Manque de visibilité') !== -1) {
      objectives.push('Atteindre le top 10 Google sur vos mots-clés stratégiques');
    }
    if (STATE.problems.indexOf('Insuffisance de leads/ventes') !== -1) {
      objectives.push('Augmenter le nombre de leads qualifiés de 50% en 6 mois');
    }
    if (STATE.problems.indexOf('Faible taux de conversion') !== -1) {
      objectives.push('Améliorer le taux de conversion de 30%+');
    }
    if (STATE.problems.indexOf('Manque de présence en ligne') !== -1) {
      objectives.push('Établir une présence en ligne professionnelle et visible');
    }
    if (STATE.problems.indexOf('Besoin d\'automatisation') !== -1) {
      objectives.push('Automatiser les tâches répétitives et gagner 40% de productivité');
    }
    if (objectives.length === 0) {
      objectives = [
        'Augmenter votre visibilité en ligne',
        'Générer plus de leads qualifiés',
        'Optimiser votre retour sur investissement digital'
      ];
    }
    return objectives;
  }

  function generateTimeline(services) {
    if (services.indexOf('web') !== -1) return '4-8 semaines pour le site, optimisation continue ensuite';
    if (services.indexOf('seo') !== -1) return 'Premiers résultats en 3-4 mois, impact significatif en 6 mois';
    if (services.indexOf('ads') !== -1) return 'Lancement des campagnes en 1 semaine, optimisation continue';
    return 'Lancement sous 2 semaines, suivi et optimisation mensuels';
  }

  function formatOfferHTML() {
    var offer = generateOffer();
    var html = '<div style="background:#1a1a1a;border:1px solid #333;border-radius:12px;padding:16px;margin:4px 0;">';
    html += '<div style="text-align:center;margin-bottom:12px;"><strong style="color:#FF5500;font-size:14px;">Proposition personnalisée</strong>';
    html += '<br><span style="color:#888;font-size:11px;">' + offer.id + ' | ' + offer.date + '</span></div>';

    // Services
    html += '<div style="margin-bottom:10px;"><strong style="color:#e0e0e0;font-size:12px;">Services recommandés :</strong>';
    offer.services.forEach(function (s) {
      html += '<div style="color:#ccc;font-size:12px;padding:4px 0;border-bottom:1px solid #2a2a2a;">' + s.icon + ' ' + s.name + ' <span style="color:#FF5500;">' + s.priceRange + '</span></div>';
    });
    html += '</div>';

    // Objectives
    html += '<div style="margin-bottom:10px;"><strong style="color:#e0e0e0;font-size:12px;">Objectifs :</strong>';
    offer.objectives.forEach(function (o) {
      html += '<div style="color:#aaa;font-size:11px;padding:2px 0;">&#10003; ' + o + '</div>';
    });
    html += '</div>';

    // Budget
    html += '<div style="margin-bottom:10px;"><strong style="color:#e0e0e0;font-size:12px;">Budget estimé :</strong>';
    if (offer.budgetOneTime) html += '<div style="color:#FF5500;font-size:13px;font-weight:600;">' + offer.budgetOneTime + ' (one-time)</div>';
    if (offer.budgetMonthly) html += '<div style="color:#FF5500;font-size:13px;font-weight:600;">' + offer.budgetMonthly + ' (récurrent)</div>';
    html += '</div>';

    // Timeline
    html += '<div style="margin-bottom:10px;"><strong style="color:#e0e0e0;font-size:12px;">Timeline :</strong>';
    html += '<div style="color:#aaa;font-size:11px;">' + offer.timeline + '</div></div>';

    // Next steps
    html += '<div><strong style="color:#e0e0e0;font-size:12px;">Prochaines étapes :</strong>';
    offer.nextSteps.forEach(function (ns, i) {
      html += '<div style="color:#aaa;font-size:11px;padding:2px 0;">' + (i + 1) + '. ' + ns + '</div>';
    });
    html += '</div>';

    html += '<div style="text-align:center;margin-top:12px;padding-top:10px;border-top:1px solid #333;">';
    html += '<span style="color:#888;font-size:10px;">Pirabel Labs | ' + CONFIG.contactEmail + ' | ' + CONFIG.contactWhatsApp + '</span></div>';
    html += '</div>';
    return html;
  }

  // =====================================================================
  //  SECTION 15 — MAIN CONVERSATION ENGINE — backed by /api/chat/lea
  //  Léa now runs on the server (Claude API + persona consultante).
  //  This function only handles local STATE updates and forwards the
  //  conversation to the backend, then renders the reply.
  // =====================================================================
  function processUserMessage(input) {
    STATE.messageCount++;
    STATE.userMessageCount++;
    STATE.conversationHistory.push({ role: 'user', text: input, ts: Date.now() });
    STATE.history.push({ role: 'user', text: input, ts: Date.now() });

    // Detect if the user refuses to share email — never re-ask after that.
    if (STATE.waitingForEmail && !detectEmail(input)) {
      var lower = (input || '').toLowerCase();
      if (/\b(non|pas envie|préfère pas|prefere pas|pas maintenant|plus tard|pas mon email|je ne veux pas|pas d['’]email|pas de mail|je prefere pas|je préfère pas)\b/.test(lower)) {
        STATE.emailRefused = true;
        STATE.waitingForEmail = false;
      }
    }
    // Mark email as asked if we were expecting it
    if (STATE.waitingForEmail) STATE.emailAsked = true;

    // Local extraction (keeps STATE.visitor / qualification in sync for UI + lead capture)
    extractAllInfo(input);

    // Léa vouvoie toujours — pas de bascule en tutoiement
    STATE.tutoyement = false;

    // Determine current phase (kept for tracking + lead summary)
    STATE.phase = determinePhase();

    // Build short conversation history for the API (last 16 turns max)
    var apiHistory = STATE.conversationHistory.slice(-16).map(function (m) {
      return {
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: stripHtml(m.text || '').slice(0, 2000)
      };
    });

    // Snapshot of what we already know about the visitor — persisted so Léa
    // never has to ask twice for the same thing.
    var visitorPayload = {
      name: STATE.visitor.name || '',
      company: STATE.visitor.company || '',
      sector: STATE.visitor.sector || '',
      email: STATE.visitor.email || '',
      phone: STATE.visitor.phone || '',
      website: STATE.visitor.website || ''
    };
    var qualPayload = {
      budget: STATE.qualification.budget || '',
      timeline: STATE.qualification.timeline || '',
      decisionMaker: STATE.qualification.decisionMaker === true,
      problems: (STATE.problems || []).slice(0, 10),
      interests: (STATE.interests || []).slice(0, 10),
      topicsDiscussed: (STATE.topicsDiscussed || []).slice(0, 10),
      emailAsked: STATE.emailAsked === true,
      emailRefused: STATE.emailRefused === true
    };

    // Show typing indicator immediately for better UX
    showTyping();

    fetch('/api/chat/lea', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: conversationId,
        history: apiHistory,
        visitor: visitorPayload,
        qualification: qualPayload
      })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        if (!data || !data.reply) {
          finishBotTurn(["Je rencontre une difficulté technique. Pourriez-vous reformuler votre question, ou nous écrire à <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a> ?"], [], false);
          return;
        }

        // Trigger closing flow when we have a hot lead and enough turns
        var closingDue = (
          STATE.qualification.score >= 55 &&
          STATE.userMessageCount >= 5 &&
          !STATE.closingAttempted &&
          (STATE.visitor.email || STATE.visitor.phone)
        );

        var buttons = Array.isArray(data.buttons) ? data.buttons : [];

        // Auto-end conversation if Léa has captured enough and we're past 5 turns
        if (closingDue) {
          STATE.closingAttempted = true;
          triggerEndOfConversation();
        }

        finishBotTurn([data.reply], buttons, false);
      })
      .catch(function (err) {
        hideTyping();
        finishBotTurn(["Désolée, je n'arrive pas à vous répondre pour le moment. Vous pouvez nous joindre directement à <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a> et nous vous reviendrons sous 24 heures."], [], false);
      });
  }

  // Strip HTML tags so we never send markup to the LLM
  function stripHtml(s) {
    if (!s) return '';
    return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }


  function finishBotTurn(responses, buttons, hadQuestion) {
    // Queue all responses with delays
    responses.forEach(function (resp, i) {
      var delay = i === 0 ? getTypingDelay(resp) : CONFIG.messageQueueGap + getTypingDelay(resp);
      queueBotMessage(resp, delay, i === responses.length - 1 ? buttons : null, hadQuestion);
    });
  }

  // =====================================================================
  //  SECTION 16 — MESSAGE QUEUE SYSTEM
  // =====================================================================
  function queueBotMessage(html, delay, buttons, hadQuestion) {
    messageQueue.push({
      html: html,
      delay: delay,
      buttons: buttons,
      hadQuestion: hadQuestion || false
    });
    if (!isProcessingQueue) processQueue();
  }

  function processQueue() {
    if (messageQueue.length === 0) {
      isProcessingQueue = false;
      return;
    }
    isProcessingQueue = true;
    var msg = messageQueue.shift();

    showTyping();
    setTimeout(function () {
      hideTyping();
      addBotMessage(msg.html);
      STATE.conversationHistory.push({ role: 'bot', text: msg.html, ts: Date.now() });
      STATE.history.push({ role: 'bot', text: msg.html, ts: Date.now(), hadQuestion: msg.hadQuestion });
      STATE.lastBotMessageTime = Date.now();

      if (msg.buttons && msg.buttons.length > 0) {
        addQuickButtons(msg.buttons);
      }

      // Save to server
      saveMsg(conversationId, STATE.visitor.name, STATE.visitor.email, msg.html, 'admin');

      // Track event
      trackEvent('chat_message', { sender: 'bot', phase: STATE.phase });

      // Continue queue
      if (messageQueue.length > 0) {
        setTimeout(processQueue, CONFIG.messageQueueGap);
      } else {
        isProcessingQueue = false;
      }
    }, msg.delay);
  }

  // =====================================================================
  //  SECTION 17 — API INTEGRATION
  // =====================================================================
  function saveMsg(cid, name, email, content, sender) {
    if (!cid) return;
    try {
      fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: cid,
          visitorName: name,
          visitorEmail: email,
          content: content,
          sender: sender
        })
      }).catch(function () { });
    } catch (e) { }
  }

  function triggerEndOfConversation() {
    if (STATE.summaryGenerated) return;
    STATE.summaryGenerated = true;
    STATE.phase = PHASES.POST;

    var summary = buildSummary();

    try {
      fetch('/api/chat/lead-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary)
      }).catch(function () { });
    } catch (e) { }

    if (STATE.visitor.email) {
      try {
        fetch('/api/chat/send-followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: conversationId,
            name: STATE.visitor.name,
            email: STATE.visitor.email,
            interests: STATE.interests,
            problems: STATE.problems,
            sector: STATE.visitor.sector,
            budget: STATE.qualification.budget,
            offer: STATE.offer
          })
        }).catch(function () { });
      } catch (e) { }
    }

    trackEvent('chat_lead_captured', {
      score: STATE.qualification.score,
      level: STATE.qualification.level,
      hasEmail: !!STATE.visitor.email,
      hasPhone: !!STATE.visitor.phone,
      messageCount: STATE.messageCount
    });
  }

  function sendOffer() {
    if (!STATE.offer || !STATE.visitor.email) return;
    try {
      fetch('/api/chat/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationId,
          offer: STATE.offer,
          visitor: STATE.visitor,
          qualification: STATE.qualification,
          problems: STATE.problems,
          interests: STATE.interests
        })
      }).catch(function () { });
    } catch (e) { }
  }

  function buildSummary() {
    var q = STATE.qualification;
    return {
      conversationId: conversationId,
      visitor: Object.assign({}, STATE.visitor),
      qualification: {
        score: q.score,
        level: q.level,
        budget: q.budget,
        timeline: q.timeline,
        decisionMaker: q.decisionMaker,
        urgency: q.urgency
      },
      problems: STATE.problems.slice(),
      interests: STATE.interests.slice(),
      topicsDiscussed: STATE.topicsDiscussed.slice(),
      conversationSummary: buildTextSummary(),
      messageCount: STATE.messageCount,
      userMessageCount: STATE.userMessageCount,
      duration: STATE.history.length > 1
        ? Math.round((STATE.history[STATE.history.length - 1].ts - STATE.history[0].ts) / 60000) + ' min'
        : '< 1 min',
      offer: STATE.offer,
      objectionCount: STATE.objectionCount,
      timestamp: new Date().toISOString()
    };
  }

  function buildTextSummary() {
    var v = STATE.visitor;
    var q = STATE.qualification;
    var lines = [];
    lines.push('Visiteur: ' + (v.name || 'Inconnu') + (v.email ? ' (' + v.email + ')' : '') + (v.phone ? ' | Tel: ' + v.phone : ''));
    if (v.company) lines.push('Entreprise: ' + v.company);
    if (v.sector) lines.push('Secteur: ' + v.sector);
    if (v.website) lines.push('Site: ' + v.website);
    if (STATE.problems.length) lines.push('Problèmes: ' + STATE.problems.join(', '));
    if (STATE.interests.length) lines.push('Intérêts: ' + STATE.interests.join(', '));
    if (q.budget) lines.push('Budget: ' + q.budget);
    if (q.timeline) lines.push('Délai: ' + q.timeline);
    if (q.decisionMaker !== null) lines.push('Décideur: ' + (q.decisionMaker ? 'Oui' : 'Non'));
    lines.push('Score: ' + q.score + '/100 (' + q.level.toUpperCase() + ')');
    lines.push('Messages: ' + STATE.messageCount + ' (' + STATE.userMessageCount + ' du visiteur)');
    lines.push('Objections gérées: ' + STATE.objectionCount);
    lines.push('Services discutés: ' + (STATE.topicsDiscussed.length > 0 ? STATE.topicsDiscussed.join(', ') : 'aucun'));
    return lines.join('\n');
  }

  function trackEvent(eventName, data) {
    if (typeof window.plTrack === 'function') {
      try { window.plTrack(eventName, data); } catch (e) { }
    }
  }

  // =====================================================================
  //  SECTION 18 — PAGE CONTEXT DETECTION
  // =====================================================================
  function getPageContext() {
    var p = (window.location.pathname + window.location.hash).toLowerCase();
    if (p.indexOf('seo') !== -1 || p.indexOf('referencement') !== -1) return 'seo';
    if (p.indexOf('site') !== -1 || p.indexOf('web') !== -1 || p.indexOf('création') !== -1) return 'web';
    if (p.indexOf('social') !== -1 || p.indexOf('community') !== -1) return 'social';
    if (p.indexOf('ads') !== -1 || p.indexOf('pub') !== -1 || p.indexOf('campagne') !== -1) return 'ads';
    if (p.indexOf('email') !== -1 || p.indexOf('crm') !== -1 || p.indexOf('newsletter') !== -1) return 'email';
    if (p.indexOf('ia') !== -1 || p.indexOf('auto') !== -1 || p.indexOf('chatbot') !== -1) return 'ia';
    if (p.indexOf('design') !== -1 || p.indexOf('brand') !== -1 || p.indexOf('logo') !== -1) return 'branding';
    if (p.indexOf('video') !== -1 || p.indexOf('motion') !== -1) return 'video';
    if (p.indexOf('funnel') !== -1 || p.indexOf('cro') !== -1 || p.indexOf('tunnel') !== -1) return 'funnel';
    if (p.indexOf('formation') !== -1) return 'formation';
    if (p.indexOf('consulting') !== -1 || p.indexOf('conseil') !== -1) return 'consulting';
    if (p.indexOf('services') !== -1) return 'services';
    if (p.indexOf('blog') !== -1 || p.indexOf('article') !== -1) return 'blog';
    if (p.indexOf('contact') !== -1) return 'contact';
    return null;
  }

  function getContextualGreeting() {
    var ctx = getPageContext();
    if (ctx && GREETINGS[ctx]) return pickUnused(GREETINGS[ctx], 'greet_' + ctx);
    return pickUnused(GREETINGS.default, 'greet_default');
  }

  function getContextualButtons() {
    var ctx = getPageContext();
    if (isEn) {
      switch (ctx) {
        case 'seo': return ['Free SEO Audit', 'SEO Pricing?', 'I have a project'];
        case 'web': return ['How much for a site?', 'Which CMS to choose?', 'I have a project'];
        case 'social': return ['Community management price?', 'Which platform?', 'I have a project'];
        case 'ads': return ['Minimum budget?', 'Google vs Meta?', 'I have a project'];
        case 'email': return ['CRM setup', 'Emailing strategy', 'I have a project'];
        case 'ia': return ['Chatbot for my site', 'Automate my tasks', 'I have a project'];
        case 'branding': return ['Logo price?', 'Brand book', 'I have a project'];
        case 'video': return ['Corporate video', 'Social content', 'I have a project'];
        case 'funnel': return ['Landing page', 'Sales funnel', 'I have a project'];
        case 'formation': return ['Available training?', 'Pricing', 'I have a project'];
        case 'consulting': return ['Digital audit', 'Strategy', 'I have a project'];
        case 'services': return ['Which service fits me?', 'Pricing', 'I have a project'];
        case 'contact': return ['Book a Call', 'WhatsApp', 'Quick Question'];
        default: return ['Discover services', 'I have a project', 'Pricing'];
      }
    }
    switch (ctx) {
      case 'seo': return ['Audit SEO gratuit', 'Tarif SEO ?', 'J\'ai un projet'];
      case 'web': return ['Combien coûte un site ?', 'Quel CMS choisir ?', 'J\'ai un projet'];
      case 'social': return ['Tarif community management ?', 'Quelle plateforme choisir ?', 'J\'ai un projet'];
      case 'ads': return ['Budget minimum ?', 'Google vs Meta ?', 'J\'ai un projet'];
      case 'email': return ['Brevo ou Mailchimp ?', 'Setup CRM', 'J\'ai un projet'];
      case 'ia': return ['Chatbot pour mon site', 'Automatiser mes taches', 'J\'ai un projet'];
      case 'branding': return ['Tarif logo ?', 'Charte graphique', 'J\'ai un projet'];
      case 'video': return ['Vidéo corporate', 'Contenu social', 'J\'ai un projet'];
      case 'funnel': return ['Landing page', 'Tunnel de vente', 'J\'ai un projet'];
      case 'formation': return ['Formations disponibles ?', 'Tarifs', 'J\'ai un projet'];
      case 'consulting': return ['Audit digital', 'Stratégie', 'J\'ai un projet'];
      case 'services': return ['Quel service me convient ?', 'Tarifs', 'J\'ai un projet'];
      case 'contact': return ['Prendre RDV', 'WhatsApp', 'Question rapide'];
      default: return ['Découvrir les services', 'J\'ai un projet', 'Tarifs'];
    }
  }

  // =====================================================================
  //  SECTION 19 — INJECT CSS (Dark Theme)
  // =====================================================================
  var css = '\n'
    // -- Chat Button --
    + '#pb-chat-btn{position:fixed;bottom:24px;right:100px;z-index:9999;width:62px;height:62px;border-radius:50%;'
    + 'background:' + CONFIG.accentGradient + ';border:none;cursor:pointer;'
    + 'box-shadow:0 4px 24px rgba(255,85,0,0.45);display:flex;align-items:center;justify-content:center;'
    + 'transition:transform .3s ease,box-shadow .3s ease;}\n'
    + '#pb-chat-btn:hover{transform:scale(1.1);box-shadow:0 6px 32px rgba(255,85,0,0.6);}\n'
    + '#pb-chat-btn svg{width:28px;height:28px;fill:#fff;}\n'
    + '#pb-chat-btn .pb-badge{position:absolute;top:-4px;right:-4px;background:#25D366;color:#fff;font-size:11px;'
    + 'font-weight:700;min-width:22px;height:22px;border-radius:11px;display:none;align-items:center;'
    + 'justify-content:center;font-family:"Inter",system-ui,sans-serif;border:2px solid #0e0e0e;}\n'
    + '#pb-chat-btn.has-badge .pb-badge{display:flex;}\n'
    + '#pb-chat-btn .pb-pulse{position:absolute;width:100%;height:100%;border-radius:50%;'
    + 'background:' + CONFIG.accentColor + ';animation:pbPulse 2s infinite;opacity:0;pointer-events:none;}\n'
    + '@keyframes pbPulse{0%{transform:scale(1);opacity:0.4;}100%{transform:scale(1.6);opacity:0;}}\n'

    // -- Widget Container --
    + '#pb-chat-widget{position:fixed;bottom:100px;right:24px;z-index:9998;width:400px;max-width:calc(100vw - 32px);'
    + 'height:580px;max-height:calc(100vh - 130px);background:#0e0e0e;border-radius:20px;'
    + 'box-shadow:0 12px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.06);display:none;flex-direction:column;'
    + 'overflow:hidden;font-family:"Inter",system-ui,-apple-system,sans-serif;}\n'
    + '#pb-chat-widget.open{display:flex;animation:pbSlideUp .35s cubic-bezier(0.16,1,0.3,1);}\n'
    + '@keyframes pbSlideUp{from{opacity:0;transform:translateY(24px) scale(0.96);}to{opacity:1;transform:translateY(0) scale(1);}}\n'

    // -- Header --
    + '.pb-chat-head{background:' + CONFIG.accentGradient + ';padding:18px 20px;display:flex;align-items:center;gap:12px;'
    + 'color:#fff;position:relative;}\n'
    + '.pb-chat-avatar{width:42px;height:42px;background:rgba(255,255,255,0.2);border-radius:50%;'
    + 'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;'
    + 'backdrop-filter:blur(4px);flex-shrink:0;}\n'
    + '.pb-chat-avatar .pb-status{position:absolute;bottom:0;right:0;width:12px;height:12px;'
    + 'background:#25D366;border-radius:50%;border:2px solid #FF5500;}\n'
    + '.pb-chat-head-info{flex:1;}\n'
    + '.pb-chat-head-info h4{font-size:15px;font-weight:700;margin:0;letter-spacing:-0.2px;}\n'
    + '.pb-chat-head-info p{font-size:12px;opacity:0.85;margin:2px 0 0;}\n'
    + '.pb-chat-close{background:none;border:none;color:#fff;cursor:pointer;font-size:24px;'
    + 'line-height:1;opacity:0.7;transition:opacity .2s,transform .2s;padding:4px;}\n'
    + '.pb-chat-close:hover{opacity:1;transform:rotate(90deg);}\n'

    // -- Body --
    + '.pb-chat-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:6px;'
    + 'background:#0e0e0e;scroll-behavior:smooth;}\n'
    + '.pb-chat-body::-webkit-scrollbar{width:5px;}\n'
    + '.pb-chat-body::-webkit-scrollbar-track{background:transparent;}\n'
    + '.pb-chat-body::-webkit-scrollbar-thumb{background:#333;border-radius:3px;}\n'

    // -- Messages --
    + '.pb-msg-wrap{display:flex;flex-direction:column;max-width:82%;animation:pbMsgIn .3s ease;}\n'
    + '.pb-msg-wrap.bot{align-self:flex-start;}\n'
    + '.pb-msg-wrap.user{align-self:flex-end;}\n'
    + '@keyframes pbMsgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}\n'
    + '.pb-msg{padding:11px 15px;font-size:13.5px;line-height:1.65;word-wrap:break-word;}\n'
    + '.pb-msg-wrap.bot .pb-msg{background:#1a1a1a;color:#e0e0e0;border-radius:4px 16px 16px 16px;'
    + 'border:1px solid #2a2a2a;}\n'
    + '.pb-msg-wrap.user .pb-msg{background:' + CONFIG.accentGradient + ';color:#fff;'
    + 'border-radius:16px 16px 4px 16px;}\n'
    + '.pb-msg a{color:' + CONFIG.accentColor + ';text-decoration:none;font-weight:500;border-bottom:1px solid transparent;'
    + 'transition:border-color .2s;}\n'
    + '.pb-msg a:hover{border-bottom-color:' + CONFIG.accentColor + ';}\n'
    + '.pb-msg-wrap.user .pb-msg a{color:#fff;}\n'
    + '.pb-msg-time{font-size:10px;color:#555;margin-top:3px;padding:0 4px;}\n'
    + '.pb-msg-wrap.user .pb-msg-time{text-align:right;}\n'

    // -- Bot label --
    + '.pb-bot-label{font-size:11px;color:#888;margin-bottom:2px;padding-left:4px;font-weight:500;}\n'

    // -- Typing indicator --
    + '.pb-typing{align-self:flex-start;padding:12px 16px;background:#1a1a1a;border:1px solid #2a2a2a;'
    + 'border-radius:4px 16px 16px 16px;display:none;gap:5px;align-items:center;animation:pbMsgIn .3s ease;}\n'
    + '.pb-typing.show{display:flex;}\n'
    + '.pb-typing-label{font-size:11px;color:#888;margin-right:4px;}\n'
    + '.pb-typing span{width:7px;height:7px;background:' + CONFIG.accentColor + ';border-radius:50%;animation:pbDot 1.3s infinite;}\n'
    + '.pb-typing span:nth-child(2){animation-delay:0.2s;}\n'
    + '.pb-typing span:nth-child(3){animation-delay:0.4s;}\n'
    + '@keyframes pbDot{0%,80%,100%{opacity:0.25;transform:scale(0.7);}40%{opacity:1;transform:scale(1.1);}}\n'

    // -- Input area --
    + '.pb-chat-input{display:flex;gap:8px;padding:14px 16px;border-top:1px solid #1f1f1f;background:#0e0e0e;}\n'
    + '.pb-chat-input input{flex:1;border:1px solid #2a2a2a;border-radius:24px;padding:11px 18px;'
    + 'font-size:13.5px;font-family:"Inter",system-ui,sans-serif;outline:none;transition:border-color .2s;'
    + 'background:#141414;color:#e0e0e0;}\n'
    + '.pb-chat-input input::placeholder{color:#666;}\n'
    + '.pb-chat-input input:focus{border-color:' + CONFIG.accentColor + ';}\n'
    + '.pb-chat-input button{width:42px;height:42px;border-radius:50%;background:' + CONFIG.accentGradient + ';'
    + 'border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;'
    + 'transition:transform .2s,box-shadow .2s;flex-shrink:0;}\n'
    + '.pb-chat-input button:hover{transform:scale(1.05);box-shadow:0 2px 12px rgba(255,85,0,0.4);}\n'
    + '.pb-chat-input button svg{width:18px;height:18px;fill:#fff;}\n'

    // -- Intro form --
    + '.pb-intro-form{padding:24px 20px;text-align:center;}\n'
    + '.pb-intro-form .pb-lea-avatar{width:60px;height:60px;background:' + CONFIG.accentGradient + ';'
    + 'border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;'
    + 'font-size:22px;color:#fff;margin:0 auto 12px;}\n'
    + '.pb-intro-form h4{font-size:16px;font-weight:700;color:#e0e0e0;margin-bottom:4px;}\n'
    + '.pb-intro-form p{font-size:12.5px;color:#888;margin-bottom:18px;line-height:1.6;}\n'
    + '.pb-intro-form input{width:100%;border:1px solid #2a2a2a;border-radius:10px;padding:11px 16px;'
    + 'font-size:13px;font-family:"Inter",system-ui,sans-serif;margin-bottom:10px;outline:none;'
    + 'box-sizing:border-box;transition:border-color .2s;background:#141414;color:#e0e0e0;}\n'
    + '.pb-intro-form input::placeholder{color:#666;}\n'
    + '.pb-intro-form input:focus{border-color:' + CONFIG.accentColor + ';}\n'
    + '.pb-intro-form button{width:100%;padding:12px;border:none;border-radius:10px;'
    + 'background:' + CONFIG.accentGradient + ';color:#fff;font-weight:600;font-size:14px;'
    + 'cursor:pointer;transition:transform .2s,box-shadow .2s;font-family:"Inter",system-ui,sans-serif;}\n'
    + '.pb-intro-form button:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(255,85,0,0.4);}\n'
    + '.pb-intro-form .pb-skip{display:block;margin-top:10px;font-size:12px;color:#666;cursor:pointer;'
    + 'text-decoration:none;transition:color .2s;}\n'
    + '.pb-intro-form .pb-skip:hover{color:' + CONFIG.accentColor + ';}\n'

    // -- Quick buttons --
    + '.pb-quick-btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;padding-left:4px;animation:pbMsgIn .3s ease;}\n'
    + '.pb-quick-btn{background:#1a1a1a;border:1px solid #333;border-radius:20px;padding:7px 14px;'
    + 'font-size:12px;color:' + CONFIG.accentColor + ';cursor:pointer;transition:all .2s;'
    + 'font-family:"Inter",system-ui,sans-serif;white-space:nowrap;}\n'
    + '.pb-quick-btn:hover{background:' + CONFIG.accentColor + ';color:#fff;border-color:' + CONFIG.accentColor + ';'
    + 'transform:translateY(-1px);}\n'

    // -- Powered by --
    + '.pb-powered{text-align:center;padding:6px;font-size:10px;color:#444;background:#0a0a0a;'
    + 'border-top:1px solid #1a1a1a;}\n'
    + '.pb-powered a{color:#666;text-decoration:none;}\n'
    + '.pb-powered a:hover{color:' + CONFIG.accentColor + ';}\n'

    // -- Mobile responsive --
    + '@media(max-width:480px){#pb-chat-widget{bottom:0;right:0;width:100%;max-width:100%;'
    + 'height:100vh;max-height:100vh;border-radius:0;}'
    + '#pb-chat-btn{bottom:16px;right:16px;width:56px;height:56px;}'
    + '.pb-msg{font-size:14px;}}\n';

  var styleEl = document.createElement('style');
  styleEl.id = 'pb-chatbot-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // =====================================================================
  //  SECTION 20 — INJECT HTML
  // =====================================================================
  var widgetContainer = document.createElement('div');
  widgetContainer.id = 'pb-chatbot-root';
  widgetContainer.innerHTML = ''
    + '<button id="pb-chat-btn" aria-label="Discuter avec Lea">'
    + '<span class="pb-pulse"></span>'
    + '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>'
    + '<span class="pb-badge">1</span>'
    + '</button>'
    + '<div id="pb-chat-widget">'
    + '<div class="pb-chat-head">'
    + '<div class="pb-chat-avatar"><span>L</span><span class="pb-status"></span></div>'
    + '<div class="pb-chat-head-info">'
    + '<h4>Lea - Pirabel Labs</h4>'
    + '<p>Consultante digitale &bull; En ligne</p>'
    + '</div>'
    + '<button class="pb-chat-close" aria-label="Fermer">&times;</button>'
    + '</div>'
    + '<div class="pb-chat-body" id="pb-chat-body">'
    + '<div id="pb-intro" class="pb-intro-form">'
    + '<div class="pb-lea-avatar">L</div>'
    + '<h4>' + (isEn ? 'Hi! I\'m Lea' : 'Salut ! Moi c\'est Lea') + ' &#128075;</h4>'
    + '<p>' + (isEn ? 'Digital consultant at Pirabel Labs.<br>I help you find the best solution to boost your business online.' : 'Consultante digitale chez Pirabel Labs.<br>Je t\'aide à trouver la meilleure solution pour booster ton business en ligne.') + '</p>'
    + '<input type="text" id="pb-name" placeholder="' + (isEn ? 'Your first name *' : 'Ton prenom *') + '" autocomplete="given-name" />'
    + '<input type="email" id="pb-email" placeholder="' + (isEn ? 'Your email (optional)' : 'Ton email (optionnel)') + '" autocomplete="email" />'
    + '<button id="pb-start-btn">' + (isEn ? 'Chat with Lea' : 'Discuter avec Lea') + '</button>'
    + '<a class="pb-skip" id="pb-skip-btn">' + (isEn ? 'Continue without intro' : 'Continuer sans me présenter') + '</a>'
    + '</div>'
    + '</div>'
    + '<div class="pb-chat-input" id="pb-input-area" style="display:none;">'
    + '<input type="text" id="pb-msg-input" placeholder="' + (isEn ? 'Write your message...' : 'Écris ton message...') + '" autocomplete="off" />'
    + '<button id="pb-send-btn" aria-label="Envoyer"><svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>'
    + '</div>'
    + '<div class="pb-powered">Propulsé par <a href="https://pirabellabs.com" target="_blank">Pirabel Labs</a></div>'
    + '</div>';
  document.body.appendChild(widgetContainer);

  // =====================================================================
  //  SECTION 21 — DOM REFERENCES
  // =====================================================================
  var chatBtn = document.getElementById('pb-chat-btn');
  var chatWidget = document.getElementById('pb-chat-widget');
  var chatBody = document.getElementById('pb-chat-body');
  var introForm = document.getElementById('pb-intro');
  var inputArea = document.getElementById('pb-input-area');
  var msgInput = document.getElementById('pb-msg-input');
  var sendBtn = document.getElementById('pb-send-btn');
  var startBtn = document.getElementById('pb-start-btn');
  var skipBtn = document.getElementById('pb-skip-btn');
  var closeBtn = chatWidget.querySelector('.pb-chat-close');

  // =====================================================================
  //  SECTION 22 — RESTORE SESSION
  // =====================================================================
  var storedName = localStorage.getItem('pb_chat_name') || '';
  var storedEmail = localStorage.getItem('pb_chat_email') || '';

  if (storedName) STATE.visitor.name = storedName;
  if (storedEmail) STATE.visitor.email = storedEmail;

  if (storedName && conversationId) {
    introForm.style.display = 'none';
    inputArea.style.display = 'flex';
    var hour = new Date().getHours();
    var timeGreet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Coucou' : 'Bonsoir';
    var returnGreeting = replaceName(pickUnused(GREETINGS.returning, 'greet_return'));
    STATE.hasGreeted = true;
    queueBotMessage(returnGreeting || (timeGreet + ' ' + storedName + ' ! Contente de te revoir. On reprend ?'), 500, getContextualButtons(), false);
  }

  // =====================================================================
  //  SECTION 23 — EVENT HANDLERS
  // =====================================================================

  // -- Toggle widget --
  chatBtn.addEventListener('click', function () {
    isOpen = !isOpen;
    chatWidget.classList.toggle('open', isOpen);
    chatBtn.classList.remove('has-badge');
    if (isOpen) {
      trackEvent('chat_open', { page: window.location.pathname });
      if (storedName && conversationId) {
        setTimeout(function () { msgInput.focus(); }, 100);
      }
    }
  });

  closeBtn.addEventListener('click', function () {
    isOpen = false;
    chatWidget.classList.remove('open');
    if (STATE.userMessageCount >= 3) triggerEndOfConversation();
  });

  // -- Start conversation --
  function startConversation(name, email) {
    if (name) {
      STATE.visitor.name = name;
      localStorage.setItem('pb_chat_name', name);
    }
    if (email) {
      STATE.visitor.email = email;
      localStorage.setItem('pb_chat_email', email);
    }

    conversationId = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
    localStorage.setItem('pb_chat_id', conversationId);

    introForm.style.display = 'none';
    inputArea.style.display = 'flex';

    var greeting = getContextualGreeting();
    STATE.hasGreeted = true;

    queueBotMessage(replaceName(greeting), 600, getContextualButtons(), false);

    saveMsg(conversationId, STATE.visitor.name, STATE.visitor.email, greeting, 'admin');
    trackEvent('chat_open', { page: window.location.pathname, hasName: !!name });

    setTimeout(function () { msgInput.focus(); }, 400);
  }

  startBtn.addEventListener('click', function () {
    var nameVal = document.getElementById('pb-name').value.trim();
    var emailVal = document.getElementById('pb-email').value.trim();
    if (!nameVal) {
      document.getElementById('pb-name').style.borderColor = '#ff3333';
      document.getElementById('pb-name').focus();
      return;
    }
    startConversation(nameVal, emailVal);
  });

  // Allow Enter in name/email fields
  document.getElementById('pb-name').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') startBtn.click();
  });
  document.getElementById('pb-email').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') startBtn.click();
  });

  // -- Skip intro --
  skipBtn.addEventListener('click', function () {
    startConversation('', '');
    STATE.waitingForName = true;
  });

  // -- Send message --
  function sendMessage() {
    var text = msgInput.value.trim();
    if (!text || isProcessingQueue) return;
    msgInput.value = '';

    addUserMessage(text);
    saveMsg(conversationId, STATE.visitor.name, STATE.visitor.email, text, 'visitor');
    trackEvent('chat_message', { sender: 'user', phase: STATE.phase, length: text.length });

    processUserMessage(text);
  }

  sendBtn.addEventListener('click', sendMessage);
  msgInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // -- Page unload --
  window.addEventListener('beforeunload', function () {
    if (STATE.userMessageCount >= 3) triggerEndOfConversation();
  });

  // -- Auto-open after delay (only on first visit) --
  if (!localStorage.getItem('pb_chat_opened')) {
    setTimeout(function () {
      if (!isOpen) {
        chatBtn.classList.add('has-badge');
      }
    }, CONFIG.autoOpenDelay);
  }

  // =====================================================================
  //  SECTION 24 — UI HELPER FUNCTIONS
  // =====================================================================
  function addBotMessage(html) {
    var wrap = document.createElement('div');
    wrap.className = 'pb-msg-wrap bot';

    var label = document.createElement('div');
    label.className = 'pb-bot-label';
    label.textContent = CONFIG.botName;

    var msg = document.createElement('div');
    msg.className = 'pb-msg';
    msg.innerHTML = html;

    var time = document.createElement('div');
    time.className = 'pb-msg-time';
    time.textContent = formatTimestamp();

    wrap.appendChild(label);
    wrap.appendChild(msg);
    wrap.appendChild(time);
    chatBody.appendChild(wrap);
    scrollBottom();

    // Badge notification if minimized
    if (!isOpen) {
      chatBtn.classList.add('has-badge');
    }
  }

  function addUserMessage(text) {
    var wrap = document.createElement('div');
    wrap.className = 'pb-msg-wrap user';

    var msg = document.createElement('div');
    msg.className = 'pb-msg';
    msg.textContent = text;

    var time = document.createElement('div');
    time.className = 'pb-msg-time';
    time.textContent = formatTimestamp();

    wrap.appendChild(msg);
    wrap.appendChild(time);
    chatBody.appendChild(wrap);
    scrollBottom();
  }

  function addQuickButtons(buttons) {
    if (!buttons || buttons.length === 0) return;
    var wrap = document.createElement('div');
    wrap.className = 'pb-quick-btns';
    buttons.forEach(function (label) {
      var btn = document.createElement('button');
      btn.className = 'pb-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', function () {
        // Remove all quick button groups
        var allBtns = chatBody.querySelectorAll('.pb-quick-btns');
        allBtns.forEach(function (el) { el.remove(); });
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
      el.innerHTML = '<span class="pb-typing-label">Lea écrit</span><span></span><span></span><span></span>';
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
    requestAnimationFrame(function () {
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  // =====================================================================
  //  SECTION 25 — SPECIAL BUTTON HANDLERS
  // =====================================================================
  // These handle clicks on specific quick-reply buttons that need custom logic

  // The processUserMessage function already handles all button text as regular
  // input, but we intercept some patterns for direct actions.

  // When user clicks "Planifier un appel" or "Oui, je veux un appel"
  // This is handled in the main intent engine naturally.

  // =====================================================================
  //  SECTION 26 — SOUND NOTIFICATION (optional)
  // =====================================================================
  // Minimal notification beep using Web Audio API
  function playNotificationSound() {
    if (!soundEnabled) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
  }

  // =====================================================================
  //  SECTION 27 — PUBLIC API (for external integrations)
  // =====================================================================
  window.PirabelChat = {
    open: function () {
      isOpen = true;
      chatWidget.classList.add('open');
      chatBtn.classList.remove('has-badge');
    },
    close: function () {
      isOpen = false;
      chatWidget.classList.remove('open');
    },
    toggle: function () {
      isOpen ? this.close() : this.open();
    },
    sendMessage: function (text) {
      if (!text) return;
      msgInput.value = text;
      sendMessage();
    },
    getState: function () {
      return {
        phase: STATE.phase,
        visitor: Object.assign({}, STATE.visitor),
        qualification: Object.assign({}, STATE.qualification),
        problems: STATE.problems.slice(),
        interests: STATE.interests.slice(),
        messageCount: STATE.messageCount
      };
    },
    getOffer: function () {
      return STATE.offer ? Object.assign({}, STATE.offer) : null;
    },
    isOpen: function () { return isOpen; },
    setSoundEnabled: function (enabled) { soundEnabled = !!enabled; }
  };

  // =====================================================================
  //  SECTION 28 — UTILITY FUNCTIONS
  // =====================================================================
  function pickUnused(arr, key) {
    if (!arr || arr.length === 0) return null;
    if (!STATE.usedResponses[key]) STATE.usedResponses[key] = [];
    var unused = arr.filter(function (r) { return STATE.usedResponses[key].indexOf(r) === -1; });
    if (unused.length === 0) {
      STATE.usedResponses[key] = [];
      unused = arr;
    }
    var res = unused[Math.floor(Math.random() * unused.length)];
    STATE.usedResponses[key].push(res);
    return res;
  }

  function replaceName(text) {
    if (!text) return '';
    return text.replace(/{name}/g, STATE.visitor.name || (isEn ? 'friend' : 'mon ami'));
  }

  function formatTimestamp() {
    var now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  function normalize(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function stripHtml(html) {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function saveMsg(convId, name, email, text, role) {
    try {
      fetch('/api/chat/save-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: convId,
          name: name,
          email: email,
          text: text,
          role: role,
          timestamp: new Date().toISOString()
        })
      }).catch(function () { });
    } catch (e) { }
  }

  // =====================================================================
  //  END OF CHATBOT
  // =====================================================================
})();
