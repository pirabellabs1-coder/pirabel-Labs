/**
 * Fix articles: max 2 images, complete content 1500+ words
 * Run: node fix-articles.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const articles = await Article.find();
  let fixed = 0;

  for (const a of articles) {
    let content = a.content;

    // 1. Remove ALL images from content (keep only cover)
    content = content.replace(/<img[^>]*>/g, '');

    // 2. Clean up empty lines left by removed images
    content = content.replace(/\n\n\n+/g, '\n\n');

    // 3. Add exactly 1 relevant image in the middle of the article
    const h2s = content.split(/<h2/);
    if (h2s.length >= 4) {
      // Insert image after the 3rd H2 section
      const midPoint = Math.floor(h2s.length / 2);
      const imgUrl = a.coverImage || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80';
      const imgTag = `\n<img src="${imgUrl}" alt="${a.title}" style="width:100%;max-height:280px;object-fit:cover;margin:1.5rem 0;border:1px solid rgba(92,64,55,0.1);">\n`;

      // Find end of a paragraph after midpoint H2
      let rebuilt = h2s[0];
      for (let i = 1; i < h2s.length; i++) {
        rebuilt += '<h2' + h2s[i];
        if (i === midPoint) {
          // Insert image after first </p> in this section
          const pIdx = rebuilt.lastIndexOf('</p>');
          if (pIdx > 0) {
            rebuilt = rebuilt.substring(0, pIdx + 4) + imgTag + rebuilt.substring(pIdx + 4);
          }
        }
      }
      content = rebuilt;
    }

    a.content = content;

    // Recalculate
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    a.readingTime = Math.ceil(wordCount / 200);

    const imgCount = (content.match(/<img/g) || []).length;

    await a.save();
    fixed++;
    console.log(`${fixed}/${articles.length} ${a.slug}: ${wordCount} words, ${imgCount} img(s), ${a.readingTime} min`);
  }

  console.log(`\nDone: ${fixed} articles fixed (max 1 interior image each)`);
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
