/**
 * Pirabel Labs — Language Manager V3
 * Trailing-slash safe, sub-page fallbacks, FR↔EN switching.
 */
(function() {
    const LANG_KEY = 'pirabel_pref_lang';
    const SUPPORTED_LANGS = ['fr', 'en'];
    const DEFAULT_LANG = 'fr';

    // FR path (no trailing slash) -> EN path (as the site canonically uses it)
    const URL_MAP = {
        '/agence-seo-referencement-naturel': '/en/seo-agency/',
        '/agence-creation-sites-web':         '/en/web-design-agency/',
        '/agence-ia-automatisation':          '/en/ai-automation-agency/',
        '/agence-design-branding':            '/en/branding-agency/',
        '/agence-publicite-payante-sea-ads':  '/en/paid-advertising-agency/',
        '/agence-social-media':               '/en/social-media-agency/',
        '/agence-email-marketing-crm':        '/en/email-marketing-agency/',
        '/agence-video-motion-design':        '/en/video-production-agency/',
        '/agence-sales-funnels-cro':          '/en/conversion-funnels-agency/',
        '/agence-redaction-content-marketing':'/en/content-marketing-agency/',
        '/services':         '/en/services',
        '/contact':          '/en/contact',
        '/a-propos':         '/en/about',
        '/resultats':        '/en/results',
        '/avis':             '/en/reviews',
        '/carrieres':        '/en/careers',
        '/mentions-legales': '/en/legal-mentions',
        '/politique-confidentialite': '/en/legal-mentions',
        '/blog':             '/en/blog',
        '/guides':           '/en/guides',
        '/rendez-vous':      '/en/book-a-call',
        '/':                 '/en/',
    };

    // Section prefixes for sub-page fallback
    const SECTION_PREFIXES_FR_TO_EN = {
        '/agence-seo-referencement-naturel/': '/en/seo-agency/',
        '/agence-creation-sites-web/':         '/en/web-design-agency/',
        '/agence-ia-automatisation/':          '/en/ai-automation-agency/',
        '/agence-design-branding/':            '/en/branding-agency/',
        '/agence-publicite-payante-sea-ads/':  '/en/paid-advertising-agency/',
        '/agence-social-media/':               '/en/social-media-agency/',
        '/agence-email-marketing-crm/':        '/en/email-marketing-agency/',
        '/agence-video-motion-design/':        '/en/video-production-agency/',
        '/agence-sales-funnels-cro/':          '/en/conversion-funnels-agency/',
        '/agence-redaction-content-marketing/':'/en/content-marketing-agency/',
        '/blog/':   '/en/blog',
        '/guides/': '/en/guides',
    };

    function normalizePath(p) {
        if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
        return p;
    }

    // Build reverse map (EN normalized -> FR original) from URL_MAP.
    const REVERSE_MAP = {};
    const SECTION_PREFIXES_EN_TO_FR = {};
    for (const [fr, en] of Object.entries(URL_MAP)) {
        REVERSE_MAP[normalizePath(en)] = fr;
    }
    for (const [frPrefix, enPrefix] of Object.entries(SECTION_PREFIXES_FR_TO_EN)) {
        SECTION_PREFIXES_EN_TO_FR[enPrefix.endsWith('/') ? enPrefix : enPrefix + '/'] = frPrefix;
    }

    function getTargetLang() {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored) return stored;
        const navLang = (navigator.language || 'fr').split('-')[0].toLowerCase();
        if (SUPPORTED_LANGS.includes(navLang)) return navLang;
        return DEFAULT_LANG;
    }

    function setLangPreference(lang) {
        // Persist in both localStorage (for client) and cookie (for edge middleware)
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
        const days = 30;
        const expires = new Date(Date.now() + days * 86400 * 1000).toUTCString();
        document.cookie = LANG_KEY + '=' + lang + '; path=/; expires=' + expires + '; SameSite=Lax';
    }

    // Backfill cookie from localStorage on first load (for users who chose
    // a language before the edge middleware was deployed).
    (function backfillCookie() {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored && document.cookie.indexOf(LANG_KEY + '=') === -1) {
            setLangPreference(stored);
        }
    })();

    // Auto-redirect at section roots based on stored/browser language.
    // We only redirect at root entries (/, /en/) — NOT on deep pages,
    // so Google traffic to specific pages keeps its language.
    const currentPath = window.location.pathname;
    const isFrRoot = (currentPath === '/' || currentPath === '/index.html' || currentPath === '/index');
    const isEnRoot = (currentPath === '/en' || currentPath === '/en/' || currentPath === '/en/index.html');
    if (isFrRoot || isEnRoot) {
        const target = getTargetLang();
        if (target === 'en' && isFrRoot) {
            window.location.replace('/en/');
            return;
        }
        if (target === 'fr' && isEnRoot) {
            window.location.replace('/');
            return;
        }
    }

    window.switchLanguage = function(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        setLangPreference(lang);

        const rawPath = window.location.pathname;
        const path = normalizePath(rawPath);
        let newPath = null;

        if (lang === 'en') {
            // Already EN — nothing to do
            if (path === '/en' || path.startsWith('/en/')) {
                return;
            }
            // Direct match
            if (URL_MAP[path]) {
                newPath = URL_MAP[path];
            } else {
                // Try matching by section prefix (e.g., /agence-X/sub-page → /en/X-agency/)
                for (const frPrefix in SECTION_PREFIXES_FR_TO_EN) {
                    if (rawPath.startsWith(frPrefix) || (rawPath + '/').startsWith(frPrefix)) {
                        newPath = SECTION_PREFIXES_FR_TO_EN[frPrefix];
                        break;
                    }
                }
                // Last resort: EN home
                if (!newPath) newPath = '/en/';
            }
        } else {
            // Already FR — nothing to do
            if (!path.startsWith('/en/') && path !== '/en') {
                return;
            }
            // Direct match
            if (REVERSE_MAP[path]) {
                newPath = REVERSE_MAP[path];
            } else {
                // Try matching by section prefix
                for (const enPrefix in SECTION_PREFIXES_EN_TO_FR) {
                    if (rawPath.startsWith(enPrefix)) {
                        newPath = SECTION_PREFIXES_EN_TO_FR[enPrefix];
                        break;
                    }
                }
                // Last resort: FR home
                if (!newPath) newPath = '/';
            }
        }

        window.location.href = newPath;
    };

    // ─────────────────────────────────────────────────────────────────────
    // Language suggestion banner: if the current page language differs from
    // the visitor's preferred language AND we have a known mapping for the
    // current page, show a discreet, dismissable suggestion banner.
    // ─────────────────────────────────────────────────────────────────────
    function pageLanguage() {
        if (window.location.pathname.startsWith('/en/') || window.location.pathname === '/en') {
            return 'en';
        }
        return 'fr';
    }

    function browserLangPreference() {
        const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'fr'];
        for (const l of langs) {
            const code = l.split('-')[0].toLowerCase();
            if (SUPPORTED_LANGS.includes(code)) return code;
        }
        return null;
    }

    function buildAlternateUrl(toLang) {
        const rawPath = window.location.pathname;
        const path = normalizePath(rawPath);
        if (toLang === 'en') {
            if (URL_MAP[path]) return URL_MAP[path];
            for (const frPrefix in SECTION_PREFIXES_FR_TO_EN) {
                if (rawPath.startsWith(frPrefix)) return SECTION_PREFIXES_FR_TO_EN[frPrefix];
            }
            return null;
        } else {
            if (REVERSE_MAP[path]) return REVERSE_MAP[path];
            for (const enPrefix in SECTION_PREFIXES_EN_TO_FR) {
                if (rawPath.startsWith(enPrefix)) return SECTION_PREFIXES_EN_TO_FR[enPrefix];
            }
            return null;
        }
    }

    const BANNER_DISMISS_KEY = 'pirabel_banner_dismissed';

    function showLanguageBanner() {
        // Guard: skip if user explicitly stored a preference (they chose this lang)
        if (localStorage.getItem(LANG_KEY)) return;
        // Guard: skip if dismissed this session
        if (sessionStorage.getItem(BANNER_DISMISS_KEY) === '1') return;
        // Guard: skip if no DOM (e.g., before body)
        if (!document.body) return;

        const pageLang = pageLanguage();
        const prefLang = browserLangPreference();
        if (!prefLang || prefLang === pageLang) return;

        const targetUrl = buildAlternateUrl(prefLang);
        if (!targetUrl) return;

        const labels = prefLang === 'fr'
            ? { msg: 'Voir cette page en français ?', cta: 'Passer en français', dismiss: 'Non merci' }
            : { msg: 'View this page in English?',    cta: 'Switch to English',    dismiss: 'No thanks' };

        const wrap = document.createElement('div');
        wrap.id = 'pirabel-lang-banner';
        wrap.setAttribute('role', 'region');
        wrap.setAttribute('aria-label', 'Language suggestion');
        wrap.style.cssText = [
            'position:fixed', 'left:1rem', 'right:1rem', 'bottom:1rem',
            'max-width:560px', 'margin:0 auto',
            'background:#1a1a1a', 'color:#f5f0eb',
            'border:1px solid rgba(255,85,0,0.4)', 'border-radius:12px',
            'padding:1rem 1.25rem',
            'box-shadow:0 8px 24px rgba(0,0,0,0.45)',
            'font-family:Inter,system-ui,-apple-system,sans-serif',
            'font-size:0.95rem', 'line-height:1.4',
            'z-index:9999',
            'display:flex', 'gap:0.75rem', 'align-items:center', 'flex-wrap:wrap'
        ].join(';');
        wrap.innerHTML = `
            <span style="flex:1 1 200px;">${labels.msg}</span>
            <button type="button" id="pirabel-lang-cta" style="background:#FF5500;color:#fff;border:none;padding:0.5rem 1rem;border-radius:6px;cursor:pointer;font-weight:600;">${labels.cta}</button>
            <button type="button" id="pirabel-lang-dismiss" aria-label="Dismiss" style="background:transparent;color:#aaa;border:1px solid #555;padding:0.5rem 0.85rem;border-radius:6px;cursor:pointer;font-weight:500;">${labels.dismiss}</button>
        `;
        document.body.appendChild(wrap);
        document.getElementById('pirabel-lang-cta').addEventListener('click', function() {
            setLangPreference(prefLang);
            window.location.href = targetUrl;
        });
        document.getElementById('pirabel-lang-dismiss').addEventListener('click', function() {
            sessionStorage.setItem(BANNER_DISMISS_KEY, '1');
            wrap.remove();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showLanguageBanner);
    } else {
        showLanguageBanner();
    }
})();
