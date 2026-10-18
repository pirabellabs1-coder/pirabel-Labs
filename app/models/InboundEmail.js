const mongoose = require('mongoose');

// E-mail entrant relevé dans la boîte pro (IMAP) : classé et traité par l'IA.
// Jamais d'exécution d'instruction contenue dans le message : c'est une donnée.
const inboundEmailSchema = new mongoose.Schema({
  mailbox: { type: String, default: 'INBOX', maxlength: 120 },
  uid: { type: Number, index: true },                 // UID IMAP (dédoublonnage par boîte)
  messageId: { type: String, default: '', index: true }, // Message-ID RFC
  inReplyTo: { type: String, default: '', maxlength: 998 },
  references: { type: String, default: '', maxlength: 4000 },

  fromEmail: { type: String, default: '', lowercase: true, trim: true, maxlength: 254, index: true },
  fromName: { type: String, default: '', maxlength: 200 },
  toEmail: { type: String, default: '', maxlength: 254 },
  subject: { type: String, default: '', maxlength: 400 },
  snippet: { type: String, default: '', maxlength: 320 },
  text: { type: String, default: '', maxlength: 12000 },  // corps texte nettoyé (tronqué)
  receivedAt: { type: Date, index: true },
  fetchedAt: { type: Date, default: Date.now },
  automated: { type: Boolean, default: false },        // en-têtes auto (bulk, auto-submitted, no-reply)

  // Tri par l'IA
  category: { type: String, default: 'autre', enum: ['prospect', 'client', 'facture', 'rendez_vous', 'support', 'spam', 'sensible', 'autre'] },
  qualification: { type: String, default: 'non_evalue', enum: ['chaud', 'tiede', 'froid', 'non_evalue'] },
  summary: { type: String, default: '', maxlength: 2000 },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', default: null },

  // Réponse préparée
  draftSubject: { type: String, default: '', maxlength: 400 },
  draftBody: { type: String, default: '', maxlength: 8000 },
  replySource: { type: String, default: '', enum: ['', 'ia', 'modele', 'manuel'] },
  autoEligible: { type: Boolean, default: false },     // sûr pour un envoi automatique ?
  flagged: { type: Boolean, default: false },          // sensible / demande ton attention

  status: { type: String, default: 'nouveau', enum: ['nouveau', 'brouillon', 'repondu', 'ignore', 'erreur'], index: true },
  repliedAt: { type: Date, default: null },
  replyMessageId: { type: String, default: '' },
  replyMode: { type: String, default: '' },            // 'auto' | 'manuel'
  error: { type: String, default: '', maxlength: 500 },

  readByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

// Dédoublonnage : un même message (par boîte+uid, ou par Message-ID) n'entre qu'une fois.
inboundEmailSchema.index({ mailbox: 1, uid: 1 }, { unique: true, sparse: true });
inboundEmailSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.InboundEmail || mongoose.model('InboundEmail', inboundEmailSchema);
