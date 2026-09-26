import type { PageData } from '../../components/blocks/BlockPage.astro';

const WA = 'https://wa.me/16139273067?text=Bonjour%20Pirabel%20Labs%2C%20j%E2%80%99ai%20un%20projet%20IA';

export const page: PageData = {
  path: '/solutions-ia',
  title: 'Solutions IA sur mesure : RAG, agents, ML | Pirabel Labs',
  description: 'IA sur mesure pour PME et grands comptes francophones : RAG sur vos documents, agents autonomes, fine-tuning, modèles prédictifs. Du POC à la production.',
  legacyLd: 'solutions-ia',
  footerCta: {
    title: 'Prêt à lancer votre projet d’IA ?',
    text: 'Appel découverte gratuit de 30 minutes, puis devis ferme sous 48 h, sans engagement. Réponse garantie du fondateur.',
    href: '/contact?service=solutions-ia',
    label: 'Demander mon devis',
  },
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { href: '/services', label: 'Services' }, { label: 'Solutions IA sur mesure' }] },
    {
      kind: 'hero',
      eyebrow: 'Solutions IA pour entreprises',
      eyebrowIcon: 'brain',
      title: 'Solutions <span class="grad">IA sur mesure</span>',
      lead: 'Au-delà des chatbots : des solutions d’intelligence artificielle personnalisées pour automatiser vos processus métier, éclairer vos décisions et créer un avantage concurrentiel durable. Pour les PME et les grands comptes francophones qui veulent industrialiser l’IA.',
      ctas: [
        { href: '/contact?service=solutions-ia', label: 'Demander un devis', primary: true },
        { href: WA, label: 'WhatsApp direct', external: true },
      ],
      icons: ['database', 'brain', 'bot'],
      caption: 'Du POC à la production',
      chips: [
        { icon: 'shield', text: 'Données sécurisées, NDA' },
        { icon: 'chart', text: 'ROI mesuré' },
        { icon: 'cloud', text: 'Déploiement sur site possible' },
      ],
    },
    {
      kind: 'split',
      eyebrow: 'Définition',
      title: 'Au-delà des chatbots : la <span class="grad">vraie intégration de l’IA</span>',
      html: '<p>Une agence de solutions IA conçoit et déploie des <strong>solutions d’intelligence artificielle sur mesure</strong> : recherche augmentée (RAG) sur votre base de connaissances, fine-tuning de modèles, agents autonomes multi-étapes, modèles prédictifs.</p><p>Les chatbots WhatsApp ou web sont le <strong>premier niveau de l’IA</strong>. Les entreprises sérieuses vont plus loin : pipelines RAG sur leurs documents, modèles adaptés à leurs données, agents qui orchestrent des tâches complexes.</p><p>Pirabel Labs accompagne les <strong>PME ambitieuses et les grands comptes francophones</strong> qui veulent industrialiser l’IA dans leurs opérations — une vraie transformation, pas une simple surcouche de ChatGPT.</p>',
      visual: 'brand',
      image: { src: '/img/illus-a.svg', alt: 'Solutions IA sur mesure pour entreprises' },
      points: ['RAG sur vos documents', 'Agents autonomes', 'Modèles prédictifs'],
      reverse: false,
    },
    {
      kind: 'cards', variant: 'insights',
      head: { eyebrow: 'Pourquoi l’IA sur mesure', title: 'Pourquoi des <span class="grad">solutions IA sur mesure</span> ?', lead: 'Au-delà des chatbots, l’IA avancée crée des avantages concurrentiels durables. Six raisons stratégiques.' },
      items: [
        { icon: 'shield', stat: 'Avantage', title: 'Avantage concurrentiel durable', text: 'Une IA bien intégrée à vos processus métier devient une barrière que vos concurrents ne peuvent pas copier en quelques mois.' },
        { icon: 'zap', stat: '×3 à ×10', title: 'Productivité démultipliée', text: 'Sur les tâches de connaissance (juridique, RH, vente, R&D), une bonne intégration de l’IA multiplie la productivité par 3 à 10.' },
        { icon: 'chart', stat: 'Données', title: 'Des décisions fondées sur les données', text: 'Des modèles prédictifs (attrition, valeur client, ventes) qui transforment vos décisions intuitives en décisions mesurables.' },
        { icon: 'check-circle', stat: '−50 à −90 %', title: 'Moins d’erreurs humaines', text: 'L’IA réduit de 50 à 90 % les erreurs sur les tâches répétitives (saisie, classification, conformité).' },
        { icon: 'book', stat: 'RAG', title: 'Vos documents deviennent une réponse', text: 'Des agents qui répondent à partir de votre base de connaissances (wikis, documents, code, FAQ), avec bases vectorielles Pinecone ou Weaviate.' },
        { icon: 'sliders', stat: 'Sur mesure', title: 'Des modèles adaptés à votre métier', text: 'Fine-tuning de modèles (Llama, Mistral, GPT) sur votre domaine : de meilleures performances que les modèles génériques et un coût d’inférence réduit.' },
      ],
    },
    {
      kind: 'cards', variant: 'services',
      head: { eyebrow: 'Nos solutions', title: 'Nos <span class="grad">solutions IA avancées</span>', lead: 'Huit types de solutions pour les entreprises qui ont dépassé le stade du simple chatbot.' },
      items: [
        { icon: 'book', title: 'RAG (génération augmentée par la recherche)', text: 'Un chatbot ou un agent qui répond à partir de votre base de connaissances interne : documents, wikis, code, FAQ. Base vectorielle, embeddings, recherche hybride.' },
        { icon: 'sliders', title: 'Fine-tuning de LLM', text: 'Adaptation d’un modèle ouvert (Llama, Mistral) ou fermé (GPT, Claude) à votre domaine métier : meilleures performances, coût réduit.' },
        { icon: 'workflow', title: 'Agents autonomes multi-étapes', text: 'Des agents qui orchestrent des tâches complexes : recherche web, analyse, rédaction, validation, action. LangChain, CrewAI.' },
        { icon: 'trending', title: 'Modèles prédictifs', text: 'Apprentissage supervisé pour prédire l’attrition, la valeur client, les ventes ou les anomalies. Scikit-learn, PyTorch, XGBoost.' },
        { icon: 'camera', title: 'Vision par ordinateur', text: 'OCR, classification d’images, détection d’objets, contrôle qualité visuel, avec des modèles sur mesure ou existants.' },
        { icon: 'message', title: 'Analyse du langage', text: 'Analyse sémantique de textes : classification, extraction d’entités, sentiment, intention. Pour le service client, le marketing, la veille.' },
        { icon: 'terminal', title: 'API IA prêtes à intégrer', text: 'Des API qui exposent les capacités d’IA à vos développeurs internes, avec une documentation OpenAPI complète.' },
        { icon: 'graduation', title: 'Formation IA de vos équipes', text: 'Formation pratique de vos développeurs et de vos métiers : IA générative, prompt engineering, LangChain, RAG.' },
      ],
    },
    { kind: 'cta', variant: 'inline', title: 'Un cas d’usage en tête ?', text: 'Décrivez-le-nous : première estimation de faisabilité et de ROI sous 24 h, sans engagement.', ctas: [{ href: '/contact?service=solutions-ia', label: 'Demander un devis' }, { href: WA, label: 'WhatsApp', external: true }] },
    {
      kind: 'steps', variant: 'detailed',
      head: { eyebrow: 'Notre approche', title: 'Du POC à l’industrialisation, <span class="grad">en 5 étapes</span>', lead: 'Une méthodologie rigoureuse, centrée sur le retour sur investissement.' },
      items: [
        { tag: 'Audit IA', title: 'Cartographier vos processus', text: '<p>Quelles tâches automatiser, pour quel ROI, avec quelles données et sous quelles contraintes (souveraineté, RGPD, performance).</p>' },
        { tag: 'Stratégie IA', title: 'Une feuille de route sur 12 mois', text: '<p>3 à 5 projets prioritaires, budgets, planning, indicateurs clés et gouvernance.</p>' },
        { tag: 'POC rapide', title: 'Valider sur du réel', text: '<p>Une preuve de concept de 4 à 6 semaines sur le premier cas d’usage, testée avec les utilisateurs cibles et un ROI mesuré — pas une simple démonstration.</p>', meta: '4 à 6 semaines' },
        { tag: 'Industrialisation', title: 'Passer en production', text: '<p>MLOps, supervision (Langfuse, Helicone), sécurité, conformité et formation de l’équipe.</p>', meta: '2 à 4 mois' },
        { tag: 'Amélioration continue', title: 'Faire progresser les modèles', text: '<p>Itérations mensuelles, tests A/B des modèles, nouveaux cas d’usage, mises à jour.</p>', meta: 'Mensuel' },
      ],
    },
    {
      kind: 'cards', variant: 'tools',
      head: { eyebrow: 'Stack IA', title: 'Les meilleurs outils <span class="grad">pour chaque cas d’usage</span>', lead: 'Modèles fermés (OpenAI, Anthropic) ou ouverts (Llama, Mistral) selon vos contraintes de coût, de performance et de souveraineté.' },
      items: [
        { icon: 'bot', title: 'OpenAI GPT', tag: 'Modèles fermés' },
        { icon: 'brain', title: 'Anthropic Claude', tag: 'Modèles fermés' },
        { icon: 'database', title: 'Llama', tag: 'Modèles ouverts' },
        { icon: 'sparkles', title: 'Mistral', tag: 'Modèles ouverts' },
        { icon: 'link', title: 'LangChain', tag: 'Orchestration' },
        { icon: 'database', title: 'Pinecone', tag: 'Base vectorielle' },
        { icon: 'database', title: 'Weaviate', tag: 'Base vectorielle' },
        { icon: 'layers', title: 'Hugging Face', tag: 'Modèles et jeux de données' },
      ],
    },
    {
      kind: 'pricing',
      head: { eyebrow: 'Tarifs', title: 'Tarifs <span class="grad">solutions IA</span>', lead: 'Adaptés à la complexité et au périmètre. Toujours au forfait projet, jamais à l’heure.' },
      items: [
        { icon: 'lightbulb', title: 'POC IA', text: 'Preuve de concept sur un cas d’usage, validée avec vos utilisateurs cibles.', price: '<small>à partir de</small><strong>1 500 €</strong>', features: ['4 à 6 semaines', 'Un cas d’usage prioritaire', 'Mesure du ROI', 'Retours utilisateurs'], href: '/contact?service=solutions-ia' },
        { icon: 'rocket', title: 'Solution IA en production', text: 'Industrialisation : MLOps, supervision, sécurité, formation.', price: '<small>à partir de</small><strong>5 000 €</strong>', features: ['2 à 4 mois', 'Supervision et sécurité', 'Conformité RGPD', 'Formation de l’équipe'], href: '/contact?service=solutions-ia', featured: true, badge: 'Le plus courant' },
        { icon: 'layers', title: 'Plateforme IA complète', text: 'Plusieurs cas d’usage intégrés, gouvernance de l’IA, formation transversale.', price: '<small>sur devis, à partir de</small><strong>10 000 €</strong>', features: ['4 à 9 mois', 'Plusieurs cas d’usage', 'Gouvernance IA', 'Accompagnement continu'], href: '/contact?service=solutions-ia' },
      ],
    },
    {
      kind: 'faq', variant: 'main',
      head: { eyebrow: 'FAQ', title: 'Questions fréquentes sur les <span class="grad">solutions IA</span>' },
      items: [
        { q: 'Quelle différence entre IA générative et apprentissage automatique classique ?', a: 'L’IA générative (ChatGPT, Claude) produit du texte, des images ou du code à partir d’instructions. L’apprentissage automatique classique prédit ou classe à partir de données structurées. Les deux se combinent souvent.' },
        { q: 'Combien coûte une solution IA sur mesure ?', a: 'Un POC de 4 à 6 semaines coûte de 1 500 à 4 000 €. Une solution en production (industrialisation sur 2 à 4 mois) coûte de 5 000 à 15 000 €. Une plateforme IA complète est chiffrée sur devis, à partir de 10 000 €. Pour l’Afrique francophone, ces montants peuvent être facturés en FCFA.' },
        { q: 'Mes données sont-elles vraiment sécurisées ?', a: 'Oui. Les API entreprise (OpenAI, Anthropic) s’engagent à ne pas conserver vos données pour l’entraînement. Pour les données sensibles, nous déployons des modèles ouverts sur vos propres serveurs (Llama, Mistral). Un accord de confidentialité est signé systématiquement.' },
        { q: 'Combien de temps faut-il pour un POC ?', a: 'Un POC simple prend 4 à 6 semaines ; un POC complexe (RAG sur plus de 1 000 documents, fine-tuning) de 8 à 12 semaines. Un POC est une validation réelle, pas une démonstration.' },
        { q: 'Faites-vous du fine-tuning de modèles ?', a: 'Oui : Llama, Mistral, Gemma sur vos données, ainsi que les modèles d’OpenAI qui le permettent. Nous évaluons l’approche optimale au cas par cas — le RAG suffit souvent.' },
        { q: 'Pouvez-vous déployer sur nos propres serveurs ?', a: 'Oui. Pour les contraintes de souveraineté ou de conformité (RGPD strict, santé, défense), nous déployons des modèles ouverts sur site (Llama, Mistral) : aucun transfert hors de votre infrastructure.' },
        { q: 'Quel est le ROI typique d’un projet d’IA ?', a: 'Pour l’automatisation de tâches métier, le retour sur investissement intervient en 3 à 12 mois ; pour les modèles prédictifs, en 6 à 18 mois. Il est toujours mesuré et chiffré dans nos contrats.' },
        { q: 'Quel niveau d’expertise technique faut-il chez nous ?', a: 'Aucun pour démarrer : nous gérons tout et formons votre équipe au fur et à mesure. Une documentation complète vous est remise.' },
      ],
    },
    {
      kind: 'cards', variant: 'related',
      head: { eyebrow: 'Aussi à voir', title: 'Services <span class="grad">complémentaires</span>' },
      items: [
        { icon: 'bot', title: 'Agence IA', text: 'Accompagnement IA complet', href: '/agence-ia' },
        { icon: 'rocket', title: 'Création de SaaS', text: 'Intégrer l’IA dans un SaaS', href: '/creation-saas' },
        { icon: 'workflow', title: 'Automatisation', text: 'Workflows dopés à l’IA', href: '/automatisation-marketing' },
        { icon: 'headset', title: 'Agents IA & chatbots', text: 'Assistants WhatsApp et web', href: '/agents-ia-chatbots' },
        { icon: 'workflow', title: 'Agence Make', text: 'Make et OpenAI', href: '/agence-make' },
        { icon: 'workflow', title: 'Agence n8n', text: 'n8n et IA', href: '/agence-n8n' },
      ],
    },
  ],
};
