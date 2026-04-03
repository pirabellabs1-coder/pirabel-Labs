/**
 * Update articles with cover images from Unsplash
 * Run: node update-articles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');

const coverImages = {
  'seo-2026-tendances-incontournables': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
  'choisir-agence-seo-2026': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  'google-business-profile-guide-complet': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
  'webflow-vs-wordpress-comparatif-2026': 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80',
  'automatisation-ia-15-cas-usage': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  'landing-page-convertit-40-pourcent': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'email-marketing-erreurs-taux-ouverture': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=1200&q=80',
  'strategie-contenu-planifier-12-mois': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80',
  'google-ads-vs-seo-investir-budget-2026': 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80',
  'social-media-calendrier-editorial-efficace': 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1200&q=80',
  'branding-identite-visuelle-memorable': 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80',
  'chatbot-ia-tripler-conversions': 'https://images.unsplash.com/photo-1531746790095-e5cb57f24607?w=1200&q=80',
  'core-web-vitals-ameliorer-vitesse-site': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80',
  'meta-ads-guide-complet-facebook-instagram-2026': 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=1200&q=80',
  'tiktok-entreprises-guide-marketing': 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1200&q=80',
  'netlinking-ethique-backlinks-qualite': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
  'crm-choisir-configurer-bon-outil': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  'motion-design-pourquoi-marque-besoin': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&q=80',
  'copywriting-5-formules-convertissent': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80',
  'ab-testing-doubler-conversions': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  'claude-code-outil-ia-developpement-web': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
  'construire-site-claude-code-temps-record': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80',
};

async function update() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  let count = 0;
  for (const [slug, cover] of Object.entries(coverImages)) {
    const article = await Article.findOne({ slug });
    if (!article) { console.log('Not found:', slug); continue; }

    article.coverImage = cover;

    // Add images inside content if not present
    if (!article.content.includes('<img')) {
      const sections = article.content.split('</h2>');
      if (sections.length > 2) {
        // Add image after second H2
        const imgAfterH2 = `</h2>\n<img src="${cover}" alt="${article.title}" style="width:100%;height:auto;margin:2rem 0;border-radius:0;">`;
        sections[1] = sections[1] + imgAfterH2;
        article.content = sections.join('</h2>');
      }
    }

    await article.save();
    count++;
    console.log(`Updated: ${slug}`);
  }

  console.log(`\nDone: ${count} articles updated with cover images`);
  process.exit(0);
}

update().catch(e => { console.error(e); process.exit(1); });
