const fs = require('fs');
const path = require('path');

const services = [
    { id: 'agence-seo', nom: 'Agence SEO & Référencement' },
    { id: 'creation-site-web', nom: 'Création de Site Web' },
    { id: 'marketing-digital', nom: 'Agence Marketing Digital' },
    { id: 'intelligence-artificielle', nom: 'IA & Automatisation' },
    { id: 'publicite-ads', nom: 'Publicité Payante (Ads)' }
];

const villes = [
    // France
    'Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille',
    // Afrique de l'Ouest
    'Abidjan', 'Bouake', 'Yamoussoukro', 'Dakar', 'Thies', 'SaintLouis', 'Lome', 'Cotonou', 'PortoNovo', 'Parakou', 'Niamey', 'Ouagadougou', 'Bamako',
    // Afrique Centrale
    'Douala', 'Yaounde', 'Libreville', 'Kinshasa', 'Brazzaville',
    // Maghreb
    'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Agadir',
    // Canada
    'Montreal', 'Quebec', 'Laval',
    // Belgique
    'Bruxelles', 'Anvers', 'Liege',
    // Suisse
    'Geneve', 'Zurich', 'Lausanne'
];

function sanitizeString(str) {
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Generate HTML Content
let htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nos Zones d'Intervention | Pirabel Labs</title>
    <meta name="description" content="Découvrez toutes les villes desservies par Pirabel Labs en Europe, en Afrique et au Canada pour vos projets digitaux, de création web et de SEO.">
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-H0ZTTRYBQ7"></script>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #0d0f11; color: #fff; margin: 0; padding: 0; line-height: 1.6; }
        .hub-header { text-align: center; padding: 6rem 1rem 3rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .hub-title { font-size: 3rem; color: #FF5500; margin-bottom: 1rem; }
        .container { max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; }
        .service-section { margin-bottom: 4rem; }
        .service-title { font-size: 2rem; color: #fff; border-bottom: 2px solid #FF5500; display: inline-block; padding-bottom: 0.5rem; margin-bottom: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
        .city-link { color: rgba(255,255,255,0.7); text-decoration: none; padding: 0.5rem 1rem; background: rgba(255,255,255,0.03); border-radius: 4px; transition: all 0.3s ease; }
        .city-link:hover { color: #fff; background: #FF5500; transform: translateX(5px); }
        .btn-back { display: inline-block; margin-top: 2rem; color: #FF5500; text-decoration: none; border: 1px solid #FF5500; padding: 10px 20px; border-radius: 4px; }
    </style>
</head>
<body>

    <div class="hub-header">
        <h1 class="hub-title">Zones d'Intervention</h1>
        <p style="color: rgba(255,255,255,0.6); max-width: 600px; margin: 0 auto;">Retrouvez l'intégralité de notre réseau d'expertise en marketing digital, référencement et technologies de l'intelligence artificielle à travers la francophonie.</p>
        <a href="/" class="btn-back">Retour à l'accueil</a>
    </div>

    <div class="container">
`;

for (const service of services) {
    htmlContent += `
        <div class="service-section">
            <h2 class="service-title">${service.nom}</h2>
            <div class="grid">
    `;

    for (const city of villes) {
        const urlSlug = \`\${service.id}-\${sanitizeString(city)}.html\`;
        htmlContent += \`                <a href="/villes/\${urlSlug}" class="city-link">\${service.nom} à \${city}</a>\n\`;
    }

    htmlContent += `
            </div>
        </div>
    `;
}

htmlContent += `
    </div>

</body>
</html>
`;

// Save the file
const writePath = path.join(__dirname, '../zones-intervention.html');
fs.writeFileSync(writePath, htmlContent);

console.log('✅ Index des villes généré avec succès ! 210 liens structurés.');
