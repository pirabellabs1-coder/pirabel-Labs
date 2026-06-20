# -*- coding: utf-8 -*-
import io
f = "livres-blancs.html"
s = io.open(f, encoding="utf-8").read()

anchor = '<div class="lb-grid" id="lbGrid" aria-live="polite">'
assert anchor in s, "anchor grid introuvable"
s = s.replace(anchor, '<div id="lbFeatured" class="lb-featured"></div>\n      <div id="lbToolbar" class="lb-toolbar"></div>\n      ' + anchor, 1)

old_render = r'''  function renderLivresBlancs(){
    if (!lbGrid) return;
    fetch('/api/livres-blancs').then(function(r){return r.json();}).then(function(d){
      var list = (d && d.livresBlancs) || [];
      if (!list.length){ lbGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 1rem;">Nos livres blancs arrivent tres bientot.</p>'; return; }
      lbGrid.innerHTML = list.map(function(lb){
        var pages = lb.pages ? '<span class="lb-card__pages">'+lbEsc(lb.pages)+' pages</span>' : '';
        var toc = (lb.toc && lb.toc.length) ? '<div class="lb-card__toc"><strong>Au sommaire</strong><ul>'+lb.toc.map(function(t){return '<li>'+lbEsc(t)+'</li>';}).join('')+'</ul></div>' : '';
        return '<button type="button" class="lb-card" data-slug="'+lbEsc(lb.slug)+'" data-title="'+lbEsc(lb.title)+'" style="text-align:left;border:1px solid var(--border);cursor:pointer;font:inherit;">'+
          '<div class="lb-card__cover">'+pages+'<span class="material-symbols-outlined lb-card__icon">'+lbEsc(lb.icon||'menu_book')+'</span></div>'+
          '<div class="lb-card__body">'+
          '<div class="lb-card__cat">'+lbEsc(lb.category||'Guide')+'</div>'+
          '<h3 class="lb-card__title">'+lbEsc(lb.title)+'</h3>'+
          '<p class="lb-card__desc">'+lbEsc(lb.description)+'</p>'+toc+
          '<span class="lb-card__cta">Telecharger gratuitement <span class="material-symbols-outlined">download</span></span>'+
          '</div></button>';
      }).join('');
    }).catch(function(){ lbGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 1rem;">Impossible de charger les livres blancs pour le moment.</p>'; });
  }
  if (lbGrid){
    lbGrid.addEventListener('click', function(e){
      var card = e.target.closest('.lb-card[data-slug]');
      if (!card) return;
      e.preventDefault();
      openModal(card.getAttribute('data-slug'), card.getAttribute('data-title'));
    });
    renderLivresBlancs();
  }'''

new_render = r'''  var lbAll = [], lbFeaturedSlug = '', lbState = { cat:'', q:'' };
  function lbCardHtml(lb){
    var pages = lb.pages ? '<span class="lb-card__pages">'+lbEsc(lb.pages)+' pages</span>' : '';
    var toc = (lb.toc && lb.toc.length) ? '<div class="lb-card__toc"><strong>Au sommaire</strong><ul>'+lb.toc.slice(0,5).map(function(t){return '<li>'+lbEsc(t)+'</li>';}).join('')+'</ul></div>' : '';
    return '<button type="button" class="lb-card" data-slug="'+lbEsc(lb.slug)+'" data-title="'+lbEsc(lb.title)+'" style="text-align:left;border:1px solid var(--border);cursor:pointer;font:inherit;">'+
      '<div class="lb-card__cover">'+pages+'<span class="material-symbols-outlined lb-card__icon">'+lbEsc(lb.icon||'menu_book')+'</span></div>'+
      '<div class="lb-card__body"><div class="lb-card__cat">'+lbEsc(lb.category||'Guide')+'</div>'+
      '<h3 class="lb-card__title">'+lbEsc(lb.title)+'</h3>'+
      '<p class="lb-card__desc">'+lbEsc(lb.description)+'</p>'+toc+
      '<span class="lb-card__cta">Telecharger gratuitement <span class="material-symbols-outlined">download</span></span></div></button>';
  }
  function lbRenderGrid(){
    if (!lbGrid) return;
    var q = (lbState.q||'').toLowerCase(), active = !!(lbState.cat || lbState.q);
    var rows = lbAll.filter(function(lb){
      if (!active && lb.slug === lbFeaturedSlug) return false;
      if (lbState.cat && (lb.category||'') !== lbState.cat) return false;
      if (q && ((lb.title||'')+' '+(lb.description||'')+' '+(lb.category||'')).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    if (!rows.length){ lbGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 1rem;">Aucun livre blanc ne correspond a votre recherche.</p>'; return; }
    lbGrid.innerHTML = rows.map(lbCardHtml).join('');
  }
  function lbBuildToolbar(){
    var tb = document.getElementById('lbToolbar'); if (!tb) return;
    var cats = [], seen = {};
    lbAll.forEach(function(lb){ var c=lb.category||'Guide'; if(!seen[c.toLowerCase()]){seen[c.toLowerCase()]=1;cats.push(c);} });
    cats.sort(function(a,b){return a.localeCompare(b,'fr');});
    var pills = '<a href="#" class="lb-pill'+(lbState.cat?'':' is-active')+'" data-cat="">Tous</a>' + cats.map(function(c){return '<a href="#" class="lb-pill'+(lbState.cat===c?' is-active':'')+'" data-cat="'+lbEsc(c)+'">'+lbEsc(c)+'</a>';}).join('');
    tb.innerHTML = '<div class="lb-filters">'+pills+'</div><div class="lb-search"><span class="material-symbols-outlined">search</span><input type="search" id="lbSearchInput" placeholder="Rechercher un guide..." value="'+lbEsc(lbState.q)+'"></div>';
    tb.querySelectorAll('.lb-pill').forEach(function(p){ p.addEventListener('click',function(e){e.preventDefault();lbState.cat=p.getAttribute('data-cat');lbBuildToolbar();lbRenderGrid();}); });
    var si = document.getElementById('lbSearchInput'); if (si){ si.addEventListener('input',function(){ lbState.q=si.value; lbRenderGrid(); }); }
  }
  function lbRenderFeatured(){
    var ft = document.getElementById('lbFeatured'); if (!ft || !lbAll.length) return;
    var top = lbAll.slice().sort(function(a,b){return (b.downloads||0)-(a.downloads||0);})[0];
    lbFeaturedSlug = top.slug;
    var toc = (top.toc&&top.toc.length)?'<ul class="lb-feat__toc">'+top.toc.slice(0,4).map(function(t){return '<li>'+lbEsc(t)+'</li>';}).join('')+'</ul>':'';
    ft.innerHTML = '<button type="button" class="lb-feat" data-slug="'+lbEsc(top.slug)+'" data-title="'+lbEsc(top.title)+'">'+
      '<div class="lb-feat__cover"><span class="lb-card__pages">'+(top.pages?lbEsc(top.pages)+' pages':'Guide PDF')+'</span><span class="material-symbols-outlined">'+lbEsc(top.icon||'menu_book')+'</span></div>'+
      '<div class="lb-feat__body"><span class="lb-feat__badge"><span class="material-symbols-outlined">local_fire_department</span> Le plus telecharge</span>'+
      '<div class="lb-card__cat">'+lbEsc(top.category||'Guide')+'</div>'+
      '<h2 class="lb-feat__title">'+lbEsc(top.title)+'</h2>'+
      '<p class="lb-feat__desc">'+lbEsc(top.description)+'</p>'+toc+
      '<span class="lb-card__cta" style="align-self:flex-start;">Telecharger gratuitement <span class="material-symbols-outlined">download</span></span></div></button>';
  }
  function renderLivresBlancs(){
    if (!lbGrid) return;
    fetch('/api/livres-blancs').then(function(r){return r.json();}).then(function(d){
      lbAll = (d && d.livresBlancs) || [];
      if (!lbAll.length){ lbGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 1rem;">Nos livres blancs arrivent tres bientot.</p>'; return; }
      lbRenderFeatured(); lbBuildToolbar(); lbRenderGrid();
    }).catch(function(){ lbGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem 1rem;">Impossible de charger les livres blancs pour le moment.</p>'; });
  }
  if (lbGrid){
    document.addEventListener('click', function(e){
      var card = e.target.closest('.lb-card[data-slug], .lb-feat[data-slug]');
      if (!card) return;
      e.preventDefault();
      openModal(card.getAttribute('data-slug'), card.getAttribute('data-title'));
    });
    renderLivresBlancs();
  }'''

assert old_render in s, "old_render introuvable"
s = s.replace(old_render, new_render, 1)

old_ok = (
"        if (r.ok && json.success) {\n"
"          msg.className = 'lb-form__msg is-show is-success';\n"
"          msg.innerHTML = '<strong>Email envoyé !</strong> Votre livre blanc arrive dans votre boîte mail. Pensez à vérifier les indésirables si besoin.';\n"
"          if (submitText) submitText.textContent = 'Email envoyé ✓';\n"
"          setTimeout(closeModal, 4000);\n"
"        } else {"
)
new_ok = (
"        if (r.ok && json.success) {\n"
"          msg.className = 'lb-form__msg is-show is-success';\n"
"          msg.innerHTML = '<strong>C\\'est prêt !</strong> Votre téléchargement démarre, et une copie part par e-mail (vérifiez les indésirables si besoin).';\n"
"          if (submitText) submitText.textContent = 'Téléchargé ✓';\n"
"          if (json.pdfUrl) { var a=document.createElement('a'); a.href=json.pdfUrl; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); }\n"
"          setTimeout(closeModal, 4500);\n"
"        } else {"
)
assert old_ok in s, "old_ok introuvable"
s = s.replace(old_ok, new_ok, 1)

CSS = """
.lb-toolbar { display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between; margin:2rem 0 1.5rem; }
.lb-filters { display:flex; flex-wrap:wrap; gap:.5rem; }
.lb-pill { font-size:.82rem; font-weight:700; color:var(--text-muted); background:var(--bg-2); border:1px solid var(--border); padding:.45rem .95rem; border-radius:999px; text-decoration:none; transition:.15s; font-family:var(--font-display); }
.lb-pill:hover { border-color:var(--accent); color:var(--text); }
.lb-pill.is-active { background:var(--accent); color:#fff; border-color:var(--accent); }
.lb-search { display:flex; align-items:center; gap:.5rem; background:var(--bg-2); border:1px solid var(--border); border-radius:999px; padding:.4rem 1rem; }
.lb-search .material-symbols-outlined { font-size:1.2rem; color:var(--text-muted); }
.lb-search input { background:transparent; border:none; outline:none; color:var(--text); font-family:inherit; font-size:.9rem; min-width:13rem; }
.lb-featured { margin-top:1rem; }
.lb-feat { display:grid; grid-template-columns:minmax(14rem,1fr) 1.4fr; gap:0; width:100%; text-align:left; background:var(--bg-2); border:1px solid var(--border); border-radius:20px; overflow:hidden; cursor:pointer; font:inherit; color:var(--text); transition:all .2s; }
.lb-feat:hover { border-color:var(--accent); box-shadow:0 24px 60px rgba(0,0,0,0.25); }
.lb-feat__cover { position:relative; background:linear-gradient(135deg, rgba(255,107,0,0.16) 0%, var(--bg) 80%); display:flex; align-items:center; justify-content:center; min-height:15rem; border-right:1px solid var(--border); }
.lb-feat__cover .material-symbols-outlined { font-size:5rem; color:var(--accent); filter:drop-shadow(0 6px 16px rgba(255,107,0,0.4)); }
.lb-feat__cover .lb-card__pages { position:absolute; top:1rem; right:1rem; }
.lb-feat__body { padding:2.25rem 2rem; display:flex; flex-direction:column; gap:.6rem; }
.lb-feat__badge { display:inline-flex; align-items:center; gap:.35rem; align-self:flex-start; background:rgba(255,107,0,0.12); border:1px solid rgba(255,107,0,0.35); color:var(--accent); font-family:var(--font-display); font-weight:700; font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; padding:.35rem .8rem; border-radius:999px; }
.lb-feat__badge .material-symbols-outlined { font-size:1rem; }
.lb-feat__title { font-family:'Montserrat',sans-serif; font-weight:800; font-size:clamp(1.4rem,2.4vw,2rem); line-height:1.15; color:var(--text); margin:.2rem 0; }
.lb-feat__desc { color:var(--text-muted); font-size:.98rem; line-height:1.6; }
.lb-feat__toc { margin:.3rem 0 .6rem; padding-left:1.1rem; color:var(--text); font-size:.86rem; }
.lb-feat__toc li { margin-bottom:.2rem; }
@media (max-width:760px){ .lb-feat { grid-template-columns:1fr; } .lb-feat__cover { min-height:9rem; border-right:none; border-bottom:1px solid var(--border); } .lb-toolbar { gap:.8rem; } .lb-search { width:100%; } .lb-search input { min-width:0; flex:1; } }
"""
s = s.replace("</style>", CSS + "</style>", 1)

io.open(f, "w", encoding="utf-8").write(s)
print("OK vedette/filtre/recherche/dl/CSS injectes")
print("lbFeatured", s.count('id="lbFeatured"'), "lbToolbar", s.count('id="lbToolbar"'), "lbfeatCSS", s.count('.lb-feat {'), "instantdl", s.count('a.click()'))
