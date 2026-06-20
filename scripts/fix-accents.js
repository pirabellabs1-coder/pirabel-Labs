// Corrige les accents manquants (ASCII -> accentué) avec un dictionnaire SÛR.
// Modes :
//   node scripts/fix-accents.js dry|apply <files...>        (texte + JS strings ; pour fichiers admin)
//   node scripts/fix-accents.js htmldry|htmlapply <files...> (UNIQUEMENT le texte visible entre > et < ;
//                                                              protège attributs/scripts/styles/slugs ; pour pages publiques)
// Exclus : valeurs de code (publie, qualifie, rejete, envoye, reference...) + mots ambigus (a/ou/sur/du).
// Frontières \b + on ne touche pas un mot collé à -, /, . (slug/URL/classe CSS/propriété).
const fs = require('fs');

const DICT = {
  'etre':'être','meme':'même','memes':'mêmes','tres':'très','apres':'après','pres':'près',
  'deja':'déjà','voila':'voilà','desole':'désolé','desolee':'désolée',
  'enormement':'énormément','completement':'complètement','precedent':'précédent','precedente':'précédente',
  'hesitent':'hésitent','hesiter':'hésiter','hesitez':'hésitez',
  'etoile':'étoile','etoiles':'étoiles','reseau':'réseau','reseaux':'réseaux',
  'journee':'journée','journees':'journées','annee':'année','annees':'années','soiree':'soirée',
  'numero':'numéro','numeros':'numéros',
  'societe':'société','societes':'sociétés','securite':'sécurité','securise':'sécurisé','securisee':'sécurisée',
  'fidelite':'fidélité','fidelisation':'fidélisation','notoriete':'notoriété',
  'requete':'requête','requetes':'requêtes','fenetre':'fenêtre','fenetres':'fenêtres','enquete':'enquête',
  'reponse':'réponse','reponses':'réponses','repondre':'répondre','repondez':'répondez','repondu':'répondu',
  'apercu':'aperçu','apercus':'aperçus','recu':'reçu','recus':'reçus','recue':'reçue','recues':'reçues',
  'francais':'français','francaise':'française','beninoises':'béninoises','beninoise':'béninoise',
  'parametre':'paramètre','parametres':'paramètres',
  'derniere':'dernière','dernieres':'dernières','premiere':'première','premieres':'premières',
  'moderation':'modération','moderer':'modérer','moderee':'modérée','moderez':'modérez','modere':'modéré',
  'caractere':'caractère','caracteres':'caractères',
  'strategie':'stratégie','strategies':'stratégies','strategique':'stratégique',
  'categorie':'catégorie','categories':'catégories',
  'generer':'générer','genere':'généré','generee':'générée','generees':'générées','generes':'générés','generation':'génération',
  'detaille':'détaillé','detaillee':'détaillée','detaillees':'détaillées',
  'selectionne':'sélectionné','selectionnee':'sélectionnée','selectionnez':'sélectionnez','selectionner':'sélectionner',
  'enregistre':'enregistré','enregistree':'enregistrée','enregistrer':'enregistrer','enregistrement':'enregistrement',
  'supprime':'supprimé','supprimee':'supprimée','supprimer':'supprimer','supprimes':'supprimés','suppression':'suppression',
  'envoyee':'envoyée','envoyees':'envoyées','envoyes':'envoyés',
  'accedez':'accédez','acceder':'accéder','acces':'accès','succes':'succès','progres':'progrès',
  'verifier':'vérifier','verifiez':'vérifiez','verifie':'vérifié','verifiee':'vérifiée','verification':'vérification',
  'integre':'intégré','integree':'intégrée','integrer':'intégrer',
  'creee':'créée','creees':'créées','crees':'créés','creer':'créer','creez':'créez',
  'modifie':'modifié','modifiee':'modifiée','telecharger':'télécharger','telechargement':'téléchargement','telechargements':'téléchargements',
  'fonctionnalite':'fonctionnalité','fonctionnalites':'fonctionnalités','disponibilite':'disponibilité',
  'publiee':'publiée','publiees':'publiées',
  'developpement':'développement','developpe':'développé','experience':'expérience',
  'evenement':'événement','evenements':'événements','element':'élément','elements':'éléments',
  'donnees':'données','donnee':'donnée','idee':'idée','idees':'idées','etape':'étape','etapes':'étapes',
  'necessaire':'nécessaire','prefere':'préféré','operation':'opération','operations':'opérations',
  'qualite':'qualité','qualites':'qualités','realisations':'réalisations','realisation':'réalisation',
  'methodologie':'méthodologie','video':'vidéo','videos':'vidéos','redaction':'rédaction','redactionnel':'rédactionnel',
  'referencement':'référencement','specialise':'spécialisé','specialisee':'spécialisée','dediee':'dédiée','dedie':'dédié',
  'cle':'clé','cles':'clés','clientele':'clientèle','modele':'modèle','modeles':'modèles','siege':'siège',
  'verifiee':'vérifiée','controle':'contrôle','maitrise':'maîtrise','etudie':'étudié','etude':'étude','etudes':'études',
  // « à » + ville (sûr : on ne « possède » pas une ville)
  'a Cotonou':'à Cotonou','a Paris':'à Paris','a Dakar':'à Dakar','a Abidjan':'à Abidjan','a Casablanca':'à Casablanca','a Douala':'à Douala','a Bamako':'à Bamako','a Conakry':'à Conakry','a Ouagadougou':'à Ouagadougou','a Lyon':'à Lyon','a Marseille':'à Marseille','a Bruxelles':'à Bruxelles','a Tunis':'à Tunis','a Lome':'à Lomé','a Geneve':'à Genève','a Montreal':'à Montréal','a Yaounde':'à Yaoundé',
  // Expressions figées « à » / « où » (non ambiguës)
  'a travers':'à travers','a distance':'à distance','a nouveau':'à nouveau','a savoir':'à savoir','a condition':'à condition','a compter':'à compter','a ce jour':'à ce jour','a temps':'à temps','a terme':'à terme','a long terme':'à long terme','a court terme':'à court terme','a tout moment':'à tout moment','a votre disposition':'à votre disposition','a votre ecoute':'à votre écoute','a vos cotes':'à vos côtés','a la cle':'à la clé',"d'ou":"d'où","n'importe ou":"n'importe où",'par ou':'par où',
  // Ligatures œ
  'coeur':'cœur','coeurs':'cœurs','oeuvre':'œuvre','oeuvres':'œuvres','soeur':'sœur','soeurs':'sœurs','oeil':'œil','voeu':'vœu','voeux':'vœux','noeud':'nœud','moeurs':'mœurs','oeuf':'œuf','oeufs':'œufs',
  // Expressions figées avec « à » (sûres : non ambiguës en contexte)
  'a propos':'à propos','a partir':'à partir',"jusqu'a":"jusqu'à",'grace a':'grâce à','face a':'face à','quant a':'quant à','a la une':'à la une','a venir':'à venir','a jour':'à jour','a domicile':'à domicile','pret a':'prêt à','prete a':'prête à','cle en main':'clé en main','etape par etape':'étape par étape',
  // Mots à accent interne (aucun homographe ASCII)
  'probleme':'problème','problemes':'problèmes','systeme':'système','systemes':'systèmes','reglement':'règlement','regulierement':'régulièrement','particulierement':'particulièrement','generalement':'généralement','immediatement':'immédiatement','specifique':'spécifique','specifiques':'spécifiques','agreable':'agréable','accelerer':'accélérer','reussite':'réussite','reussir':'réussir','interessant':'intéressant','interessante':'intéressante','complementaire':'complémentaire','evolution':'évolution','fiabilite':'fiabilité','accessibilite':'accessibilité','rentabilite':'rentabilité','visibilite':'visibilité','creativite':'créativité','operationnel':'opérationnel','operationnelle':'opérationnelle','referencer':'référencer','dediee':'dédiée','priorite':'priorité','priorites':'priorités','difficulte':'difficulté','difficultes':'difficultés','flexibilite':'flexibilité',
  'etes':'êtes','pret':'prêt','prets':'prêts','prete':'prête','pretes':'prêtes','bientot':'bientôt','plutot':'plutôt','aout':'août','gout':'goût','gouts':'goûts','cout':'coût','couts':'coûts','depot':'dépôt','depots':'dépôts','diplome':'diplôme','diplomes':'diplômes','hopital':'hôpital','theatre':'théâtre','etat':'état','etats':'états','peut-etre':'peut-être','chaine':'chaîne','chaines':'chaînes','maitre':'maître','connaitre':'connaître','paraitre':'paraître','parait':'paraît','apparait':'apparaît','entrainement':'entraînement','benefice':'bénéfice','benefices':'bénéfices',
  // Villes / noms propres
  'Lome':'Lomé','Yaounde':'Yaoundé','Geneve':'Genève','Montreal':'Montréal','Benin':'Bénin','Amerique':'Amérique','Bresil':'Brésil','Senegal':'Sénégal',"Cote d'Ivoire":"Côte d'Ivoire",
  // Mots courants sûrs
  'ecran':'écran','ecrans':'écrans','equipe':'équipe','equipes':'équipes','legal':'légal','legale':'légale','legales':'légales','legaux':'légaux','confidentialite':'confidentialité','droits reserves':'droits réservés','reserve':'réservé','reservee':'réservée','reserves':'réservés',
};

// Mots SÛRS en contexte public (texte + attributs alt/title), mais valeurs de code en admin -> htmltext seulement.
const PUBLIC_EXTRA = {
  'creation':'création','creations':'créations','cree':'créé','creee':'créée','crees':'créés',
  'qualifie':'qualifié','qualifies':'qualifiés','qualifiee':'qualifiée',
  'telephone':'téléphone','telephones':'téléphones','reference':'référence','references':'références',
  'envoye':'envoyé','envoyes':'envoyés','reserves':'réservés','revele':'révélé',
};
// Mots EXCLUS (valeurs de code / champs de formulaire / homographes risqués).
['publie','qualifie','rejete','converti','reference','references','envoye','consulte','accepte','refuse','telephone','email','creation','cree'].forEach(k => delete DICT[k]);

function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

// On NE touche pas un mot collé à -, / (slug/URL) ni précédé d'un . (classe CSS / propriété JS).
function guarded(a, b, txt, counter) {
  const re = new RegExp('\\b' + a + '\\b', 'g');
  return txt.replace(re, (match, offset, full) => {
    const before = full[offset - 1] || '';
    const after = full[offset + match.length] || '';
    if (before === '-' || before === '/' || before === '.' || after === '-' || after === '/') return match;
    counter.n++; return b;
  });
}
function processText(txt) {
  const counter = { n: 0 };
  for (const [a, b] of Object.entries(DICT)) { txt = guarded(a, b, txt, counter); txt = guarded(cap(a), cap(b), txt, counter); }
  return { txt, count: counter.n };
}

// Mode texte HTML : corrige UNIQUEMENT le texte visible (entre > et <). Masque script/style/commentaires.
function fixHtmlText(html) {
  const masks = [];
  const D = String.fromCharCode(1);
  const mask = (re) => { html = html.replace(re, m => { masks.push(m); return D + (masks.length - 1) + D; }); };
  mask(/<script[\s\S]*?<\/script>/gi);
  mask(/<style[\s\S]*?<\/style>/gi);
  mask(/<!--[\s\S]*?-->/g);
  const counter = { n: 0 };
  const ENTRIES = Object.entries(DICT).concat(Object.entries(PUBLIC_EXTRA));
  const applyEnt = (t) => { for (const [a, b] of ENTRIES) { t = guarded(a, b, t, counter); t = guarded(cap(a), cap(b), t, counter); } return t; };
  // Attributs d'AFFICHAGE seulement (jamais href/src/name/id) — espace avant pour éviter data-title etc.
  html = html.replace(/ (alt|title|aria-label|placeholder)="([^"]*)"/gi, (m, attr, val) => ' ' + attr + '="' + applyEnt(val) + '"');
  // Meta description / og:title / og:description / og:site_name
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => /name="description"|property="og:(title|description|site_name)"/i.test(tag) ? tag.replace(/content="([^"]*)"/i, (mm, c) => 'content="' + applyEnt(c) + '"') : tag);
  html = html.replace(/>([^<]+)</g, (m, text) => {
    let t = applyEnt(text);
    t = t.replace(/\.\.\.+/g, () => { counter.n++; return '…'; });
    // Espace insécable avant ! et ? (typo FR). Pas ; ni : (collision avec entités HTML / heures).
    t = t.replace(/([A-Za-zÀ-ÖØ-öø-ÿ0-9)»"'])[ \t]*([!?])/g, (mm, p1, p2) => { counter.n++; return p1 + ' ' + p2; });
    return '>' + t + '<';
  });
  html = html.replace(new RegExp(D + '(\\d+)' + D, 'g'), (m, i) => masks[+i]);
  return { txt: html, count: counter.n };
}

const mode = process.argv[2] || 'dry';
const files = process.argv.slice(3);
const htmlMode = mode === 'htmldry' || mode === 'htmlapply';
const writeMode = mode === 'apply' || mode === 'htmlapply';
let grand = 0;
for (const f of files) {
  const orig = fs.readFileSync(f, 'utf8');
  const { txt, count } = htmlMode ? fixHtmlText(orig) : processText(orig);
  grand += count;
  if (count > 0) {
    console.log(count + '\t' + f);
    if (writeMode) fs.writeFileSync(f, txt, 'utf8');
  }
}
console.log('\n' + (writeMode ? 'APPLIQUÉ' : 'DRY-RUN') + ' (' + mode + ') : ' + grand + ' corrections sur ' + files.length + ' fichier(s).');
