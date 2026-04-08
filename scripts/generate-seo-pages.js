const fs = require('fs');
const path = require('path');

// 1. Definition des cibles
const cities = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille",
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir",
  "Cotonou", "Porto-Novo", "Parakou",
  "Abidjan", "Yamoussoukro", "Bouake",
  "Dakar", "Thies", "Saint-Louis",
  "Montreal", "Quebec", "Laval",
  "Bruxelles", "Anvers", "Liege",
  "Geneve", "Lausanne", "Zurich",
  "Douala", "Yaounde", "Libreville", "Brazzaville", "Kinshasa", "Lome", "Ouagadougou", "Bamako", "Niamey"
];

const services = [
  { 
    id: "creation-site-web", 
    name: "Creation de Site Web",
    desc: "Conception de sites vitrines et e-commerce sur mesure, ultra-rapides et optimises.",
    keywords: ["developpement web", "site internet", "creation web", "Shopify", "WordPress", "Webflow"]
  },
  { 
    id: "agence-seo", 
    name: "Agence SEO et Referencement Naturel",
    desc: "Optimisation pour les moteurs de recherche et Intelligence Artificielle (GEO) pour dominer la premiere page.",
    keywords: ["referencement naturel", "consultant SEO", "audit SEO", "netlinking", "premiere page google"]
  },
  { 
    id: "marketing-digital", 
    name: "Agence de Marketing Digital",
    desc: "Strategie globale d'acquisition, funnel de conversion et croissance acceleree pour votre entreprise.",
    keywords: ["strategie digitale", "webmarketing", "acquisition client", "inbound marketing", "croissance"]
  },
  { 
    id: "publicite-ads", 
    name: "Agence Publicite Google & Meta Ads",
    desc: "Campagnes sponsorisees hyper-rentables sur Google, Facebook, Instagram et LinkedIn.",
    keywords: ["Google Ads", "Facebook Ads", "SMA", "SEA", "ROI", "publicite en ligne"]
  },
  { 
    id: "intelligence-artificielle", 
    name: "Integration Intelligence Artificielle",
    desc: "Automatisation et chatbots IA pour transformer la productivite et le service client de votre entreprise.",
    keywords: ["chatbots IA", "automatisation n8n", "Make", "agents conversationnels", "machine learning"]
  }
];

// 2. Préparation du dossier
const outputDir = path.join(__dirname, '..', 'villes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 3. Modèle HTML (Basic Template)
// We will load a template or use a hardcoded HTML string matching the website's style
const generateHTML = (service, city) => {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${service.name} a ${city} | Pirabel Labs Agence Premium</title>
    <meta name="description" content="Decouvrez notre expertise en ${service.name} a ${city}. Pirabel Labs accompagne les entreprises locales et internationales vers la pleine croissance digitale. Resultats mesurables.">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="https://www.pirabellabs.com/villes/${service.id}-${city.toLowerCase().replace(/[\s-]/g, '')}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${service.name} a ${city} | Pirabel Labs">
    <meta property="og:description" content="${service.desc}">
    <meta property="og:type" content="website">
    
    <!-- AI & Bing Discovery -->
    <meta name="ai-content-declaration" content="We offer ${service.name} services in ${city}.">
    <link rel="alternate" type="text/plain" href="/llms.txt">

    <link rel="stylesheet" href="../css/global.css">
    <link rel="stylesheet" href="../css/illustrations.css">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Pirabel Labs - ${service.name} ${city}",
      "description": "${service.desc}",
      "url": "https://www.pirabellabs.com/villes/${service.id}-${city.toLowerCase().replace(/[\s-]/g, '')}",
      "telephone": "+16139273067",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${city}"
      }
    }
    </script>
</head>
<body>
    <nav class="nav">
      <div class="nav-inner">
        <a href="/" class="nav-logo"><b style="color:white;font-size:1.5rem">PIRABEL LABS</b></a>
        <div class="nav-links">
          <a href="/">ACCUEIL</a>
          <a href="/services">SERVICES</a>
          <a href="/contact">CONTACT</a>
        </div>
        <a href="/contact" class="nav-cta btn-magnetic">Audit Gratuit</a>
      </div>
    </nav>

    <header class="section" style="min-height:60vh;padding-top:12rem;">
      <div class="section-inner">
        <span class="pill">Expertise Locale</span>
        <h1 class="text-hero" style="color:#FF5500;">${service.name} a ${city}</h1>
        <p class="text-lead" style="max-width:800px;margin-top:2rem;">${service.desc} Nous accompagnons les entreprises de <strong>${city}</strong> dans leur transformation avec des strategies eprouvees et innovantes.</p>
        <a href="/contact" class="btn btn-primary" style="margin-top:2rem;">Parler a un expert a ${city}</a>
      </div>
    </header>

    <section class="section bg-light">
      <div class="section-inner content-block">
        <h2>Pourquoi choisir notre ${service.name} a ${city} ?</h2>
        <p>Le marche digital a ${city} est extremement competitif. Pour vous demarquer, vous avez besoin d'une agence qui comprend non seulement les enjeux technologiques mondiaux, mais aussi le contexte de <strong>${city}</strong>. Chez Pirabel Labs, notre methodologie en <em>${service.keywords[0]}</em> et <em>${service.keywords[1]}</em> a permis a de nombreuses entreprises de multiplier leur chiffre d'affaires.</p>
        
        <div class="grid grid-3" style="margin-top:3rem;">
          <div class="card glass-card">
            <h3>Strategie Sur Mesure</h3>
            <p>Chaque entreprise a ${city} est unique. Nous analysons vos concurrents directs et elaborons une tactique pour dominer votre secteur via ${service.keywords[2]}.</p>
          </div>
          <div class="card glass-card">
            <h3>Technologie Premium</h3>
            <p>Nous n'utilisons que le meilleur. Fini les solutions lentes. Nous developpons et integrons des methodes fiables pour garantir votre ROI.</p>
          </div>
          <div class="card glass-card">
            <h3>Croissance Continue</h3>
            <p>Notre but n'est pas juste de vous livrer un service, mais de devenir votre partenaire de croissance a ${city}.</p>
          </div>
        </div>

        <h3 style="margin-top:4rem;">Methodologie Eprouvee</h3>
        <p>1. <strong>Audit & Analyse</strong> : Etude de votre presence actuelle a ${city}.<br>
        2. <strong>Developpement & Execution</strong> : Mise en oeuvre de notre plan d'action centre sur ${service.name}.<br>
        3. <strong>Optimisation Continue</strong> : Analyse des donnees (Analytics) pour maximiser les resultats.</p>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="section">
      <div class="section-inner">
        <h2>Questions Frequentes (${service.name})</h2>
        <div style="margin-top:2rem;">
          <h3>Proposez-vous des consultations a ${city} ?</h3>
          <p>Absolument. Bien que nous soyons une agence digitale internationale, nous accompagnons nos clients a ${city} via un suivi dedie et personnalise (visioconferenece, bilans mensuels).</p>
          
          <h3 style="margin-top:1.5rem;">Combien coute un accompagnement en ${service.name} ?</h3>
          <p>Nos tarifs dependent de l'ampleur du projet. Contactez-nous pour obtenir un devis precis et un audit complet de votre situation.</p>
        </div>
      </div>
    </section>

    ${fs.readFileSync(path.join(__dirname, '..', 'css', 'global.css')) ? `<!-- Global CSS link already present -->` : ''}
</body>
</html>`;
};

// 4. Generation des pages
let sitemapEntries = [];
const today = new Date().toISOString().split('T')[0];

cities.forEach(city => {
  services.forEach(service => {
    const slug = service.id + '-' + city.toLowerCase().replace(/[\s-']/g, '');
    const fileName = slug + '.html';
    const filePath = path.join(outputDir, fileName);
    
    const htmlContent = generateHTML(service, city);
    fs.writeFileSync(filePath, htmlContent);
    
    sitemapEntries.push(
      '\n  <url>\n' +
      '    <loc>https://www.pirabellabs.com/villes/' + slug + '</loc>\n' +
      '    <lastmod>' + today + '</lastmod>\n' +
      '    <changefreq>monthly</changefreq>\n' +
      '    <priority>0.7</priority>\n' +
      '  </url>'
    );
  });
});

console.log("✅ " + (cities.length * services.length) + " SEO pages generated in /villes!");

// 5. Update Sitemap
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
let existingSitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';

// Inject entries before </urlset>
if(existingSitemap.includes('</urlset>')) {
    existingSitemap = existingSitemap.replace('</urlset>', sitemapEntries.join('') + '\n</urlset>');
    fs.writeFileSync(sitemapPath, existingSitemap);
    console.log("✅ Sitemap updated with " + sitemapEntries.length + " new URLs.");
} else {
    const newSitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + sitemapEntries.join('') + '\n</urlset>';
    fs.writeFileSync(sitemapPath, newSitemap);
    console.log("✅ Created new sitemap with " + sitemapEntries.length + " URLs.");
}
