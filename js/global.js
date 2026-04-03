/* ========================================================================
   PIRABEL LABS — Global JavaScript
   Preloader, Custom Cursor, Scroll Progress, Nav, Reveal Animations
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
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

  // --- NEWSLETTER SUBSCRIPTION ---
  const nlBtn = document.getElementById('nl-btn');
  if (nlBtn) {
    nlBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('nl-email');
      const email = emailInput?.value?.trim();
      if (!email) return;
      nlBtn.disabled = true;
      nlBtn.textContent = '...';
      try {
        const API = window.PIRABEL_API || 'http://localhost:3000';
        await fetch(API + '/api/campaigns/subscribers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'newsletter', source: 'site_footer' })
        });
        const success = document.getElementById('nl-success');
        if (success) success.style.display = 'block';
        emailInput.value = '';
      } catch (e) { console.error('Newsletter error:', e); }
      nlBtn.disabled = false;
      nlBtn.textContent = "S'inscrire";
    });
  }

  // --- CONTACT FORM SUBMISSION ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const successEl = document.getElementById('form-success');
      const errorEl = document.getElementById('form-error');
      if (successEl) successEl.style.display = 'none';
      if (errorEl) errorEl.style.display = 'none';
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

      try {
        const API_URL = window.PIRABEL_API || 'http://localhost:3000';
        const res = await fetch(API_URL + '/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          if (successEl) successEl.style.display = 'block';
          contactForm.reset();
        } else {
          if (errorEl) { errorEl.textContent = result.error || 'Erreur lors de l\'envoi'; errorEl.style.display = 'block'; }
        }
      } catch (err) {
        if (errorEl) { errorEl.textContent = 'Erreur de connexion. Veuillez r\u00e9essayer.'; errorEl.style.display = 'block'; }
      }
      btn.disabled = false;
      btn.innerHTML = 'Envoyer ma demande <span class="material-symbols-outlined">arrow_forward</span>';
    });
  }

  // --- CHAT WIDGET ---
  (function initChat() {
    // Only inject if not already present
    if (document.getElementById('pirabel-chat')) return;

    const chatHTML = `
    <div id="pirabel-chat">
      <button id="chat-toggle" aria-label="Chat">
        <span class="material-symbols-outlined" id="chat-icon">chat</span>
        <span id="chat-badge" style="display:none;">1</span>
      </button>
      <div id="chat-window" style="display:none;">
        <div id="chat-header">
          <div><strong>Pirabel Labs</strong><br><span style="font-size:0.6875rem;opacity:0.7;">En ligne &mdash; r\u00e9ponse rapide</span></div>
          <button id="chat-close" aria-label="Fermer"><span class="material-symbols-outlined">close</span></button>
        </div>
        <div id="chat-messages">
          <div class="chat-msg admin"><p>Bonjour ! Comment pouvons-nous vous aider ?</p></div>
        </div>
        <div id="chat-intro" style="display:block;">
          <input type="text" id="chat-name" placeholder="Votre nom" required>
          <input type="email" id="chat-email" placeholder="Votre email" required>
          <button id="chat-start">D\u00e9marrer le chat <span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">arrow_forward</span></button>
        </div>
        <div id="chat-input-area" style="display:none;">
          <input type="text" id="chat-input" placeholder="Tapez votre message...">
          <button id="chat-send"><span class="material-symbols-outlined">send</span></button>
        </div>
      </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    let conversationId = localStorage.getItem('pirabel_chat_id') || null;
    let chatName = localStorage.getItem('pirabel_chat_name') || '';
    let chatEmail = localStorage.getItem('pirabel_chat_email') || '';
    const API = window.PIRABEL_API || 'http://localhost:3000';

    const toggle = document.getElementById('chat-toggle');
    const win = document.getElementById('chat-window');
    const closeBtn = document.getElementById('chat-close');
    const msgs = document.getElementById('chat-messages');
    const intro = document.getElementById('chat-intro');
    const inputArea = document.getElementById('chat-input-area');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const startBtn = document.getElementById('chat-start');

    toggle.addEventListener('click', () => {
      const open = win.style.display !== 'none';
      win.style.display = open ? 'none' : 'flex';
      document.getElementById('chat-icon').textContent = open ? 'chat' : 'chat';
      if (!open && chatName) { intro.style.display = 'none'; inputArea.style.display = 'flex'; input.focus(); }
    });
    closeBtn.addEventListener('click', () => { win.style.display = 'none'; });

    startBtn.addEventListener('click', () => {
      const n = document.getElementById('chat-name').value.trim();
      const e = document.getElementById('chat-email').value.trim();
      if (!n || !e) return;
      chatName = n; chatEmail = e;
      conversationId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      localStorage.setItem('pirabel_chat_id', conversationId);
      localStorage.setItem('pirabel_chat_name', chatName);
      localStorage.setItem('pirabel_chat_email', chatEmail);
      intro.style.display = 'none';
      inputArea.style.display = 'flex';
      input.focus();
    });

    function addMsg(content, sender) {
      const div = document.createElement('div');
      div.className = 'chat-msg ' + sender;
      div.innerHTML = '<p>' + content + '</p>';
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text || !conversationId) return;
      input.value = '';
      addMsg(text, 'visitor');

      try {
        await fetch(API + '/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, visitorName: chatName, visitorEmail: chatEmail, content: text, sender: 'visitor' })
        });
      } catch (e) { console.error('Chat send error:', e); }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Poll for admin replies (simple fallback without socket.io on client)
    if (conversationId) {
      intro.style.display = 'none';
      inputArea.style.display = 'flex';
      setInterval(async () => {
        if (!conversationId || win.style.display === 'none') return;
        try {
          const res = await fetch(API + '/api/chat/message?conversationId=' + conversationId + '&after=' + Date.now());
          // Simple polling - in production use socket.io client
        } catch (e) {}
      }, 10000);
    }
  })();
});
