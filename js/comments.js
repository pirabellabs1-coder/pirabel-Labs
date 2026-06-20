/* Commentaires de blog : charge les commentaires approuvés et gère la soumission. */
(function () {
  var parts = location.pathname.split('/').filter(Boolean);
  var slug = parts[parts.length - 1] || '';
  if (parts[0] !== 'blog' || !slug) return;
  var list = document.getElementById('cmList');
  var head = document.getElementById('cmTitle');
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function fmt(d) { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  fetch('/api/blog/' + encodeURIComponent(slug) + '/comments').then(function (r) { return r.json(); }).then(function (d) {
    var c = d.comments || [];
    if (head) head.textContent = 'Commentaires (' + c.length + ')';
    if (!list) return;
    if (!c.length) { list.innerHTML = '<p style="color:rgba(229,226,225,0.45);">Soyez le premier à commenter cet article.</p>'; return; }
    list.innerHTML = c.map(function (x) {
      return '<div class="bx-cm"><div class="bx-cm__h"><strong>' + esc(x.author) + '</strong><span>' + fmt(x.createdAt) + '</span></div><p>' + esc(x.content) + '</p></div>';
    }).join('');
  }).catch(function () { if (list) list.innerHTML = ''; });

  var f = document.getElementById('cmForm');
  if (!f) return;
  var msg = document.getElementById('cmMsg');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var b = f.querySelector('button[type=submit]');
    b.disabled = true; b.textContent = 'Envoi…';
    fetch('/api/blog/' + encodeURIComponent(slug) + '/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: f.author.value, email: f.email.value, content: f.content.value, cm_check_hp: (f.cm_check_hp ? f.cm_check_hp.value : '') })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d.success) { msg.style.color = '#4ade80'; msg.textContent = d.message; f.reset(); }
      else { msg.style.color = '#f87171'; msg.textContent = d.error || 'Une erreur est survenue.'; }
      b.disabled = false; b.textContent = 'Publier mon commentaire';
    }).catch(function () { msg.style.color = '#f87171'; msg.textContent = 'Erreur réseau.'; b.disabled = false; b.textContent = 'Publier mon commentaire'; });
  });
})();
