/**
 * Formulaire de qualification en étapes (page /contact).
 *
 * - Questions, options et budgets par devise : app/qualification.json (même source que le serveur).
 * - Une question par écran ; sur un choix unique, clic = passage automatique (jamais au clavier).
 * - Réponses gardées dans le navigateur (localStorage) pour reprendre plus tard.
 * - Animations Motion ; en mouvement réduit, simples fondus.
 * - Le serveur revalide tout (app/qualification.js) : ce composant ne fait que guider.
 */
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react';
import Q from '../../../app/qualification.json';
import { iconSvg } from '../../data/icons';

type Opt = { id: string; label: string; hint?: string };
type Question = { id: string; label: string; short: string; type: 'single' | 'multi'; optional?: boolean; options: Opt[] };
type DetailDef = { title: string; questions: Question[] };
type DetailAnswers = Record<string, string | string[]>;

type Answers = {
  projects: string[];
  details: Record<string, DetailAnswers>;
  country: string;
  city: string;
  goal: string;
  size: string;
  maturity: string;
  sector: string;
  sectorOther: string;
  budgetType: string;
  budget: string;
  timeline: string;
  assets: string[];
  websiteUrl: string;
  description: string;
  contact: { name: string; email: string; phone: string; company: string; channel: string; consent: boolean };
};

const DETAILS = Q.details as unknown as Record<string, DetailDef>;
const STORAGE_KEY = 'pl_qualif_v1';
const PROJECT_ICONS: Record<string, string> = {
  site: 'code', ecommerce: 'cart', app: 'rocket', seo: 'search', ads: 'megaphone', social: 'message',
  funnel: 'funnel', automation: 'workflow', email: 'mail', video: 'video', consulting: 'compass', autre: 'sparkles',
};
const PHASES = ['Projet', 'Détails', 'Contexte', 'Budget', 'Coordonnées'];
// Anciens liens des pages service (…/contact?service=seo-local, ?service=shopify…) → besoin présélectionné.
const SERVICE_ALIASES: [RegExp, string][] = [
  [/^(agents-ia|agence-ia|solutions-ia|automatisation|audit-automatisation|agence-make|make|n8n|zapier)/, 'automation'],
  [/^(seo|audit-seo|netlinking|fiche-google|google-business|gestion-avis|gestion-mensuelle-avis|premium-avis|audit-gbp|audit-avis)/, 'seo'],
  [/^(community|audit-social)/, 'social'],
  [/^(tunnels|landing|clickfunnels|systeme-io|audit-tunnel)/, 'funnel'],
  [/^(email|brevo|mailchimp|klaviyo|hubspot|agence-hubspot|pipedrive|audit-email)/, 'email'],
  [/^montage-video/, 'video'],
  [/^(creation-application|application|creation-saas|saas|marketplace|atelier-mvp)/, 'app'],
  [/^(ecommerce|shopify|woocommerce|prestashop)/, 'ecommerce'],
  [/^(creation-site|site|wordpress|webflow|elementor|refonte|maintenance|hebergement|securite|hardening|audit-wordpress|audit-securite|audit-lighthouse)/, 'site'],
  [/^(consulting|appel-consulting)/, 'consulting'],
];
const CITY_PRESETS: Record<string, [string, string]> = {
  cotonou: ['BJ', 'Cotonou'], 'abomey-calavi': ['BJ', 'Abomey-Calavi'], 'porto-novo': ['BJ', 'Porto-Novo'],
  abidjan: ['CI', 'Abidjan'], dakar: ['SN', 'Dakar'], lome: ['TG', 'Lomé'], bamako: ['ML', 'Bamako'],
  ouagadougou: ['BF', 'Ouagadougou'], conakry: ['GN', 'Conakry'], yaounde: ['CM', 'Yaoundé'], douala: ['CM', 'Douala'],
  libreville: ['GA', 'Libreville'], kinshasa: ['CD', 'Kinshasa'], casablanca: ['MA', 'Casablanca'], tunis: ['TN', 'Tunis'],
  paris: ['FR', 'Paris'], lyon: ['FR', 'Lyon'], marseille: ['FR', 'Marseille'], bordeaux: ['FR', 'Bordeaux'],
  toulouse: ['FR', 'Toulouse'], nice: ['FR', 'Nice'], nantes: ['FR', 'Nantes'], lille: ['FR', 'Lille'],
  montpellier: ['FR', 'Montpellier'], bruxelles: ['BE', 'Bruxelles'], geneve: ['CH', 'Genève'], montreal: ['CA', 'Montréal'],
};
const projectFromParams = (params: URLSearchParams): string | null => {
  const direct = params.get('projet');
  if (direct && Q.projects.some((p) => p.id === direct)) return direct;
  const svc = (params.get('service') || '').toLowerCase();
  if (!svc) return null;
  return SERVICE_ALIASES.find(([re]) => re.test(svc))?.[1] ?? null;
};
const EMPTY: Answers = {
  projects: [], details: {}, country: '', city: '', goal: '', size: '', maturity: '', sector: '', sectorOther: '',
  budgetType: 'projet', budget: '', timeline: '', assets: [], websiteUrl: '', description: '',
  contact: { name: '', email: '', phone: '', company: '', channel: 'whatsapp', consent: false },
};

type StepId = string; // 'projects' | 'location' | `detail:${pid}` | 'goal' | 'company' | 'budget' | 'timeline' | 'assets' | 'description' | 'contact' | 'recap'
const phaseOf = (id: StepId) =>
  id === 'projects' || id === 'location' ? 0
    : id.startsWith('detail:') ? 1
      : id === 'goal' || id === 'company' ? 2
        : id === 'budget' || id === 'timeline' || id === 'assets' ? 3 : 4;

function buildSteps(a: Answers): StepId[] {
  // Ordre du catalogue (et non ordre des clics) : parcours stable et prévisible.
  const details = Q.projects.map((p) => p.id).filter((p) => a.projects.includes(p) && DETAILS[p]).map((p) => `detail:${p}`);
  return ['projects', 'location', ...details, 'goal', 'company', 'budget', 'timeline', 'assets', 'description', 'contact', 'recap'];
}

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const label = (list: Opt[], id: string) => list.find((o) => o.id === id)?.label ?? '';
const currencyOf = (country: string) => Q.countries.find((c) => c.code === country)?.currency ?? 'EUR';

function budgetOptions(a: Answers): Opt[] {
  const labels = (Q.budgetLabels as Record<string, string[]>)[currencyOf(a.country)] ?? Q.budgetLabels.EUR;
  const unit = a.budgetType === 'mensuel' ? ' par mois' : '';
  return [...Q.budgetTiers.map((id, i) => ({ id, label: labels[i] + unit })), Q.budgetUnknown];
}

function canContinue(step: StepId, a: Answers): boolean {
  if (step === 'projects') return a.projects.length > 0;
  if (step === 'location') return !!a.country;
  if (step.startsWith('detail:')) {
    const def = DETAILS[step.slice(7)];
    const ans = a.details[step.slice(7)] ?? {};
    return def.questions.every((q) => q.optional || (Array.isArray(ans[q.id]) ? (ans[q.id] as string[]).length > 0 : !!ans[q.id]));
  }
  if (step === 'goal') return !!a.goal;
  if (step === 'company') return !!a.size && !!a.maturity && !!a.sector && (a.sector !== 'autre' || a.sectorOther.trim().length > 1);
  if (step === 'budget') return !!a.budget;
  if (step === 'timeline') return !!a.timeline;
  if (step === 'assets') return a.assets.length > 0;
  if (step === 'contact') return a.contact.name.trim().length > 1 && isEmail(a.contact.email) && a.contact.consent;
  return true;
}

// Données relues du navigateur : on ne garde que des valeurs du bon type (stockage modifiable).
function coerceSaved(raw: unknown): Answers {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const str = (k: keyof Answers) => (typeof r[k] === 'string' ? (r[k] as string).slice(0, 3000) : (EMPTY[k] as string));
  const arr = (k: keyof Answers) => (Array.isArray(r[k]) ? (r[k] as unknown[]).filter((x): x is string => typeof x === 'string').slice(0, 20) : []);
  const details = r.details && typeof r.details === 'object' ? (r.details as Record<string, DetailAnswers>) : {};
  return {
    ...EMPTY,
    projects: arr('projects').filter((p) => Q.projects.some((x) => x.id === p)).slice(0, Q.maxProjects),
    details, country: str('country'), city: str('city'), goal: str('goal'), size: str('size'), maturity: str('maturity'),
    sector: str('sector'), sectorOther: str('sectorOther'), budgetType: str('budgetType') || 'projet', budget: str('budget'),
    timeline: str('timeline'), assets: arr('assets'), websiteUrl: str('websiteUrl'), description: str('description'),
    contact: { ...EMPTY.contact },
  };
}

/* ------------------------------------------------------------------ UI -- */

function Svg({ name, size = 20 }: { name: string; size?: number }) {
  return <span className="qz-ico" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />;
}

function Choice(props: {
  type: 'radio' | 'checkbox'; name: string; opt: Opt; checked: boolean; disabled?: boolean; icon?: string;
  onPick: (id: string, byPointer: boolean) => void; compact?: boolean;
}) {
  const { type, name, opt, checked, disabled, icon, onPick, compact } = props;
  return (
    <label className={`qz-choice${checked ? ' is-on' : ''}${compact ? ' qz-choice--compact' : ''}${disabled ? ' is-disabled' : ''}`}>
      <input
        type={type} name={name} value={opt.id} checked={checked} disabled={disabled}
        onChange={() => onPick(opt.id, false)}
        onClick={(e) => { if (type === 'radio' && e.detail > 0) onPick(opt.id, true); }}
      />
      {icon && <span className="qz-choice__icon"><Svg name={icon} size={20} /></span>}
      <span className="qz-choice__text">
        <span className="qz-choice__label">{opt.label}</span>
        {opt.hint && <span className="qz-choice__hint">{opt.hint}</span>}
      </span>
      <span className="qz-choice__tick" aria-hidden="true"><Svg name="check" size={14} /></span>
    </label>
  );
}

function Group(props: { legend: ReactNode; hint?: string; children: ReactNode; cols?: 'auto' | 'wide' | 'chips'; optional?: boolean }) {
  return (
    <fieldset className="qz-group">
      <legend className="qz-legend">{props.legend}{props.optional && <span className="qz-optional"> (facultatif)</span>}</legend>
      {props.hint && <p className="qz-hint">{props.hint}</p>}
      <div className={`qz-options qz-options--${props.cols ?? 'auto'}`}>{props.children}</div>
    </fieldset>
  );
}

/* ------------------------------------------------------------ Composant -- */

export default function QualifyWizard() {
  const reduce = useReducedMotion();
  const [a, setA] = useState<Answers>(EMPTY);
  const [stepId, setStepId] = useState<StepId>('projects');
  const [dir, setDir] = useState(1);
  const [restored, setRestored] = useState(false);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const [level, setLevel] = useState<'froid' | 'tiede' | 'chaud' | ''>('');
  const [confirmationSent, setConfirmationSent] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef<HTMLInputElement>(null);
  const interacted = useRef(false);
  const autoTimer = useRef<number>(0);

  const steps = useMemo(() => buildSteps(a), [a.projects]);
  const index = Math.max(0, steps.indexOf(stepId));
  const progress = status === 'done' ? 1 : index / (steps.length - 1);
  const phase = phaseOf(stepId);

  // Reprise : réponses sauvegardées + projet présélectionné via ?projet=…
  useEffect(() => {
    let next = EMPTY;
    let nextStep: StepId = 'projects';
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.v === 1 && Date.now() - saved.t < 14 * 864e5 && saved.a) {
          next = coerceSaved(saved.a);
          if (typeof saved.s === 'string' && buildSteps(next).includes(saved.s) && saved.s !== 'projects') {
            nextStep = saved.s;
            setRestored(true);
          }
        }
      }
    } catch { /* stockage indisponible : on repart de zéro */ }
    const params = new URLSearchParams(location.search);
    const pre = projectFromParams(params);
    if (pre && !next.projects.includes(pre)) {
      next = { ...next, projects: [pre, ...next.projects].slice(0, Q.maxProjects) };
    }
    // Pages villes : …/contact?ville=dakar → pays (donc devise) et ville pré-remplis.
    const ville = CITY_PRESETS[(params.get('ville') || '').toLowerCase()];
    if (ville && !next.country) next = { ...next, country: ville[0], city: ville[1] };
    // L'étape reprise doit toujours exister dans le parcours (un projet a pu être retiré).
    if (!buildSteps(next).includes(nextStep)) { nextStep = 'projects'; setRestored(false); }
    setA(next);
    setStepId(nextStep);
  }, []);

  useEffect(() => {
    if (status === 'done') return;
    // Coordonnées jamais stockées (poste partagé) : seules les réponses sur le projet sont gardées.
    const { contact: _contact, ...answers } = a;
    const step = stepId === 'recap' ? 'contact' : stepId;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, t: Date.now(), s: step, a: answers })); } catch { /* ignoré */ }
  }, [a, stepId, status]);

  // Après chaque changement d'étape : focus sur le titre + retour en haut du formulaire.
  useEffect(() => {
    if (!interacted.current) return;
    const el = rootRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) {
        const y = top + window.scrollY - 100;
        const lenis = (window as any).__lenis;
        if (lenis) lenis.scrollTo(y, { duration: 0.8 });
        else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
  }, [stepId, status]);

  useEffect(() => () => window.clearTimeout(autoTimer.current), []);

  const go = (target: StepId, direction: number) => {
    interacted.current = true;
    window.clearTimeout(autoTimer.current);
    setTouched(false);
    setDir(direction);
    setStepId(target);
  };
  const next = () => {
    if (!canContinue(stepId, a)) {
      setTouched(true);
      // Coordonnées : focus sur le premier champ à corriger.
      if (stepId === 'contact') {
        window.setTimeout(() => {
          const c = a.contact;
          const id = c.name.trim().length < 2 ? 'qz-name' : !isEmail(c.email) ? 'qz-email' : 'qz-consent';
          document.getElementById(id)?.focus();
        }, 0);
      }
      return;
    }
    const i = steps.indexOf(stepId);
    if (i < steps.length - 1) go(steps[i + 1], 1);
  };
  const back = () => {
    const i = steps.indexOf(stepId);
    if (i > 0) go(steps[i - 1], -1);
  };
  // Passage automatique après un choix unique fait à la souris / au doigt.
  const autoNext = (updated: Answers) => {
    window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(() => {
      if (!canContinue(stepId, updated)) return;
      const list = buildSteps(updated);
      const i = list.indexOf(stepId);
      if (i < list.length - 1) go(list[i + 1], 1);
    }, reduce ? 120 : 380);
  };
  const update = (patch: Partial<Answers>, byPointer = false) => {
    const updated = { ...a, ...patch };
    setA(updated);
    if (byPointer) autoNext(updated);
  };
  const setContact = (patch: Partial<Answers['contact']>) => setA((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));
  const toggle = (list: string[], id: string, max = 99) =>
    list.includes(id) ? list.filter((x) => x !== id) : list.length >= max ? list : [...list, id];

  const restart = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignoré */ }
    setRestored(false);
    setA(EMPTY);
    go('projects', -1);
  };

  const submit = async () => {
    if (status === 'sending') return;
    setStatus('sending');
    setServerMsg('');
    const params = new URLSearchParams(location.search);
    const body = {
      projects: a.projects,
      details: Object.fromEntries(a.projects.filter((p) => DETAILS[p]).map((p) => [p, a.details[p] ?? {}])),
      country: a.country, city: a.city, goal: a.goal, size: a.size, maturity: a.maturity,
      sector: a.sector, sectorOther: a.sectorOther, budgetType: a.budgetType, budget: a.budget,
      timeline: a.timeline, assets: a.assets, websiteUrl: a.websiteUrl, description: a.description,
      contact: a.contact,
      context: {
        page: location.pathname, referrer: document.referrer.slice(0, 300),
        utmSource: params.get('utm_source') || params.get('utm') || '', utmMedium: params.get('utm_medium') || '',
        utmCampaign: params.get('utm_campaign') || '',
      },
      qf_hp: hpRef.current?.value || '',
    };
    try {
      const res = await fetch('/api/qualification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(typeof data.error === 'string' ? data.error : 'Envoi impossible pour le moment.');
      setLevel(data.level || '');
      setConfirmationSent(data.confirmationSent !== false);
      setStatus('done');
      interacted.current = true;
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignoré */ }
      (window as any).gtag?.('event', 'generate_lead', { method: 'qualification', value: 1 });
    } catch (e) {
      setStatus('error');
      setServerMsg(e instanceof Error ? e.message : 'Envoi impossible pour le moment.');
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (stepId === 'recap') submit();
    else next();
  };

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * 48, filter: 'blur(6px)' }),
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: d * -36, filter: 'blur(4px)' }),
  };

  /* --------------------------------------------------------- Étapes -- */
  const renderStep = (): ReactNode => {
    if (stepId === 'projects') {
      const full = a.projects.length >= Q.maxProjects;
      return (
        <Step title="Sur quoi pouvons-nous vous aider ?" hint={`Choisissez jusqu’à ${Q.maxProjects} besoins : les questions suivantes s’adaptent.`} focus={interacted.current}>
          <Group legend={<span className="sr-only">Types de projet</span>} cols="wide">
            {Q.projects.map((p) => (
              <Choice key={p.id} type="checkbox" name="projects" opt={p} icon={PROJECT_ICONS[p.id]}
                checked={a.projects.includes(p.id)} disabled={full && !a.projects.includes(p.id)}
                onPick={(id) => update({ projects: toggle(a.projects, id, Q.maxProjects) })} />
            ))}
          </Group>
          {full && <p className="qz-note">Trois besoins maximum : retirez-en un pour en choisir un autre.</p>}
        </Step>
      );
    }

    if (stepId === 'location') {
      const groups = [...new Set(Q.countries.map((c) => c.group))];
      return (
        <Step title="Où êtes-vous basé ?" hint="Pour vous répondre dans votre fuseau horaire et chiffrer dans votre monnaie." focus={interacted.current}>
          {groups.map((g) => (
            <Group key={g} legend={g} cols="chips">
              {Q.countries.filter((c) => c.group === g).map((c) => (
                <Choice key={c.code} type="radio" name="country" compact opt={{ id: c.code, label: c.label }}
                  checked={a.country === c.code} onPick={(id) => update({ country: id, budget: a.country && currencyOf(a.country) !== currencyOf(id) ? '' : a.budget })} />
              ))}
            </Group>
          ))}
          <div className="qz-field qz-field--inline">
            <label htmlFor="qz-city">Ville <span className="qz-optional">(facultatif)</span></label>
            <input id="qz-city" type="text" autoComplete="address-level2" maxLength={80} value={a.city}
              onChange={(e) => update({ city: e.target.value })} placeholder="Ex. Cotonou" />
          </div>
        </Step>
      );
    }

    if (stepId.startsWith('detail:')) {
      const pid = stepId.slice(7);
      const def = DETAILS[pid];
      const ans = a.details[pid] ?? {};
      const single = def.questions.length === 1 && def.questions[0].type === 'single';
      const setAns = (qid: string, val: string | string[], byPointer = false) =>
        update({ details: { ...a.details, [pid]: { ...ans, [qid]: val } } }, byPointer);
      return (
        <Step title={def.title} hint="Quelques précisions pour cadrer votre besoin." focus={interacted.current} kicker={Q.projects.find((p) => p.id === pid)?.label}>
          {def.questions.map((q) => (
            <Group key={q.id} legend={q.label} optional={q.optional} cols={q.options.length > 4 ? 'chips' : 'auto'}>
              {q.options.map((o) => q.type === 'multi' ? (
                <Choice key={o.id} type="checkbox" name={`${pid}-${q.id}`} opt={o} compact
                  checked={Array.isArray(ans[q.id]) && (ans[q.id] as string[]).includes(o.id)}
                  onPick={(id) => setAns(q.id, toggle(Array.isArray(ans[q.id]) ? (ans[q.id] as string[]) : [], id))} />
              ) : (
                <Choice key={o.id} type="radio" name={`${pid}-${q.id}`} opt={o} compact
                  checked={ans[q.id] === o.id} onPick={(id, byPointer) => setAns(q.id, id, byPointer && single)} />
              ))}
            </Group>
          ))}
        </Step>
      );
    }

    if (stepId === 'goal') {
      return (
        <Step title="Quel est votre objectif n° 1 ?" hint="Celui qui compte le plus pour vous dans les six prochains mois." focus={interacted.current}>
          <Group legend={<span className="sr-only">Objectif principal</span>}>
            {Q.goals.map((g) => (
              <Choice key={g.id} type="radio" name="goal" opt={g} checked={a.goal === g.id}
                onPick={(id, byPointer) => update({ goal: id }, byPointer)} />
            ))}
          </Group>
        </Step>
      );
    }

    if (stepId === 'company') {
      return (
        <Step title="Parlez-nous de votre structure" hint="Pour proposer une solution à la bonne échelle." focus={interacted.current}>
          <Group legend="Taille" cols="chips">
            {Q.companySizes.map((o) => (
              <Choice key={o.id} type="radio" name="size" compact opt={o} checked={a.size === o.id} onPick={(id) => update({ size: id })} />
            ))}
          </Group>
          <Group legend="Stade" cols="chips">
            {Q.maturity.map((o) => (
              <Choice key={o.id} type="radio" name="maturity" compact opt={o} checked={a.maturity === o.id} onPick={(id) => update({ maturity: id })} />
            ))}
          </Group>
          <Group legend="Secteur d’activité" cols="chips">
            {Q.sectors.map((o) => (
              <Choice key={o.id} type="radio" name="sector" compact opt={o} checked={a.sector === o.id} onPick={(id) => update({ sector: id })} />
            ))}
          </Group>
          {a.sector === 'autre' && (
            <div className="qz-field qz-field--inline">
              <label htmlFor="qz-sector">Précisez votre secteur</label>
              <input id="qz-sector" type="text" maxLength={80} value={a.sectorOther} onChange={(e) => update({ sectorOther: e.target.value })} />
            </div>
          )}
        </Step>
      );
    }

    if (stepId === 'budget') {
      return (
        <Step title="Quel budget envisagez-vous ?" hint="Une fourchette suffit : elle nous aide à proposer la solution la plus rentable, pas la plus chère." focus={interacted.current}>
          <div className="qz-switch" role="group" aria-label="Type de budget">
            {Q.budgetTypes.map((t) => (
              <button key={t.id} type="button" aria-pressed={a.budgetType === t.id} onClick={() => update({ budgetType: t.id })}>
                {t.label}
              </button>
            ))}
          </div>
          <Group legend={<span className="sr-only">Fourchette de budget</span>}>
            {budgetOptions(a).map((o) => (
              <Choice key={o.id} type="radio" name="budget" opt={o} checked={a.budget === o.id}
                onPick={(id, byPointer) => update({ budget: id }, byPointer)} />
            ))}
          </Group>
          <p className="qz-note">Montants en {currencyOf(a.country) === 'XOF' || currencyOf(a.country) === 'XAF' ? 'FCFA' : currencyOf(a.country)}, calculés d’après votre pays.</p>
        </Step>
      );
    }

    if (stepId === 'timeline') {
      return (
        <Step title="Quand souhaitez-vous démarrer ?" focus={interacted.current}>
          <Group legend={<span className="sr-only">Date de démarrage</span>}>
            {Q.timelines.map((o) => (
              <Choice key={o.id} type="radio" name="timeline" opt={o} checked={a.timeline === o.id}
                onPick={(id, byPointer) => update({ timeline: id }, byPointer)} />
            ))}
          </Group>
        </Step>
      );
    }

    if (stepId === 'assets') {
      return (
        <Step title="De quoi disposez-vous déjà ?" hint="Tout ce qui existe nous fait gagner du temps (et à vous, de l’argent)." focus={interacted.current}>
          <Group legend={<span className="sr-only">Éléments existants</span>} cols="chips">
            {Q.assets.map((o) => (
              <Choice key={o.id} type="checkbox" name="assets" compact opt={o} checked={a.assets.includes(o.id)}
                onPick={(id) => update({ assets: id === 'rien' ? (a.assets.includes('rien') ? [] : ['rien']) : toggle(a.assets.filter((x) => x !== 'rien'), id) })} />
            ))}
          </Group>
          {a.assets.includes('site') && (
            <div className="qz-field qz-field--inline">
              <label htmlFor="qz-url">Adresse de votre site <span className="qz-optional">(facultatif)</span></label>
              <input id="qz-url" type="url" inputMode="url" autoComplete="url" maxLength={300} value={a.websiteUrl}
                onChange={(e) => update({ websiteUrl: e.target.value })} placeholder="votre-site.com" />
            </div>
          )}
        </Step>
      );
    }

    if (stepId === 'description') {
      const prompts = ['Mon principal défi aujourd’hui : ', 'Je m’inspire de ce site : ', 'Mes concurrents sont : ', 'Une date importante : '];
      return (
        <Step title="Décrivez votre projet en quelques lignes" hint="Facultatif, mais c’est ce qui nous permet d’arriver à l’appel avec de vraies idées." focus={interacted.current}>
          <div className="qz-field">
            <label htmlFor="qz-desc" className="sr-only">Description du projet</label>
            <textarea id="qz-desc" rows={6} maxLength={3000} value={a.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Votre activité, ce que vous voulez obtenir, ce qui ne fonctionne pas aujourd’hui…" />
            <p className="qz-count">{a.description.length} / 3 000</p>
          </div>
          <div className="qz-prompts" aria-label="Idées pour commencer">
            {prompts.map((p) => (
              <button key={p} type="button" className="qz-prompt" onClick={() => update({ description: (a.description ? a.description.trimEnd() + '\n' : '') + p })}>
                + {p.replace(/ : $/, '')}
              </button>
            ))}
          </div>
        </Step>
      );
    }

    if (stepId === 'contact') {
      const c = a.contact;
      const err = (cond: boolean) => touched && cond;
      return (
        <Step title="Où pouvons-nous vous répondre ?" hint="Lissanon Gildas, fondateur de Pirabel Labs, vous répond personnellement sous 24 h ouvrées." focus={interacted.current}>
          <div className="qz-grid">
            <div className="qz-field">
              <label htmlFor="qz-name">Nom complet <span aria-hidden="true">*</span></label>
              <input id="qz-name" type="text" autoComplete="name" required maxLength={120} value={c.name}
                aria-invalid={err(c.name.trim().length < 2)} aria-describedby={err(c.name.trim().length < 2) ? 'qz-name-err' : undefined}
                onChange={(e) => setContact({ name: e.target.value })} />
              {err(c.name.trim().length < 2) && <p className="qz-error" id="qz-name-err" role="alert">Indiquez votre nom.</p>}
            </div>
            <div className="qz-field">
              <label htmlFor="qz-email">E-mail <span aria-hidden="true">*</span></label>
              <input id="qz-email" type="email" autoComplete="email" inputMode="email" required maxLength={254} value={c.email}
                aria-invalid={err(!isEmail(c.email))} aria-describedby={err(!isEmail(c.email)) ? 'qz-email-err' : undefined}
                onChange={(e) => setContact({ email: e.target.value })} />
              {err(!isEmail(c.email)) && <p className="qz-error" id="qz-email-err" role="alert">Adresse e-mail invalide.</p>}
            </div>
            <div className="qz-field">
              <label htmlFor="qz-phone">Téléphone ou WhatsApp <span className="qz-optional">(recommandé)</span></label>
              <input id="qz-phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} value={c.phone}
                placeholder="+229 01 23 45 67 89" onChange={(e) => setContact({ phone: e.target.value })} />
            </div>
            <div className="qz-field">
              <label htmlFor="qz-company">Entreprise <span className="qz-optional">(facultatif)</span></label>
              <input id="qz-company" type="text" autoComplete="organization" maxLength={120} value={c.company}
                onChange={(e) => setContact({ company: e.target.value })} />
            </div>
          </div>
          <Group legend="Comment préférez-vous être recontacté ?" cols="chips">
            {Q.channels.map((o) => (
              <Choice key={o.id} type="radio" name="channel" compact opt={o} checked={c.channel === o.id} onPick={(id) => setContact({ channel: id })} />
            ))}
          </Group>
          <label className={`qz-consent${err(!c.consent) ? ' is-error' : ''}`}>
            <input id="qz-consent" type="checkbox" checked={c.consent} onChange={(e) => setContact({ consent: e.target.checked })}
              aria-invalid={err(!c.consent)} aria-describedby={err(!c.consent) ? 'qz-consent-err' : undefined} />
            <span>J’accepte que Pirabel Labs utilise ces informations pour me recontacter au sujet de mon projet, conformément à la <a href="/politique-confidentialite">politique de confidentialité</a>. <span aria-hidden="true">*</span></span>
          </label>
          {err(!c.consent) && <p className="qz-error" id="qz-consent-err" role="alert">Cochez cette case pour que nous puissions vous répondre.</p>}
        </Step>
      );
    }

    // Récapitulatif
    const rows: { k: string; v: string; step: StepId }[] = [
      { k: 'Projet', v: a.projects.map((p) => label(Q.projects, p)).join(', '), step: 'projects' },
      ...a.projects.filter((p) => DETAILS[p]).map((p) => {
        const ans = a.details[p] ?? {};
        const v = DETAILS[p].questions.filter((q) => ans[q.id] && (ans[q.id] as string | string[]).length)
          .map((q) => `${q.short} : ${([] as string[]).concat(ans[q.id]).map((id) => label(q.options, id)).join(', ')}`).join(' · ');
        return { k: label(Q.projects, p), v: v || '—', step: `detail:${p}` };
      }),
      { k: 'Localisation', v: [a.city, Q.countries.find((c) => c.code === a.country)?.label].filter(Boolean).join(', '), step: 'location' },
      { k: 'Objectif', v: label(Q.goals, a.goal), step: 'goal' },
      { k: 'Structure', v: [label(Q.companySizes, a.size), label(Q.maturity, a.maturity), a.sector === 'autre' ? a.sectorOther : label(Q.sectors, a.sector)].filter(Boolean).join(' · '), step: 'company' },
      { k: 'Budget', v: label(budgetOptions(a), a.budget) + (a.budgetType === 'projet' && a.budget !== 'nsp' ? ' (projet ponctuel)' : ''), step: 'budget' },
      { k: 'Démarrage', v: label(Q.timelines, a.timeline), step: 'timeline' },
      { k: 'Existant', v: a.assets.map((x) => label(Q.assets, x)).join(', ') + (a.websiteUrl ? ` (${a.websiteUrl})` : ''), step: 'assets' },
      { k: 'Description', v: a.description.trim() || 'Non renseignée', step: 'description' },
      { k: 'Coordonnées', v: [a.contact.name, a.contact.email, a.contact.phone, a.contact.company].filter(Boolean).join(' · ') + ` — par ${label(Q.channels, a.contact.channel).toLowerCase()}`, step: 'contact' },
    ];
    return (
      <Step title="Tout est juste ?" hint="Relisez votre demande : vous pouvez modifier chaque point avant l’envoi." focus={interacted.current}>
        <dl className="qz-recap">
          {rows.map((r) => (
            <div key={r.k} className="qz-recap__row">
              <dt>{r.k}</dt>
              <dd>
                <span className="qz-recap__v">{r.v}</span>
                <button type="button" className="qz-edit" onClick={() => go(r.step, -1)} aria-label={`Modifier : ${r.k}`}>Modifier</button>
              </dd>
            </div>
          ))}
        </dl>
        {status === 'error' && <p className="qz-error qz-error--block" role="alert">{serverMsg} Vous pouvez réessayer ou nous écrire sur <a href="https://wa.me/16139273067">WhatsApp</a>.</p>}
      </Step>
    );
  };

  /* ---------------------------------------------------------- Rendu -- */
  const firstName = a.contact.name.trim().split(/\s+/)[0] || '';
  const isLast = stepId === 'recap';
  const ok = canContinue(stepId, a);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="qz glass" ref={rootRef}>
        <div className="qz-head">
          <ol className="qz-phases" aria-hidden="true">
            {PHASES.map((p, i) => (
              <li key={p} className={i < phase || status === 'done' ? 'is-done' : i === phase ? 'is-current' : ''}>{p}</li>
            ))}
          </ol>
          <div className="qz-bar" role="progressbar" aria-label="Progression" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <m.span className="qz-bar__fill" initial={false} animate={{ scaleX: Math.max(0.04, progress) }}
              transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, duration: 0.6 }} />
          </div>
          <p className="qz-count-steps" aria-live="polite">
            {status === 'done' ? 'Demande envoyée' : `Étape ${index + 1} sur ${steps.length} · ${PHASES[phase]}`}
          </p>
        </div>

        {restored && status !== 'done' && (
          <p className="qz-restored">Vous aviez commencé : on reprend là où vous en étiez. <button type="button" onClick={restart}>Recommencer</button></p>
        )}

        {status === 'done' ? (
          <Done firstName={firstName} level={level} confirmationSent={confirmationSent} focus={interacted.current} reduce={!!reduce} />
        ) : (
          <form className="qz-form" onSubmit={onSubmit} noValidate>
            <input ref={hpRef} type="text" name="qf_hp" defaultValue="" readOnly tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: 'none' }} />
            <div className="qz-stage">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <m.div key={stepId} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
                  transition={reduce ? { duration: 0.15 } : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
                  {renderStep()}
                </m.div>
              </AnimatePresence>
            </div>
            {touched && !ok && stepId !== 'contact' && <p className="qz-error qz-error--block" role="alert">Choisissez une réponse pour continuer.</p>}
            <div className="qz-actions">
              {index > 0 ? (
                <button type="button" className="btn btn--glass qz-back" onClick={back}><Svg name="arrow-left" size={18} /> Retour</button>
              ) : <span />}
              <button type="submit" className="btn btn--primary btn--lg qz-next" aria-disabled={!ok || status === 'sending'} data-ready={ok}>
                {isLast ? (status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande') : 'Continuer'}
                {!isLast && <Svg name="arrow-right" size={18} />}
                {isLast && status !== 'sending' && <Svg name="send" size={18} />}
              </button>
            </div>
            <p className="qz-privacy"><Svg name="lock" size={14} /> Vos réponses restent confidentielles et ne sont jamais revendues.</p>
          </form>
        )}
      </div>
    </LazyMotion>
  );
}

// Titre focalisé à son apparition (après la transition), pour les lecteurs d'écran.
function useFocusOnMount(active: boolean) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (active) ref.current?.focus({ preventScroll: true }); }, []);
  return ref;
}

function Step(props: { title: string; hint?: string; kicker?: string; children: ReactNode; focus: boolean }) {
  const ref = useFocusOnMount(props.focus);
  return (
    <div className="qz-step">
      {props.kicker && <p className="qz-kicker">{props.kicker}</p>}
      <h2 className="qz-title" tabIndex={-1} ref={ref}>{props.title}</h2>
      {props.hint && <p className="qz-sub">{props.hint}</p>}
      <div className="qz-body">{props.children}</div>
    </div>
  );
}

function Done(props: { firstName: string; level: string; confirmationSent: boolean; focus: boolean; reduce: boolean }) {
  const { firstName, level, confirmationSent, focus, reduce } = props;
  const titleRef = useFocusOnMount(focus);
  const hot = level === 'chaud';
  return (
    <div className="qz-done">
      <svg className="qz-done__check" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(255,122,51,.25)" strokeWidth="3" />
        <m.path d="M19 33 l9 9 l17 -19" fill="none" stroke="#ff7a33" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <h2 className="qz-title" tabIndex={-1} ref={titleRef}>Merci{firstName ? ` ${firstName}` : ''}, votre demande est bien reçue !</h2>
      <p className="qz-sub">
        {hot
          ? 'Votre projet est clair et prioritaire : Lissanon Gildas vous recontacte dans la journée ouvrée. Pour aller plus vite, choisissez dès maintenant un créneau d’appel.'
          : 'Nous étudions vos réponses et revenons vers vous sous 24 h ouvrées avec une première lecture de votre besoin.' +
            (confirmationSent ? ' Un e-mail de confirmation vient de partir.' : ' Votre demande précédente reste bien enregistrée.')}
      </p>
      <div className="qz-done__actions">
        <a href="/rdv" className="btn btn--primary btn--lg">Choisir un créneau d’appel</a>
        <a href="https://wa.me/16139273067?text=Bonjour%20Pirabel%20Labs%2C%20je%20viens%20d%27envoyer%20ma%20demande%20sur%20le%20site" className="btn btn--glass btn--lg" target="_blank" rel="noopener">Écrire sur WhatsApp</a>
      </div>
      <a href="/realisations" className="link-arrow qz-done__more">En attendant, découvrez nos réalisations →</a>
    </div>
  );
}
