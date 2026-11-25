// Fonction CloudFront « pirabel-labs-rewrite » (requêtes vers le site statique S3).
// 1. Redirections permanentes des anciennes URL (reprises de l'ancien vercel.json).
// 2. URL propres : /page -> /page.html, /dossier/ -> /dossier/index.html.
// Publication : voir scripts/deploy-aws/README.md (aws cloudfront update-function + publish-function).
var REDIRECTS = {
  '/creation-application': '/creation-application-web',
  '/automatisation': '/automatisation-marketing'
};

function redirect(location, permanent) {
  return {
    statusCode: permanent ? 301 : 302,
    statusDescription: permanent ? 'Moved Permanently' : 'Found',
    headers: { location: { value: location } }
  };
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (REDIRECTS[uri]) return redirect(REDIRECTS[uri], true);
  // Anciennes URL d'articles : /article-<slug> -> /blog/<slug>
  if (uri.indexOf('/article-') === 0 && uri.length > 9) return redirect('/blog/' + uri.substring(9), true);
  // Anciennes formations : plus de page dédiée
  if (uri.indexOf('/formation/') === 0 || uri.indexOf('/lesson/') === 0) return redirect('/contact', false);

  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else {
    var lastSeg = uri.substring(uri.lastIndexOf('/') + 1);
    if (lastSeg.indexOf('.') === -1) {
      request.uri = uri + '.html';
    }
  }
  return request;
}
