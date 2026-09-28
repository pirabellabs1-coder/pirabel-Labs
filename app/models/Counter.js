const mongoose = require('mongoose');

// Compteur atomique pour la numerotation sequentielle des pieces (FACT-2026-0001,
// DEVIS-2026-0001). Une entree par prefixe et par annee : _id = « FACT-2026 ».
// L'increment passe toujours par findOneAndUpdate({ $inc }) : deux creations
// simultanees ne peuvent jamais obtenir le meme numero.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
}, { versionKey: false });

module.exports = mongoose.model('Counter', counterSchema);
