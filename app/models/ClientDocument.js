const mongoose = require('mongoose');

// Document partagé avec un client dans son espace (livrable, maquette, contrat…).
// Deux formes : un lien externe (Drive, Figma…) ou un petit fichier stocké en base64
// (2 Mo maximum ; au-delà, passer par un lien). Le contenu n'est JAMAIS renvoyé dans
// les listes : il est exclu par défaut (select: false) et servi par les routes de
// téléchargement, qui vérifient l'appartenance.
const DOC_TYPES = ['livrable', 'maquette', 'contrat', 'facture', 'autre'];
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const clientDocumentSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },

  title: { type: String, required: true, maxlength: 200 },
  type: { type: String, enum: DOC_TYPES, default: 'livrable' },
  source: { type: String, enum: ['fichier', 'lien'], required: true },

  url: { type: String, default: '', maxlength: 1000 },          // source « lien »
  filename: { type: String, default: '', maxlength: 200 },      // source « fichier »
  mimeType: { type: String, default: '', maxlength: 120 },
  size: { type: Number, default: 0 },
  data: { type: String, select: false },                         // base64 brut (sans préfixe data:)

  visibleClient: { type: Boolean, default: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now, index: true },
});

clientDocumentSchema.index({ leadId: 1, visibleClient: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Validation d'un fichier téléversé (fonction pure, testable sans base).
// On ne fait JAMAIS confiance au type annoncé par le navigateur : l'extension doit
// être autorisée ET la signature binaire (« magic bytes ») doit correspondre.
// ---------------------------------------------------------------------------
const ALLOWED = {
  pdf: { mime: 'application/pdf', sig: 'pdf' },
  png: { mime: 'image/png', sig: 'png' },
  jpg: { mime: 'image/jpeg', sig: 'jpg' },
  jpeg: { mime: 'image/jpeg', sig: 'jpg' },
  webp: { mime: 'image/webp', sig: 'webp' },
  zip: { mime: 'application/zip', sig: 'zip' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sig: 'zip' },
  xlsx: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sig: 'zip' },
};

function matchesSignature(buf, sig) {
  if (!buf || buf.length < 12) return false;
  switch (sig) {
    case 'pdf': return buf.slice(0, 5).toString('latin1') === '%PDF-';
    case 'png': return buf[0] === 0x89 && buf.slice(1, 4).toString('latin1') === 'PNG';
    case 'jpg': return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case 'webp': return buf.slice(0, 4).toString('latin1') === 'RIFF' && buf.slice(8, 12).toString('latin1') === 'WEBP';
    case 'zip': return buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
    default: return false;
  }
}

// Nom de fichier sûr (affichage + en-tête Content-Disposition).
function safeFilename(name) {
  const base = String(name || '').split(/[\\/]/).pop()
    .replace(/[\u0000-\u001f\u007f"<>|:*?]/g, '')
    .replace(/\s+/g, ' ').trim();
  return (base || 'document').slice(0, 150);
}

// dataUrl : « data:<mime>;base64,<données> » (ou base64 brut). Retourne
// { mime, ext, size, base64, filename } ou { error }.
function validateUpload(dataUrl, filename) {
  if (typeof dataUrl !== 'string' || !dataUrl) return { error: 'Fichier manquant.' };
  const m = /^data:[^;,]{0,120}(?:;[^;,]{0,60})*;base64,/i.exec(dataUrl);
  const base64 = (m ? dataUrl.slice(m[0].length) : dataUrl).replace(/\s/g, '');
  if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) return { error: 'Fichier illisible.' };
  // Contrôle de taille AVANT décodage (évite d'allouer un tampon énorme).
  const approx = Math.floor(base64.length * 3 / 4);
  if (approx > MAX_UPLOAD_BYTES + 3) return { error: 'Fichier trop lourd (2 Mo maximum). Pour un fichier plus volumineux, ajoutez plutôt un lien.' };
  const clean = safeFilename(filename);
  const ext = (clean.match(/\.([a-z0-9]{2,5})$/i) || [])[1];
  const rule = ext && ALLOWED[ext.toLowerCase()];
  if (!rule) return { error: 'Format non autorisé (PDF, PNG, JPG, WEBP, ZIP, DOCX ou XLSX).' };
  const buf = Buffer.from(base64, 'base64');
  if (!buf.length) return { error: 'Fichier vide.' };
  if (buf.length > MAX_UPLOAD_BYTES) return { error: 'Fichier trop lourd (2 Mo maximum). Pour un fichier plus volumineux, ajoutez plutôt un lien.' };
  if (!matchesSignature(buf, rule.sig)) return { error: 'Le contenu du fichier ne correspond pas à son extension.' };
  return { mime: rule.mime, ext: ext.toLowerCase(), size: buf.length, base64: buf.toString('base64'), filename: clean };
}

// Lien externe : https uniquement (http toléré), jamais javascript:/data:.
function validateLink(url) {
  const s = String(url == null ? '' : url).trim().slice(0, 1000);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.toString();
  } catch (e) { return null; }
}

// En-tête Content-Disposition compatible (ASCII + RFC 5987 pour les accents).
function contentDisposition(filename, inline) {
  const name = safeFilename(filename);
  const ascii = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '');
  return `${inline ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

clientDocumentSchema.statics.DOC_TYPES = DOC_TYPES;
clientDocumentSchema.statics.MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES;
clientDocumentSchema.statics.validateUpload = validateUpload;
clientDocumentSchema.statics.validateLink = validateLink;
clientDocumentSchema.statics.safeFilename = safeFilename;
clientDocumentSchema.statics.contentDisposition = contentDisposition;

module.exports = mongoose.model('ClientDocument', clientDocumentSchema);
