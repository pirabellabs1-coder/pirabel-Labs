const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Lead = require('../models/Lead');
const Prospect = require('../models/Prospect');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, limitBody } = require('../middleware/security');
const { sendEmail, masterTemplate } = require('../config/email');

// ═══════════════════════════════════════════════════════════
// AI CHATBOT KNOWLEDGE BASE — Pirabel Labs
// ═══════════════════════════════════════════════════════════
const KB = [
  {
    patterns: [/bonjour/i, /salut/i, /hello/i, /hey/i, /bonsoir/i, /coucou/i, /yo\b/i],
    reply: "Bonjour ! Bienvenue chez <strong>Pirabel Labs</strong>. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui ?",
    buttons: ['Quels sont vos services ?', 'Je veux un devis', 'Comment vous contacter ?'],
    topic: 'greeting'
  },
  {
    patterns: [/services?/i, /quoi.*proposez/i, /que.*faites/i, /offres?/i, /prestations?/i, /expertise/i, /sp[eé]cialit/i, /domaines?/i],
    reply: "Pirabel Labs propose <strong>12 p\u00f4les d'expertise</strong> :<br><br>\u2022 <strong>SEO & R\u00e9f\u00e9rencement naturel</strong> \u2014 Audit, strat\u00e9gie, netlinking<br>\u2022 <strong>Cr\u00e9ation de sites web</strong> \u2014 WordPress, Shopify, Webflow, sur-mesure<br>\u2022 <strong>Design & Branding</strong> \u2014 Logo, charte graphique, identit\u00e9 visuelle<br>\u2022 <strong>Social Media</strong> \u2014 Community management, strat\u00e9gie, influence<br>\u2022 <strong>Publicit\u00e9 payante</strong> \u2014 Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads<br>\u2022 <strong>Email Marketing & CRM</strong> \u2014 Campagnes, automation, nurturing<br>\u2022 <strong>IA & Automatisation</strong> \u2014 Chatbots, agents IA, Make, Zapier, n8n<br>\u2022 <strong>R\u00e9daction & Content</strong> \u2014 Articles SEO, copywriting, pages de vente<br>\u2022 <strong>Vid\u00e9o & Motion Design</strong> \u2014 Corporate, r\u00e9seaux sociaux, montage<br>\u2022 <strong>Sales Funnels & CRO</strong> \u2014 Landing pages, tunnels, A/B testing<br>\u2022 <strong>Consulting digital</strong><br>\u2022 <strong>Formation digitale</strong>",
    buttons: ['Je veux un site web', 'Je veux du SEO', 'Tarifs ?', 'Je veux un devis'],
    topic: 'services'
  },
  {
    patterns: [/site\s*web/i, /cr[eé]ation.*site/i, /d[eé]veloppement.*web/i, /refonte/i, /wordpress/i, /shopify/i, /webflow/i, /sur[- ]mesure/i, /e-commerce/i, /ecommerce/i, /boutique.*ligne/i],
    reply: "Nous cr\u00e9ons des <strong>sites web performants</strong> adapt\u00e9s \u00e0 vos besoins :<br><br>\u2022 <strong>WordPress</strong> \u2014 Sites vitrines, blogs, portails<br>\u2022 <strong>Shopify</strong> \u2014 Boutiques e-commerce<br>\u2022 <strong>Webflow</strong> \u2014 Sites design avanc\u00e9<br>\u2022 <strong>D\u00e9veloppement sur-mesure</strong> \u2014 Applications web complexes<br>\u2022 <strong>Figma / UI Design</strong> \u2014 Maquettes et prototypes<br><br>Chaque projet inclut : design responsive, SEO de base, formation et support. Nous intervenons partout : Paris, Lyon, Marseille, Bruxelles, Montr\u00e9al, Dakar, Abidjan, Casablanca...",
    buttons: ['Combien \u00e7a co\u00fbte ?', 'Je veux un devis', 'D\u00e9lai de r\u00e9alisation ?'],
    topic: 'web'
  },
  {
    patterns: [/seo/i, /r[eé]f[eé]rencement/i, /google.*position/i, /visibilit[eé]/i, /netlinking/i, /audit.*seo/i, /mot[s]?\s*cl[eé]/i],
    reply: "Notre p\u00f4le <strong>SEO & R\u00e9f\u00e9rencement</strong> comprend :<br><br>\u2022 <strong>Audit SEO complet</strong> \u2014 Analyse technique, s\u00e9mantique et concurrentielle<br>\u2022 <strong>SEO technique</strong> \u2014 Vitesse, structure, Core Web Vitals<br>\u2022 <strong>R\u00e9daction SEO</strong> \u2014 Contenu optimis\u00e9 pour Google<br>\u2022 <strong>Netlinking</strong> \u2014 Backlinks de qualit\u00e9<br>\u2022 <strong>SEO local</strong> \u2014 Fiche Google, avis, g\u00e9olocalisation<br><br>Nos clients constatent en moyenne <strong>+45% de trafic organique</strong> en 6 mois.",
    buttons: ['Combien \u00e7a co\u00fbte ?', 'Je veux un audit SEO', 'Je veux un devis'],
    topic: 'seo'
  },
  {
    patterns: [/design/i, /branding/i, /logo/i, /charte.*graphique/i, /identit[eé].*visuelle/i, /packaging/i],
    reply: "Notre \u00e9quipe <strong>Design & Branding</strong> cr\u00e9e des identit\u00e9s visuelles m\u00e9morables :<br><br>\u2022 Cr\u00e9ation de logo<br>\u2022 Charte graphique compl\u00e8te<br>\u2022 Identit\u00e9 visuelle<br>\u2022 Direction artistique<br>\u2022 Packaging design<br><br>Du concept \u00e0 la livraison, nous vous accompagnons pour renforcer votre image de marque.",
    buttons: ['Je veux un logo', 'Tarifs ?', 'Je veux un devis'],
    topic: 'design'
  },
  {
    patterns: [/social\s*media/i, /r[eé]seaux?\s*socia/i, /community/i, /instagram/i, /facebook/i, /tiktok/i, /linkedin/i, /influence/i],
    reply: "Notre p\u00f4le <strong>Social Media</strong> g\u00e8re votre pr\u00e9sence sur les r\u00e9seaux :<br><br>\u2022 Community management (Instagram, Facebook, TikTok, LinkedIn)<br>\u2022 Strat\u00e9gie social media<br>\u2022 Cr\u00e9ation de contenu<br>\u2022 Influence marketing<br><br>Nous augmentons votre visibilit\u00e9 et votre engagement en ligne.",
    buttons: ['Tarifs ?', 'Je veux un devis'],
    topic: 'social'
  },
  {
    patterns: [/pub(licit[eé])?/i, /ads?\b/i, /google\s*ads/i, /meta\s*ads/i, /campagne.*pub/i, /sea\b/i, /sponsor/i],
    reply: "Nous g\u00e9rons vos <strong>campagnes publicitaires</strong> sur toutes les plateformes :<br><br>\u2022 <strong>Google Ads</strong> \u2014 Search, Display, Shopping<br>\u2022 <strong>Meta Ads</strong> \u2014 Facebook & Instagram<br>\u2022 <strong>TikTok Ads</strong><br>\u2022 <strong>LinkedIn Ads</strong> \u2014 B2B<br><br>Optimisation continue pour maximiser votre ROI.",
    buttons: ['Budget minimum ?', 'Je veux un devis'],
    topic: 'ads'
  },
  {
    patterns: [/ia\b/i, /intelligence.*artificielle/i, /automatisation/i, /chatbot/i, /agent.*ia/i, /make\b/i, /zapier/i, /n8n/i],
    reply: "Notre expertise <strong>IA & Automatisation</strong> :<br><br>\u2022 <strong>Chatbots IA</strong> \u2014 Assistants conversationnels intelligents<br>\u2022 <strong>Agents IA</strong> \u2014 Automatisation de t\u00e2ches complexes<br>\u2022 <strong>Make / Zapier / n8n</strong> \u2014 Workflows automatis\u00e9s<br><br>Nous aidons les entreprises \u00e0 gagner du temps et de l'efficacit\u00e9 gr\u00e2ce \u00e0 l'IA.",
    buttons: ['Exemple concret ?', 'Je veux un devis'],
    topic: 'ia'
  },
  {
    patterns: [/email\s*marketing/i, /crm/i, /emailing/i, /newsletter/i, /nurturing/i, /automation.*email/i, /marketing.*automation/i],
    reply: "Notre p\u00f4le <strong>Email Marketing & CRM</strong> :<br><br>\u2022 Campagnes emailing (Brevo, Mailchimp, Klaviyo)<br>\u2022 Setup CRM (HubSpot, Salesforce, Pipedrive)<br>\u2022 Marketing automation & s\u00e9quences<br>\u2022 Nurturing & lead scoring<br><br>Convertissez vos prospects en clients fid\u00e8les.",
    buttons: ['Tarifs ?', 'Je veux un devis'],
    topic: 'email'
  },
  {
    patterns: [/vid[eé]o/i, /motion\s*design/i, /montage/i, /corporate/i, /youtube/i, /miniature/i],
    reply: "Notre p\u00f4le <strong>Vid\u00e9o & Motion Design</strong> :<br><br>\u2022 Vid\u00e9o corporate & pr\u00e9sentation<br>\u2022 Montage vid\u00e9o professionnel<br>\u2022 Motion design & animation<br>\u2022 Contenu vid\u00e9o pour r\u00e9seaux sociaux<br>\u2022 Miniatures YouTube",
    buttons: ['Tarifs ?', 'Je veux un devis'],
    topic: 'video'
  },
  {
    patterns: [/r[eé]daction/i, /content/i, /copywriting/i, /article/i, /blog/i, /page.*vente/i, /strat[eé]gie.*[eé]ditoriale/i],
    reply: "Notre p\u00f4le <strong>R\u00e9daction & Content Marketing</strong> :<br><br>\u2022 Articles de blog SEO<br>\u2022 Copywriting & pages de vente<br>\u2022 Strat\u00e9gie \u00e9ditoriale<br>\u2022 Fiches produits<br><br>Du contenu qui convertit et qui se positionne sur Google.",
    buttons: ['Je veux un devis', 'Exemples ?'],
    topic: 'content'
  },
  {
    patterns: [/funnel/i, /tunnel.*vente/i, /landing\s*page/i, /conversion/i, /cro\b/i, /a\/b\s*test/i],
    reply: "Notre p\u00f4le <strong>Sales Funnels & CRO</strong> :<br><br>\u2022 Tunnels de vente complets<br>\u2022 Landing pages optimis\u00e9es<br>\u2022 A/B testing<br>\u2022 Optimisation du taux de conversion<br><br>Nous transformons vos visiteurs en clients.",
    buttons: ['Je veux un devis'],
    topic: 'funnel'
  },
  {
    patterns: [/tarif/i, /prix/i, /co[uû]t/i, /combien/i, /budget/i, /investissement/i],
    reply: "Nos <strong>tarifs</strong> d\u00e9pendent du projet et de sa complexit\u00e9. Voici des fourchettes indicatives :<br><br>\u2022 <strong>Site vitrine</strong> \u2014 \u00e0 partir de 1 500\u20ac<br>\u2022 <strong>E-commerce</strong> \u2014 \u00e0 partir de 3 000\u20ac<br>\u2022 <strong>SEO</strong> \u2014 \u00e0 partir de 500\u20ac/mois<br>\u2022 <strong>Social Media</strong> \u2014 \u00e0 partir de 400\u20ac/mois<br>\u2022 <strong>Logo & Branding</strong> \u2014 \u00e0 partir de 800\u20ac<br><br>Pour un devis pr\u00e9cis, dites-moi votre projet et je vous mets en relation avec notre \u00e9quipe.",
    buttons: ['Je veux un devis', 'Parler \u00e0 un humain'],
    topic: 'pricing'
  },
  {
    patterns: [/devis/i, /estimation/i, /proposition/i, /offre.*commercial/i],
    reply: "Pour obtenir un <strong>devis gratuit et personnalis\u00e9</strong>, vous pouvez :<br><br>\u2022 Remplir notre <a href='/contact.html'>formulaire de contact</a><br>\u2022 Nous envoyer un email \u00e0 <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a><br>\u2022 Me d\u00e9crire votre projet ici et je transmettrai votre demande \u00e0 notre \u00e9quipe<br><br>Nous r\u00e9pondons sous <strong>24h ouvr\u00e9es</strong>.",
    buttons: ['Formulaire de contact', 'D\u00e9crire mon projet'],
    topic: 'quote'
  },
  {
    patterns: [/contact/i, /joindre/i, /appeler/i, /t[eé]l[eé]phone/i, /mail\b/i, /adresse/i, /localisation/i, /o[uù]\s*[eê]tes/i],
    reply: "Vous pouvez nous contacter de plusieurs fa\u00e7ons :<br><br>\u2022 <strong>Email</strong> : <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a><br>\u2022 <strong>Formulaire</strong> : <a href='/contact.html'>Page contact</a><br>\u2022 <strong>Ce chat</strong> : D\u00e9crivez votre besoin et je le transmets \u00e0 notre \u00e9quipe<br><br>Nous sommes une agence digitale internationale avec des clients en France, Belgique, Canada, et Afrique.",
    buttons: ['Formulaire de contact', 'Quels sont vos services ?'],
    topic: 'contact'
  },
  {
    patterns: [/d[eé]lai/i, /combien.*temps/i, /dur[eé]e/i, /livraison/i, /quand/i, /rapide/i],
    reply: "Les <strong>d\u00e9lais</strong> varient selon le type de projet :<br><br>\u2022 <strong>Site vitrine</strong> \u2014 2 \u00e0 4 semaines<br>\u2022 <strong>E-commerce</strong> \u2014 4 \u00e0 8 semaines<br>\u2022 <strong>Logo & Branding</strong> \u2014 1 \u00e0 2 semaines<br>\u2022 <strong>Campagne Ads</strong> \u2014 Setup en 3-5 jours<br>\u2022 <strong>SEO</strong> \u2014 R\u00e9sultats visibles en 3-6 mois<br><br>Nous respectons toujours les d\u00e9lais convenus.",
    buttons: ['Je veux un devis', 'Parler \u00e0 un humain'],
    topic: 'timeline'
  },
  {
    patterns: [/processus/i, /comment.*fonctionne/i, /[eé]tape/i, /m[eé]thodologie/i, /d[eé]roulement/i, /comment.*travaillez/i],
    reply: "Notre <strong>processus</strong> en 4 \u00e9tapes :<br><br><strong>1. D\u00e9couverte</strong> \u2014 Appel gratuit pour comprendre vos besoins<br><strong>2. Proposition</strong> \u2014 Devis d\u00e9taill\u00e9 + strat\u00e9gie<br><strong>3. R\u00e9alisation</strong> \u2014 D\u00e9veloppement avec points r\u00e9guliers<br><strong>4. Livraison</strong> \u2014 Mise en ligne + formation + suivi<br><br>Vous avez un chef de projet d\u00e9di\u00e9 tout au long du parcours.",
    buttons: ['Je veux commencer', 'Tarifs ?'],
    topic: 'process'
  },
  {
    patterns: [/r[eé]sultats?/i, /portfolio/i, /r[eé]f[eé]rences?/i, /client/i, /t[eé]moignage/i, /cas\b/i, /prouv/i],
    reply: "Nos <strong>r\u00e9sultats</strong> parlent d'eux-m\u00eames :<br><br>\u2022 <strong>150+</strong> projets livr\u00e9s<br>\u2022 <strong>+45%</strong> de trafic organique moyen pour nos clients SEO<br>\u2022 <strong>3x</strong> ROI moyen sur les campagnes publicitaires<br>\u2022 <strong>98%</strong> de clients satisfaits<br><br>D\u00e9couvrez nos \u00e9tudes de cas sur notre <a href='/resultats.html'>page r\u00e9sultats</a>.",
    buttons: ['Je veux un devis', 'Quels sont vos services ?'],
    topic: 'results'
  },
  {
    patterns: [/formation/i, /apprendre/i, /cours/i, /coaching/i, /accompagnement/i],
    reply: "Nous proposons des <strong>formations digitales</strong> pour monter en comp\u00e9tences :<br><br>\u2022 Formation SEO<br>\u2022 Formation r\u00e9seaux sociaux<br>\u2022 Formation Google Ads<br>\u2022 Formation email marketing<br>\u2022 Coaching digital personnalis\u00e9<br><br>Formations adapt\u00e9es \u00e0 votre niveau et vos objectifs.",
    buttons: ['Tarifs formation ?', 'Je veux un devis'],
    topic: 'training'
  },
  {
    patterns: [/consulting/i, /conseil/i, /strat[eé]gie.*digital/i, /audit\b/i, /diagnostic/i],
    reply: "Notre p\u00f4le <strong>Consulting digital</strong> vous accompagne :<br><br>\u2022 Audit digital complet<br>\u2022 Strat\u00e9gie de croissance<br>\u2022 Benchmark concurrentiel<br>\u2022 Plan d'action digital<br><br>Un regard d'expert pour booster votre pr\u00e9sence en ligne.",
    buttons: ['Je veux un audit', 'Tarifs ?'],
    topic: 'consulting'
  },
  {
    patterns: [/qui\s*[eê]tes/i, /pirabel/i, /agence/i, /[eé]quipe/i, /pr[eé]sentation/i, /about/i, /[aà]\s*propos/i],
    reply: "<strong>Pirabel Labs</strong> est une agence digitale 360\u00b0 qui aide les entreprises \u00e0 se d\u00e9velopper en ligne.<br><br>\u2022 \u00c9quipe multidisciplinaire (d\u00e9veloppeurs, designers, marketeurs, experts IA)<br>\u2022 Clients en France, Belgique, Canada, Afrique<br>\u2022 +150 projets livr\u00e9s<br>\u2022 Approche sur-mesure et orient\u00e9e r\u00e9sultats<br><br>D\u00e9couvrez-nous sur notre <a href='/a-propos.html'>page \u00e0 propos</a>.",
    buttons: ['Quels sont vos services ?', 'Je veux un devis'],
    topic: 'about'
  },
  {
    patterns: [/humain/i, /vrai.*personne/i, /parler.*quelqu/i, /[eé]quipe.*commercial/i, /rendez.*vous/i, /rdv/i, /appel/i],
    reply: "Je vais transmettre votre demande \u00e0 notre \u00e9quipe ! En attendant, vous pouvez :<br><br>\u2022 Nous \u00e9crire \u00e0 <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a><br>\u2022 Remplir notre <a href='/contact.html'>formulaire de contact</a><br><br>Un membre de l'\u00e9quipe vous r\u00e9pondra sous <strong>24h ouvr\u00e9es</strong>.",
    buttons: ['Formulaire de contact'],
    topic: 'human'
  },
  {
    patterns: [/merci/i, /super/i, /parfait/i, /g[eé]nial/i, /top/i, /excellent/i, /cool/i],
    reply: "Avec plaisir ! N'h\u00e9sitez pas si vous avez d'autres questions. L'\u00e9quipe Pirabel Labs est l\u00e0 pour vous accompagner.",
    buttons: [],
    topic: 'thanks'
  },
  {
    patterns: [/faq/i, /question.*fr[eé]quent/i],
    reply: "Consultez notre <a href='/faq.html'>FAQ compl\u00e8te</a> pour les questions les plus courantes. Sinon, posez-moi votre question ici !",
    buttons: ['Quels sont vos services ?', 'Tarifs ?'],
    topic: 'faq'
  },
  {
    patterns: [/d[eé]crire.*projet/i, /mon\s*projet/i, /besoin\s*de/i, /je\s*cherche/i, /j'?ai\s*besoin/i, /je\s*veux/i, /je\s*voudrais/i, /je\s*souhaite/i],
    reply: "Excellent ! D\u00e9crivez-moi votre projet en quelques lignes :<br><br>\u2022 Quel est votre secteur d'activit\u00e9 ?<br>\u2022 Quel est votre objectif principal ?<br>\u2022 Avez-vous un budget en t\u00eate ?<br>\u2022 Quel est votre d\u00e9lai souhait\u00e9 ?<br><br>Je transmettrai ces informations \u00e0 notre \u00e9quipe pour vous pr\u00e9parer une proposition personnalis\u00e9e.",
    buttons: [],
    topic: 'project'
  },
  {
    patterns: [/formulaire/i],
    reply: "Rendez-vous sur notre <a href='/contact.html'>page contact</a> pour remplir le formulaire. Notre \u00e9quipe vous r\u00e9pondra sous 24h !",
    buttons: [],
    topic: 'form'
  }
];

const DEFAULT_REPLY = {
  reply: "Merci pour votre message ! Je n'ai pas de r\u00e9ponse pr\u00e9cise \u00e0 cette question, mais notre \u00e9quipe pourra vous aider. Voici ce que je peux faire :<br><br>\u2022 Vous pr\u00e9senter <strong>nos services</strong><br>\u2022 Vous donner des <strong>tarifs indicatifs</strong><br>\u2022 Vous orienter vers <strong>un membre de l'\u00e9quipe</strong>",
  buttons: ['Quels sont vos services ?', 'Tarifs ?', 'Parler \u00e0 un humain']
};

// ═══════════════════════════════════════════════════════════
// CONVERSATION CONTEXT STORE (in-memory, per conversation)
// ═══════════════════════════════════════════════════════════
const conversationContexts = new Map();

// Clean up stale contexts every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, ctx] of conversationContexts) {
    if (now - ctx.lastActivity > 60 * 60 * 1000) {
      conversationContexts.delete(id);
    }
  }
}, 30 * 60 * 1000);

function getContext(conversationId) {
  if (!conversationContexts.has(conversationId)) {
    conversationContexts.set(conversationId, {
      phase: 'greeting',     // greeting, discovery, qualification, closing
      topicsDiscussed: [],
      messageCount: 0,
      lastActivity: Date.now(),
      askedName: false,
      askedEmail: false,
      askedBudget: false,
      askedProject: false
    });
  }
  const ctx = conversationContexts.get(conversationId);
  ctx.lastActivity = Date.now();
  return ctx;
}

function advancePhase(ctx) {
  if (ctx.messageCount <= 1) ctx.phase = 'greeting';
  else if (ctx.messageCount <= 4) ctx.phase = 'discovery';
  else if (ctx.messageCount <= 8) ctx.phase = 'qualification';
  else ctx.phase = 'closing';
}

function getAIReply(message, conversationId) {
  const text = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const ctx = getContext(conversationId);
  ctx.messageCount++;
  advancePhase(ctx);

  let matched = null;
  for (const entry of KB) {
    for (const pattern of entry.patterns) {
      if (pattern.test(message) || pattern.test(text)) {
        matched = entry;
        break;
      }
    }
    if (matched) break;
  }

  if (matched) {
    if (matched.topic && !ctx.topicsDiscussed.includes(matched.topic)) {
      ctx.topicsDiscussed.push(matched.topic);
    }
    return {
      reply: matched.reply,
      quickButtons: matched.buttons.length > 0 ? matched.buttons : undefined,
      phase: ctx.phase,
      topicsDiscussed: ctx.topicsDiscussed
    };
  }

  // Contextual follow-up based on phase
  if (ctx.phase === 'qualification' && !ctx.askedBudget) {
    ctx.askedBudget = true;
    return {
      reply: "Merci pour ces informations ! Pour mieux vous orienter, pourriez-vous me donner une id\u00e9e de votre <strong>budget</strong> et de votre <strong>d\u00e9lai souhait\u00e9</strong> ?",
      quickButtons: ['Moins de 2000\u20ac', '2000\u20ac - 5000\u20ac', '5000\u20ac - 10000\u20ac', '+10000\u20ac'],
      phase: ctx.phase,
      topicsDiscussed: ctx.topicsDiscussed
    };
  }

  if (ctx.phase === 'closing') {
    return {
      reply: "Merci pour tous ces d\u00e9tails ! Notre \u00e9quipe va analyser votre besoin et revenir vers vous rapidement. En attendant, vous pouvez :<br><br>\u2022 <a href='/contact.html'>Remplir notre formulaire</a> pour un suivi prioritaire<br>\u2022 Nous \u00e9crire \u00e0 <a href='mailto:contact@pirabellabs.com'>contact@pirabellabs.com</a>",
      quickButtons: ['Formulaire de contact', 'Quels sont vos services ?'],
      phase: ctx.phase,
      topicsDiscussed: ctx.topicsDiscussed
    };
  }

  return {
    reply: DEFAULT_REPLY.reply,
    quickButtons: DEFAULT_REPLY.buttons,
    phase: ctx.phase,
    topicsDiscussed: ctx.topicsDiscussed
  };
}

// ═══════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (no auth)
// ═══════════════════════════════════════════════════════════

// Rate limiters
const chatLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 30, message: 'Trop de messages. Réessayez dans quelques minutes.', keyPrefix: 'chat' });
const leadSummaryLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de requêtes. Réessayez dans quelques minutes.', keyPrefix: 'lead-summary' });
const followUpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3, message: 'Trop de requêtes. Réessayez dans quelques minutes.', keyPrefix: 'lead-followup' });
const offerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3, message: 'Trop de requêtes. Réessayez dans quelques minutes.', keyPrefix: 'lead-offer' });

// POST /api/chat/bot-reply — Visitor sends message, gets AI reply
router.post('/bot-reply', chatLimiter, limitBody(6), async (req, res) => {
  try {
    const conversationId = sanitize(req.body.conversationId, 50) || Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const visitorName = sanitize(req.body.visitorName || 'Visiteur', 100);
    const visitorEmail = sanitizeEmail(req.body.visitorEmail || '');
    const content = sanitize(req.body.content, 1000);

    if (!content) return res.status(400).json({ error: 'Message requis' });

    // Save visitor message
    await Message.create({
      conversationId,
      visitorName,
      visitorEmail,
      sender: 'visitor',
      content
    });

    // Generate AI reply with context tracking
    const aiResponse = getAIReply(content, conversationId);

    // Save bot reply
    await Message.create({
      conversationId,
      visitorName,
      visitorEmail,
      sender: 'admin',
      content: aiResponse.reply
    });

    res.json(aiResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/public-messages/:conversationId — Load conversation history (public)
router.get('/public-messages/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .limit(100)
      .select('sender content createdAt');
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/message — Legacy: visitor sends message (kept for compatibility)
router.post('/message', chatLimiter, limitBody(6), async (req, res) => {
  try {
    const conversationId = sanitize(req.body.conversationId, 50) || Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const visitorName = sanitize(req.body.visitorName || 'Visiteur', 100);
    const visitorEmail = sanitizeEmail(req.body.visitorEmail || '');
    const content = sanitize(req.body.content, 1000);
    const sender = req.body.sender === 'admin' ? 'admin' : 'visitor';

    if (!content) return res.status(400).json({ error: 'Message requis' });

    const message = await Message.create({
      conversationId,
      visitorName,
      visitorEmail,
      sender,
      content
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('new-message', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// LEAD MANAGEMENT ENDPOINTS
// ═══════════════════════════════════════════════════════════

// POST /api/chat/lead-summary — Save lead summary from chatbot (public)
router.post('/lead-summary', leadSummaryLimiter, limitBody(20), async (req, res) => {
  try {
    const conversationId = sanitize(req.body.conversationId, 50);
    if (!conversationId) return res.status(400).json({ error: 'conversationId requis' });

    const visitorName = sanitize(req.body.visitor?.name || '', 100);
    const visitorEmail = sanitizeEmail(req.body.visitor?.email || '');
    const visitorPhone = sanitize(req.body.visitor?.phone || '', 30);
    const visitorCompany = sanitize(req.body.visitor?.company || '', 200);
    const visitorSector = sanitize(req.body.visitor?.sector || '', 100);
    const visitorWebsite = sanitize(req.body.visitor?.website || '', 300);

    // Parse services array
    let services = [];
    if (Array.isArray(req.body.services)) {
      services = req.body.services.slice(0, 20).map(s => ({
        name: sanitize(s.name || '', 200),
        estimatedBudget: sanitize(s.estimatedBudget || '', 100)
      })).filter(s => s.name);
    }

    // Parse offer object
    let offer = {};
    if (req.body.offer && typeof req.body.offer === 'object') {
      offer = {
        services: Array.isArray(req.body.offer.services) ? req.body.offer.services.map(s => sanitize(s, 200)).filter(Boolean).slice(0, 20) : [],
        totalEstimate: sanitize(req.body.offer.totalEstimate || '', 100),
        timeline: sanitize(req.body.offer.timeline || '', 200),
        objectives: Array.isArray(req.body.offer.objectives) ? req.body.offer.objectives.map(o => sanitize(o, 300)).filter(Boolean).slice(0, 20) : []
      };
    }

    const leadData = {
      conversationId,
      visitor: {
        name: visitorName,
        email: visitorEmail,
        phone: visitorPhone,
        company: visitorCompany,
        sector: visitorSector,
        website: visitorWebsite
      },
      qualification: {
        score: Math.min(Math.max(parseInt(req.body.qualification?.score) || 0, 0), 100),
        level: ['Chaud', 'Tiede', 'Froid'].includes(req.body.qualification?.level) ? req.body.qualification.level : 'Froid',
        budget: sanitize(req.body.qualification?.budget || '', 100),
        timeline: sanitize(req.body.qualification?.timeline || '', 100),
        decisionMaker: req.body.qualification?.decisionMaker === true
      },
      problems: Array.isArray(req.body.problems) ? req.body.problems.map(p => sanitize(p, 200)).filter(Boolean).slice(0, 30) : [],
      interests: Array.isArray(req.body.interests) ? req.body.interests.map(i => sanitize(i, 200)).filter(Boolean).slice(0, 30) : [],
      services,
      conversationSummary: sanitize(req.body.conversationSummary || '', 3000),
      offer,
      messageCount: Math.min(Math.max(parseInt(req.body.messageCount) || 0, 0), 9999),
      topicsDiscussed: Array.isArray(req.body.topicsDiscussed) ? req.body.topicsDiscussed.map(t => sanitize(t, 200)).filter(Boolean).slice(0, 30) : [],
      duration: sanitize(req.body.duration || '', 50),
      source: sanitize(req.body.source || '', 500)
    };

    const lead = await Lead.findOneAndUpdate(
      { conversationId },
      { $set: leadData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also register as prospect if email is provided
    if (visitorEmail && isValidEmail(visitorEmail)) {
      const prospectName = visitorName || visitorCompany || 'Lead Chatbot';
      try {
        await Prospect.findOneAndUpdate(
          { email: visitorEmail },
          {
            $set: {
              contactName: prospectName,
              email: visitorEmail,
              phone: visitorPhone,
              company: visitorCompany,
              website: visitorWebsite,
              sector: visitorSector,
              problem: (leadData.problems || []).join(', '),
              notes: `[Chatbot Lead] ${leadData.conversationSummary || ''}`.substring(0, 2000)
            },
            $setOnInsert: {
              status: 'nouveau',
              createdAt: new Date()
            }
          },
          { upsert: true, new: true }
        );
      } catch (prospectErr) {
        console.error('Error syncing prospect:', prospectErr.message);
      }
    }

    res.json({ success: true, leadId: lead._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/send-offer — Send offer email to lead (public)
router.post('/send-offer', offerLimiter, limitBody(15), async (req, res) => {
  try {
    const name = sanitize(req.body.name || 'Visiteur', 100);
    const email = sanitizeEmail(req.body.email || '');
    const conversationSummary = sanitize(req.body.conversationSummary || '', 3000);

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });

    const offerData = req.body.offer || {};
    const offerServices = Array.isArray(offerData.services) ? offerData.services.map(s => sanitize(s, 200)).filter(Boolean) : [];
    const totalEstimate = sanitize(offerData.totalEstimate || '', 100);
    const timeline = sanitize(offerData.timeline || '', 200);
    const objectives = Array.isArray(offerData.objectives) ? offerData.objectives.map(o => sanitize(o, 300)).filter(Boolean) : [];
    const problems = Array.isArray(req.body.problems) ? req.body.problems.map(p => sanitize(p, 200)).filter(Boolean) : [];

    // Build services rows
    const servicesHTML = offerServices.length > 0
      ? offerServices.map(s => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid rgba(92,64,55,0.15);color:rgba(229,226,225,0.85);font-size:15px;">${s}</td>
        </tr>`).join('')
      : '<tr><td style="padding:12px 16px;color:rgba(229,226,225,0.5);font-size:14px;">Services à définir lors de notre appel</td></tr>';

    const problemsHTML = problems.length > 0
      ? `<div style="margin:20px 0;">
          <p style="font-size:14px;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">Problématiques identifiées</p>
          ${problems.map(p => `<div style="display:inline-block;background:rgba(255,85,0,0.1);border:1px solid rgba(255,85,0,0.2);padding:6px 14px;margin:3px 4px 3px 0;font-size:13px;color:#FF5500;">${p}</div>`).join('')}
        </div>`
      : '';

    const objectivesHTML = objectives.length > 0
      ? `<div style="margin:20px 0;">
          <p style="font-size:14px;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">Objectifs</p>
          <ul style="margin:0;padding-left:20px;">
            ${objectives.map(o => `<li style="color:rgba(229,226,225,0.7);font-size:15px;padding:4px 0;">${o}</li>`).join('')}
          </ul>
        </div>`
      : '';

    const htmlContent = masterTemplate({
      preheader: `${name}, votre proposition personnalisée — Pirabel Labs`,
      title: 'Votre proposition personnalisée',
      subtitle: `Préparée pour ${name}`,
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour <strong style="color:#e5e2e1;">${name}</strong>,</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Suite à notre échange, nous avons le plaisir de vous transmettre une proposition adaptée à vos besoins. Notre équipe a analysé votre projet avec attention.</p>

        ${problemsHTML}

        <div style="margin:28px 0;background:#0e0e0e;border:1px solid rgba(92,64,55,0.2);padding:0;">
          <div style="background:rgba(255,85,0,0.08);padding:14px 20px;border-bottom:1px solid rgba(92,64,55,0.15);">
            <p style="margin:0;font-size:13px;color:#FF5500;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Services recommandés</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${servicesHTML}
          </table>
        </div>

        ${totalEstimate ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
          <tr>
            <td style="text-align:center;padding:20px;background:rgba(255,85,0,0.06);border:1px solid rgba(255,85,0,0.15);">
              <div style="font-size:12px;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Budget estimé</div>
              <div style="font-size:32px;font-weight:800;color:#FF5500;letter-spacing:-1px;">${totalEstimate}</div>
            </td>
            ${timeline ? `<td style="text-align:center;padding:20px;background:rgba(255,85,0,0.06);border:1px solid rgba(255,85,0,0.15);">
              <div style="font-size:12px;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;">Délai proposé</div>
              <div style="font-size:32px;font-weight:800;color:#FF5500;letter-spacing:-1px;">${timeline}</div>
            </td>` : ''}
          </tr>
        </table>` : ''}

        ${objectivesHTML}

        ${conversationSummary ? `
        <div style="border-left:3px solid #FF5500;padding:16px 20px;margin:28px 0;background:rgba(255,85,0,0.03);">
          <p style="font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;font-weight:700;">Résumé de notre échange</p>
          <p style="font-style:italic;color:rgba(229,226,225,0.6);margin:0;font-size:14px;line-height:1.6;">${conversationSummary}</p>
        </div>` : ''}

        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Cette proposition est <strong style="color:#e5e2e1;">sans engagement</strong>. Planifions un appel pour affiner les détails et répondre à toutes vos questions.</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">À très bientôt,<br><strong style="color:#FF5500;">L'équipe Pirabel Labs</strong></p>
      `,
      cta: 'Planifier un appel',
      ctaUrl: (process.env.SITE_URL || 'https://www.pirabellabs.com') + '/contact.html?ref=offer',
      ctaSecondary: 'Voir nos résultats',
      ctaSecondaryUrl: (process.env.SITE_URL || 'https://www.pirabellabs.com') + '/resultats.html'
    });

    await sendEmail(email, `${name}, votre proposition personnalisée — Pirabel Labs`, htmlContent);

    // Mark lead as offerSent
    await Lead.findOneAndUpdate(
      { 'visitor.email': email },
      { $set: { offerSent: true, offerSentAt: new Date() } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/send-followup — Trigger follow-up email from chatbot (public)
router.post('/send-followup', followUpLimiter, limitBody(6), async (req, res) => {
  try {
    const conversationId = sanitize(req.body.conversationId, 50);
    const email = sanitizeEmail(req.body.email || '');
    const name = sanitize(req.body.name || 'Visiteur', 100);

    if (!conversationId) return res.status(400).json({ error: 'conversationId requis' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });

    // Find the lead to get their interests and problems
    const lead = await Lead.findOne({ conversationId });

    const interests = lead?.interests || [];
    const problems = lead?.problems || [];
    const services = lead?.services || [];

    // Build email body
    const interestsHTML = interests.length > 0
      ? `<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Lors de notre conversation, vous avez exprimé de l'intérêt pour :</p>
         <ul style="margin:12px 0 24px;padding-left:20px;">
           ${interests.map(i => `<li style="font-size:15px;color:rgba(229,226,225,0.7);padding:4px 0;">${i}</li>`).join('')}
         </ul>`
      : '';

    const problemsHTML = problems.length > 0
      ? `<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Nous avons bien noté vos problématiques :</p>
         <ul style="margin:12px 0 24px;padding-left:20px;">
           ${problems.map(p => `<li style="font-size:15px;color:rgba(229,226,225,0.7);padding:4px 0;">${p}</li>`).join('')}
         </ul>`
      : '';

    const servicesHTML = services.length > 0
      ? `<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Services qui pourraient vous convenir :</p>
         <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 24px;border-collapse:collapse;">
           ${services.map(s => `<tr>
             <td style="padding:10px 16px;border-bottom:1px solid rgba(92,64,55,0.15);color:rgba(229,226,225,0.8);font-size:15px;">${s.name}</td>
             ${s.estimatedBudget ? `<td style="padding:10px 16px;border-bottom:1px solid rgba(92,64,55,0.15);color:#FF5500;font-size:14px;font-weight:700;text-align:right;">${s.estimatedBudget}</td>` : ''}
           </tr>`).join('')}
         </table>`
      : '';

    const htmlContent = masterTemplate({
      preheader: `${name}, merci pour votre intérêt — Pirabel Labs`,
      title: `Merci, ${name} !`,
      subtitle: 'Suite à notre conversation',
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${name},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Merci d'avoir échangé avec notre assistant Pirabel Labs. Nous sommes ravis de votre intérêt et souhaitons vous accompagner dans votre projet.</p>
        ${interestsHTML}
        ${problemsHTML}
        ${servicesHTML}
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Notre équipe serait ravie d'en discuter plus en détail avec vous. N'hésitez pas à <strong style="color:#e5e2e1;">réserver un appel découverte gratuit</strong> ou à répondre directement à cet email.</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">À très bientôt !</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">L'équipe <strong style="color:#FF5500;">Pirabel Labs</strong></p>
      `,
      cta: 'Nous contacter',
      ctaUrl: (process.env.SITE_URL || 'https://www.pirabellabs.com') + '/contact.html',
      ctaSecondary: 'Découvrir nos services',
      ctaSecondaryUrl: (process.env.SITE_URL || 'https://www.pirabellabs.com') + '/services.html'
    });

    await sendEmail(email, `${name}, merci pour votre intérêt — Pirabel Labs`, htmlContent);

    // Mark lead as followUpSent
    if (lead) {
      lead.followUpSent = true;
      await lead.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// ADMIN LEAD ENDPOINTS (auth required)
// ═══════════════════════════════════════════════════════════

// GET /api/chat/leads/stats — Lead statistics (admin)
router.get('/leads/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const [total, nouveau, contacte, en_cours, converti, perdu, chaud, tiede, froid] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'nouveau' }),
      Lead.countDocuments({ status: 'contacte' }),
      Lead.countDocuments({ status: 'en_cours' }),
      Lead.countDocuments({ status: 'converti' }),
      Lead.countDocuments({ status: 'perdu' }),
      Lead.countDocuments({ 'qualification.level': 'Chaud' }),
      Lead.countDocuments({ 'qualification.level': 'Tiede' }),
      Lead.countDocuments({ 'qualification.level': 'Froid' })
    ]);

    const avgResult = await Lead.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$qualification.score' } } }
    ]);
    const avgScore = avgResult.length > 0 ? Math.round(avgResult[0].avgScore * 10) / 10 : 0;

    // Conversion rate
    const conversionRate = total > 0 ? Math.round((converti / total) * 1000) / 10 : 0;

    // Top services requested
    const topServices = await Lead.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top problems mentioned
    const topProblems = await Lead.aggregate([
      { $unwind: '$problems' },
      { $group: { _id: '$problems', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Leads by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const leadsByDay = await Lead.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Leads by week (last 12 weeks)
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
    const leadsByWeek = await Lead.aggregate([
      { $match: { createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Offer stats
    const offersSent = await Lead.countDocuments({ offerSent: true });

    res.json({
      total, nouveau, contacte, en_cours, converti, perdu,
      chaud, tiede, froid,
      avgScore, conversionRate, offersSent,
      topServices: topServices.map(s => ({ name: s._id, count: s.count })),
      topProblems: topProblems.map(p => ({ name: p._id, count: p.count })),
      leadsByDay: leadsByDay.map(d => ({ date: d._id, count: d.count })),
      leadsByWeek: leadsByWeek.map(w => ({ week: w._id, count: w.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/leads — List all leads (admin)
router.get('/leads', auth, adminOrEmployee, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status && ['nouveau', 'contacte', 'en_cours', 'converti', 'perdu'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.level && ['Chaud', 'Tiede', 'Froid'].includes(req.query.level)) {
      filter['qualification.level'] = req.query.level;
    }
    if (req.query.hasOffer === 'true') {
      filter.offerSent = true;
    } else if (req.query.hasOffer === 'false') {
      filter.offerSent = { $ne: true };
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { 'visitor.name': searchRegex },
        { 'visitor.email': searchRegex },
        { 'visitor.company': searchRegex },
        { 'visitor.sector': searchRegex }
      ];
    }
    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      filter.createdAt = {};
      if (req.query.dateFrom) filter.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const to = new Date(req.query.dateTo);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === 'score') sort = { 'qualification.score': -1 };
    else if (req.query.sort === 'score_asc') sort = { 'qualification.score': 1 };
    else if (req.query.sort === 'date_asc') sort = { createdAt: 1 };
    else if (req.query.sort === 'budget') sort = { 'qualification.budget': -1 };
    else if (req.query.sort === 'name') sort = { 'visitor.name': 1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'name email'),
      Lead.countDocuments(filter)
    ]);

    res.json({ leads, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/leads/:id — Full lead detail (admin)
router.get('/leads/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ error: 'Lead non trouvé' });

    // Also load conversation messages
    let messages = [];
    if (lead.conversationId) {
      messages = await Message.find({ conversationId: lead.conversationId })
        .sort({ createdAt: 1 })
        .limit(200)
        .select('sender content createdAt');
    }

    res.json({ lead, messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/chat/leads/:id — Update a lead (admin)
router.put('/leads/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const updates = {};

    if (req.body.status && ['nouveau', 'contacte', 'en_cours', 'converti', 'perdu'].includes(req.body.status)) {
      updates.status = req.body.status;
    }
    if (req.body.notes !== undefined) {
      updates.notes = sanitize(req.body.notes, 2000);
    }
    if (req.body.assignedTo) {
      updates.assignedTo = req.body.assignedTo;
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!lead) return res.status(404).json({ error: 'Lead non trouvé' });

    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/chat/leads/:id — Delete a lead (admin)
router.delete('/leads/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead non trouvé' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════
// ADMIN/EMPLOYEE ENDPOINTS (auth required)
// ═══════════════════════════════════════════════════════════

// GET /api/chat/conversations
router.get('/conversations', auth, adminOrEmployee, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$conversationId',
        visitorName: { $first: '$visitorName' },
        visitorEmail: { $first: '$visitorEmail' },
        lastMessage: { $first: '$content' },
        lastSender: { $first: '$sender' },
        lastDate: { $first: '$createdAt' },
        unread: { $sum: { $cond: [{ $and: [{ $eq: ['$sender', 'visitor'] }, { $eq: ['$read', false] }] }, 1, 0] } },
        messageCount: { $sum: 1 }
      }},
      { $sort: { lastDate: -1 } }
    ]);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/messages/:conversationId
router.get('/messages/:conversationId', auth, adminOrEmployee, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .limit(100);
    await Message.updateMany(
      { conversationId: req.params.conversationId, sender: 'visitor', read: false },
      { read: true }
    );
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/chat/admin-reply
router.post('/admin-reply', auth, adminOrEmployee, async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const message = await Message.create({
      conversationId,
      sender: 'admin',
      content,
      adminUser: req.user._id
    });

    if (req.app.get('io')) {
      req.app.get('io').to(conversationId).emit('admin-reply', message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/chat/unread-count
router.get('/unread-count', auth, adminOrEmployee, async (req, res) => {
  try {
    const count = await Message.countDocuments({ sender: 'visitor', read: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
