/**
 * Pirabel Labs - Language Manager V3
 * Handles language switching + cookie sync with Vercel Edge Middleware geo-detection
 */

(function() {
    const LANG_KEY = 'pirabel_pref_lang';
    const COOKIE_NAME = 'pirabel_lang';
    const SUPPORTED_LANGS = ['fr', 'en'];

    function setCookie(lang) {
        document.cookie = COOKIE_NAME + '=' + lang + '; path=/; max-age=31536000; SameSite=Lax';
    }

    function getCookie() {
        const match = document.cookie.match(/pirabel_lang=(\w+)/);
        return match ? match[1] : null;
    }

    // Sync localStorage with cookie on load
    const cookieLang = getCookie();
    if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) {
        localStorage.setItem(LANG_KEY, cookieLang);
    }

    window.switchLanguage = function(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) return;

        // Save preference in both localStorage and cookie
        localStorage.setItem(LANG_KEY, lang);
        setCookie(lang);

        let newPath = window.location.pathname;

        if (lang === 'en') {
            if (!newPath.startsWith('/en/')) {
                newPath = '/en' + (newPath === '/' ? '/' : newPath);
            }
        } else {
            if (newPath.startsWith('/en/')) {
                newPath = newPath.replace('/en/', '/');
                if (newPath === '' || newPath === '/en') newPath = '/';
            }
        }

        window.location.href = newPath;
    };
})();
