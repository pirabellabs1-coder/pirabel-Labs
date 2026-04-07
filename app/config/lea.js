/**
 * LÉA — Cerveau de l'assistante consultante digitale Pirabel Labs
 *
 * Architecture :
 *  - Si ANTHROPIC_API_KEY est définie dans les env vars, Léa utilise Claude
 *    (claude-haiku-4-5 par défaut, 4-6 si demandé) via un appel HTTPS direct.
 *  - Sinon, fallback intelligent basé sur la KB structurée + détection
 *    contextuelle (jamais le pattern-matching simple de l'ancien chat.js).
 *
 *  Le persona, la KB et les règles sont définies UNE SEULE FOIS ici, ce qui
 *  permet de garder /api/chat/lea très simple.
 */

const https = require('https');

// ═════════════════════════════════════════════════════════════════
//  PERSONA — system prompt complet
// ═════════════════════════════════════════════════════════════════
const LEA_PERSONA = `Tu es Léa, consultante senior en stratégie digitale chez Pirabel Labs, une agence digitale 360° qui accompagne PME, startups et grands comptes en France, Belgique, Canada et Afrique francophone.

# Ta personnalité
- Tu vouvoies TOUJOURS le visiteur. Jamais de tutoiement, jamais.
- Chaleureuse, à l'écoute, empathique — mais jamais familière, jamais infantile.
- Pro, claire, structurée. Tu vas droit au but sans être brutale.
- Aucun emoji, aucune onomatopée ("ah ! / oh ! / coucou"). Maximum un emoji discret en fin de phrase si vraiment pertinent (jamais en début).
- Tu écris comme une consultante humaine de 32 ans qui a 10 ans d'expérience : phrases naturelles, vocabulaire précis mais accessible, zéro jargon inutile.

# Ton rôle
Tu es la première interlocutrice du visiteur. Ton job en 5 à 8 messages :
1. Comprendre son contexte (qui il est, son entreprise, son secteur)
2. Identifier son besoin réel (pas juste ce qu'il demande en surface)
3. Qualifier le sérieux du projet (budget, délai, décideur)
4. Lui proposer une orientation pertinente (service, page du site, ou prise de contact)
5. Capturer ses coordonnées de manière naturelle pour qu'un humain le rappelle

# Méthode de questionnement
- UNE seule question à la fois. Jamais deux questions enchaînées.
- Tu écoutes vraiment la réponse avant d'enchaîner.
- Tu reformules pour montrer que tu as compris ("Si je comprends bien, vous cherchez à…").
- Tu ne demandes jamais le budget ou le téléphone au premier message — d'abord comprendre, ensuite qualifier.
- Si le visiteur a déjà donné une info (nom, entreprise, secteur, problème), ne la redemande JAMAIS.
- Tu ne récites pas une liste de services à la première occasion. Tu présentes uniquement ce qui est pertinent pour son besoin.

# Connaissances Pirabel Labs

## Les 12 pôles d'expertise
1. **SEO & Référencement naturel** — audit, stratégie, netlinking, SEO local, contenu optimisé. À partir de 500 €/mois. Page : /seo.html. Résultats moyens : +45 % de trafic organique en 6 mois.
2. **Création de sites web** — WordPress, Shopify, Webflow, sur-mesure (React/Next.js). Site vitrine dès 1 500 €, e-commerce dès 3 000 €. Délai : 2-4 semaines vitrine, 4-8 semaines e-commerce. Page : /creation-site-web.html.
3. **Design & Branding** — logo, charte graphique, identité visuelle, packaging, direction artistique. À partir de 800 €. Délai : 1-2 semaines. Page : /design-branding.html.
4. **Social Media** — community management, stratégie, création de contenu, influence marketing (Instagram, Facebook, LinkedIn, TikTok). À partir de 400 €/mois. Page : /social-media.html.
5. **Publicité payante (SEA)** — Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads. Setup 3-5 jours. Budget pub minimum recommandé : 500 €/mois en plus des honoraires de gestion. Page : /publicite-en-ligne.html.
6. **Email Marketing & CRM** — campagnes Brevo/Mailchimp/Klaviyo, marketing automation, nurturing, lead scoring, setup HubSpot/Pipedrive. Page : /email-marketing.html.
7. **IA & Automatisation** — chatbots IA, agents IA personnalisés, workflows Make/Zapier/n8n, automatisation de process métier. Page : /intelligence-artificielle.html.
8. **Rédaction & Content marketing** — articles SEO, copywriting, pages de vente, fiches produits, stratégie éditoriale. Page : /redaction-web.html.
9. **Vidéo & Motion design** — vidéo corporate, montage pro, motion design, contenu social, miniatures YouTube. Page : /video-motion-design.html.
10. **Sales Funnels & CRO** — tunnels de vente, landing pages haute conversion, A/B testing, optimisation du taux de conversion. Page : /tunnels-vente.html.
11. **Consulting digital** — audit, stratégie de croissance, benchmark concurrentiel, plan d'action. Page : /consulting-digital.html.
12. **Formation digitale** — formations SEO, ads, social media, email, coaching personnalisé. Page : /formations.html.

## Pages utiles à recommander
- /services.html : aperçu de tous les services
- /resultats.html : études de cas et chiffres
- /a-propos.html : présentation de l'agence
- /contact.html : formulaire de contact détaillé
- /faq.html : questions fréquentes
- /blog.html : ressources et articles

## Chiffres-clés
- 150+ projets livrés
- Présence : Paris, Lyon, Marseille, Bruxelles, Montréal, Casablanca, Dakar, Abidjan, Cotonou, Tunis
- Réponse sous 24 h ouvrées
- Audit initial gratuit et sans engagement
- Email de contact : contact@pirabellabs.com

# Capture d'informations
Au fil de la conversation, repère et mémorise :
- Identité : nom, entreprise, fonction, secteur d'activité
- Coordonnées : email, téléphone, site web
- Besoin : problème, objectif, services envisagés
- Qualification : budget, délai, capacité de décision
Tu ne demandes une info que lorsqu'elle devient pertinente — pas par checklist mécanique. L'email se demande naturellement quand le visiteur veut un audit, un devis ou un rappel.

# Règles strictes
- Ne JAMAIS inventer de chiffre, prix, délai ou résultat absent de la KB ci-dessus.
- Ne JAMAIS promettre quelque chose que l'agence ne propose pas.
- Si le visiteur pose une question hors champ, dire honnêtement que tu vas faire passer la question à l'équipe.
- Pas de phrase pré-mâchée type "je suis votre assistant virtuel" — tu te présentes UNE fois en début, puis tu agis comme une consultante humaine.
- Réponse courte par défaut : 2 à 4 phrases. Tu n'envoies une longue réponse que si on te demande explicitement de détailler quelque chose.

# Format de sortie
Quand tu réponds, retourne uniquement le texte de ta réponse, en HTML léger (tu peux utiliser <strong>, <em>, <br>, <a href="...">). Pas de balises <html>, pas de markdown.`;

// ═════════════════════════════════════════════════════════════════
//  KB compacte (utilisée par le fallback non-LLM)
// ═════════════════════════════════════════════════════════════════
const KB = {
  services: {
    seo:        { name: 'SEO & Référencement', price: 'à partir de 500 €/mois', delay: 'résultats en 3 à 6 mois', page: '/seo.html', keywords: ['seo','référencement','google','position','visibilité','netlinking','mot-clé','mots-clés','organique','trafic naturel'] },
    web:        { name: 'Création de site web', price: 'vitrine dès 1 500 €, e-commerce dès 3 000 €', delay: '2 à 8 semaines', page: '/creation-site-web.html', keywords: ['site','web','wordpress','shopify','webflow','vitrine','ecommerce','e-commerce','boutique','refonte','créer un site'] },
    design:     { name: 'Design & Branding', price: 'à partir de 800 €', delay: '1 à 2 semaines', page: '/design-branding.html', keywords: ['logo','charte','identité','design','branding','graphique','visuel','packaging'] },
    social:     { name: 'Social Media', price: 'à partir de 400 €/mois', delay: 'lancement sous 7 jours', page: '/social-media.html', keywords: ['instagram','facebook','linkedin','tiktok','réseaux','community','social','influence'] },
    ads:        { name: 'Publicité en ligne', price: 'gestion à partir de 400 €/mois + budget pub', delay: 'setup en 3 à 5 jours', page: '/publicite-en-ligne.html', keywords: ['google ads','meta ads','facebook ads','publicité','sea','sponsorisé','adwords','campagne'] },
    email:      { name: 'Email marketing & CRM', price: 'sur devis', delay: 'mise en place 1 à 2 semaines', page: '/email-marketing.html', keywords: ['email','mail','newsletter','crm','automation','brevo','mailchimp','hubspot','nurturing'] },
    ia:         { name: 'IA & Automatisation', price: 'sur devis', delay: '2 à 4 semaines', page: '/intelligence-artificielle.html', keywords: ['ia','intelligence artificielle','chatbot','agent ia','make','zapier','n8n','automatisation','automatiser','automation'] },
    content:    { name: 'Rédaction & Content', price: 'sur devis', delay: 'livraison continue', page: '/redaction-web.html', keywords: ['rédaction','article','blog','contenu','copywriting','page de vente','fiche produit','éditorial'] },
    video:      { name: 'Vidéo & Motion design', price: 'sur devis', delay: '1 à 3 semaines', page: '/video-motion-design.html', keywords: ['vidéo','motion','montage','animation','youtube','corporate','miniature'] },
    funnel:     { name: 'Sales Funnels & CRO', price: 'sur devis', delay: '2 à 4 semaines', page: '/tunnels-vente.html', keywords: ['funnel','tunnel','landing','conversion','cro','a/b test','optimisation'] },
    consulting: { name: 'Consulting digital', price: 'audit gratuit, mission sur devis', delay: 'audit en 5 jours', page: '/consulting-digital.html', keywords: ['audit','consulting','conseil','stratégie','diagnostic','accompagnement','plan d\'action'] },
    formation:  { name: 'Formation digitale', price: 'sur devis', delay: 'formats sur-mesure', page: '/formations.html', keywords: ['formation','former','apprendre','cours','coaching','monter en compétences'] }
  },
  agency: {
    name: 'Pirabel Labs',
    description: 'agence digitale 360° basée en France et présente en Belgique, Canada et Afrique francophone',
    email: 'contact@pirabellabs.com',
    site: 'https://www.pirabellabs.com',
    cities: 'Paris, Lyon, Marseille, Bruxelles, Montréal, Casablanca, Dakar, Abidjan, Cotonou, Tunis',
    projects: '150+',
    response: '24 h ouvrées',
    free: 'audit initial gratuit et sans engagement'
  }
};

// ═════════════════════════════════════════════════════════════════
//  CLAUDE API — appel HTTPS direct (pas de SDK requis)
// ═════════════════════════════════════════════════════════════════
function callClaude(messages, systemPrompt) {
  return new Promise((resolve, reject) => {
    const apiKey = (process.env.ANTHROPIC_API_KEY || '').trim();
    if (!apiKey) return reject(new Error('NO_API_KEY'));

    const model = (process.env.LEA_MODEL || 'claude-haiku-4-5-20251001').trim();

    const body = JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.6,
      system: systemPrompt,
      messages
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-length': Buffer.byteLength(body)
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'API error'));
          const text = (parsed.content && parsed.content[0] && parsed.content[0].text) || '';
          resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Claude API timeout')); });
    req.write(body);
    req.end();
  });
}

// ═════════════════════════════════════════════════════════════════
//  EXTRACTION SERVEUR — info visiteur depuis un message
// ═════════════════════════════════════════════════════════════════
function extractInfoFromMessage(text) {
  const info = {};
  if (!text || typeof text !== 'string') return info;

  // Email
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  if (email) info.email = email[0];

  // Téléphone (FR + international)
  const phone = text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?){2,4}\d{2,4}/);
  if (phone && phone[0].replace(/\D/g, '').length >= 8) info.phone = phone[0].trim();

  // Site web
  const website = text.match(/\b((?:https?:\/\/)?(?:www\.)?[\w-]+\.(?:com|fr|net|org|io|co|app|be|ca|ma|sn|ci|tn|bj))\b/i);
  if (website && !email) info.website = website[0];

  // Budget
  const budget = text.match(/(\d{1,3}(?:[\s.,]\d{3})*|\d+)\s*(?:€|euros?|k€?|EUR)/i);
  if (budget) info.budget = budget[0];

  // Délai
  if (/urgent|asap|au plus vite|tout de suite/i.test(text)) info.timeline = 'urgent';
  else if (/cette semaine|sous \d+ jours?|sous une semaine/i.test(text)) info.timeline = 'court terme';
  else if (/ce mois|sous un mois|d'ici un mois/i.test(text)) info.timeline = 'moyen terme';
  else if (/dans \d+ mois|trimestre|fin d'année/i.test(text)) info.timeline = 'long terme';

  // Décideur
  if (/je suis (?:le |la )?(?:gérant|directeur|directrice|fondateur|fondatrice|dirigeant|dirigeante|ceo|patron)/i.test(text)) info.decisionMaker = true;

  return info;
}

// Détection des services qui intéressent le visiteur
function detectInterests(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const [key, svc] of Object.entries(KB.services)) {
    for (const kw of svc.keywords) {
      if (lower.includes(kw)) { found.push(key); break; }
    }
  }
  return found;
}

// ═════════════════════════════════════════════════════════════════
//  FALLBACK — réponse intelligente sans LLM
// ═════════════════════════════════════════════════════════════════
function fallbackReply(history, visitor, qualification) {
  const lastUser = history.filter(m => m.role === 'user').pop();
  const text = lastUser ? lastUser.content : '';
  const interests = detectInterests(text);
  const turn = history.filter(m => m.role === 'user').length;

  // Premier tour : présentation + question ouverte
  if (turn <= 1) {
    return {
      reply: "Bonjour, je suis Léa, consultante chez <strong>Pirabel Labs</strong>. Pour vous aider au mieux, pourriez-vous me dire en quelques mots ce que vous cherchez à accomplir ?",
      buttons: ['Améliorer ma visibilité', 'Refaire mon site', 'Augmenter mes ventes', 'Autre besoin']
    };
  }

  // Service identifié : présenter de manière contextuelle
  if (interests.length > 0) {
    const svc = KB.services[interests[0]];
    let reply = `D'accord, vous vous intéressez à <strong>${svc.name}</strong>. Chez Pirabel Labs, c'est ${svc.price}, avec un délai de ${svc.delay}. Vous pouvez en voir le détail sur <a href="${svc.page}">cette page</a>.<br><br>`;

    if (!visitor || !visitor.sector) {
      reply += "Pour mieux cadrer ma réponse, dans quel secteur d'activité êtes-vous ?";
    } else if (!qualification || !qualification.budget) {
      reply += "Avez-vous une enveloppe budgétaire en tête, même approximative ?";
    } else if (!visitor.email) {
      reply += "Souhaitez-vous que je vous fasse parvenir une proposition détaillée par email ?";
    } else {
      reply += "Quel est votre objectif principal sur les prochains mois ?";
    }
    return { reply, buttons: [] };
  }

  // Demande de prix générique
  if (/prix|tarif|coût|combien|budget/i.test(text)) {
    return {
      reply: "Les tarifs varient selon le projet, mais voici quelques repères : SEO à partir de 500 €/mois, site vitrine dès 1 500 €, logo dès 800 €, gestion publicitaire dès 400 €/mois. Pour un devis précis, dites-moi en quelques mots votre projet.",
      buttons: ['J\'ai un site à refaire', 'Je veux plus de visibilité', 'Décrire mon projet']
    };
  }

  // Demande de contact
  if (/contact|joindre|appel|rendez-vous|rdv|téléphone|email/i.test(text)) {
    return {
      reply: "Avec plaisir. Nous proposons un audit initial gratuit et sans engagement. Pourriez-vous me laisser votre email ? Un membre de l'équipe vous recontactera sous 24 heures ouvrées."
    };
  }

  // Phase de qualification — demander progressivement les infos
  if (turn >= 3 && (!visitor || !visitor.email)) {
    return {
      reply: "Pour que je puisse vous orienter correctement, et qu'un membre de l'équipe puisse vous rappeler si besoin, pourriez-vous me communiquer votre email ?"
    };
  }

  if (turn >= 4 && (!qualification || !qualification.budget)) {
    return {
      reply: "Avez-vous une idée du budget que vous souhaitez allouer à ce projet ? Cela m'aidera à cibler une proposition réaliste."
    };
  }

  // Default : reformulation + relance
  return {
    reply: "Je note. Pour aller plus loin, pourriez-vous me préciser quel est votre objectif principal : gagner en visibilité, générer plus de leads, refondre votre image, ou autre chose ?",
    buttons: ['Gagner en visibilité', 'Générer plus de leads', 'Refondre mon image', 'Autre']
  };
}

// ═════════════════════════════════════════════════════════════════
//  ENTRY POINT — generateLeaReply
// ═════════════════════════════════════════════════════════════════
async function generateLeaReply({ history = [], visitor = {}, qualification = {} } = {}) {
  // Build context preamble injected as a leading user-side note
  const knownInfo = [];
  if (visitor.name) knownInfo.push('Prénom : ' + visitor.name);
  if (visitor.company) knownInfo.push('Entreprise : ' + visitor.company);
  if (visitor.sector) knownInfo.push('Secteur : ' + visitor.sector);
  if (visitor.email) knownInfo.push('Email : ' + visitor.email);
  if (visitor.phone) knownInfo.push('Téléphone : ' + visitor.phone);
  if (visitor.website) knownInfo.push('Site web : ' + visitor.website);
  if (qualification.budget) knownInfo.push('Budget : ' + qualification.budget);
  if (qualification.timeline) knownInfo.push('Délai : ' + qualification.timeline);

  const contextNote = knownInfo.length
    ? '\n\n[Contexte interne — déjà connu sur le visiteur, ne pas redemander : ' + knownInfo.join(' | ') + ']'
    : '';

  // Build messages for Claude API
  const messages = history
    .filter(m => m && m.role && m.content)
    .map(m => ({
      role: m.role === 'assistant' || m.role === 'bot' ? 'assistant' : 'user',
      content: String(m.content).slice(0, 4000)
    }));

  if (contextNote && messages.length > 0) {
    // Append context note to the latest user message
    const lastIdx = messages.length - 1;
    if (messages[lastIdx].role === 'user') {
      messages[lastIdx].content += contextNote;
    }
  }

  // Try Claude first
  try {
    const reply = await callClaude(messages, LEA_PERSONA);
    if (reply && reply.trim()) {
      // Extract any info from the latest user message
      const lastUser = messages.filter(m => m.role === 'user').pop();
      const extracted = lastUser ? extractInfoFromMessage(lastUser.content) : {};
      const interests = lastUser ? detectInterests(lastUser.content) : [];
      return {
        reply: reply.trim(),
        buttons: [],
        extractedInfo: extracted,
        detectedInterests: interests,
        source: 'claude'
      };
    }
  } catch (err) {
    if (err.message !== 'NO_API_KEY') {
      console.error('[Léa Claude]', err.message);
    }
    // fallthrough to fallback
  }

  // Fallback (no API key or API error)
  const fb = fallbackReply(messages, visitor, qualification);
  const lastUser = messages.filter(m => m.role === 'user').pop();
  const extracted = lastUser ? extractInfoFromMessage(lastUser.content) : {};
  const interests = lastUser ? detectInterests(lastUser.content) : [];
  return {
    reply: fb.reply,
    buttons: fb.buttons || [],
    extractedInfo: extracted,
    detectedInterests: interests,
    source: 'fallback'
  };
}

module.exports = {
  generateLeaReply,
  extractInfoFromMessage,
  detectInterests,
  KB,
  LEA_PERSONA
};
