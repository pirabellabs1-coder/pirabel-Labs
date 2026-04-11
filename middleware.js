import { next } from '@vercel/edge';

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

  // Only redirect on FR pages (not /en/, not /api/, not assets)
  if (path.startsWith('/en/') || path.startsWith('/api/') ||
      path.startsWith('/img/') || path.startsWith('/css/') ||
      path.startsWith('/js/') || path.startsWith('/public/') ||
      path.includes('.') && !path.endsWith('.html')) {
    return next();
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
    // If pref is 'fr' or user is already on correct version, continue
    return next();
  }

  // No cookie — detect language from geo then browser
  const country = request.headers.get('x-vercel-ip-country') || '';

  let detectedLang = null;

  if (ENGLISH_COUNTRIES.has(country)) {
    detectedLang = 'en';
  } else if (FRENCH_COUNTRIES.has(country)) {
    detectedLang = 'fr';
  } else {
    // Fallback: check browser Accept-Language header
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

  // French user — set cookie and continue
  const response = next();
  response.headers.set('Set-Cookie', 'pirabel_lang=fr; Path=/; Max-Age=31536000; SameSite=Lax');
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|img/|css/|js/|public/|fonts/).*)',
  ],
};
