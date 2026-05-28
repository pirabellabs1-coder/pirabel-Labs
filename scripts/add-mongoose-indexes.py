#!/usr/bin/env python3
"""Ajoute les indexes Mongoose recommandes par l'audit Marcus (Tech Lead)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / 'app' / 'models'

# (filename, [index_lines_to_add_after_schema_definition])
INDEXES = {
    'Lead.js': [
        "leadSchema.index({ conversationId: 1 });",
        "leadSchema.index({ 'visitor.email': 1 });",
        "leadSchema.index({ 'qualification.level': 1, createdAt: -1 });",
    ],
    'Order.js': [
        "orderSchema.index({ status: 1, createdAt: -1 });",
        "orderSchema.index({ email: 1 });",
        "orderSchema.index({ assignedTo: 1, status: 1 });",
    ],
    'Quote.js': [
        "quoteSchema.index({ status: 1, sentAt: 1 });",
        "quoteSchema.index({ client: 1, status: 1 });",
        "quoteSchema.index({ validUntil: 1 });",
    ],
    'Client.js': [
        "clientSchema.index({ email: 1 });",
        "clientSchema.index({ status: 1, createdAt: -1 });",
        "clientSchema.index({ user: 1 });",
    ],
    'Application.js': [
        "applicationSchema.index({ jobOffer: 1, status: 1 });",
        "applicationSchema.index({ email: 1 });",
        "applicationSchema.index({ createdAt: -1 });",
    ],
    'Project.js': [
        "projectSchema.index({ client: 1, status: 1 });",
        "projectSchema.index({ status: 1 });",
    ],
    'Invoice.js': [
        "invoiceSchema.index({ client: 1, status: 1 });",
        "invoiceSchema.index({ status: 1, dueDate: 1 });",
    ],
    'Appointment.js': [
        "appointmentSchema.index({ startTime: 1 });",
        "appointmentSchema.index({ status: 1, startTime: 1 });",
    ],
    'Deal.js': [
        "dealSchema.index({ stage: 1, updatedAt: -1 });",
        "dealSchema.index({ assignedTo: 1, stage: 1 });",
    ],
    'Message.js': [
        # conversationId deja indexe (inline)
        "messageSchema.index({ createdAt: -1 });",
        "messageSchema.index({ sender: 1, read: 1 });",
    ],
    'OTP.js': [
        "otpSchema.index({ email: 1, purpose: 1 });",
        "otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });",  # TTL auto-delete
    ],
    'LessonProgress.js': [
        "lessonProgressSchema.index({ user: 1, formation: 1 });",
        "lessonProgressSchema.index({ user: 1, completed: 1 });",
    ],
    'LessonComment.js': [
        "lessonCommentSchema.index({ formation: 1, createdAt: -1 });",
        "lessonCommentSchema.index({ approved: 1, createdAt: -1 });",
    ],
}

count = 0
for filename, idx_lines in INDEXES.items():
    p = MODELS / filename
    if not p.exists():
        print(f"  SKIP {filename} (introuvable)")
        continue
    text = p.read_text(encoding='utf-8')

    # Detect existing indexes (skip if already added)
    new_lines = [line for line in idx_lines if line not in text]
    if not new_lines:
        continue

    # Insert before "module.exports"
    if 'module.exports' not in text:
        print(f"  SKIP {filename} (pas de module.exports)")
        continue
    block = "\n// --- Indexes (audit Tech Lead) ---\n" + "\n".join(new_lines) + "\n\n"
    new_text = text.replace('module.exports', block + 'module.exports', 1)
    p.write_text(new_text, encoding='utf-8')
    count += 1
    print(f"  +{len(new_lines)} idx -> {filename}")

print(f"\nModeles mis a jour: {count}")
