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
        localStorage.setItem(LANG_KEY, lang);

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
})();
