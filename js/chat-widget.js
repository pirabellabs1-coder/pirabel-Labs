/* ==========================================================================
   PIRABEL LABS — Widget d'assistant IA public
   Remplace le bouton WhatsApp flottant par un lanceur unique qui ouvre le
   chat. WhatsApp reste accessible depuis l'en-tete du panneau (repli humain).
   Aucune dependance externe, aucun cookie, historique garde en memoire de page.
   ========================================================================== */
(function () {
  'use strict';
  if (window.__plChatLoaded) return;
  window.__plChatLoaded = true;

  var WHATSAPP = 'https://wa.me/16139273067';
  var history = [];
  var busy = false;
  var opened = false;

  // ---------- Styles ----------
  var css = document.createElement('style');
  css.textContent = [
    '.plc-launch{position:fixed;right:18px;bottom:18px;z-index:9000;display:flex;align-items:center;gap:.55rem;padding:.7rem 1.05rem .7rem .8rem;border:0;border-radius:999px;background:#FF5500;color:#fff;font-family:inherit;font-weight:700;font-size:.92rem;cursor:pointer;box-shadow:0 8px 26px rgba(255,85,0,.38);transition:transform .18s,box-shadow .18s}',
    '.plc-launch:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,85,0,.5)}',
    '.plc-launch svg{width:22px;height:22px;flex:0 0 auto}',
    '.plc-launch.is-hidden{display:none}',
    '.plc-panel{position:fixed;right:18px;bottom:18px;z-index:9001;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 40px));display:none;flex-direction:column;background:#111010;border:1px solid rgba(255,85,0,.28);border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.6);font-family:inherit}',
    '.plc-panel.is-open{display:flex}',
    '.plc-head{display:flex;align-items:center;gap:.65rem;padding:.85rem 1rem;background:linear-gradient(135deg,rgba(255,85,0,.2),#151414);border-bottom:1px solid rgba(255,255,255,.07)}',
    '.plc-avatar{width:34px;height:34px;border-radius:50%;background:#FF5500;display:flex;align-items:center;justify-content:center;flex:0 0 auto}',
    '.plc-avatar svg{width:19px;height:19px}',
    '.plc-id{flex:1;min-width:0}',
    '.plc-name{font-weight:700;font-size:.92rem;color:#f2efee;line-height:1.2}',
    '.plc-status{font-size:.72rem;color:#4ade80;display:flex;align-items:center;gap:.3rem;margin-top:1px}',
    '.plc-status i{width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}',
    '.plc-hbtn{background:transparent;border:0;color:rgba(242,239,238,.6);cursor:pointer;padding:.3rem;border-radius:7px;display:flex;line-height:0}',
    '.plc-hbtn:hover{color:#f2efee;background:rgba(255,255,255,.07)}',
    '.plc-hbtn svg{width:19px;height:19px}',
    '.plc-body{flex:1;overflow-y:auto;padding:1rem .9rem;display:flex;flex-direction:column;gap:.7rem;scrollbar-width:thin}',
    '.plc-msg{max-width:85%;padding:.62rem .85rem;border-radius:13px;font-size:.88rem;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}',
    '.plc-msg.bot{align-self:flex-start;background:#1e1c1c;color:#e8e5e4;border-bottom-left-radius:4px}',
    '.plc-msg.me{align-self:flex-end;background:#FF5500;color:#fff;border-bottom-right-radius:4px}',
    '.plc-msg a{color:inherit;text-decoration:underline}',
    '.plc-typing{align-self:flex-start;display:flex;gap:4px;padding:.7rem .85rem;background:#1e1c1c;border-radius:13px;border-bottom-left-radius:4px}',
    '.plc-typing i{width:6px;height:6px;border-radius:50%;background:rgba(232,229,228,.5);animation:plcB 1.3s infinite}',
    '.plc-typing i:nth-child(2){animation-delay:.18s}.plc-typing i:nth-child(3){animation-delay:.36s}',
    '@keyframes plcB{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}',
    '.plc-quick{display:flex;flex-wrap:wrap;gap:.4rem;padding:0 .9rem .6rem}',
    '.plc-quick button{background:rgba(255,85,0,.1);border:1px solid rgba(255,85,0,.3);color:#ff8c4d;font-family:inherit;font-size:.78rem;padding:.42rem .7rem;border-radius:999px;cursor:pointer;transition:background .15s}',
    '.plc-quick button:hover{background:rgba(255,85,0,.2)}',
    '.plc-bar{display:flex;gap:.5rem;align-items:flex-end;padding:.7rem .8rem;border-top:1px solid rgba(255,255,255,.07);background:#151414}',
    '.plc-bar textarea{flex:1;resize:none;max-height:96px;background:#1e1c1c;border:1px solid rgba(255,255,255,.1);border-radius:11px;color:#e8e5e4;font-family:inherit;font-size:.88rem;padding:.6rem .75rem;outline:none;line-height:1.45}',
    '.plc-bar textarea:focus{border-color:rgba(255,85,0,.55)}',
    '.plc-bar textarea::placeholder{color:rgba(232,229,228,.35)}',
    '.plc-send{background:#FF5500;border:0;border-radius:11px;width:38px;height:38px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:opacity .15s}',
    '.plc-send:disabled{opacity:.4;cursor:default}',
    '.plc-send svg{width:18px;height:18px}',
    '.plc-legal{font-size:.66rem;color:rgba(232,229,228,.32);text-align:center;padding:0 .8rem .55rem;background:#151414;line-height:1.4}',
    '@media(max-width:520px){.plc-panel{right:8px;bottom:8px;width:calc(100vw - 16px);height:calc(100vh - 16px);border-radius:14px}.plc-launch{right:14px;bottom:14px}}',
    '@media(prefers-reduced-motion:reduce){.plc-typing i{animation:none}.plc-launch{transition:none}}'
  ].join('');
  document.head.appendChild(css);

  var ICON_BOT = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>';

  // ---------- Lanceur ----------
  var launch = document.createElement('button');
  launch.className = 'plc-launch';
  launch.type = 'button';
  launch.setAttribute('aria-label', "Ouvrir l'assistant Pirabel Labs");
  launch.innerHTML = ICON_BOT + '<span>Discuter</span>';
  document.body.appendChild(launch);

  // ---------- Panneau ----------
  var panel = document.createElement('div');
  panel.className = 'plc-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Assistant Pirabel Labs');
  panel.innerHTML =
    '<div class="plc-head">' +
      '<div class="plc-avatar">' + ICON_BOT + '</div>' +
      '<div class="plc-id"><div class="plc-name">Assistant Pirabel Labs</div>' +
        '<div class="plc-status"><i></i>En ligne — réponse immédiate</div></div>' +
      '<a class="plc-hbtn" href="' + WHATSAPP + '" target="_blank" rel="noopener" title="Parler sur WhatsApp" aria-label="Parler sur WhatsApp">' +
        '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.5 14.4c-.3-.2-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3c1.4.8 3 1.2 4.7 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.2c-1.6 0-3-.4-4.3-1.2l-.3-.2-3.1.8.8-3-.2-.3c-.8-1.3-1.3-2.8-1.3-4.4 0-4.5 3.7-8.2 8.2-8.2s8.2 3.7 8.2 8.2-3.6 8.3-8 8.3z"/></svg>' +
      '</a>' +
      '<button class="plc-hbtn" type="button" id="plcClose" title="Fermer" aria-label="Fermer">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="plc-body" id="plcBody"></div>' +
    '<div class="plc-quick" id="plcQuick"></div>' +
    '<div class="plc-bar">' +
      '<textarea id="plcInput" rows="1" placeholder="Votre message…" aria-label="Votre message"></textarea>' +
      '<button class="plc-send" id="plcSend" type="button" aria-label="Envoyer">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="plc-legal">Assistant IA — vos coordonnées ne servent qu\'à vous recontacter.</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector('#plcBody');
  var quick = panel.querySelector('#plcQuick');
  var input = panel.querySelector('#plcInput');
  var sendBtn = panel.querySelector('#plcSend');

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Filet de securite : le widget n'interprete pas le Markdown, donc on retire les
  // marqueurs si le modele en produit malgre la consigne (evite d'afficher des **).
  function stripMarkdown(s) {
    return String(s)
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1$2')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*]\s+/gm, '• ')
      .replace(/`([^`]+)`/g, '$1');
  }

  // Transforme les URL et adresses e-mail en liens cliquables.
  function linkify(s) {
    return esc(stripMarkdown(s))
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
  }

  function addMsg(role, text) {
    var d = document.createElement('div');
    d.className = 'plc-msg ' + (role === 'user' ? 'me' : 'bot');
    d.innerHTML = linkify(text);
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var t = document.createElement('div');
    t.className = 'plc-typing';
    t.id = 'plcTyping';
    t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() { var t = document.getElementById('plcTyping'); if (t) t.remove(); }

  var QUICKS = ['Je veux un site web', 'Améliorer mon référencement', 'Automatiser mon activité', 'Combien ça coûte ?'];
  function renderQuick() {
    quick.innerHTML = '';
    if (history.length) return;
    QUICKS.forEach(function (q) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = q;
      b.onclick = function () { input.value = q; send(); };
      quick.appendChild(b);
    });
  }

  async function send() {
    var text = (input.value || '').trim();
    if (!text || busy) return;
    input.value = '';
    input.style.height = 'auto';
    addMsg('user', text);
    history.push({ role: 'user', content: text });
    renderQuick();
    busy = true; sendBtn.disabled = true;
    showTyping();
    try {
      var r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-16) })
      });
      var d = await r.json();
      hideTyping();
      var reply = (d && d.reply) || "Désolé, je n'ai pas pu répondre. Écrivez-nous à contact@pirabellabs.com.";
      addMsg('assistant', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (e) {
      hideTyping();
      addMsg('assistant', "Je n'arrive pas à joindre le serveur. Écrivez-nous à contact@pirabellabs.com ou via WhatsApp.");
    } finally {
      busy = false; sendBtn.disabled = false; input.focus();
    }
  }

  function open() {
    opened = true;
    panel.classList.add('is-open');
    launch.classList.add('is-hidden');
    if (!history.length && !body.children.length) {
      addMsg('assistant', "Bonjour ! Je suis l'assistant de Pirabel Labs. Quel projet souhaitez-vous mener — un site web, du référencement, de l'automatisation ?");
      renderQuick();
    }
    setTimeout(function () { input.focus(); }, 60);
  }
  function close() {
    panel.classList.remove('is-open');
    launch.classList.remove('is-hidden');
  }

  launch.onclick = open;
  panel.querySelector('#plcClose').onclick = close;
  sendBtn.onclick = send;
  input.addEventListener('input', function () {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 96) + 'px';
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && opened) close(); });

  // Retire l'ancien bouton WhatsApp flottant : le lanceur du chat le remplace.
  var old = document.querySelector('.wa-float');
  if (old && old.parentNode) old.parentNode.removeChild(old);
})();
