/* ========================================================================
   PIRABEL LABS — Global JavaScript
   Preloader, Custom Cursor, Scroll Progress, Nav, Reveal Animations, i18n
   ======================================================================== */

// --- I18N MANAGER (Global, V3: trailing-slash safe + section prefix fallback) ---
(function() {
    const LANG_KEY = 'pirabel_pref_lang';
    const SUPPORTED_LANGS = ['fr', 'en'];
    const DEFAULT_LANG = 'fr';

    // FR (no trailing slash) -> EN canonical URL
    const URL_MAP = {
        '/agence-seo-referencement-naturel': '/en/seo-agency/',
        '/agence-creation-sites-web':         '/en/web-design-agency/',
        '/agence-ia-automatisation':          '/en/ai-automation-agency/',
        '/agence-design-branding':            '/en/branding-agency/',
        '/agence-publicite-payante-sea-ads':  '/en/paid-advertising-agency/',
        '/agence-social-media':               '/en/social-media-agency/',
        '/agence-email-marketing-crm':        '/en/email-marketing-agency/',
        '/agence-video-motion-design':        '/en/video-production-agency/',
        '/agence-sales-funnels-cro':          '/en/conversion-funnels-agency/',
        '/agence-redaction-content-marketing':'/en/content-marketing-agency/',
        '/services':         '/en/services',
        '/contact':          '/en/contact',
        '/a-propos':         '/en/about',
        '/resultats':        '/en/results',
        '/avis':             '/en/reviews',
        '/carrieres':        '/en/careers',
        '/mentions-legales': '/en/legal-mentions',
        '/politique-confidentialite': '/en/legal-mentions',
        '/blog':             '/en/blog',
        '/guides':           '/en/guides',
        '/rendez-vous':      '/en/book-a-call',
        '/':                 '/en/'
    };

    const SECTION_PREFIXES_FR_TO_EN = {
        '/agence-seo-referencement-naturel/': '/en/seo-agency/',
        '/agence-creation-sites-web/':         '/en/web-design-agency/',
        '/agence-ia-automatisation/':          '/en/ai-automation-agency/',
        '/agence-design-branding/':            '/en/branding-agency/',
        '/agence-publicite-payante-sea-ads/':  '/en/paid-advertising-agency/',
        '/agence-social-media/':               '/en/social-media-agency/',
        '/agence-email-marketing-crm/':        '/en/email-marketing-agency/',
        '/agence-video-motion-design/':        '/en/video-production-agency/',
        '/agence-sales-funnels-cro/':          '/en/conversion-funnels-agency/',
        '/agence-redaction-content-marketing/':'/en/content-marketing-agency/',
        '/blog/':   '/en/blog',
        '/guides/': '/en/guides'
    };

    function normalizePath(p) {
        return (p.length > 1 && p.endsWith('/')) ? p.slice(0, -1) : p;
    }

    const REVERSE_MAP = {};
    const SECTION_PREFIXES_EN_TO_FR = {};
    for (const fr in URL_MAP) {
        REVERSE_MAP[normalizePath(URL_MAP[fr])] = fr;
    }
    for (const frP in SECTION_PREFIXES_FR_TO_EN) {
        const enP = SECTION_PREFIXES_FR_TO_EN[frP];
        SECTION_PREFIXES_EN_TO_FR[enP.endsWith('/') ? enP : enP + '/'] = frP;
    }

    function setLangPreference(lang) {
        try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
        const expires = new Date(Date.now() + 30 * 86400 * 1000).toUTCString();
        document.cookie = LANG_KEY + '=' + lang + '; path=/; expires=' + expires + '; SameSite=Lax';
    }

    // Backfill cookie from localStorage (for users who chose lang before edge middleware)
    try {
        const stored = localStorage.getItem(LANG_KEY);
        if (stored && document.cookie.indexOf(LANG_KEY + '=') === -1) {
            setLangPreference(stored);
        }
    } catch (e) {}

    window.switchLanguage = function(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) return;
        setLangPreference(lang);

        const rawPath = window.location.pathname;
        const path = normalizePath(rawPath);
        let newPath = null;

        if (lang === 'en') {
            if (path === '/en' || path.startsWith('/en/')) return;
            if (URL_MAP[path]) {
                newPath = URL_MAP[path];
            } else {
                for (const frPrefix in SECTION_PREFIXES_FR_TO_EN) {
                    if (rawPath.startsWith(frPrefix) || (rawPath + '/').startsWith(frPrefix)) {
                        newPath = SECTION_PREFIXES_FR_TO_EN[frPrefix];
                        break;
                    }
                }
                if (!newPath) newPath = '/en/';
            }
        } else {
            if (!path.startsWith('/en/') && path !== '/en') return;
            if (REVERSE_MAP[path]) {
                newPath = REVERSE_MAP[path];
            } else {
                for (const enPrefix in SECTION_PREFIXES_EN_TO_FR) {
                    if (rawPath.startsWith(enPrefix)) {
                        newPath = SECTION_PREFIXES_EN_TO_FR[enPrefix];
                        break;
                    }
                }
                if (!newPath) newPath = '/';
            }
        }

        window.location.href = newPath;
    };
})();


document.addEventListener('DOMContentLoaded', () => {

  // --- ANTI-SPAM: HONEYPOT + TIME CHECK + RATE LIMIT ---
  (function() {
    var formLoadTime = Date.now();

    // Inject honeypot field into all public forms
    document.querySelectorAll('form').forEach(function(form) {
      if (form.querySelector('[name="website_url"]')) return; // Already has honeypot
      var hp = document.createElement('div');
      hp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;height:0;width:0;overflow:hidden;';
      hp.setAttribute('aria-hidden', 'true');
      hp.innerHTML = '<label>Ne pas remplir<input type="text" name="website_url" tabindex="-1" autocomplete="off" value=""></label>';
      form.appendChild(hp);
      form.dataset.loadTime = formLoadTime;
    });

    // Client-side rate limiting helper
    window._plCanSubmit = function(formType) {
      var key = 'pl_rl_' + (formType || 'form');
      var now = Date.now();
      try {
        var data = JSON.parse(localStorage.getItem(key) || '[]');
        // Keep only entries from last 15 minutes
        data = data.filter(function(ts) { return now - ts < 15 * 60 * 1000; });
        if (data.length >= 5) return false;
        data.push(now);
        localStorage.setItem(key, JSON.stringify(data));
        return true;
      } catch(e) { return true; }
    };

    // Time-based check: reject if form submitted in < 2 seconds
    window._plTimeCheck = function(form) {
      var loadTime = parseInt(form.dataset.loadTime || formLoadTime);
      return (Date.now() - loadTime) > 2000;
    };

    // Honeypot check
    window._plHoneypotOk = function(form) {
      var hp = form.querySelector('[name="website_url"]');
      return !hp || !hp.value;
    };
  })();

  // --- PRELOADER ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const barFill = preloader.querySelector('.pre-bar-fill');
    const pctEl = preloader.querySelector('.pre-pct');
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        setTimeout(() => preloader.classList.add('done'), 300);
      }
      if (barFill) barFill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = Math.floor(pct) + '%';
    }, 120);
  }

  // --- CUSTOM CURSOR ---
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (dot && ring && window.matchMedia('(hover: hover)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
    });

    function animateRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state on interactive elements
    const hoverEls = document.querySelectorAll('a, button, [data-cursor], input, textarea, select, .card, .srv-row, .guide-card, details summary');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // --- SCROLL PROGRESS BAR ---
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // --- NAVBAR SCROLL ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

  // --- MOBILE HAMBURGER ---
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- SCROLL REVEAL (IntersectionObserver) ---
  const revealEls = document.querySelectorAll('.rv');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => observer.observe(el));
  }

  // --- ANIMATED COUNTERS ---
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = el.getAttribute('data-count');
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const numTarget = parseFloat(target);
          const isDecimal = target.includes('.');
          const duration = 1800;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out-quart
            const current = isDecimal
              ? (numTarget * eased).toFixed(1)
              : Math.floor(numTarget * eased);
            el.textContent = prefix + current + suffix;
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
          countObserver.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    counters.forEach(el => countObserver.observe(el));
  }

  // --- MARQUEE DUPLICATE (for seamless loop) ---
  const marquees = document.querySelectorAll('.marquee-track');
  marquees.forEach(track => {
    if (track.children.length > 0) {
      const clone = track.innerHTML;
      track.innerHTML += clone;
    }
  });

  // --- FAQ ACCORDION (for non-details fallback) ---
  document.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // --- API URL HELPER ---
  function getApiBase() {
    // Use same-origin (empty string) when PIRABEL_API is defined (even as '')
    // Only fall back to localhost for development when PIRABEL_API is not defined at all
    if (typeof window.PIRABEL_API === 'string') return window.PIRABEL_API;
    return '';
  }

  // --- NEWSLETTER SUBSCRIPTION ---
  const nlBtn = document.getElementById('nl-btn');
  if (nlBtn) {
    nlBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('nl-email');
      const email = emailInput?.value?.trim();
      if (!email || !email.includes('@')) return;
      // Anti-spam checks
      if (!window._plCanSubmit('newsletter')) { nlBtn.textContent = 'Patientez...'; setTimeout(() => { nlBtn.textContent = "S'inscrire"; }, 2000); return; }
      const nlForm = nlBtn.closest('form') || nlBtn.parentElement;
      if (nlForm && !window._plHoneypotOk(nlForm)) return;
      nlBtn.disabled = true;
      nlBtn.textContent = 'Envoi...';
      try {
        const res = await fetch(getApiBase() + '/api/campaigns/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'newsletter', source: 'site_footer' })
        });
        if (res.ok) {
          const success = document.getElementById('nl-success');
          if (success) success.style.display = 'block';
          emailInput.value = '';
          nlBtn.textContent = "Inscrit !";
          setTimeout(() => { nlBtn.textContent = "S'inscrire"; }, 3000);
        } else {
          throw new Error('Server error');
        }
      } catch (e) {
        // Fallback: save locally and show success anyway for good UX
        try {
          const stored = JSON.parse(localStorage.getItem('pl_pending_subs') || '[]');
          stored.push({ email, ts: Date.now() });
          localStorage.setItem('pl_pending_subs', JSON.stringify(stored));
        } catch(x) {}
        const success = document.getElementById('nl-success');
        if (success) success.style.display = 'block';
        emailInput.value = '';
        nlBtn.textContent = "Inscrit !";
        setTimeout(() => { nlBtn.textContent = "S'inscrire"; }, 3000);
      }
      nlBtn.disabled = false;
    });
  }

  // --- CONTACT FORM SUBMISSION ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const btnOriginal = btn.innerHTML;
      const successEl = document.getElementById('form-success');
      const errorEl = document.getElementById('form-error');
      if (successEl) successEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';

      // Anti-spam checks
      if (!window._plHoneypotOk(contactForm)) return;
      if (!window._plTimeCheck(contactForm)) { if (errorEl) { errorEl.textContent = 'Veuillez patienter avant de soumettre.'; errorEl.style.display = 'block'; } return; }
      if (!window._plCanSubmit('contact')) { if (errorEl) { errorEl.textContent = 'Trop de soumissions. Reessayez dans quelques minutes.'; errorEl.style.display = 'block'; } return; }

      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';

      const data = {
        name: contactForm.querySelector('[name="name"]')?.value,
        email: contactForm.querySelector('[name="email"]')?.value,
        phone: contactForm.querySelector('[name="phone"]')?.value || '',
        website: contactForm.querySelector('[name="website"]')?.value || '',
        service: contactForm.querySelector('[name="service"]')?.value,
        budget: contactForm.querySelector('[name="budget"]')?.value || '',
        message: contactForm.querySelector('[name="message"]')?.value || ''
      };

      let sent = false;
      try {
        const res = await fetch(getApiBase() + '/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          sent = true;
        } else {
          throw new Error(result.error || 'Erreur serveur');
        }
      } catch (err) {
        // Fallback: try mailto
        try {
          const subject = encodeURIComponent('Nouvelle demande - ' + (data.service || 'Contact'));
          const body = encodeURIComponent(
            'Nom: ' + data.name + '\nEmail: ' + data.email + '\nTel: ' + data.phone +
            '\nSite: ' + data.website + '\nService: ' + data.service +
            '\nBudget: ' + data.budget + '\nMessage: ' + data.message
          );
          window.open('mailto:contact@pirabellabs.com?subject=' + subject + '&body=' + body, '_self');
          sent = true;
        } catch(x) {}
      }

      if (sent) {
        if (successEl) successEl.style.display = 'block';
        contactForm.reset();
      } else {
        if (errorEl) { errorEl.textContent = 'Erreur de connexion. Envoyez-nous un email a contact@pirabellabs.com'; errorEl.style.display = 'block'; }
      }
      btn.disabled = false;
      btn.innerHTML = btnOriginal;
    });
  }

  // --- UNIVERSAL CTA FORM HANDLER (service pages) ---
  document.querySelectorAll('.section--cta form:not(#contact-form):not(#newsletter-form)').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const btnOriginal = btn.innerHTML;

      // Anti-spam checks
      if (!window._plHoneypotOk(form)) return;
      if (!window._plTimeCheck(form)) { btn.textContent = 'Patientez...'; setTimeout(() => { btn.innerHTML = btnOriginal; }, 2000); return; }
      if (!window._plCanSubmit('cta')) { btn.textContent = 'Trop de soumissions'; setTimeout(() => { btn.innerHTML = btnOriginal; }, 3000); return; }

      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';

      const name = (form.querySelector('input[type="text"]') || {}).value || '';
      const email = (form.querySelector('input[type="email"]') || {}).value || '';
      const phone = (form.querySelector('input[type="tel"]') || {}).value || '';
      const message = (form.querySelector('textarea') || {}).value || '';
      const page = document.title || window.location.pathname;

      if (!name || !email) {
        btn.disabled = false;
        btn.innerHTML = btnOriginal;
        return;
      }

      let sent = false;
      try {
        const res = await fetch(getApiBase() + '/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message, service: page, source: 'cta_form' })
        });
        if (res.ok) sent = true;
      } catch(err) {}

      if (!sent) {
        // Fallback to mailto
        try {
          const subject = encodeURIComponent('Demande depuis ' + page);
          const body = encodeURIComponent('Nom: ' + name + '\nEmail: ' + email + '\nTel: ' + phone + '\nMessage: ' + message);
          window.open('mailto:contact@pirabellabs.com?subject=' + subject + '&body=' + body, '_self');
          sent = true;
        } catch(x) {}
      }

      if (sent) {
        // Show success inline
        btn.innerHTML = '<span style="color:#25D366;">&#10003; Demande envoyee ! Reponse sous 24h.</span>';
        form.reset();
        setTimeout(() => { btn.innerHTML = btnOriginal; btn.disabled = false; }, 5000);
      } else {
        btn.innerHTML = 'Erreur - Contactez contact@pirabellabs.com';
        setTimeout(() => { btn.innerHTML = btnOriginal; btn.disabled = false; }, 4000);
      }
    });
  });

  // --- SMART CHATBOT LOADER ---
  // Load chatbot.js if not already loaded (it provides the intelligent chat widget)
  (function() {
    if (document.getElementById('pb-chat-btn')) return; // Already loaded
    var s = document.createElement('script');
    s.src = '/js/chatbot.js';
    s.defer = true;
    document.head.appendChild(s);
  })();
});

// --- WHATSAPP FLOATING BUTTON (independent of DOMContentLoaded) ---
(function() {
  function createWhatsApp() {
    if (document.getElementById('wa-float-btn')) return;
    if (window.innerWidth <= 768) return; // Hide on mobile
    var wa = document.createElement('a');
    wa.id = 'wa-float-btn';
    wa.href = 'https://wa.me/16139273067';
    wa.target = '_blank';
    wa.rel = 'noopener noreferrer';
    wa.setAttribute('aria-label', 'Nous contacter sur WhatsApp');
    wa.style.cssText = 'position:fixed;bottom:6rem;right:1.5rem;z-index:9997;width:56px;height:56px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);transition:transform .2s,box-shadow .2s;cursor:pointer;';
    wa.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    wa.onmouseenter = function(){ this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(37,211,102,0.4)'; };
    wa.onmouseleave = function(){ this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'; };
    document.body.appendChild(wa);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWhatsApp);
  } else {
    createWhatsApp();
  }
})();
