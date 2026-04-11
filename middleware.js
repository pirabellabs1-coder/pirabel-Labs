const ENGLISH_COUNTRIES = new Set([
  'US', 'GB', 'AU', 'NZ', 'IE', 'ZA', 'GH', 'NG', 'KE', 'UG', 'TZ',
  'SG', 'PH', 'IN', 'PK', 'JM', 'TT', 'BB', 'BS', 'BZ', 'GY',
  'FJ', 'MW', 'ZM', 'ZW', 'BW', 'NA', 'SL', 'LR', 'GM',
]);

const FRENCH_COUNTRIES = new Set([
  'FR', 'BE', 'CH', 'CA', 'SN', 'CI', 'BJ', 'TG', 'CM', 'ML',
  'BF', 'NE', 'GA', 'CG', 'CD', 'MG', 'HT', 'LU', 'MC', 'GN',
  'TD', 'CF', 'DJ', 'KM', 'RW', 'BI', 'MR', 'SC',
]);

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Only process FR HTML pages (skip /en/, /api/, assets)
  if (path.startsWith('/en/') || path.startsWith('/api/') ||
      path.startsWith('/img/') || path.startsWith('/css/') ||
      path.startsWith('/js/') || path.startsWith('/public/') ||
      path.startsWith('/_next/')) {
    return;
  }

  // Skip asset files
  const ext = path.split('.').pop();
  if (['png','jpg','jpeg','gif','svg','ico','woff','woff2','ttf','css','js','map','json','txt','xml'].includes(ext)) {
    return;
  }

  // Check if user already chose a language (cookie)
  const cookies = request.headers.get('cookie') || '';
  const langMatch = cookies.match(/pirabel_lang=(\w+)/);

  if (langMatch) {
    const pref = langMatch[1];
    if (pref === 'en' && !path.startsWith('/en/')) {
      const enPath = '/en' + (path === '/' ? '/' : path);
      return Response.redirect(new URL(enPath, request.url), 307);
    }
    return;
  }

  // No cookie — detect from geo then browser
  const country = request.headers.get('x-vercel-ip-country') || '';
  let detectedLang = null;

  if (ENGLISH_COUNTRIES.has(country)) {
    detectedLang = 'en';
  } else if (FRENCH_COUNTRIES.has(country)) {
    detectedLang = 'fr';
  } else {
    const acceptLang = request.headers.get('accept-language') || '';
    const primary = acceptLang.split(',')[0].split('-')[0].toLowerCase();
    detectedLang = primary === 'en' ? 'en' : 'fr';
  }

  if (detectedLang === 'en') {
    const enPath = '/en' + (path === '/' ? '/' : path);
    const response = Response.redirect(new URL(enPath, request.url), 307);
    response.headers.set('Set-Cookie', 'pirabel_lang=en; Path=/; Max-Age=31536000; SameSite=Lax');
    return response;
  }

  // French — no redirect needed, but we can't set cookie on passthrough
  // Cookie will be set by language-manager.js client-side
  return;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
