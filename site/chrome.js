// The site's header (tabs + live status light) and footer, shared by every page.
// To add a page: make the .html file with <body data-page="yourid">, then add one line to TABS.
(() => {
  const DISCORD = 'https://discord.gg/aCHyjABJG7';
  const DOWNLOAD = 'https://github.com/Bitty-Buddies/bitty-buddies/releases/latest/download/Bitty-Buddies-Setup.exe';
  const STATUS_API = 'https://bitty-admin.reece-feetenby.workers.dev/status';

  const TABS = [
    { id: 'home', label: 'Home', href: './' },
    { id: 'packs', label: 'Packs', href: 'packs.html' },
    { id: 'book', label: 'Buddy Book', href: 'buddybook.html' },
    { id: 'team', label: 'Team', href: 'team.html' },
    { id: 'members', label: 'Members', href: 'members.html' },
    { id: 'status', label: 'Status', href: 'status.html' },
    { id: 'account', label: 'Account', href: 'account.html' }
    // { id: 'faq', label: 'FAQ', href: 'faq.html' },
  ];
  const ELSEWHERE = [
    { label: 'Discord', href: DISCORD }
  ];

  const page = document.body.dataset.page || '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tab = t => `<a href="${t.href}"${t.id === page ? ' aria-current="page"' : ''}>${esc(t.label)}</a>`;
  const out = l => `<a href="${l.href}" rel="noopener">${esc(l.label)}</a>`;

  // ---------- header ----------
  const head = document.getElementById('site-header');
  if (head) {
    head.className = 'site-header';
    head.innerHTML = `
      <div class="bar">
        <a class="brand" href="./"><img src="icon.png" alt="" width="28" height="28">Bitty Buddies</a>
        <nav class="tabs" aria-label="Main">${TABS.map(tab).join('')}${ELSEWHERE.slice(0, 1).map(out).join('')}</nav>
        <a class="status-pill checking" href="status.html" title="Live service status">
          <span class="lamp" aria-hidden="true"></span><span class="status-pill-text">Checking…</span>
        </a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu-panel">Menu</button>
      </div>
      <nav class="menu-panel" id="menu-panel" aria-label="Main" hidden>
        ${TABS.map(tab).join('')}${ELSEWHERE.map(out).join('')}
      </nav>`;
    const btn = head.querySelector('.menu-btn');
    const panel = head.querySelector('.menu-panel');
    const close = () => { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => { const open = panel.hidden; panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
    matchMedia('(min-width: 1081px)').addEventListener('change', e => { if (e.matches) close(); });
  }

  // ---------- live status light ----------
  // One quick check per visit (kept for two minutes across pages) so browsing doesn't hammer the server.
  const pill = head && head.querySelector('.status-pill');
  const show = st => {
    if (!pill) return;
    const bad = (st.services || []).filter(s => !s.ok && !s.internal).length;   // internal checks are for the Admin Tool only
    pill.className = 'status-pill ' + (st.unreachable ? 'down' : bad ? 'down' : 'up');
    pill.querySelector('.status-pill-text').textContent = st.unreachable ? 'Status unknown' : bad ? 'Some issues' : 'All systems go';
  };
  if (pill) {
    let cached = null;
    try { cached = JSON.parse(sessionStorage.getItem('bb-status') || 'null'); } catch { /* storage off */ }
    if (cached && Date.now() - cached.at < 120000) show(cached.st);
    else fetch(STATUS_API, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .catch(() => ({ unreachable: true }))
      .then(st => { show(st); try { sessionStorage.setItem('bb-status', JSON.stringify({ at: Date.now(), st })); } catch { /* fine */ } });
  }

  // ---------- footer ----------
  // The header script runs at the top of the page, before the footer exists, so wait for it.
  const footer = () => {
    const foot = document.getElementById('site-footer');
    if (!foot || foot.dataset.done) return;
    foot.dataset.done = '1';
    foot.classList.add('bedrock', 'site-footer');
    foot.innerHTML = `
      <div class="wrap foot-grid">
        <div class="foot-about">
          <a class="brand" href="./"><img src="icon.png" alt="" width="24" height="24">Bitty Buddies</a>
          <p>Tiny pixel pets for your Windows desktop. Free to download, with extra packs to unlock.</p>
        </div>
        <nav class="foot-col" aria-label="Pages"><h2>Pages</h2>${TABS.map(tab).join('')}</nav>
        <nav class="foot-col" aria-label="Community"><h2>Community</h2>${ELSEWHERE.map(out).join('')}</nav>
        <div class="foot-legal">
          <p>© 2026 Bitty Buddies. All rights reserved. The code is public to read, not to copy or re-upload. <a href="terms.html">Terms of use</a> · <a href="terms.html#cookies">Cookies</a> · <button type="button" class="linkish" data-cookie-settings>Cookie settings</button></p>
          <p>Privacy: the app sends an anonymous "+1" once a day so we can count users. No name, ID or files are sent, and you can turn it off in the tray menu. If you use “Report a problem…”, we only get what you type and, if you leave it ticked, basic app details like the version and your Windows version. If you make an account, we store your username, a scrambled copy of your password, and your Discord name and picture if you link Discord. You can delete your account at any time.</p>
        </div>
      </div>`;
  };
  footer();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', footer);

  // ---------- cookies and storage ----------
  // The site has no tracking or advertising cookies. Browser storage is only used to keep you
  // signed in (needed for accounts, so always allowed) and, if you say yes, to remember which
  // advent doors you've opened. Your choice is saved so the notice doesn't keep coming back.
  const CHOICE = 'bb-consent';
  const read = () => { try { return localStorage.getItem(CHOICE); } catch { return null; } };
  window.BB_EXTRAS_OK = () => read() === 'all';
  function choose(value) {
    try {
      localStorage.setItem(CHOICE, value);
      if (value !== 'all') Object.keys(localStorage).filter(k => k.startsWith('bb-advent-')).forEach(k => localStorage.removeItem(k));
    } catch { /* storage is off, so nothing is saved anyway */ }
    const bar = document.getElementById('cookie-bar');
    if (bar) bar.remove();
  }
  function showNotice() {
    if (document.getElementById('cookie-bar')) return;
    const bar = document.createElement('section');
    bar.id = 'cookie-bar';
    bar.className = 'cookie-bar';
    bar.setAttribute('aria-label', 'Cookies');
    bar.innerHTML = `
      <p><strong>Cookies on Bitty Buddies.</strong> We don't use tracking or advertising cookies. We only save what keeps you signed in, and, if you're happy, which advent doors you've opened. <a href="terms.html#cookies">What we save</a></p>
      <div class="cookie-actions">
        <button type="button" class="btn grass" data-choice="all">Accept</button>
        <button type="button" class="btn stone" data-choice="essential">Essential only</button>
      </div>`;
    bar.addEventListener('click', e => { const b = e.target.closest('[data-choice]'); if (b) choose(b.dataset.choice); });
    document.body.appendChild(bar);
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-cookie-settings]')) { document.getElementById('cookie-bar')?.remove(); showNotice(); document.querySelector('#cookie-bar button')?.focus(); } });
  const start = () => { if (!read()) showNotice(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
