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

function redirect(url, lang) {
  return new Response(null, {
    status: 307,
    headers: {
      'Location': url,
      'Set-Cookie': 'pirabel_lang=' + lang + '; Path=/; Max-Age=31536000; SameSite=Lax',
    },
  });
}

export default function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Skip: EN pages, API, assets
  if (path.startsWith('/en/') || path.startsWith('/en') ||
      path.startsWith('/api/') ||
      path.startsWith('/img/') || path.startsWith('/css/') ||
      path.startsWith('/js/') || path.startsWith('/public/') ||
      path.startsWith('/_next/') || path.startsWith('/_vercel/')) {
    return;
  }

  // Skip asset files
  if (/\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|css|js|map|json|txt|xml|webp|mp4|webm|pdf)$/i.test(path)) {
    return;
  }

  // Check cookie for existing language preference
  const cookies = request.headers.get('cookie') || '';
  const langMatch = cookies.match(/pirabel_lang=(\w+)/);

  if (langMatch) {
    const pref = langMatch[1];
    if (pref === 'en') {
      const enPath = '/en' + (path === '/' ? '/' : path);
      return redirect(new URL(enPath, request.url).toString(), 'en');
    }
    // User prefers FR — let them through
    return;
  }

  // No cookie — detect from geo then browser
  const country = request.headers.get('x-vercel-ip-country') || '';
  let detectedLang = 'fr';

  if (ENGLISH_COUNTRIES.has(country)) {
    detectedLang = 'en';
  } else if (FRENCH_COUNTRIES.has(country)) {
    detectedLang = 'fr';
  } else {
    // Fallback: browser Accept-Language
    const acceptLang = request.headers.get('accept-language') || '';
    const primary = acceptLang.split(',')[0].split('-')[0].toLowerCase();
    if (primary === 'en') detectedLang = 'en';
  }

  if (detectedLang === 'en') {
    const enPath = '/en' + (path === '/' ? '/' : path);
    return redirect(new URL(enPath, request.url).toString(), 'en');
  }

  // French user — pass through (cookie set by client-side JS)
  return;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
