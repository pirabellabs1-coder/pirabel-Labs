/**
 * Middleware i18n Pirabel Labs.
 *
 * REGLE CRITIQUE SEO : on ne redirige JAMAIS automatiquement par geolocalisation.
 * Google recommande explicitement d'utiliser hreflang et de laisser les bots
 * acceder a toutes les versions d'une page :
 *   https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
 *
 * Avant ce fix, Googlebot (qui crawle depuis des IPs US) etait redirige vers
 * /en/ a chaque visite => Google n'indexait jamais la version FR de la home,
 * ce qui faisait remonter /en/ comme version principale pour la marque
 * "Pirabel Labs" meme aux utilisateurs francophones.
 *
 * Strategie post-fix :
 *   1. Cookie pirabel_lang explicite (set par le user via switcher de langue)
 *      -> respecte si =en, redirige vers /en/<path>
 *   2. AUCUNE redirection par geolocalisation ou Accept-Language
 *   3. AUCUNE redirection des bots (User-Agent contenant 'bot', 'crawl', 'spider', etc.)
 *   4. Le user qui veut EN clique le switcher de langue (action explicite).
 *
 * Resultat : Google peut crawler / (FR) et /en/ (EN) librement, hreflang fait
 * son travail, la version FR redevient la version principale pour les requetes
 * francophones.
 */

const BOT_PATTERNS = /(bot|crawl|spider|slurp|mediapartners|googleweblight|facebookexternalhit|whatsapp|telegrambot|linkedinbot|twitterbot|pinterestbot|applebot|yandexbot|baiduspider|duckduckbot|sogou|exabot|ia_archiver|preview|prerender|chrome-lighthouse|insights|gtmetrix|pagespeed)/i;

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
  if (path.startsWith('/en/') || path === '/en' ||
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

  // CRITIQUE SEO : ne jamais rediriger les bots (crawlers)
  const ua = request.headers.get('user-agent') || '';
  if (BOT_PATTERNS.test(ua)) {
    return;  // laisser le bot voir la version FR de /
  }

  // Respect du cookie utilisateur (action explicite via switcher de langue)
  const cookies = request.headers.get('cookie') || '';
  const langMatch = cookies.match(/pirabel_lang=(\w+)/);
  if (langMatch && langMatch[1] === 'en') {
    const enPath = '/en' + (path === '/' ? '/' : path);
    return redirect(new URL(enPath, request.url).toString(), 'en');
  }

  // Aucune detection geo/Accept-Language : on reste sur FR (default)
  return;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
