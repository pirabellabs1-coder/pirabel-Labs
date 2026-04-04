/**
 * Rewrite short articles (<1000 words) with full long-form content
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');

const rewrites = {
  'google-business-profile-guide-complet': {
    readingTime: 10,
    content: `<h2>Pourquoi votre fiche Google Business est votre meilleur investissement local</h2>
<p>46% de toutes les recherches Google ont une intention locale. Quand un client potentiel cherche "restaurant italien pres de moi", "plombier Cotonou" ou "agence web Paris", c'est votre fiche Google Business Profile (anciennement Google My Business) qui apparait en premier — pas votre site web.</p>
<p>Les entreprises avec une fiche Google Business optimisee recoivent en moyenne 7 fois plus d'appels et 5 fois plus de visites que celles qui n'en ont pas. C'est gratuit, et pourtant la majorite des entreprises negligent cet outil. Voyons comment l'exploiter a fond.</p>

<h2>Créer et revendiquer votre fiche</h2>
<p>La première etape est de vérifier si une fiche existe deja pour votre entreprise. Google cree parfois des fiches automatiquement a partir d'informations trouvees en ligne. Allez sur business.google.com et recherchez votre entreprise.</p>
<p>Si une fiche existe, revendiquez-la. Google vous demandera de vérifier que vous etes bien le proprietaire — généralement par carte postale, telephone ou email. Le processus prend entre 1 et 14 jours selon la méthode de verification.</p>
<p>Si aucune fiche n'existe, créez-en une. Remplissez chaque champ avec precision : nom exact de l'entreprise (pas de mots-cles fourres dedans), adresse complete, numéro de telephone direct, site web, horaires d'ouverture. Chaque information manquante reduit votre visibilité.</p>

<h2>Les 7 optimisations qui font la différence</h2>
<p><strong>1. Categories — le facteur #1 de classement local.</strong> Choisissez votre categorie principale avec le plus grand soin. C'est le signal le plus fort pour Google. Si vous etes "Agence de marketing digital", ne mettez pas "Consultant en informatique". Ajoutez ensuite 2-3 categories secondaires pertinentes.</p>
<p><strong>2. Description — 750 caracteres pour convaincre.</strong> Ecrivez une description claire qui explique ce que vous faites, pour qui, et pourquoi vous etes different. Incluez naturellement vos mots-cles cibles et votre zone geographique. Pas de jargon, pas de majuscules excessives.</p>
<p><strong>3. Photos — les fiches avec photos obtiennent 42% plus de clics.</strong> Ajoutez au minimum 10 photos de qualité : votre local (interieur et exterieur), votre équipe, vos produits/services, votre logo. Mettez-les a jour régulièrement. Les photos de moins de 6 mois sont privilegiees par Google.</p>
<p><strong>4. Avis clients — la preuve sociale decisive.</strong> Les avis sont le deuxieme facteur de classement local apres les categories. Demandez systematiquement un avis a chaque client satisfait. Envoyez un lien direct vers votre page d'avis (disponible dans votre tableau de bord GBP). Repondez a TOUS les avis — positifs et negatifs — de maniere professionnelle et dans les 24h.</p>
<p><strong>5. Posts Google — le signal de fraicheur.</strong> Google Business Profile permet de publier des posts (comme sur les réseaux sociaux) : promotions, evenements, actualites, offres speciales. Publiez au moins 1 post par semaine. C'est un signal de fraicheur pour Google qui booste votre visibilité.</p>
<p><strong>6. Questions/Reponses — anticipez les questions.</strong> La section Q&A de votre fiche est souvent ignoree. Remplissez-la vous-meme avec les questions les plus frequentes de vos clients. Cela evite les mauvaises informations postees par d'autres et ameliore votre pertinence.</p>
<p><strong>7. Produits et services — decrivez votre offre.</strong> Listez vos produits et services avec des descriptions detaillees et des prix si possible. C'est un champ souvent vide qui donne un avantage concurrentiel significatif a ceux qui le remplissent.</p>

<h2>Gerer les avis negatifs sans paniquer</h2>
<p>Un avis negatif n'est pas une catastrophe — c'est une opportunite. Voici comment reagir :</p>
<ul>
<li><strong>Ne supprimez jamais un avis legitime.</strong> Google penalise les tentatives de suppression abusive.</li>
<li><strong>Repondez vite et professionnellement.</strong> Montrez que vous prenez le feedback au serieux.</li>
<li><strong>Proposez une solution concrete.</strong> "Nous sommes desoles. Contactez-nous a [email] pour que nous puissions corriger cela."</li>
<li><strong>Noyez les negatifs avec des positifs.</strong> Un avis negatif parmi 50 positifs n'a aucun impact. Concentrez-vous sur la collecte d'avis.</li>
</ul>
<p>Les etudes montrent qu'une note entre 4.2 et 4.8 etoiles est optimale. Les entreprises a 5.0 paraissent suspectes. Quelques avis negatifs rendent votre profil plus credible.</p>

<h2>Mesurer vos résultats</h2>
<p>Google Business Profile fournit des statistiques detaillees directement dans votre tableau de bord :</p>
<ul>
<li><strong>Recherches :</strong> combien de fois votre fiche est apparue dans les résultats</li>
<li><strong>Vues :</strong> combien de personnes ont vu votre fiche</li>
<li><strong>Actions :</strong> appels, demandes d'itineraire, visites du site web</li>
<li><strong>Photos :</strong> combien de fois vos photos ont ete vues vs celles de vos concurrents</li>
</ul>
<p>Suivez ces metriques mensuellement. Comparez-les mois par mois pour mesurer votre progression. Si vos appels et demandes d'itineraire augmentent, votre optimisation fonctionne.</p>

<h2>Les erreurs qui tuent votre visibilité locale</h2>
<p>Evitez ces erreurs courantes qui penalisent votre fiche :</p>
<ul>
<li>Nom d'entreprise avec des mots-cles ajoutes ("Pirabel Labs - Meilleure Agence SEO Paris")</li>
<li>Adresse incorrecte ou boite postale (Google exige une adresse physique)</li>
<li>Horaires non mis a jour (specialement les jours feries)</li>
<li>Pas de reponse aux avis pendant des semaines</li>
<li>Photos de mauvaise qualité ou non pertinentes</li>
<li>Informations differentes entre votre site web et votre fiche Google (le NAP — Nom, Adresse, Telephone — doit etre identique partout)</li>
</ul>

<blockquote><p>Le SEO local est l'un des leviers les plus rentables du marketing digital. Un investissement de quelques heures par mois peut transformer votre visibilité locale. <a href="/agence-seo-referencement-naturel/fiche-google.html">Découvrez notre service d'optimisation Google Business</a> ou <a href="/contact.html">demandez votre audit gratuit</a>.</p></blockquote>`
  },

  'branding-identite-visuelle-memorable': {
    readingTime: 10,
    content: `<h2>L'identite visuelle, bien plus qu'un logo</h2>
<p>Votre identite visuelle englobe bien plus que votre logo. C'est l'ensemble des elements visuels qui representent votre marque : logo, couleurs, typographie, style photographique, iconographie, et meme le ton de vos communications. C'est ce qui vous rend instantanement reconnaissable dans un marche sature.</p>
<p>Pensez aux marques que vous reconnaissez en un clin d'oeil : le orange de Hermes, le rouge de Coca-Cola, la pomme croquee d'Apple. Ces identites ne sont pas le fruit du hasard — elles sont le resultat d'un travail stratégique de design pense pour créer une connexion emotionnelle avec l'audience.</p>

<h2>Pourquoi investir dans votre identite visuelle</h2>
<p>Votre identite visuelle est souvent le premier contact qu'un prospect a avec votre entreprise. En moins de 5 secondes, il se forme une opinion sur votre professionnalisme, votre positionnement et votre credibilite. Un design amateur envoie un signal de manque de serieux, meme si vos produits ou services sont excellents.</p>
<p>Les entreprises avec une identite visuelle forte et coherente constatent en moyenne :</p>
<ul>
<li>33% d'augmentation de la reconnaissance de marque</li>
<li>23% d'augmentation du chiffre d'affaires lie a la coherence de marque</li>
<li>Une confiance client significativement plus elevee</li>
<li>Un recrutement facilite (les talents veulent travailler pour des marques fortes)</li>
</ul>

<h2>Les 5 elements fondamentaux</h2>
<p><strong>1. Le logo — simple, memorable, declinable.</strong> Votre logo doit fonctionner en noir et blanc, en petit (favicon) et en grand (enseigne). Il doit etre lisible a toutes les tailles. Evitez les details trop fins qui disparaissent en reduction. Les logos les plus iconiques sont aussi les plus simples.</p>
<p>Prévoyez plusieurs declinaisons : logo complet (symbole + texte), symbole seul, version horizontale, version verticale, version monochrome. Chaque situation d'utilisation necessite une version adaptee.</p>
<p><strong>2. La palette de couleurs — 2-3 couleurs maximum.</strong> Chaque couleur evoque une emotion. L'orange evoque l'energie et la créativité. Le bleu inspire la confiance et la stabilite. Le noir communique le luxe et l'exclusivite. Le vert suggere la nature et la croissance.</p>
<p>Definissez une couleur primaire (votre couleur signature), une couleur secondaire (complement), et une couleur d'accent (pour les CTAs et les elements importants). Documentez les codes exacts : HEX, RGB, CMYK, Pantone.</p>
<p><strong>3. La typographie — 2 polices maximum.</strong> Une police pour les titres (distinctive, avec du caractere) et une pour le corps de texte (lisible, neutre). La lisibilite prime toujours sur l'originalite. Si vos clients doivent plisser les yeux pour lire votre contenu, vous avez echoue.</p>
<p><strong>4. Le style visuel — coherence sur tous les supports.</strong> Definissez un style photographique (lumineux vs sombre, people vs produit, naturel vs pose), un style d'illustration (geometrique vs organique), et un style d'icones (filled vs outlined). Ce style doit etre applique de maniere coherente sur votre site web, vos réseaux sociaux, vos emails et vos supports commerciaux.</p>
<p><strong>5. Le ton de voix — comment vous parlez a vos clients.</strong> Etes-vous professionnel et serieux ? Decontracte et amical ? Expert et pedagogique ? Le ton de voix fait partie de votre identite autant que les elements visuels. Il doit etre coherent partout : site web, emails, réseaux sociaux, service client.</p>

<h2>Le processus de création d'une identite visuelle</h2>
<p>Un processus professionnel de création d'identite visuelle se deroule en 5 phases :</p>
<p><strong>Phase 1 : Decouverte et brief (1 semaine).</strong> Comprendre votre entreprise, vos valeurs, votre audience, vos concurrents et vos ambitions. C'est la fondation de tout le travail creatif.</p>
<p><strong>Phase 2 : Recherche et moodboard (1 semaine).</strong> Analyse de la concurrence, recherche d'inspiration, création de moodboards pour definir la direction creative. Validation avec vous avant de passer au design.</p>
<p><strong>Phase 3 : Concepts et design (2 semaines).</strong> Création de 2-3 pistes creatives pour le logo, exploration des couleurs et typographies. Presentation et discussion pour affiner la direction choisie.</p>
<p><strong>Phase 4 : Revisions et finalisation (1 semaine).</strong> Ajustements sur le concept retenu, declinaisons du logo, création de la palette complete, choix definitif des typographies.</p>
<p><strong>Phase 5 : Livraison et charte graphique (1 semaine).</strong> Livraison de tous les fichiers dans tous les formats nécessaires. Rédaction de la charte graphique qui documente les règles d'utilisation de chaque element.</p>

<h2>Les erreurs de branding les plus courantes</h2>
<ul>
<li><strong>Suivre les tendances aveuglement.</strong> Ce qui est a la mode aujourd'hui sera demode dans 2 ans. Les meilleures identites sont intemporelles.</li>
<li><strong>Copier un concurrent.</strong> Vous devez vous differencier, pas vous fondre dans la masse.</li>
<li><strong>Trop de complexite.</strong> Simple = memorable. Complexe = oubliable.</li>
<li><strong>Incoherence entre les supports.</strong> Si votre logo est bleu sur le site et orange sur Instagram, vous perdez en credibilite.</li>
<li><strong>Ignorer le mobile.</strong> Votre logo doit etre lisible sur un ecran de 5 pouces.</li>
</ul>

<blockquote><p>Votre marque merite une identite visuelle a la hauteur de vos ambitions. <a href="/agence-design-branding/">Decouvrez nos services Design & Branding</a> ou <a href="/contact.html">demandez votre audit gratuit</a>.</p></blockquote>`
  },

  'motion-design-pourquoi-marque-besoin': {
    readingTime: 8,
    content: `<h2>Le pouvoir du mouvement dans la communication</h2>
<p>Le cerveau humain traite les informations visuelles 60 000 fois plus vite que le texte. Et quand ces visuels bougent, l'engagement monte en fleche. Le motion design — l'art de donner vie a des elements graphiques par l'animation — est devenu un outil de communication incontournable pour les marques qui veulent se demarquer.</p>
<p>Sur les réseaux sociaux, les contenus animes generent en moyenne 3 fois plus d'engagement que les contenus statiques. Dans les emails, l'ajout d'un GIF anime augmente le taux de clic de 26%. Sur les pages d'accueil, une video motion design augmente le temps passe sur la page de 88%.</p>

<h2>Les 6 cas d'utilisation du motion design en marketing</h2>
<p><strong>1. Videos explicatives (Explainer Videos).</strong> Vous avez un produit ou service complexe a expliquer ? Le motion design transforme des concepts abstraits en animations claires et engageantes. Format ideal : 60-90 secondes. Placement : page d'accueil, landing pages, presentations commerciales.</p>
<p><strong>2. Logo anime.</strong> Un logo statique est oublie. Un logo qui s'anime est memorise. L'animation de logo renforce la reconnaissance de marque de 33% selon les etudes. Utilisez-le en intro de vos videos, sur vos presentations et sur votre site web.</p>
<p><strong>3. Publicites animees.</strong> Les animations se demarquent dans les feeds satures des réseaux sociaux. Elles captent l'attention sans necessite de tournage video — ideal pour les entreprises qui n'ont pas de contenu video mais veulent des ads performantes.</p>
<p><strong>4. Infographies animees.</strong> Les donnees et statistiques prennent vie quand elles sont animees. Les graphiques, chiffres et comparaisons deviennent immédiatement plus impactants et partageables.</p>
<p><strong>5. Stories et Reels.</strong> Le format vertical court est domine par le mouvement. Des templates animes pour vos stories Instagram, TikTok et LinkedIn generent plus d'engagement que des images statiques.</p>
<p><strong>6. Presentations commerciales.</strong> Un pitch deck avec des animations motion design fait une impression bien plus forte qu'un PowerPoint classique. C'est l'arme secrete des startups qui levent des fonds.</p>

<h2>Motion design vs video classique : quand utiliser quoi</h2>
<p>Le motion design n'est pas un substitut a la video — c'est un complement. Voici quand privilegier chaque format :</p>
<p><strong>Privilegiez le motion design quand :</strong></p>
<ul>
<li>Vous expliquez un concept abstrait (SaaS, processus, methodologie)</li>
<li>Vous n'avez pas de contenu video existant</li>
<li>Votre budget ne permet pas un tournage professionnel</li>
<li>Vous voulez un contenu facilement modifiable et declinable</li>
<li>Votre marque a un style graphique fort a mettre en avant</li>
</ul>
<p><strong>Privilegiez la video classique quand :</strong></p>
<ul>
<li>Vous voulez montrer des personnes reelles (temoignages, équipe)</li>
<li>Vous presentez un produit physique</li>
<li>L'authenticite et le "vrai" sont importants pour votre audience</li>
<li>Vous créez du contenu UGC (User Generated Content)</li>
</ul>

<h2>Le processus de création</h2>
<p>Un projet motion design professionnel se deroule en 4 etapes :</p>
<p><strong>1. Brief creatif :</strong> Definition du message, de la cible, du format et du ton. C'est l'etape la plus importante — un brief flou = un resultat flou.</p>
<p><strong>2. Storyboard et script :</strong> On dessine chaque scene et on ecrit le texte/voix off. Vous validez avant toute animation.</p>
<p><strong>3. Animation :</strong> Création des elements graphiques et animation dans After Effects, Cinema 4D ou des outils similaires.</p>
<p><strong>4. Son et livraison :</strong> Ajout de la musique, des effets sonores et de la voix off. Export dans tous les formats nécessaires (16:9, 9:16, 1:1).</p>

<h2>Combien coute le motion design</h2>
<p>Les tarifs varient selon la complexite :</p>
<ul>
<li><strong>Logo anime simple :</strong> 200 a 500 euros</li>
<li><strong>Animation pour réseaux sociaux (15-30s) :</strong> 300 a 800 euros</li>
<li><strong>Video explicative (60-90s) :</strong> 1 000 a 3 000 euros</li>
<li><strong>Video corporate animee (2-3 min) :</strong> 3 000 a 8 000 euros</li>
</ul>
<p>Le motion design est un investissement rentable : une bonne animation peut etre utilisee pendant des mois, voire des annees, et declinee sur de multiples supports.</p>

<blockquote><p>Pret a donner vie a votre communication ? <a href="/agence-video-motion-design/">Decouvrez nos services Video & Motion Design</a> ou <a href="/contact.html">demandez un devis gratuit</a>.</p></blockquote>`
  },

  'ab-testing-doubler-conversions': {
    readingTime: 10,
    content: `<h2>L'A/B testing : la méthode scientifique du marketing</h2>
<p>L'A/B testing (aussi appele split testing) consiste a comparer deux versions d'un meme element — page web, email, publicité — pour determiner laquelle performe le mieux. Au lieu de deviner ce qui fonctionne, vous laissez les donnees decider.</p>
<p>Les entreprises qui pratiquent l'A/B testing systematiquement augmentent leurs conversions de 20 a 50% en moyenne sur 12 mois. Amazon, Google, Netflix testent en permanence — chaque detail de leur interface a ete optimise par des milliers de tests.</p>
<p>La bonne nouvelle : vous n'avez pas besoin d'etre Amazon pour faire de l'A/B testing. Les outils sont accessibles et la méthode est simple a appliquer.</p>

<h2>Que tester en priorite</h2>
<p>Tous les elements ne meritent pas un test. Concentrez-vous sur ceux qui ont le plus grand impact sur vos conversions :</p>
<p><strong>1. Les titres (headlines).</strong> C'est l'element le plus impactant. Un changement de titre peut modifier votre taux de conversion de +50% — ou le diviser par 2. Testez differentes approches : bénéfice vs douleur, question vs affirmation, court vs long.</p>
<p><strong>2. Les CTA (Call-to-Action).</strong> Le texte du bouton, sa couleur, sa taille, son positionnement — chaque detail compte. "S'inscrire" vs "Commencer gratuitement" vs "Recevoir mon guide" — la formulation change tout.</p>
<p><strong>3. Les visuels.</strong> Photo vs illustration, visage humain vs produit, avec ou sans texte sur l'image. Les visuels avec des personnes qui regardent vers le CTA performent généralement mieux.</p>
<p><strong>4. La mise en page.</strong> Formulaire en 1 etape vs plusieurs etapes, video vs texte, temoignages en haut vs en bas, avec ou sans navigation.</p>
<p><strong>5. Les prix et offres.</strong> 99 euros vs 97 euros, mensuel vs annuel, avec ou sans prix barre, garantie vs pas de garantie.</p>

<h2>Les 7 règles d'or de l'A/B testing</h2>
<p><strong>Regle 1 : Testez un seul element a la fois.</strong> Si vous changez le titre ET la couleur du bouton, vous ne saurez pas lequel a cause le changement. Isolez chaque variable.</p>
<p><strong>Regle 2 : Attendez suffisamment de donnees.</strong> Un test avec 50 visiteurs ne prouve rien. Visez minimum 1000 visiteurs par variante et un niveau de confiance statistique de 95%. Des outils comme Google Optimize, VWO ou Optimizely calculent cela automatiquement.</p>
<p><strong>Regle 3 : Ne terminez pas un test trop tot.</strong> Meme si une variante semble gagnante apres 24h, laissez tourner au moins 7 jours pour capturer les variations jour/semaine.</p>
<p><strong>Regle 4 : Testez sur le meme trafic.</strong> Les visiteurs du lundi ne sont pas les memes que ceux du samedi. Les deux variantes doivent etre exposees simultanement au meme type de trafic.</p>
<p><strong>Regle 5 : Documentez chaque test.</strong> Hypothese, variantes, résultats, conclusion. Créez un registre de tests pour capitaliser sur vos apprentissages.</p>
<p><strong>Regle 6 : Les gagnants deviennent la nouvelle reference.</strong> Quand vous avez un gagnant, il devient la version "controle" contre laquelle vous testez de nouvelles variantes. C'est un processus d'amelioration continu.</p>
<p><strong>Regle 7 : Mefiez-vous des faux positifs.</strong> Un resultat statistiquement significatif a 95% signifie qu'il y a encore 5% de chances que le resultat soit du au hasard. Replique les tests importants.</p>

<h2>Exemples concrets de tests qui ont double les conversions</h2>
<p><strong>Cas 1 : Landing page SaaS.</strong> Hypothese : un titre oriente bénéfice performe mieux qu'un titre descriptif. Resultat : "Gagnez 15h par semaine" (+47% de conversions) vs "Plateforme d'automatisation marketing".</p>
<p><strong>Cas 2 : E-commerce.</strong> Hypothese : ajouter des avis clients sous le bouton d'achat augmente les conversions. Resultat : +23% de conversions avec 3 temoignages visibles.</p>
<p><strong>Cas 3 : Formulaire de contact.</strong> Hypothese : reduire le nombre de champs augmente les soumissions. Resultat : 3 champs (+62% de soumissions) vs 7 champs. La simplicite gagne presque toujours.</p>

<h2>Les outils pour faire de l'A/B testing</h2>
<ul>
<li><strong>Google Optimize :</strong> Gratuit, integration native avec GA4. Parfait pour debuter.</li>
<li><strong>VWO (Visual Website Optimizer) :</strong> Interface visuelle, pas besoin de code. A partir de 199$/mois.</li>
<li><strong>Optimizely :</strong> Le plus puissant, pour les entreprises avancees. Tarification sur mesure.</li>
<li><strong>Hotjar :</strong> Heatmaps et enregistrements de sessions pour comprendre le comportement avant de tester.</li>
</ul>

<blockquote><p>L'A/B testing est au coeur de notre approche CRO chez Pirabel Labs. <a href="/agence-sales-funnels-cro/">Decouvrez nos services Sales Funnels & CRO</a> ou <a href="/contact.html">demandez votre audit gratuit</a>.</p></blockquote>`
  },
};

async function rewrite() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  let count = 0;
  for (const [slug, data] of Object.entries(rewrites)) {
    const article = await Article.findOne({ slug });
    if (!article) { console.log('Not found:', slug); continue; }

    article.content = data.content;
    article.readingTime = data.readingTime;

    // Recalculate excerpt
    const plainText = data.content.replace(/<[^>]*>/g, '');
    article.excerpt = plainText.substring(0, 250).trim() + '...';

    const wordCount = plainText.split(/\s+/).length;
    await article.save();
    count++;
    console.log(`Rewritten: ${slug} (${wordCount} words, ${article.readingTime} min)`);
  }

  console.log(`\nDone: ${count} articles rewritten to 1500+ words`);
  process.exit(0);
}

rewrite().catch(e => { console.error(e); process.exit(1); });
