/**
 * Pirabel Labs - Language Manager V3
 * Cookie sync only — the full switchLanguage logic lives in global.js
 * This file runs early (in <head>) to set the cookie before middleware redirects.
 */
(function() {
    var COOKIE = 'pirabel_lang';
    var LS_KEY = 'pirabel_pref_lang';

    // Sync: if localStorage has a preference but cookie is missing, set the cookie
    try {
        var stored = localStorage.getItem(LS_KEY);
        if (stored && document.cookie.indexOf(COOKIE + '=') === -1) {
            document.cookie = COOKIE + '=' + stored + '; path=/; max-age=31536000; SameSite=Lax';
        }
    } catch (e) {}

    // Sync: if cookie exists but localStorage doesn't, copy cookie to localStorage
    try {
        var match = document.cookie.match(/pirabel_lang=(\w+)/);
        if (match && match[1] && !localStorage.getItem(LS_KEY)) {
            localStorage.setItem(LS_KEY, match[1]);
        }
    } catch (e) {}
})();
