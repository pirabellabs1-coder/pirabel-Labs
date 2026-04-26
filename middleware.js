/**
 * Pirabel Labs — Edge Middleware: geolocation-based language preference.
 *
 * Runs at Vercel's edge for every matched request. Uses the
 * `x-vercel-ip-country` header set automatically by Vercel.
 *
 * Behavior:
 *   - Only fires on root entries (/, /en/) — never on deep pages, so Google
 *     traffic to specific URLs keeps the language Google indexed.
 *   - Skips if the visitor already has a language preference cookie.
 *   - Skips if the visitor has explicitly arrived via the language switcher
 *     (cookie set by language-manager.js localStorage doesn't reach edge,
 *     but we set a parallel cookie too — see language-manager.js).
 *   - French-speaking countries: redirect /en/ → /
 *   - English-speaking countries: redirect / → /en/
 *   - Other countries: respect the URL as-is (no forced redirect).
 */

export const config = {
    matcher: ['/', '/index.html', '/en', '/en/', '/en/index.html'],
};

// Countries where French is the dominant or co-official language and
// the agency has commercial relevance (offices or target market).
const FR_COUNTRIES = new Set([
    'FR', // France
    'BE', // Belgium
    'CH', // Switzerland
    'LU', // Luxembourg
    'MC', // Monaco
    'CA', // Canada (Quebec — mixed; we still send to FR by default since FR-CA exists)
    'MA', // Morocco
    'DZ', // Algeria
    'TN', // Tunisia
    'SN', // Senegal
    'CI', // Côte d'Ivoire
    'BJ', // Benin
    'CM', // Cameroon
    'GA', // Gabon
    'TG', // Togo
    'CD', // DR Congo
    'CG', // Republic of Congo
    'BF', // Burkina Faso
    'ML', // Mali
    'NE', // Niger
    'GN', // Guinea
    'MG', // Madagascar
    'HT', // Haiti
    'DJ', // Djibouti
    'KM', // Comoros
    'MR', // Mauritania
    'RW', // Rwanda
    'BI', // Burundi
    'VU', // Vanuatu
]);

// Anglophone-dominant countries that should be forced to /en/ from /
const EN_COUNTRIES = new Set([
    'US', 'GB', 'AU', 'NZ', 'IE',
    'IN', 'PH', 'NG', 'KE', 'ZA', 'GH',
    'SG', 'MY', // Singapore + Malaysia: English is widely used
    'JM', 'TT', 'BB', // Caribbean English-speaking
]);

const LANG_COOKIE = 'pirabel_pref_lang';

export default function middleware(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Skip if a language preference is already set
    const cookieHeader = request.headers.get('cookie') || '';
    if (cookieHeader.includes(`${LANG_COOKIE}=`)) {
        return;
    }

    const country = (request.headers.get('x-vercel-ip-country') || '').toUpperCase();
    const isFrRoot = path === '/' || path === '/index.html';
    const isEnRoot = path === '/en' || path === '/en/' || path === '/en/index.html';

    if (!isFrRoot && !isEnRoot) {
        return; // Defensive — matcher should already filter
    }

    let target = null;
    if (FR_COUNTRIES.has(country) && isEnRoot) {
        target = '/';
    } else if (EN_COUNTRIES.has(country) && isFrRoot) {
        target = '/en/';
    }

    if (!target) {
        return;
    }

    // 302: visitor preference, NOT a permanent canonical change.
    // Set a 30-day cookie so the visitor isn't redirected on every load.
    const headers = new Headers();
    headers.set('Location', new URL(target, request.url).toString());
    headers.set(
        'Set-Cookie',
        `${LANG_COOKIE}=${target.startsWith('/en') ? 'en' : 'fr'}; Path=/; Max-Age=2592000; SameSite=Lax`
    );
    headers.set('Cache-Control', 'no-store');
    headers.set('Vary', 'Cookie, X-Vercel-IP-Country');

    return new Response(null, { status: 302, headers });
}
