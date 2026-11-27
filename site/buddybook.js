// The Buddy Book: every buddy and build on the website, with how to get each one.
// Signed in (the same sign-in as the Account page), it also shows what you've collected, the names you gave
// your buddies and your friendship hearts, from the backup the app makes to your account.
// Secret packs never show here: Mitty's Pack isn't on the website at all, and hidden packs (Supporter, Tester) have no buddies.
(() => {
  const API = 'https://bitty-admin.reece-feetenby.workers.dev';
  const PX = window.BBPixel;
  const PACKS = {};
  for (const p of window.BBPacks || []) PACKS[p.id] = p;
  const SHOP = Object.fromEntries((window.BBShop || []).map(c => [c.id, c]));
  const ADV = window.BBAdvent || null;
  const $ = id => document.getElementById(id);

  // The order packs appear in, and how you get each one. Builds went paid in 1.2.0, so accounts made before then keep them.
  const BUILDS_PAID_FROM = Date.parse('2026-11-22T23:00:00Z');
  const BUNDLE = 'https://payhip.com/b/ngN9f';
  const ORDER = [
    { id: 'critters', how: 'Free with every download', tag: 'Free', free: true },
    { id: 'winter', how: 'Free advent calendar, 1 to 25 December', tag: 'Free', free: true },
    { id: 'builds', how: 'Builds pack', tag: '£1.99', buy: 'https://payhip.com/b/eUfOF', buyText: 'Buy Builds for £1.99' },
    { id: 'fantasy', how: 'Fantasy Folk pack', tag: '£3.99', buy: 'https://payhip.com/b/tA5Ho', buyText: 'Buy Fantasy Folk for £3.99' },
    { id: 'serverroom', how: 'Server Room pack, in the Everything Bundle', tag: 'Bundle', buy: BUNDLE, buyText: 'Get it in the Everything Bundle, £11.99' },
    { id: 'shop', how: 'Bitty Shop, with Buddy Bucks', tag: 'Buddy Bucks', shop: true }
  ];
  const LEVELS = [0, 180, 600, 1500, 3000];                  // friendship: minutes out together (same as the app)
  const LEVEL_NAMES = ['New friend', 'Pal', 'Best buddy', 'Bestie', 'Forever friend'];
  const isBuild = it => it.kind === 'build';

  // ---------- drawing ----------
  function canvasOf(item, ghost) {
    const grid = PX.drawItem(PX.withDefaults(item), { pose: 'idle', frame: 0, blink: false });
    const c = document.createElement('canvas');
    c.width = grid[0].length; c.height = grid.length;
    const x = c.getContext('2d');
    grid.forEach((row, j) => row.forEach((col, i) => {
      if (!col) return;
      x.fillStyle = ghost ? 'rgba(46,52,92,.55)' : col;
      x.fillRect(i, j, 1, 1);
    }));
    return c;
  }
  function mystery() {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    const x = c.getContext('2d'); x.fillStyle = 'rgba(46,52,92,.55)';
    // a pixel question mark
    [[5,2],[6,2],[7,2],[8,2],[9,2],[4,3],[10,3],[4,4],[10,4],[9,5],[8,6],[7,7],[7,8],[7,9],[7,12],[7,13]]
      .forEach(([i, j]) => { x.fillRect(i, j, 1, 1); x.fillRect(i + 1, j, 1, 1); });
    return c;
  }

  // ---------- the cards ----------
  // Every entry: { key: 'pack/item', pack, item, how, tag, build, door, mystery }
  const entries = [];
  for (const o of ORDER) {
    const pack = PACKS[o.id];
    if (!pack || pack.hidden) continue;
    if (o.id === 'winter' && ADV) {
      // Only doors already opened (and buddies already shown off) are in the page. The rest stay a surprise.
      const byKey = pack.items;
      const placed = new Set();
      for (const d of ADV.doors) {
        if (d.key && byKey[d.key]) { entries.push({ key: `winter/${d.key}`, o, item: byKey[d.key], door: d.day }); placed.add(d.key); continue; }
        const preview = Object.entries(byKey).find(([k, it]) => it.day === d.day && !placed.has(k));
        if (preview) { entries.push({ key: `winter/${preview[0]}`, o, item: preview[1], door: d.day, soon: true }); placed.add(preview[0]); }
        else entries.push({ key: `winter/door-${d.day}`, o, door: d.day, mystery: true });
      }
      continue;
    }
    for (const [k, it] of Object.entries(pack.items)) {
      const e = { key: `${o.id}/${k}`, o, item: it };
      if (o.shop) e.price = SHOP[k] ? SHOP[k].price : null;
      entries.push(e);
    }
  }

  // ---------- who's signed in, and what they have ----------
  let me = null;                  // { user, keys, wallet }
  const filter = { kind: 'all', own: 'all', q: '' };

  function token() { try { return localStorage.getItem('bb-account'); } catch { return null; } }
  async function call(path) {
    const res = await fetch(API + path, { headers: { authorization: `Bearer ${token()}` } });
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }

  function owns(e) {
    if (!me || e.mystery) return false;
    const id = e.o.id;
    if (e.o.free) return id !== 'winter' || !e.soon;           // advent buddies are yours once their door opens
    if (e.o.shop) return me.owned.has(e.key.split('/')[1]);
    if (id === 'builds' && me.keepBuilds) return true;
    return me.packs.has(id);
  }
  function hearts(e) {
    const mins = me && me.wallet.friends ? me.wallet.friends[e.key] || 0 : 0;
    let lvl = 0;
    LEVELS.forEach((m, i) => { if (mins >= m) lvl = i; });
    return lvl;
  }

  function card(e) {
    const have = owns(e);
    const li = document.createElement('li');
    li.className = 'book-card' + (e.item && isBuild(e.item) ? ' build' : '') + (me && !have ? ' missing' : '') + (have ? ' have' : '');
    const pic = document.createElement('div');
    pic.className = 'book-pic';
    pic.appendChild(e.mystery ? mystery() : canvasOf(e.item, !!me && !have));
    li.appendChild(pic);

    const body = document.createElement('div');
    body.className = 'book-text';
    const name = document.createElement('h3');
    const given = me && me.wallet.names ? me.wallet.names[e.key] : null;
    if (e.mystery) name.textContent = `Door ${e.door}`;
    else if (given) { name.textContent = given; const real = document.createElement('span'); real.className = 'book-real'; real.textContent = e.item.name; name.append(' ', real); }
    else name.textContent = e.item.name;
    body.appendChild(name);

    const blurb = document.createElement('p');
    blurb.className = 'book-blurb';
    blurb.textContent = e.mystery ? `Opens on ${e.door} December. No peeking!` : e.item.blurb;
    body.appendChild(blurb);

    const how = document.createElement('p');
    how.className = 'book-how';
    if (e.door) how.textContent = e.soon ? `Advent door ${e.door}, opens ${e.door} December` : `Advent door ${e.door}`;
    else if (e.o.shop) how.textContent = e.price ? `Bitty Shop · ${e.price.toLocaleString('en-GB')} Buddy Bucks` : 'Bitty Shop';
    else how.textContent = e.o.how;
    body.appendChild(how);

    if (me && have && !isBuild(e.item)) {
      const lvl = hearts(e);
      const h = document.createElement('p');
      h.className = 'book-hearts';
      h.setAttribute('aria-label', `Friendship: ${LEVEL_NAMES[lvl]}`);
      h.title = LEVEL_NAMES[lvl];
      for (let i = 1; i < LEVELS.length; i++) { const s = document.createElement('span'); s.textContent = '♥'; if (i <= lvl) s.className = 'on'; h.appendChild(s); }
      const t = document.createElement('em'); t.textContent = LEVEL_NAMES[lvl]; h.appendChild(t);
      body.appendChild(h);
    }
    if (me) {
      const badge = document.createElement('span');
      badge.className = 'book-got';
      badge.textContent = have ? 'Collected' : 'Not yet';
      li.appendChild(badge);
    }
    li.appendChild(body);
    li.dataset.kind = e.item && isBuild(e.item) ? 'build' : 'pet';
    li.dataset.text = e.mystery ? `door ${e.door} advent` : `${e.item.name} ${e.item.blurb} ${given || ''} ${e.o.how}`.toLowerCase();
    li.dataset.have = have ? '1' : '0';
    return li;
  }

  function render() {
    const book = $('book');
    book.textContent = '';
    let shown = 0;
    for (const o of ORDER) {
      const list = entries.filter(e => e.o === o);
      if (!list.length) continue;
      const sec = document.createElement('section');
      sec.className = 'book-pack';
      sec.id = `book-${o.id}`;
      const head = document.createElement('div');
      head.className = 'book-pack-head';
      const h2 = document.createElement('h2'); h2.textContent = PACKS[o.id].name;
      const tag = document.createElement('span'); tag.className = 'price-tag' + (o.free ? ' free' : o.shop ? ' gift' : ''); tag.textContent = o.tag;
      head.append(h2, tag);
      if (me) {
        const got = list.filter(owns).length, real = list.filter(e => !e.mystery).length;
        const n = document.createElement('span'); n.className = 'book-pack-count'; n.textContent = `${got} of ${real}`;
        head.appendChild(n);
      }
      sec.appendChild(head);
      if (o.id === 'builds' && !(me && (me.other || owns(list[0])))) {
        const p = document.createElement('p'); p.className = 'book-note';
        p.textContent = 'Had Bitty Buddies before version 1.2.0? You keep Builds free, nothing to do.';
        sec.appendChild(p);
      }
      if (o.shop) {
        const p = document.createElement('p'); p.className = 'book-note';
        p.textContent = 'Your buddies earn Buddy Bucks while they\'re out on your desktop. Spend them in the Bitty Shop from the tray menu. Buddy Bucks are never sold for money.';
        sec.appendChild(p);
      }
      const ul = document.createElement('ul');
      ul.className = 'book-grid';
      for (const e of list) ul.appendChild(card(e));
      sec.appendChild(ul);
      if (o.buy && !(me && (me.other || list.every(owns)))) {
        const a = document.createElement('a'); a.className = 'btn grass book-buy'; a.href = o.buy; a.textContent = o.buyText;
        sec.appendChild(a);
      }
      book.appendChild(sec);
    }
    apply();
    return shown;
  }

  function apply() {
    let any = false;
    document.querySelectorAll('.book-pack').forEach(sec => {
      let n = 0;
      sec.querySelectorAll('.book-card').forEach(li => {
        const ok = (filter.kind === 'all' || li.dataset.kind === filter.kind)
          && (filter.own === 'all' || (filter.own === 'have') === (li.dataset.have === '1'))
          && (!filter.q || li.dataset.text.includes(filter.q));
        li.hidden = !ok;
        if (ok) n++;
      });
      sec.hidden = n === 0;
      if (n) any = true;
    });
    $('book-empty').hidden = any;
  }

  function chips(attr) {
    document.querySelectorAll(`[data-${attr}]`).forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll(`[data-${attr}]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      filter[attr] = b.dataset[attr];
      apply();
    }));
  }
  chips('kind'); chips('own');
  $('book-q').addEventListener('input', e => { filter.q = e.target.value.trim().toLowerCase(); apply(); });

  // ---------- your collection ----------
  const count = (n, one, many) => `${(n || 0).toLocaleString('en-GB')} ${n === 1 ? one : many}`;
  function showMe() {
    const u = me.user;
    $('book-out').hidden = true;
    $('book-in').hidden = false;
    $('book-own').hidden = false;
    $('book-name').textContent = me.other ? `${u.name}'s collection` : `${u.discord ? u.discord.name : u.username}'s collection`;
    if (me.other) { document.title = `${u.name}'s Buddy Book · Bitty Buddies`; const back = document.createElement('a'); back.href = 'buddybook.html'; back.className = 'book-mine'; back.textContent = 'See your own'; $('book-name').after(back); }
    $('book-supporter').hidden = !me.packs.has('supporter');
    const real = entries.filter(e => !e.mystery);
    const got = real.filter(owns).length;
    const bar = $('book-bar');
    bar.setAttribute('aria-valuemax', String(real.length)); bar.setAttribute('aria-valuenow', String(got));
    bar.setAttribute('aria-label', `${got} of ${real.length} collected`);
    $('book-fill').style.width = `${real.length ? Math.round(got / real.length * 100) : 0}%`;
    $('book-count').textContent = `${got} of ${real.length} collected`;
    const w = me.wallet, s = w.stats || {};
    const earned = Object.values(w.earned || {}).reduce((a, b) => a + b, 0);
    const spent = (w.owned || []).reduce((a, id) => a + (SHOP[id] ? SHOP[id].price : 0), 0);
    const stats = [
      ...(me.other ? [] : [['🪙', `${Math.max(0, earned - spent).toLocaleString('en-GB')} Buddy Bucks`]]),
      ['💤', count(s.naps, 'nap', 'naps')],
      ['⚽', count(s.balls, 'ball fetched', 'balls fetched')],
      ['⚔️', count(s.battles, 'battle won', 'battles won')]
    ];
    const ul = $('book-stats'); ul.textContent = '';
    for (const [icon, text] of stats) { const li = document.createElement('li'); const i = document.createElement('span'); i.setAttribute('aria-hidden', 'true'); i.textContent = icon; li.append(i, ' ', text); ul.appendChild(li); }
    const fresh = !w.updated && !me.other;
    if (fresh) { const li = document.createElement('li'); li.className = 'book-hint'; li.textContent = 'Sign in to the app with this account to back up your buddies here.'; ul.appendChild(li); }
  }

  // ?u=name shows another member's book (from the Members page). Otherwise it's your own.
  const other = (new URLSearchParams(location.search).get('u') || '').trim().toLowerCase();
  const keepsBuilds = (wallet, created) => wallet.keepBuilds === true
    || (wallet.keepBuilds === undefined && !!created && Date.parse(created) < BUILDS_PAID_FROM);   // older app versions don't say, so go by when the account was made
  render();
  if (other && !token()) {
    $('book-out').innerHTML = '';
    $('book-out').append('Members\u2019 collections are for signed-in members. ', Object.assign(document.createElement('a'), { href: 'account.html', textContent: 'Sign in' }), ' to see it.');
  } else if (other) {
    call(`/account/book?u=${encodeURIComponent(other)}`).then(d => {
      const wallet = d.wallet || {};
      me = { user: d.user, packs: new Set(d.packs || []), owned: new Set(wallet.owned || []), keepBuilds: keepsBuilds(wallet, d.user.created), wallet, other: true };
      render();
      showMe();
    }).catch(() => { $('book-out').textContent = 'That member\u2019s Buddy Book isn\u2019t available. They may have hidden themselves from the Members page.'; });
  } else if (token()) {
    Promise.all([call('/account/me'), call('/account/bucks')]).then(([acc, b]) => {
      const live = (acc.keys || []).filter(k => !k.revoked);
      const wallet = b.wallet || {};
      me = {
        user: acc.user,
        packs: new Set(live.flatMap(k => k.packs)),
        owned: new Set(wallet.owned || []),
        keepBuilds: keepsBuilds(wallet, acc.user.created),
        wallet
      };
      render();
      showMe();
    }).catch(() => { /* signed out or offline: the public book is still here */ });
  }
})();
