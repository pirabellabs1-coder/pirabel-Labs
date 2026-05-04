/**
 * Pirabel Labs - Language Manager V4
 * Runs early in <head> — sets cookie based on current page, NOT from localStorage.
 * The full switchLanguage logic lives in global.js.
 */
(function() {
    var COOKIE = 'pirabel_lang';
    var LS_KEY = 'pirabel_pref_lang';
    var isEN = window.location.pathname.startsWith('/en/') || window.location.pathname === '/en';
    var currentLang = isEN ? 'en' : 'fr';

    // Always sync cookie to match current page language
    var match = document.cookie.match(/pirabel_lang=(\w+)/);
    var cookieLang = match ? match[1] : null;

    if (cookieLang !== currentLang) {
        document.cookie = COOKIE + '=' + currentLang + '; path=/; max-age=31536000; SameSite=Lax';
    }

    try { localStorage.setItem(LS_KEY, currentLang); } catch(e) {}
})();
