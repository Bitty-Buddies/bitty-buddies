// Bitty Shop and Buddy Book: spend Buddy Bucks, see your collection, name your buddies.
(() => {
  const PX = window.BBPixel;
  const $ = id => document.getElementById(id);
  const COIN = ['.GGG.', 'GYYYG', 'GYGYG', 'GYYYG', '.GGG.'], COIN_COLS = { G: '#D99A1E', Y: '#FFD84A' };
  let state = null, editing = false;
  const REG = {};

  function loadScript(src) {
    return new Promise(res => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.body.appendChild(s); });
  }
  async function loadPacks(files) {
    for (const f of files) await loadScript('../packs/' + f);
    for (const pack of window.BBPacks || []) for (const [key, item] of Object.entries(pack.items)) REG[`${pack.id}/${key}`] = PX.withDefaults(item);
  }

  // Draw a sprite (and optionally a hat) into a canvas, a pixel per cell; CSS scales it up crisply.
  function drawSprite(cv, id, { hat = null, ghost = false } = {}) {
    const def = REG[id];
    const ctx = cv.getContext('2d');
    if (!def) { cv.width = 1; cv.height = 1; return; }
    const grid = PX.drawItem(def, { pose: 'idle', frame: 0, blink: false });
    const pad = 6, w = Math.max(def.w + 4, Math.round((def.h + pad + 2) * 156 / 84));
    cv.width = w; cv.height = def.h + pad + 2;
    const ox = Math.round((w - def.w) / 2), oy = pad;
    const put = (x, y, col) => { ctx.fillStyle = ghost ? 'rgba(46,52,92,.32)' : col; ctx.fillRect(ox + x, oy + y, 1, 1); };
    grid.forEach((row, y) => row.forEach((c, x) => { if (c) put(x, y, c); }));
    if (hat && !ghost) for (const d of BBOutfits.hatPixels(grid, hat, 1)) put(d.x, d.y, d.col);
  }
  function drawCoin(cv) {
    cv.width = 5; cv.height = 5;
    const ctx = cv.getContext('2d');
    COIN.forEach((r, y) => [...r].forEach((ch, x) => { if (COIN_COLS[ch]) { ctx.fillStyle = COIN_COLS[ch]; ctx.fillRect(x, y, 1, 1); } }));
  }
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  let toastT = 0;
  function toast(msg, bad = false) {
    const t = $('toast');
    t.textContent = msg; t.classList.toggle('err', bad); t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3600);
  }

  // ---------- shop ----------
  function shopCard(c) {
    const w = state.wallet, have = w.owned.includes(c.id), afford = w.balance >= c.price;
    const card = el('div', 'item' + (have ? ' owned' : ''));
    const cv = el('canvas');
    drawSprite(cv, c.kind === 'hat' ? 'critters/pup' : c.item, { hat: c.kind === 'hat' ? c.id : null });
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', c.name);
    card.append(cv, el('b', null, c.name), el('div', 'blurb', c.blurb));
    const price = el('div', 'price');
    const pc = el('canvas'); drawCoin(pc);
    price.append(pc, document.createTextNode(String(c.price)));
    card.append(price);
    const btn = el('button', 'act', have ? 'Owned ✓' : afford ? 'Buy' : `Need ${c.price - w.balance} more`);
    btn.disabled = have || !afford;
    btn.onclick = async () => {
      btn.disabled = true;
      const r = await window.shop.buy(c.id);
      if (r.state) render(r.state);
      toast(r.error || r.message, !!r.error);
    };
    card.append(btn);
    return card;
  }
  function renderShop() {
    const w = state.wallet;
    $('cap').textContent = w.today >= w.cap
      ? `You've earned your full ${w.cap} today. Buddies still earn, just more slowly, until midnight.`
      : `Earned today: ${w.today} of ${w.cap} at full speed.`;
    for (const [box, kind] of [['hats', 'hat'], ['decor', 'decor'], ['buddies', 'buddy']]) {
      $(box).textContent = '';
      for (const c of state.catalogue.filter(x => x.kind === kind)) $(box).append(shopCard(c));
    }
  }

  // ---------- Buddy Book ----------
  function renderBook() {
    const w = state.wallet, s = w.stats;
    $('supporter').hidden = !state.supporter;
    $('stats').textContent = '';
    const have = state.book.filter(b => b.have).length;
    for (const [label, n] of [['Collected', `${have} of ${state.book.length}`], ['Naps taken', s.naps || 0], ['Balls fetched', s.balls || 0], ['Battles won', s.battles || 0], ['Daily gifts', s.gifts || 0], ['Things bought', s.bought || 0]]) {
      const st = el('div', 'stat'); st.append(el('b', null, String(n)), document.createTextNode(label)); $('stats').append(st);
    }
    const book = $('book');
    book.textContent = '';
    const packs = [...new Set(state.book.map(b => b.packName))];
    for (const name of packs) {
      book.append(el('h2', null, name));
      const grid = el('div', 'grid');
      for (const b of state.book.filter(x => x.packName === name)) grid.append(bookCard(b));
      book.append(grid);
    }
  }
  function bookCard(b) {
    const w = state.wallet;
    const card = el('div', 'item' + (b.have ? '' : ' locked'));
    const cv = el('canvas'); drawSprite(cv, b.id, { ghost: !b.have });
    cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', b.have ? b.name : `${b.name} (not collected yet)`);
    card.append(cv);
    const nick = w.names[b.id];
    card.append(el('b', null, b.have ? (nick ? `${nick} the ${b.name}` : b.name) : b.name));
    if (!b.have) {
      const shopItem = b.shopId && state.catalogue.find(c => c.id === b.shopId);
      card.append(el('div', 'blurb', b.blurb));
      card.append(el('span', 'tag', shopItem ? `In the Bitty Shop · ${shopItem.price}` : b.licensed ? `In ${b.packName}` : 'Locked'));
      return card;
    }
    if (b.kind === 'pet') {
      const f = w.friends[b.id] || { minutes: 0, level: 1, name: w.levelNames[0] };
      card.append(el('div', 'hearts', '❤'.repeat(f.level) + '♡'.repeat(5 - f.level)));
      const next = w.levels[f.level];
      const bar = el('div', 'bar'), fill = el('i');
      const prev = w.levels[f.level - 1] || 0;
      fill.style.width = next ? `${Math.min(100, Math.round(((f.minutes - prev) / (next - prev)) * 100))}%` : '100%';
      bar.append(fill);
      card.append(bar, el('div', 'lvl', next ? `${f.name} · ${Math.max(1, Math.ceil((next - f.minutes) / 60))}h out to ${w.levelNames[f.level]}` : f.name));
      const input = el('input', 'nick');
      input.placeholder = 'Give them a name';
      input.maxLength = 20;
      input.value = nick || '';
      input.setAttribute('aria-label', `Name for ${b.name}`);
      input.onfocus = () => { editing = true; };
      input.onblur = async () => { editing = false; if ((input.value.trim()) !== (nick || '')) render(await window.shop.name(b.id, input.value)); };
      input.onkeydown = e => { if (e.key === 'Enter') input.blur(); };
      card.append(input);
    } else card.append(el('div', 'blurb', b.blurb));
    const out = el('button', 'act ghost', 'Bring out');
    out.onclick = () => { window.shop.spawn(b.id); toast(`${nick || b.name} is on your desktop.`); };
    card.append(out);
    return card;
  }

  // ---------- Packs (real money, bought in the browser) ----------
  function packArt(ids) {
    const box = el('div', 'pack-art');
    for (const id of ids) {
      const def = REG[id]; if (!def) continue;
      const grid = PX.drawItem(def, { pose: 'idle', frame: 0, blink: false });
      const cv = el('canvas'); cv.width = grid[0].length; cv.height = grid.length;
      const ctx = cv.getContext('2d');
      grid.forEach((row, y) => row.forEach((c, x) => { if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }));
      cv.style.height = `${Math.min(70, Math.round(48 * def.h / 20))}px`;
      box.append(cv);
    }
    return box;
  }
  function renderPacks() {
    const box = $('paid');
    box.textContent = '';
    const steamStore = state.store === 'steam';   // the Steam version sells packs as DLC
    $('already').hidden = steamStore;
    if (steamStore) $('packs-intro').textContent = 'Extra packs are DLC on Steam: a one-off payment, no subscription. Buy one and it unlocks here straight away.';
    const pick = (pack, n) => state.book.filter(b => b.pack === pack && b.kind === 'pet').slice(0, n).map(b => b.id);
    const art = { builds: state.book.filter(b => b.pack === 'builds').slice(3, 6).map(b => b.id), fantasy: pick('fantasy', 4), serverroom: pick('serverroom', 4), outbreak: pick('outbreak', 4), supporter: pick('critters', 3), bundle: [...pick('fantasy', 1), ...pick('serverroom', 2), ...state.book.filter(b => b.pack === 'builds').slice(4, 5).map(b => b.id)] };
    for (const p of state.paid) {
      const card = el('div', 'item' + (p.owned ? ' owned' : '') + (p.id === 'bundle' ? ' best' : ''));
      card.append(packArt(art[p.id] || []), el('b', null, p.name), el('div', 'blurb', p.blurb), el('div', 'money', p.price));
      const btn = el('button', 'act', p.owned ? 'Owned ✓' : steamStore ? 'Get it on Steam' : `Buy for ${p.price}`);
      btn.disabled = p.owned;
      btn.onclick = () => { window.shop.open(p.id); toast(steamStore ? 'Opening the Steam store…' : 'Opening the shop in your browser…'); };
      card.append(btn);
      box.append(card);
    }
    $('go-signin').hidden = state.signedIn;
    $('step-signin').textContent = state.signedIn ? 'You\'re signed in, so redeemed packs unlock here by themselves.' : 'Sign in here with the same account and the pack unlocks.';
  }
  $('go-redeem').onclick = () => { window.shop.open('redeem'); toast('Opening your account page…'); };
  $('go-signin').onclick = () => window.shop.open('signin');
  $('go-licence').onclick = () => window.shop.open('licence');

  function render(s) {
    if (s) state = s;
    if (!state) return;
    $('balance').textContent = String(state.wallet.balance);
    renderShop();
    renderPacks();
    if (!editing) renderBook();
  }
  function showTab(tab) {
    for (const b of document.querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
    $('panel-shop').hidden = tab !== 'shop';
    $('panel-book').hidden = tab !== 'book';
    $('panel-packs').hidden = tab !== 'packs';
    document.title = tab === 'book' ? 'Buddy Book' : tab === 'packs' ? 'Bitty Buddies packs' : 'Bitty Shop';
  }
  for (const b of document.querySelectorAll('[data-tab]')) b.onclick = () => showTab(b.dataset.tab);
  window.shop.onTab(showTab);
  window.shop.onUpdate(s => { if (!editing) render(s); else { state = s; $('balance').textContent = String(s.wallet.balance); } });

  drawCoin($('coin'));
  const firstTab = new URLSearchParams(location.search).get('tab');
  showTab(['book', 'packs'].includes(firstTab) ? firstTab : 'shop');
  window.shop.state().then(async s => {
    const files = [...new Set(['critters.js', ...s.book.map(b => b.file)])];
    await loadPacks(files);
    render(s);
  });
})();
