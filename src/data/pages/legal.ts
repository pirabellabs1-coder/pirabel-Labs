import type { PageData } from '../../components/blocks/BlockPage.astro';

const MAIL = '<a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a>';

export const mentions: PageData = {
  path: '/mentions-legales',
  title: 'Mentions légales — Pirabel Labs',
  description: 'Mentions légales du site pirabellabs.com : éditeur (Pirabel Labs, Abomey-Calavi, Bénin), hébergeur, propriété intellectuelle, responsabilités et droit applicable.',
  legacyLd: 'mentions-legales',
  faqLd: false,
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { label: 'Mentions légales' }] },
    {
      kind: 'hero', eyebrow: 'Informations légales', eyebrowIcon: 'scale',
      title: 'Mentions <span class="grad">légales</span>',
      lead: 'Qui édite ce site, qui l’héberge et dans quel cadre juridique : toutes les informations obligatoires, en clair.',
      ctas: [{ href: '/contact', label: 'Nous contacter', primary: true }, { href: '/politique-confidentialite', label: 'Politique de confidentialité' }],
      icons: ['file', 'scale', 'shield'], chips: [{ icon: 'pin', text: 'Abomey-Calavi, Bénin' }, { icon: 'clock', text: 'Mise à jour : 26 septembre 2026' }],
    },
    {
      kind: 'legal', updated: '26 septembre 2026',
      sections: [
        { id: 'editeur', title: 'Éditeur du site', html: `<p>Le site <strong>www.pirabellabs.com</strong> est édité par :</p><dl><dt>Raison sociale</dt><dd>Pirabel Labs — agence de marketing digital</dd><dt>Forme</dt><dd>Établissement immatriculé en qualité de personne physique</dd><dt>Siège social</dt><dd>Abomey-Calavi, République du Bénin</dd><dt>RCCM</dt><dd>RB/ABY/26 A 39852</dd><dt>IFU</dt><dd>0202336099991</dd><dt>E-mail</dt><dd>${MAIL}</dd><dt>Fondateur et promoteur</dt><dd>Lissanon Gildas (propriétaire-exploitant)</dd><dt>Directeur de la publication</dt><dd>Lissanon Gildas</dd></dl>` },
        { id: 'hebergeur', title: 'Hébergeur', html: '<p>Le site est hébergé par :</p><dl><dt>Société</dt><dd>Vercel Inc.</dd><dt>Adresse</dt><dd>340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</dd><dt>Site</dt><dd><a href="https://vercel.com" rel="noopener" target="_blank">vercel.com</a></dd></dl>' },
        { id: 'propriete', title: 'Propriété intellectuelle', html: '<p>L’ensemble du contenu de ce site (textes, images, designs, code, marques, logos) est la propriété exclusive de Pirabel Labs ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable, est strictement interdite.</p><p>Le code source des sites livrés à nos clients leur est intégralement transféré après règlement de la facture finale. Les maquettes Figma, les éléments graphiques et la documentation technique font également l’objet d’un transfert complet à la livraison.</p>' },
        { id: 'responsabilites', title: 'Responsabilités', html: '<p>Pirabel Labs s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées sur ce site, dont elle se réserve le droit de corriger le contenu à tout moment et sans préavis. Toutefois, Pirabel Labs ne peut garantir l’exactitude, la précision ou l’exhaustivité des informations mises à disposition sur ce site.</p><p>En conséquence, Pirabel Labs décline toute responsabilité :</p><ul><li>pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site ;</li><li>pour tout dommage résultant d’une intrusion frauduleuse d’un tiers ayant entraîné une modification des informations mises à disposition ;</li><li>plus généralement, pour tout dommage direct ou indirect, quelles qu’en soient les causes, origines, natures ou conséquences.</li></ul>' },
        { id: 'liens', title: 'Liens hypertextes', html: `<p>Le site peut contenir des liens vers d’autres sites internet. Pirabel Labs n’exerce aucun contrôle sur ces sites et n’assume aucune responsabilité quant à leur contenu, leur disponibilité ou leur politique de confidentialité.</p><p>La création de liens vers la page d’accueil du site www.pirabellabs.com est libre. Toute autre forme de lien (lien profond, intégration en cadre) doit faire l’objet d’une demande écrite préalable à ${MAIL}.</p>` },
        { id: 'cookies', title: 'Cookies et mesure d’audience', html: '<p>Le site utilise des cookies pour mesurer l’audience (Google Analytics 4), uniquement après votre consentement, et pour améliorer l’expérience utilisateur. Vous pouvez modifier votre choix à tout moment ou configurer votre navigateur pour refuser ces cookies. Pour plus d’informations, consultez notre <a href="/politique-confidentialite">politique de confidentialité</a>.</p>' },
        { id: 'droit', title: 'Droit applicable et juridiction', html: '<p>Les présentes mentions légales sont soumises au droit béninois. En cas de litige et à défaut d’accord amiable, le litige sera porté devant les tribunaux compétents d’Abomey-Calavi.</p><p>Pour nos clients situés dans l’Union européenne, les dispositions applicables du droit européen, notamment le RGPD, sont prises en compte.</p>' },
      ],
    },
  ],
};

export const privacy: PageData = {
  path: '/politique-confidentialite',
  title: 'Politique de confidentialité et RGPD — Pirabel Labs',
  description: 'Comment Pirabel Labs collecte, utilise et protège vos données : finalités, bases légales, durées de conservation, cookies et droits RGPD.',
  legacyLd: 'politique-confidentialite',
  faqLd: false,
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { label: 'Politique de confidentialité' }] },
    {
      kind: 'hero', eyebrow: 'RGPD & protection des données', eyebrowIcon: 'lock',
      title: 'Politique de <span class="grad">confidentialité</span>',
      lead: 'Quelles données nous collectons, pourquoi, combien de temps nous les gardons et comment exercer vos droits. Nous ne vendons jamais vos données.',
      ctas: [{ href: 'mailto:contact@pirabellabs.com', label: 'Exercer mes droits', primary: true }, { href: '/mentions-legales', label: 'Mentions légales' }],
      icons: ['lock', 'shield', 'key'], chips: [{ icon: 'shield', text: 'Principes du RGPD appliqués' }, { icon: 'clock', text: 'Réponse sous 30 jours' }],
    },
    {
      kind: 'legal', updated: '14 juin 2026',
      sections: [
        { id: 'preambule', title: 'Préambule', html: '<p>Pirabel Labs accorde une grande importance à la protection de vos données personnelles. Cette politique décrit comment nous collectons, utilisons, partageons et protégeons les informations vous concernant lorsque vous utilisez notre site web ou nos services.</p><p>Nous appliquons les principes du <strong>Règlement général sur la protection des données</strong> (RGPD, règlement UE 2016/679) à tous nos clients et visiteurs, qu’ils soient situés dans l’Union européenne ou non.</p>' },
        { id: 'responsable', title: 'Responsable du traitement', html: `<dl><dt>Responsable</dt><dd>Pirabel Labs</dd><dt>Siège social</dt><dd>Abomey-Calavi, République du Bénin</dd><dt>Contact (DPO)</dt><dd>${MAIL}</dd></dl><p>Pour toute question relative au traitement de vos données, vous pouvez nous écrire à cette adresse.</p>` },
        { id: 'donnees', title: 'Données collectées', html: '<p>Nous collectons les données suivantes :</p><div class="b-table-wrap" tabindex="0" role="region" aria-label="Tableau des données collectées"><table><thead><tr><th scope="col">Type de données</th><th scope="col">Finalité</th><th scope="col">Conservation</th></tr></thead><tbody><tr><td>E-mail professionnel</td><td>Réponse à votre demande, devis, newsletter</td><td>3 ans après le dernier contact</td></tr><tr><td>Prénom, nom</td><td>Personnalisation des échanges</td><td>3 ans après le dernier contact</td></tr><tr><td>Téléphone</td><td>Rappel pour un devis ou le démarrage d’un projet</td><td>3 ans après le dernier contact</td></tr><tr><td>Entreprise</td><td>Compréhension du contexte de votre activité</td><td>3 ans après le dernier contact</td></tr><tr><td>URL de votre site</td><td>Réalisation d’un audit gratuit</td><td>1 an après l’audit</td></tr><tr><td>Cookies analytiques (GA4)</td><td>Mesure d’audience anonymisée</td><td>13 mois (recommandation de la CNIL)</td></tr><tr><td>Cookies Clarity / Hotjar</td><td>Analyse comportementale de l’expérience utilisateur</td><td>13 mois</td></tr></tbody></table></div>' },
        { id: 'bases', title: 'Bases légales du traitement', html: '<p>Selon le type de données, nous appliquons l’une des bases légales suivantes :</p><ul><li><strong>Exécution contractuelle</strong> : données nécessaires à la réalisation de nos prestations (clients actifs) ;</li><li><strong>Consentement</strong> : newsletter, cookies non essentiels, audit gratuit (case à cocher obligatoire) ;</li><li><strong>Intérêt légitime</strong> : prospection commerciale B2B, mesure d’audience anonymisée ;</li><li><strong>Obligation légale</strong> : archivage des factures (10 ans), comptabilité.</li></ul>' },
        { id: 'droits', title: 'Vos droits', html: `<p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p><ul><li><strong>Droit d’accès</strong> : obtenir une copie de vos données ;</li><li><strong>Droit de rectification</strong> : corriger les informations inexactes ;</li><li><strong>Droit à l’effacement</strong> : demander la suppression de vos données ;</li><li><strong>Droit à la limitation</strong> : restreindre temporairement le traitement ;</li><li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré ;</li><li><strong>Droit d’opposition</strong> : vous opposer au traitement de vos données ;</li><li><strong>Droit de retirer votre consentement</strong> : à tout moment, en un clic ;</li><li><strong>Droit d’introduire une réclamation</strong> auprès de la <a href="https://www.cnil.fr" rel="noopener" target="_blank">CNIL</a> (France) ou de votre autorité de contrôle nationale.</li></ul><p>Pour exercer ces droits, écrivez-nous à ${MAIL}. Nous répondons sous 30 jours au maximum.</p>` },
        { id: 'partage', title: 'Partage des données', html: '<p>Nous ne vendons jamais vos données. Nous les partageons uniquement avec :</p><ul><li><strong>nos sous-traitants techniques</strong> : Vercel (hébergement), Brevo (e-mailing), HubSpot (CRM), Stripe (paiements), tous engagés dans une démarche de conformité au RGPD ;</li><li><strong>les autorités légales</strong>, uniquement sur réquisition judiciaire ou obligation légale.</li></ul><p>Certains de nos sous-traitants sont situés hors de l’Union européenne (aux États-Unis pour Vercel, par exemple). Ces transferts sont encadrés par les <strong>clauses contractuelles types</strong> de la Commission européenne (décision 2021/914), qui garantissent un niveau de protection équivalent.</p>' },
        { id: 'cookies', title: 'Cookies', html: '<p>Notre site utilise les catégories de cookies suivantes :</p><ul><li><strong>Cookies essentiels</strong> : fonctionnement du site (aucun consentement requis) ;</li><li><strong>Cookies analytiques</strong> : Google Analytics 4 anonymisé, Microsoft Clarity (consentement requis) ;</li><li><strong>Cookies marketing</strong> : aucun cookie publicitaire actif à ce jour.</li></ul><p>Vous pouvez accepter ou refuser les cookies non essentiels via la bannière dédiée, et gérer les cookies directement dans les paramètres de votre navigateur (Chrome, Firefox, Safari, Edge).</p>' },
        { id: 'securite', title: 'Sécurité des données', html: '<p>Nous mettons en place des mesures techniques et organisationnelles pour protéger vos données :</p><ul><li>chiffrement HTTPS sur l’ensemble du site (TLS 1.3) ;</li><li>hébergement sur des infrastructures certifiées ISO 27001 ;</li><li>accès aux données strictement limité aux personnes habilitées ;</li><li>sauvegardes chiffrées quotidiennes ;</li><li>surveillance continue contre les intrusions et les attaques ;</li><li>sensibilisation régulière de notre équipe à la cybersécurité.</li></ul>' },
        { id: 'modifications', title: 'Modifications de cette politique', html: '<p>Nous pouvons mettre à jour cette politique de confidentialité pour refléter l’évolution de nos pratiques ou de la législation. La date de dernière mise à jour est indiquée dans le sommaire. En cas de changement majeur, nous vous en informerons par e-mail ou via un bandeau visible sur le site.</p>' },
        { id: 'contact', title: 'Une question ?', html: `<p>Pour toute question relative à vos données personnelles ou à cette politique de confidentialité, écrivez-nous à ${MAIL}. Nous nous engageons à vous répondre sous 30 jours ouvrés.</p>` },
      ],
    },
  ],
};
