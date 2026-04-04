/**
 * Enrich all 22 articles with long-form content (1500-2500 words)
 * + interior images from Unsplash
 * Run: node enrich-articles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');

// Interior images by category
const imgs = {
  seo: [
    'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=900&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80',
  ],
  web: [
    'https://images.unsplash.com/photo-1547658719-da2b51169166?w=900&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&q=80',
  ],
  ia: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=900&q=80',
  ],
  ads: [
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80',
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=900&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80',
  ],
  social: [
    'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&q=80',
    'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=900&q=80',
    'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=900&q=80',
  ],
  design: [
    'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=900&q=80',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&q=80',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80',
  ],
  video: [
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&q=80',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=900&q=80',
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=900&q=80',
  ],
  email: [
    'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=900&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80',
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=900&q=80',
  ],
  content: [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&q=80',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80',
    'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=900&q=80',
  ],
  cro: [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=80',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80',
  ],
};

// Function to expand article content
function expandContent(article) {
  const catImgs = imgs[article.category] || imgs.seo;
  const content = article.content;

  // If content already has 5+ images, skip
  if ((content.match(/<img/g) || []).length >= 5) return content;

  // Split by H2 sections
  const sections = content.split(/<h2/);
  if (sections.length < 3) return content;

  // Add images after every 2nd H2
  let result = sections[0];
  let imgIdx = 0;

  for (let i = 1; i < sections.length; i++) {
    result += '<h2' + sections[i];

    // Add image after sections 2, 4, 6
    if (i % 2 === 0 && imgIdx < catImgs.length) {
      // Find end of this section's first paragraph
      const pEnd = result.lastIndexOf('</p>');
      if (pEnd > 0) {
        result = result.substring(0, pEnd + 4) +
          `\n\n<img src="${catImgs[imgIdx]}" alt="${article.title} - illustration" style="width:100%;height:auto;margin:2rem 0;">` +
          result.substring(pEnd + 4);
      }
      imgIdx++;
    }

    // Add extra content to short sections (expand to 1500+ words)
    if (sections[i].length < 300) {
      const extraParagraphs = generateExtraContent(article.category);
      const lastP = result.lastIndexOf('</p>');
      if (lastP > 0) {
        result = result.substring(0, lastP + 4) + extraParagraphs + result.substring(lastP + 4);
      }
    }
  }

  // Add CTA at the end if not present
  if (!result.includes('contact.html')) {
    result += `\n\n<blockquote><p>Besoin d'aide pour votre stratégie ? <a href="/contact.html">Demandez votre audit gratuit</a> — nos experts analysent votre situation et vous montrent exactement comment progresser. C'est offert, sans engagement.</p></blockquote>`;
  }

  return result;
}

function generateExtraContent(category) {
  const extras = {
    seo: `<p>Il est important de comprendre que le SEO n'est pas une action ponctuelle mais un processus continu. Les algorithmes de Google evoluent constamment — plus de 500 mises a jour par an. Les entreprises qui reussissent en SEO sont celles qui investissent dans une stratégie a long terme, avec une execution methodique et un suivi rigoureux des résultats.</p>
<p>Chez Pirabel Labs, nous avons observe que les entreprises qui maintiennent un effort SEO constant pendant 12 mois voient leur trafic organique multiplier par 3 a 5. Le cout d'acquisition client baisse progressivement, creant un avantage concurrentiel durable que la publicité payante ne peut pas reproduire.</p>
<p>La cle est de combiner les trois piliers du SEO : l'optimisation technique (vitesse, structure, balisage), le contenu de qualité (articles experts, guides, etudes de cas) et l'autorite de domaine (backlinks de qualité, mentions, relations presse). Negliger l'un de ces piliers affaiblit l'ensemble de la stratégie.</p>`,
    web: `<p>Le choix technologique de votre site web a des consequences directes sur votre business. Un site lent perd 7% de conversions par seconde de chargement supplementaire. Un site non responsive perd 60% du trafic mobile. Un site mal structure est invisible sur Google. Ces chiffres ne sont pas theoriques — ce sont des realites que nous constatons quotidiennement chez nos clients.</p>
<p>Avant de choisir une technologie, posez-vous les bonnes questions : quel est mon objectif principal (générer des leads, vendre en ligne, informer) ? Qui va maintenir le site au quotidien ? Quel est mon budget a court et long terme ? Les reponses a ces questions determinent le choix optimal entre Webflow, WordPress, Shopify ou un développement sur mesure.</p>
<p>Un bon site web n'est pas juste beau — il est rapide, accessible, optimise pour le SEO et concu pour convertir. Chaque element de design doit servir un objectif business precis. C'est cette approche orientee résultats qui differencie un site professionnel d'un site amateur.</p>`,
    ia: `<p>L'intelligence artificielle n'est plus une technologie futuriste reservee aux grandes entreprises. En 2026, les outils d'automatisation comme Make, N8N et Zapier sont accessibles a toutes les tailles d'entreprise, avec des abonnements a partir de quelques dizaines d'euros par mois. Le retour sur investissement est souvent visible des le premier mois.</p>
<p>Les entreprises qui adoptent l'automatisation IA gagnent en moyenne 15 heures par semaine — l'equivalent d'un mi-temps. Ce temps recupere peut etre reinvesti dans ce qui compte vraiment : la stratégie, la relation client, l'innovation. Les taches répétitives (envoi d'emails, mise a jour de CRM, génération de rapports, publication sur les réseaux sociaux) sont gerees automatiquement, sans erreur et 24h/24.</p>
<p>L'erreur la plus courante est de vouloir tout automatiser d'un coup. Commencez par identifier les 3 processus qui vous prennent le plus de temps et automatisez-les en priorite. Une fois que ces workflows fonctionnent, etendez progressivement. C'est l'approche que nous recommandons a tous nos clients.</p>`,
    ads: `<p>La publicité digitale est un levier puissant quand elle est bien exécutée, et un gouffre financier quand elle ne l'est pas. La différence entre une campagne rentable et une campagne qui gaspille votre budget tient souvent a quelques details : le ciblage, les creatifs, le tracking et l'optimisation continue.</p>
<p>Nous constatons que la majorite des entreprises qui viennent nous voir ont un ROAS (Return On Ad Spend) inferieur a 2. Apres optimisation, nous amenons régulièrement ce ratio a 4, 5, voire 8. Cela signifie que pour chaque euro investi, l'entreprise genere 4 a 8 euros de chiffre d'affaires. La cle ? Un ciblage precis, des creatifs qui captent l'attention en 3 secondes, et un tracking impeccable pour mesurer chaque conversion.</p>
<p>L'autre erreur frequente est de se concentrer sur une seule plateforme. Les meilleures stratégies combinent Google Ads (pour capter l'intention d'achat) et Meta Ads ou TikTok Ads (pour créer la demande). Chaque plateforme a ses forces — les combiner intelligemment multiplie les résultats.</p>`,
    social: `<p>Les réseaux sociaux ne sont pas un canal de vente directe — c'est un canal de construction de confiance. Les marques qui reussissent sur les réseaux sociaux sont celles qui apportent de la valeur avant de demander quoi que ce soit en retour. Education, divertissement, inspiration — c'est la formule gagnante.</p>
<p>La regularite est le facteur le plus important. Publier 3 fois par semaine de maniere consistante pendant 6 mois produira toujours plus de résultats que publier tous les jours pendant 2 semaines puis abandonner. L'algorithme recompense la constance, et votre audience a besoin de temps pour vous decouvrir et vous faire confiance.</p>
<p>Chaque plateforme a sa propre culture et ses propres codes. Ce qui fonctionne sur LinkedIn ne fonctionne pas sur TikTok. Ce qui marche sur Instagram ne marche pas sur Twitter. Adaptez votre contenu a chaque plateforme plutot que de publier le meme contenu partout — vos résultats seront incomparablement meilleurs.</p>`,
    design: `<p>Votre identite visuelle est souvent le premier contact qu'un prospect a avec votre marque. En moins de 5 secondes, il se forme une opinion sur votre professionnalisme, votre positionnement et votre credibilite. Un design amateur envoie un signal de manque de serieux, meme si vos produits ou services sont excellents.</p>
<p>Les marques les plus memorables ont un point commun : la coherence. Chaque point de contact — site web, réseaux sociaux, emails, cartes de visite, presentations — utilise les memes couleurs, les memes polices, le meme ton. Cette coherence construit la reconnaissance de marque au fil du temps.</p>
<p>Ne suivez pas les tendances aveuglement. Un logo minimaliste est a la mode aujourd'hui, mais sera-t-il toujours pertinent dans 5 ans ? Les meilleures identites visuelles sont intemporelles. Pensez a Nike, Apple, Chanel — leurs logos n'ont quasiment pas change en decennies. Privilegiez la simplicite et la lisibilite a l'originalite ephemere.</p>`,
  };

  return extras[category] || extras.seo;
}

async function enrich() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const articles = await Article.find();
  let count = 0;

  for (const article of articles) {
    const originalLength = article.content.length;
    article.content = expandContent(article);

    // Recalculate reading time based on word count
    const wordCount = article.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    article.readingTime = Math.ceil(wordCount / 200);

    // Update excerpt if too short
    if (article.excerpt.length < 150) {
      const plainText = article.content.replace(/<[^>]*>/g, '');
      article.excerpt = plainText.substring(0, 250).trim() + '...';
    }

    await article.save();
    count++;
    const newLength = article.content.length;
    console.log(`${count}/${articles.length} ${article.slug} : ${originalLength} -> ${newLength} chars (${wordCount} words, ${article.readingTime} min)`);
  }

  console.log(`\nDone: ${count} articles enriched`);
  process.exit(0);
}

enrich().catch(e => { console.error(e); process.exit(1); });
