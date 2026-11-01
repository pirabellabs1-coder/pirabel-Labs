// Enveloppe Lambda de l'API Express de Pirabel Labs.
// Au premier appel (cold start), on charge les variables d'environnement depuis
// AWS Secrets Manager (la limite de 4 Ko des variables Lambda ne suffit pas),
// on les injecte dans process.env, PUIS on charge l'app (qui lit l'env a l'import).
const serverless = require('serverless-http');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

let cachedHandler = null;

async function buildHandler() {
  if (cachedHandler) return cachedHandler;
  const region = process.env.AWS_REGION || 'eu-north-1';
  const secretId = process.env.ENV_SECRET_NAME || 'pirabel-api-env';
  const sm = new SecretsManagerClient({ region });
  const res = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));
  const env = JSON.parse(res.SecretString || '{}');
  for (const k of Object.keys(env)) {
    if (process.env[k] === undefined || process.env[k] === '') process.env[k] = env[k];
  }
  const app = require('./api/index.js');
  cachedHandler = serverless(app, {
    binary: ['image/*', 'application/pdf', 'application/octet-stream', 'font/*'],
  });
  return cachedHandler;
}

// Amorçage administrateur ponctuel : écrit réglages + campagnes directement en base.
// Déclenchable UNIQUEMENT par invocation Lambda directe (IAM) + secret partagé (CRON_SECRET).
// Jamais atteignable via HTTP/CloudFront (ces appels arrivent avec un event HTTP, pas { adminSeed }).
async function runAdminSeed(seed) {
  const Setting = require('./app/models/Setting');
  const ProspectCampaign = require('./app/models/ProspectCampaign');
  const out = { settings: [], campaigns: [] };
  const settings = (seed && seed.settings) || {};
  for (const [k, v] of Object.entries(settings)) {
    await Setting.updateOne({ key: k }, { $set: { value: String(v), updatedAt: new Date() } }, { upsert: true });
    out.settings.push(k);
  }
  for (const def of (seed && seed.campaigns) || []) {
    if (!def || !def.name) continue;
    const { name, ...rest } = def;
    const r = await ProspectCampaign.updateOne(
      { name },
      { $set: Object.assign({ updatedAt: new Date() }, rest), $setOnInsert: { name, createdAt: new Date() } },
      { upsert: true }
    );
    out.campaigns.push({ name, created: !!r.upsertedCount });
  }
  out.activeCampaigns = await ProspectCampaign.countDocuments({ status: 'active', isTest: { $ne: true } });
  return { ok: true, ...out };
}

module.exports.handler = async (event, context) => {
  const h = await buildHandler();                    // charge l'env (Secrets Manager) + l'app (mongoose connecté)
  if (event && event.adminSeed) {
    const secret = String(process.env.CRON_SECRET || '').trim();
    if (!secret || event.secret !== secret) return { ok: false, error: 'unauthorized' };
    try { return await runAdminSeed(event.adminSeed); }
    catch (e) { return { ok: false, error: String(e && e.message).slice(0, 200) }; }
  }
  if (event && event.adminAction === 'dashboard') {
    const secret = String(process.env.CRON_SECRET || '').trim();
    if (!secret || event.secret !== secret) return { ok: false, error: 'unauthorized' };
    try {
      await require('./app/config/db')();            // même connexion que le chemin HTTP
      return { ok: true, data: await require('./app/prospection/engine').dashboardData() };
    } catch (e) { return { ok: false, error: String(e && e.message).slice(0, 300) }; }
  }
  return h(event, context);
};
