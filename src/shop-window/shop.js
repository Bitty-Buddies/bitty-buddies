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


  // ---------- Control Centre ----------
  const C = () => state.centre;
  const who = t => t.nick ? `${t.nick}` : t.name;
  let selUid = null, spawnKind = 'pet', spawnPack = '', lastPlay = '';
  const hearts = n => '❤'.repeat(n) + '♡'.repeat(5 - n);
  function sprite(id, hat, tight) {
    const cv = el('canvas'); cv.setAttribute('aria-hidden', 'true');
    const def = REG[id];
    if (!tight || !def) { drawSprite(cv, id, { hat: hat || null }); return cv; }
    const grid = PX.drawItem(def, { pose: 'idle', frame: 0, blink: false });   // just the sprite, so small rows show it big
    cv.width = def.w; cv.height = def.h;
    const ctx = cv.getContext('2d');
    grid.forEach((row, y) => row.forEach((c, x) => { if (c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); } }));
    cv.style.objectFit = 'contain';
    return cv;
  }

  function renderPlay() {
    const c = C(), s = c.settings;
    $('play-hide').textContent = s.hidden ? 'Show everyone' : 'Hide everyone';
    const size = $('play-size');
    if (!size.options.length) for (const [label, v] of s.sizes) size.append(new Option(label, String(v)));
    size.value = String(s.scale);
    const box = $('play-live'); box.textContent = '';
    for (const t of c.live.slice(0, 12)) {
      const b = el('button', 'tile'); b.type = 'button';
      b.append(sprite(t.id, t.hat), el('b', null, who(t)), el('span', null, t.zombie ? 'Zombie!' : t.kind === 'pet' ? t.levelName : 'Build'));
      b.onclick = () => { selUid = t.uid; showTab('onscreen'); renderOnScreen(); };
      box.append(b);
    }
    $('play-live-empty').hidden = c.live.length > 0;
    const plays = $('plays'); plays.textContent = '';
    for (const p of c.plays) {
      const b = el('button', 'play'); b.type = 'button'; b.disabled = p.off;
      b.append(el('b', null, p.label), el('span', null, p.from));
      b.onclick = () => { window.shop.play(p.id); lastPlay = `${p.label}: off they go!`; $('play-last').textContent = lastPlay; };
      plays.append(b);
    }
    $('play-last').textContent = lastPlay || 'Tip: right-click any buddy on your desktop for its own menu.';
    const quick = $('quick-spawn'); quick.textContent = '';
    const have = state.book.filter(b => b.have);
    const picks = [...have.filter(b => b.kind === 'pet').slice(0, 6), ...have.filter(b => b.kind === 'build').slice(0, 2)];
    for (const b of picks) quick.append(spawnRow(b));
  }
  function spawnRow(b) {
    const row = el('div', 'spawn');
    const info = el('div'); info.append(el('b', null, b.name), el('span', null, b.packName));
    const go = el('button', 'btn go', b.kind === 'build' ? 'Build' : 'Spawn'); go.type = 'button';
    go.onclick = () => { window.shop.spawn(b.id); toast(`${state.wallet.names[b.id] || b.name} is on your desktop.`); };
    if (C().live.length >= C().max) { go.disabled = true; go.title = `Your desktop is full (${C().max}). Remove someone first.`; }
    row.append(sprite(b.id, null, true), info, go);
    return row;
  }

  function renderSpawn() {
    const q = $('spawn-q').value.trim().toLowerCase();
    const kinds = $('spawn-kinds'); kinds.textContent = '';
    for (const [k, label] of [['pet', 'Buddies'], ['build', 'Builds']]) {
      const b = el('button', 'chip', label); b.type = 'button'; b.setAttribute('aria-pressed', String(spawnKind === k));
      b.onclick = () => { spawnKind = k; spawnPack = ''; renderSpawn(); };
      kinds.append(b);
    }
    const mine = state.book.filter(b => b.have && b.kind === spawnKind);
    const packs = [...new Set(mine.map(b => b.packName))];
    if (spawnPack && !packs.includes(spawnPack)) spawnPack = '';
    const chips = $('spawn-packs'); chips.textContent = '';
    for (const name of ['', ...packs]) {
      const b = el('button', 'chip', name || 'All packs'); b.type = 'button'; b.setAttribute('aria-pressed', String(spawnPack === name));
      b.onclick = () => { spawnPack = name; renderSpawn(); };
      chips.append(b);
    }
    const list = $('spawn-list'); list.textContent = '';
    const shown = mine.filter(b => (!spawnPack || b.packName === spawnPack) && (!q || `${b.name} ${b.packName} ${b.blurb} ${state.wallet.names[b.id] || ''}`.toLowerCase().includes(q)));
    for (const b of shown) list.append(spawnRow(b));
    $('spawn-empty').hidden = shown.length > 0;
    $('spawn-intro').textContent = `${state.book.filter(b => b.have).length} buddies and builds to bring out. Up to ${C().max} at once.`;
    const locked = [...new Set(state.book.filter(b => !b.have && b.licensed && b.kind === spawnKind).map(b => b.packName))];
    const lk = $('spawn-locked'); lk.textContent = '';
    if (locked.length) {
      const p = el('p', 'cap'); p.style.marginTop = '14px';
      p.append(document.createTextNode(`More in ${locked.join(', ')}. `));
      const a = el('button', 'linkbtn', 'See packs'); a.type = 'button'; a.dataset.go = 'packs'; p.append(a);
      lk.append(p);
    }
  }
  $('spawn-q').oninput = () => renderSpawn();

  function renderOnScreen() {
    const c = C();
    $('live-count').textContent = c.live.length ? String(c.live.length) : '';
    const pets = c.live.filter(t => t.kind === 'pet').length;
    $('live-intro').textContent = c.live.length ? `${pets} ${pets === 1 ? 'buddy' : 'buddies'} and ${c.live.length - pets} ${c.live.length - pets === 1 ? 'build' : 'builds'}. Pick one to name it, dress it or tell it what to do.` : 'Nobody is out right now.';
    if (!c.live.some(t => t.uid === selUid)) selUid = c.live.length ? c.live[0].uid : null;
    const list = $('live-list'); list.textContent = '';
    for (const t of c.live) {
      const b = el('button', 'live-row' + (t.uid === selUid ? ' on' : '')); b.type = 'button';
      const info = el('div'); info.append(el('b', null, who(t)), el('span', null, t.nick ? t.name : t.pack));
      b.append(sprite(t.id, null, true), info);
      b.onclick = () => { selUid = t.uid; renderOnScreen(); };
      list.append(b);
    }
    const d = $('live-detail'); d.textContent = '';
    const t = c.live.find(x => x.uid === selUid);
    d.hidden = !t;
    if (!t) { list.append(el('p', 'empty', 'Spawn someone from the Playground.')); return; }
    const top = el('div', 'who'); top.append(sprite(t.id, t.hat));
    const info = el('div');
    if (t.kind === 'pet') {
      const lab = el('label', 'cap', 'Name'); lab.style.display = 'grid'; lab.style.gap = '2px'; lab.style.margin = '0';
      const inp = el('input'); inp.maxLength = 20; inp.value = t.nick; inp.placeholder = `Name your ${t.name}`;
      inp.onfocus = () => { editing = true; };
      inp.onblur = async () => { editing = false; if (inp.value.trim() !== t.nick) render(await window.shop.name(t.id, inp.value)); };
      inp.onkeydown = e => { if (e.key === 'Enter') inp.blur(); };
      lab.append(inp); info.append(lab);
    } else info.append(el('h2', null, t.name));
    info.append(el('div', 'cap', `${t.name} from ${t.pack}${t.zombie ? '. Bitten! Only a medic can cure them.' : ''}`));
    top.append(info); d.append(top);
    if (t.kind === 'pet') {
      const f = state.wallet.friends[t.id] || { minutes: 0, level: 1, name: state.wallet.levelNames[0] };
      const w = state.wallet, next = w.levels[f.level], prev = w.levels[f.level - 1] || 0;
      const fr = el('div'); fr.style.margin = '0 0 12px';
      const line = el('div', 'row'); line.style.justifyContent = 'space-between'; line.style.margin = '0 0 4px';
      const hb = el('b'); hb.append(el('span', 'hearts', hearts(f.level)), document.createTextNode(`  ${f.name}`)); line.append(hb, el('span', 'lvl', next ? `${Math.max(1, Math.ceil((next - f.minutes) / 60))}h out to ${w.levelNames[f.level]}` : 'Best possible friends'));
      const bar = el('div', 'bar'), fill = el('i'); fill.style.width = next ? `${Math.min(100, Math.round(((f.minutes - prev) / (next - prev)) * 100))}%` : '100%'; bar.append(fill);
      fr.append(line, bar); d.append(fr);
      d.append(el('h2', null, `What should ${who(t)} do?`));
      const acts = el('div', 'acts');
      for (const a of t.acts) { const b = el('button', null, a.label); b.type = 'button'; b.onclick = () => window.shop.thing(t.uid, a.id); acts.append(b); }
      d.append(acts);
      d.append(el('h2', null, 'Hat'));
      const hats = el('div', 'chips');
      const none = el('button', 'chip', 'No hat'); none.type = 'button'; none.setAttribute('aria-pressed', String(!t.hat)); none.onclick = () => window.shop.thing(t.uid, 'hat-off'); hats.append(none);
      for (const h of t.hats) { const b = el('button', 'chip', h.label); b.type = 'button'; b.setAttribute('aria-pressed', String(t.hat === h.id)); b.onclick = () => window.shop.thing(t.uid, `hat:${h.id}`); hats.append(b); }
      d.append(hats);
    }
    const foot = el('div', 'foot-row');
    const more = el('button', 'linkbtn', 'See them in the Buddy Book'); more.type = 'button'; more.dataset.go = 'book';
    const rm = el('button', 'btn bad', `Remove ${who(t)}`); rm.type = 'button'; rm.onclick = () => window.shop.thing(t.uid, 'remove');
    foot.append(more, rm); d.append(foot);
  }

  function renderHats() {
    const box = $('hat-all'); box.textContent = '';
    for (const h of C().hatList) { const b = el('button', 'btn', h.label); b.type = 'button'; b.onclick = () => { window.shop.hats(h.id); toast('Hats on!'); }; box.append(b); }
  }
  $('hat-none').onclick = () => { window.shop.hats(null); toast('Hats off.'); };

  function sw(key, on, label, help, cb) {
    const row = el('div', 'set'); const t = el('div'); t.append(el('b', null, label), el('span', null, help));
    const b = el('button', 'switch'); b.type = 'button'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(!!on)); b.setAttribute('aria-label', label);
    b.onclick = async () => { b.disabled = true; render(cb ? await cb(!on) : await window.shop.set(key, !on)); };
    row.append(t, b); return row;
  }
  function pickRow(key, label, help, opts, val) {
    const row = el('div', 'set'); const t = el('div'); t.append(el('b', null, label), el('span', null, help));
    const s = el('select'); s.setAttribute('aria-label', label);
    for (const [l, v] of opts) s.append(new Option(l, String(v)));
    s.value = String(val);
    s.onchange = async () => render(await window.shop.set(key, key === 'scale' ? Number(s.value) : s.value));
    row.append(t, s); return row;
  }
  function group(title, rows) { const c = el('div', 'card'); c.append(el('h2', null, title)); for (const r of rows) if (r) c.append(r); return c; }
  function renderSettings() {
    const s = C().settings, box = $('settings'); box.textContent = '';
    box.append(
      group('How buddies behave', [
        sw('mischief', s.mischief, 'Mischief', 'Chasing the mouse, climbing and tugging windows'),
        s.goreShown ? sw('gore', s.gore, 'Gore', 'Blood splats and trails in Outbreak') : null,
        pickRow('snow', 'Snow', 'Snow falls and settles on your windows. Auto snows from 1 December to 6 January', [['Auto (in winter)', 'auto'], ['Always', 'on'], ['Off', 'off']], s.snow)
      ]),
      group('Your screen', [
        sw('hidden', s.hidden, 'Hide everyone', 'Clear the screen without removing anyone'),
        pickRow('scale', 'Size', 'How big buddies are', s.sizes, s.scale),
        sw('buddyNews', s.buddyNews, 'Buddy news', 'A note when a buddy becomes a better friend')
      ]),
      group('This computer', [
        s.login === null ? null : sw('login', s.login, 'Start with computer', 'Your buddies are there when you sign in'),
        sw('shareStats', s.shareStats, 'Count me in the user stats', 'One anonymous count a day. No names, nothing else')
      ])
    );
  }
  function renderAccount() {
    const c = C();
    const a = c.account;
    $('acct-text').textContent = !a ? 'Accounts aren\'t available in this version.' : a.username ? `Signed in as ${a.username}. Packs on your account unlock here by themselves, and your Buddy Bucks are backed up.` : 'Sign in to unlock packs from your account and back up your Buddy Bucks.';
    const ab = $('acct-btns'); ab.textContent = '';
    const btn = (label, act, cls) => { const b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.dataset.act = act; return b; };
    if (a && a.username) ab.append(btn('Check for new packs', 'sync'), btn('Sign out', 'signout'));
    else if (a) ab.append(btn('Sign in…', 'signin', 'go'));
    $('keys-text').textContent = c.keys ? `${c.keys} licence key${c.keys === 1 ? '' : 's'} on this computer.` : 'No licence keys on this computer.';
    $('upd-text').textContent = c.ready ? `Version ${c.ready} is ready to install. You're on ${c.version}.` : `You're on version ${c.version}${c.testing ? ' (test versions on)' : ''}. Updates download by themselves.`;
    const ub = $('upd-btns'); ub.textContent = '';
    ub.append(c.ready ? btn(`Restart to update to ${c.ready}`, 'restart', 'go') : btn('Check for updates', 'update'));
    const t = $('upd-test'); t.textContent = '';
    if (c.canTest) t.append(sw('testVersions', c.testing, 'Get test versions', 'Try new things before everyone else'));
    $('foot-who').textContent = a && a.username ? a.username : 'Not signed in';
    $('foot-ver').textContent = `v${c.version}${c.testing ? ', testing' : ''}`;
  }
  function renderCentre() {
    renderPlay();
    if (!editing) renderOnScreen(); else $('live-count').textContent = C().live.length ? String(C().live.length) : '';
    renderSpawn(); renderHats(); renderSettings(); renderAccount();
  }
  $('play-hide').onclick = async () => render(await window.shop.set('hidden', !C().settings.hidden));
  $('play-size').onchange = async () => render(await window.shop.set('scale', Number($('play-size').value)));

  function render(s) {
    if (s) state = s;
    if (!state) return;
    $('balance').textContent = String(state.wallet.balance);
    renderShop();
    renderPacks();
    if (!editing) renderBook();
    if (state.centre) renderCentre();
  }
  const TABS = ['play', 'spawn', 'onscreen', 'hats', 'book', 'packs', 'shop', 'settings', 'account'];
  const TITLES = { play: 'Playground', spawn: 'Spawn and build', onscreen: 'On screen now', hats: 'Hats and outfits', book: 'Buddy Book', packs: 'Packs', shop: 'Bitty Shop', settings: 'Settings', account: 'Account and updates' };
  function showTab(tab) {
    if (!TABS.includes(tab)) tab = 'play';
    for (const b of document.querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
    for (const t of TABS) $('panel-' + t).hidden = t !== tab;
    document.title = `${TITLES[tab]} · Bitty Buddies`;
    document.querySelector('.content').scrollTop = 0;
  }
  for (const b of document.querySelectorAll('[data-tab]')) b.onclick = () => showTab(b.dataset.tab);
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) showTab(g.dataset.go);
    const a = e.target.closest('[data-act]'); if (a) window.shop.act(a.dataset.act);
    const c = e.target.closest('[data-clear]'); if (c) { window.shop.clear(c.dataset.clear); toast(c.textContent + ': done.'); }
  });
  window.shop.onTab(showTab);
  window.shop.onUpdate(s => { if (!editing) render(s); else { state = s; $('balance').textContent = String(s.wallet.balance); } });

  drawCoin($('coin'));
  const firstTab = new URLSearchParams(location.search).get('tab');
  showTab(firstTab || 'play');
  window.shop.state().then(async s => {
    const files = [...new Set(['critters.js', ...s.book.map(b => b.file)])];
    await loadPacks(files);
    render(s);
  });
})();
