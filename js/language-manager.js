/**
 * Pirabel Labs - Language Manager V2
 * Gère la détection automatique et le mapping intelligent des URLs (SEO Slugs)
 */

(function() {
    const LANG_KEY = 'pirabel_pref_lang';
    const SUPPORTED_LANGS = ['fr', 'en'];
    const DEFAULT_LANG = 'fr';

    // Table de correspondance SEO (Français -> Anglais)
    const URL_MAP = {
        '/agence-seo-referencement-naturel/': '/en/seo-agency/',
        '/agence-creation-sites-web/': '/en/web-design-agency/',
        '/agence-ia-automatisation/': '/en/ai-automation-agency/',
        '/agence-design-branding/': '/en/branding-agency/',
        '/agence-publicite-payante-sea-ads/': '/en/paid-advertising-agency/',
        '/agence-social-media/': '/en/social-media-agency/',
        '/agence-email-marketing-crm/': '/en/email-marketing-agency/',
        '/agence-video-motion-design/': '/en/video-production-agency/',
        '/agence-sales-funnels-cro/': '/en/conversion-funnels-agency/',
        '/agence-redaction-content-marketing/': '/en/content-marketing-agency/',
        '/resultats': '/en/results',
        '/avis': '/en/reviews',
        '/contact': '/en/contact'
    };

    // Inverser la table pour le sens Anglais -> Français
    const REVERSE_MAP = {};
    for (const [fr, en] of Object.entries(URL_MAP)) {
        REVERSE_MAP[en] = fr;
    }

    function getTargetLang() {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored) return stored;
        const navLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGS.includes(navLang)) return navLang;
        return DEFAULT_LANG;
    }

    // Détection à la racine
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/index.html') {
        const target = getTargetLang();
        if (target === 'en') window.location.href = '/en/';
    }

    window.switchLanguage = function(lang) {
        console.log('Switching to:', lang);
        if (!SUPPORTED_LANGS.includes(lang)) return;
        localStorage.setItem(LANG_KEY, lang);
        
        let newPath = window.location.pathname;
        
        // Nettoyer le trailing slash pour le mapping
        const cleanPath = newPath.endsWith('/') && newPath.length > 1 ? newPath.slice(0, -1) : newPath;
        
        if (lang === 'en') {
            if (URL_MAP[cleanPath]) {
                newPath = URL_MAP[cleanPath];
            } else if (!newPath.startsWith('/en/')) {
                newPath = '/en' + (newPath === '/' ? '/' : newPath);
            }
        } else {
            if (REVERSE_MAP[cleanPath]) {
                newPath = REVERSE_MAP[cleanPath];
            } else if (newPath.startsWith('/en/')) {
                newPath = newPath.replace('/en/', '/');
            }
        }
        
        console.log('Redirecting to:', newPath);
        window.location.href = newPath;
    };
})();
