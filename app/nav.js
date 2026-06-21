// En-tête de site partagé (mega menu) — utilisé par les pages rendues côté serveur
// (blog, réalisations, témoignages) pour un menu identique au reste du site.
// Le CSS (.nav-mega*) vit dans /css/global.css, déjà chargé par le gabarit blog.
const html = `<nav class="nav-mega" id="nav">
  <div class="nav-mega__inner">
    <a href="/" class="nav-mega__logo" aria-label="Pirabel Labs - accueil">
      <img src="/img/logo.png?v=elan2" alt="Pirabel Labs" width="36" height="36" fetchpriority="high">
      <span>Pirabel Labs</span>
    </a>
    <div class="nav-mega__menu" id="navMenu">
      <div class="nav-mega__item">
        <button class="nav-mega__trigger" type="button">Expertises <span class="material-symbols-outlined">expand_more</span></button>
        <div class="nav-mega__panel nav-mega__panel--2col">
          <div class="nav-mega__panel-inner">
            <div>
              <div class="nav-mega__col-title">Web &amp; visibilité</div>
              <a href="/creation-site-web" class="nav-mega__link"><span class="material-symbols-outlined">code</span><div><div class="nav-mega__link-title">Création de site web</div><div class="nav-mega__link-desc">Sites, e-commerce, applications</div></div></a>
              <a href="/seo" class="nav-mega__link"><span class="material-symbols-outlined">search_insights</span><div><div class="nav-mega__link-title">SEO &amp; référencement</div><div class="nav-mega__link-desc">Trafic organique qualifié</div></div></a>
              <a href="/community-management" class="nav-mega__link"><span class="material-symbols-outlined">forum</span><div><div class="nav-mega__link-title">Community management</div><div class="nav-mega__link-desc">Instagram, TikTok, LinkedIn</div></div></a>
              <a href="/tunnels-de-vente" class="nav-mega__link"><span class="material-symbols-outlined">conversion_path</span><div><div class="nav-mega__link-title">Tunnels de vente</div><div class="nav-mega__link-desc">Landing pages CRO</div></div></a>
            </div>
            <div>
              <div class="nav-mega__col-title">IA, SaaS &amp; automatisation</div>
              <a href="/agence-ia" class="nav-mega__link"><span class="material-symbols-outlined">smart_toy</span><div><div class="nav-mega__link-title">Agence IA</div><div class="nav-mega__link-desc">Chatbots, agents IA, ChatGPT</div></div></a>
              <a href="/creation-saas" class="nav-mega__link"><span class="material-symbols-outlined">rocket_launch</span><div><div class="nav-mega__link-title">Création de SaaS</div><div class="nav-mega__link-desc">MVP Next.js en 8-12 semaines</div></div></a>
              <a href="/solutions-ia" class="nav-mega__link"><span class="material-symbols-outlined">psychology</span><div><div class="nav-mega__link-title">Solutions IA sur mesure</div><div class="nav-mega__link-desc">RAG, fine-tuning, agents</div></div></a>
              <a href="/automatisation-marketing" class="nav-mega__link"><span class="material-symbols-outlined">linked_services</span><div><div class="nav-mega__link-title">Automatisation</div><div class="nav-mega__link-desc">Make, n8n, agents IA</div></div></a>
            </div>
            <div class="nav-mega__panel-footer">
              <a href="/services" class="nav-mega__see-all">Voir tous nos services <span class="material-symbols-outlined">arrow_forward</span></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-mega__item">
        <button class="nav-mega__trigger" type="button">Agences <span class="material-symbols-outlined">expand_more</span></button>
        <div class="nav-mega__panel nav-mega__panel--3col">
          <div class="nav-mega__panel-inner">
            <div>
              <div class="nav-mega__col-title">Sites &amp; e-commerce</div>
              <a href="/agence-webflow" class="nav-mega__link"><span class="material-symbols-outlined">web</span><div><div class="nav-mega__link-title">Agence Webflow</div></div></a>
              <a href="/agence-elementor" class="nav-mega__link"><span class="material-symbols-outlined">dashboard_customize</span><div><div class="nav-mega__link-title">Agence Elementor</div></div></a>
              <a href="/agence-woocommerce" class="nav-mega__link"><span class="material-symbols-outlined">shopping_cart</span><div><div class="nav-mega__link-title">Agence WooCommerce</div></div></a>
              <a href="/agence-prestashop" class="nav-mega__link"><span class="material-symbols-outlined">storefront</span><div><div class="nav-mega__link-title">Agence PrestaShop</div></div></a>
              <a href="/agence-ecommerce" class="nav-mega__link"><span class="material-symbols-outlined">point_of_sale</span><div><div class="nav-mega__link-title">Agence e-commerce</div></div></a>
              <a href="/agence-site-vitrine" class="nav-mega__link"><span class="material-symbols-outlined">window</span><div><div class="nav-mega__link-title">Agence site vitrine</div></div></a>
            </div>
            <div>
              <div class="nav-mega__col-title">Automatisation &amp; IA</div>
              <a href="/agence-ia" class="nav-mega__link"><span class="material-symbols-outlined">smart_toy</span><div><div class="nav-mega__link-title">Agence IA</div></div></a>
              <a href="/agence-make" class="nav-mega__link"><span class="material-symbols-outlined">linked_services</span><div><div class="nav-mega__link-title">Agence Make</div></div></a>
              <a href="/agence-n8n" class="nav-mega__link"><span class="material-symbols-outlined">account_tree</span><div><div class="nav-mega__link-title">Agence n8n</div></div></a>
              <a href="/agents-ia-chatbots" class="nav-mega__link"><span class="material-symbols-outlined">forum</span><div><div class="nav-mega__link-title">Agents IA &amp; chatbots</div></div></a>
              <a href="/agence-systeme-io" class="nav-mega__link"><span class="material-symbols-outlined">conversion_path</span><div><div class="nav-mega__link-title">Agence Système.io</div></div></a>
            </div>
            <div>
              <div class="nav-mega__col-title">Email, social, vidéo</div>
              <a href="/agence-hubspot" class="nav-mega__link"><span class="material-symbols-outlined">hub</span><div><div class="nav-mega__link-title">Agence HubSpot</div></div></a>
              <a href="/agence-brevo" class="nav-mega__link"><span class="material-symbols-outlined">mail</span><div><div class="nav-mega__link-title">Agence Brevo</div></div></a>
              <a href="/community-instagram" class="nav-mega__link"><span class="material-symbols-outlined">photo_camera</span><div><div class="nav-mega__link-title">Agence Instagram</div></div></a>
              <a href="/community-tiktok" class="nav-mega__link"><span class="material-symbols-outlined">music_video</span><div><div class="nav-mega__link-title">Agence TikTok</div></div></a>
              <a href="/community-linkedin" class="nav-mega__link"><span class="material-symbols-outlined">work</span><div><div class="nav-mega__link-title">Agence LinkedIn</div></div></a>
              <a href="/agence-netlinking" class="nav-mega__link"><span class="material-symbols-outlined">link</span><div><div class="nav-mega__link-title">Agence netlinking</div></div></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-mega__item">
        <button class="nav-mega__trigger" type="button">Villes <span class="material-symbols-outlined">expand_more</span></button>
        <div class="nav-mega__panel nav-mega__panel--3col">
          <div class="nav-mega__panel-inner">
            <div>
              <div class="nav-mega__col-title">Afrique de l'Ouest</div>
              <a href="/agence-marketing-cotonou" class="nav-mega__link"><div><div class="nav-mega__link-title">Cotonou</div></div></a>
              <a href="/agence-marketing-abomey-calavi" class="nav-mega__link"><div><div class="nav-mega__link-title">Abomey-Calavi</div></div></a>
              <a href="/agence-marketing-porto-novo" class="nav-mega__link"><div><div class="nav-mega__link-title">Porto-Novo</div></div></a>
              <a href="/agence-web-abidjan" class="nav-mega__link"><div><div class="nav-mega__link-title">Abidjan</div></div></a>
              <a href="/agence-web-dakar" class="nav-mega__link"><div><div class="nav-mega__link-title">Dakar</div></div></a>
              <a href="/agence-web-lome" class="nav-mega__link"><div><div class="nav-mega__link-title">Lomé</div></div></a>
              <a href="/agence-web-bamako" class="nav-mega__link"><div><div class="nav-mega__link-title">Bamako</div></div></a>
              <a href="/agence-web-ouagadougou" class="nav-mega__link"><div><div class="nav-mega__link-title">Ouagadougou</div></div></a>
              <a href="/agence-web-conakry" class="nav-mega__link"><div><div class="nav-mega__link-title">Conakry</div></div></a>
            </div>
            <div>
              <div class="nav-mega__col-title">Afrique Centrale &amp; Maghreb</div>
              <a href="/agence-web-yaounde" class="nav-mega__link"><div><div class="nav-mega__link-title">Yaoundé</div></div></a>
              <a href="/agence-web-douala" class="nav-mega__link"><div><div class="nav-mega__link-title">Douala</div></div></a>
              <a href="/agence-web-casablanca" class="nav-mega__link"><div><div class="nav-mega__link-title">Casablanca</div></div></a>
              <a href="/agence-web-tunis" class="nav-mega__link"><div><div class="nav-mega__link-title">Tunis</div></div></a>
            </div>
            <div>
              <div class="nav-mega__col-title">Europe &amp; Amérique Nord</div>
              <a href="/agence-web-paris" class="nav-mega__link"><div><div class="nav-mega__link-title">Paris</div></div></a>
              <a href="/agence-web-lyon" class="nav-mega__link"><div><div class="nav-mega__link-title">Lyon</div></div></a>
              <a href="/agence-web-marseille" class="nav-mega__link"><div><div class="nav-mega__link-title">Marseille</div></div></a>
              <a href="/agence-web-bruxelles" class="nav-mega__link"><div><div class="nav-mega__link-title">Bruxelles</div></div></a>
              <a href="/agence-web-geneve" class="nav-mega__link"><div><div class="nav-mega__link-title">Genève</div></div></a>
              <a href="/agence-web-montreal" class="nav-mega__link"><div><div class="nav-mega__link-title">Montréal</div></div></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-mega__item">
        <button class="nav-mega__trigger" type="button">Ressources <span class="material-symbols-outlined">expand_more</span></button>
        <div class="nav-mega__panel nav-mega__panel--small">
          <div class="nav-mega__panel-inner">
            <div>
              <a href="/blog" class="nav-mega__link"><span class="material-symbols-outlined">article</span><div><div class="nav-mega__link-title">Blog</div><div class="nav-mega__link-desc">Articles experts</div></div></a>
              <a href="/realisations" class="nav-mega__link"><span class="material-symbols-outlined">collections</span><div><div class="nav-mega__link-title">Réalisations</div><div class="nav-mega__link-desc">Nos cas clients</div></div></a>
              <a href="/methodologie" class="nav-mega__link"><span class="material-symbols-outlined">timeline</span><div><div class="nav-mega__link-title">Méthodologie</div><div class="nav-mega__link-desc">Notre process en 7 étapes</div></div></a>
              <a href="/livres-blancs" class="nav-mega__link"><span class="material-symbols-outlined">menu_book</span><div><div class="nav-mega__link-title">Livres blancs</div><div class="nav-mega__link-desc">Guides gratuits</div></div></a>
              <a href="/tarifs" class="nav-mega__link"><span class="material-symbols-outlined">payments</span><div><div class="nav-mega__link-title">Tarifs</div><div class="nav-mega__link-desc">Grille complète</div></div></a>
              <a href="/faq" class="nav-mega__link"><span class="material-symbols-outlined">help</span><div><div class="nav-mega__link-title">FAQ</div><div class="nav-mega__link-desc">Vos questions</div></div></a>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-mega__item">
        <button class="nav-mega__trigger" type="button">À propos <span class="material-symbols-outlined">expand_more</span></button>
        <div class="nav-mega__panel nav-mega__panel--small">
          <div class="nav-mega__panel-inner">
            <div>
              <a href="/a-propos" class="nav-mega__link"><span class="material-symbols-outlined">group</span><div><div class="nav-mega__link-title">L'équipe &amp; l'agence</div></div></a>
              <a href="/contact" class="nav-mega__link"><span class="material-symbols-outlined">mail</span><div><div class="nav-mega__link-title">Contact</div></div></a>
              <a href="/mentions-legales" class="nav-mega__link"><span class="material-symbols-outlined">gavel</span><div><div class="nav-mega__link-title">Mentions légales</div></div></a>
              <a href="/politique-confidentialite" class="nav-mega__link"><span class="material-symbols-outlined">shield</span><div><div class="nav-mega__link-title">Confidentialité</div></div></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="lang-switch notranslate" translate="no" role="group" aria-label="Langue" style="display:inline-flex;gap:2px;align-items:center;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:2px;margin-right:10px;vertical-align:middle;"><button type="button" data-l="fr" onclick="pirabelSetLang('fr')">FR</button><button type="button" data-l="en" onclick="pirabelSetLang('en')">EN</button></div>
    <a href="/contact" class="nav-mega__cta">Contactez-nous</a>
    <button class="nav-mega__burger" id="navBurger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</nav>`;

const js = `<script>(function(){var burger=document.getElementById('navBurger');var menu=document.getElementById('navMenu');if(burger&&menu){burger.addEventListener('click',function(){var open=menu.classList.toggle('is-open');burger.classList.toggle('is-open',open);burger.setAttribute('aria-expanded',open);document.body.style.overflow=open?'hidden':'';});menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('is-open');burger.classList.remove('is-open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';});});menu.querySelectorAll('.nav-mega__trigger').forEach(function(t){t.addEventListener('click',function(e){if(window.innerWidth<980){e.preventDefault();var item=t.closest('.nav-mega__item');if(item)item.classList.toggle('is-active');}});});}})();</script>`;

const langSwitch = `<div id="google_translate_element" style="display:none"></div><style>.lang-switch button{border:0;background:transparent;color:inherit;font-family:inherit;font-weight:600;font-size:12px;line-height:1;padding:5px 10px;border-radius:999px;cursor:pointer;}.lang-switch button[aria-pressed="true"]{background:#FF5500;color:#fff;}.goog-te-banner-frame,.skiptranslate{display:none!important;}body{top:0!important;position:static!important;}#goog-gt-tt,.goog-te-balloon-frame{display:none!important;}font font{background:none!important;box-shadow:none!important;}</style><script>function pirabelSetLang(l){var h=location.hostname;if(l==="fr"){document.cookie="googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";document.cookie="googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=."+h;}else{document.cookie="googtrans=/fr/"+l+";path=/";document.cookie="googtrans=/fr/"+l+";path=/;domain=."+h;}location.reload();}function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:"fr",includedLanguages:"en,fr",autoDisplay:false},"google_translate_element");}(function(){var en=document.cookie.indexOf("/fr/en")>-1;document.querySelectorAll(".lang-switch button").forEach(function(b){b.setAttribute("aria-pressed",((b.getAttribute("data-l")==="en")===en)?"true":"false");});document.querySelectorAll(".material-symbols-outlined,.material-icons").forEach(function(e){e.setAttribute("translate","no");e.classList.add("notranslate");});})();</script><script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>`;
module.exports = { html, js: js + langSwitch };
