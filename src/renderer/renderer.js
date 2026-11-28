// Bitty Buddies overlay: runs the pets and builds on a transparent full-screen canvas.
// Behaviours: wander, sit, nap, climb screen edges, chase + ride the mouse, battles,
// fetch a ball, eat treats, dance parties, conga lines, emote bubbles and petting.
// Server Room kit: cables from a UPS / network cabinet, boot-up lights, faults and engineers who fix them.
(() => {
  const PX = window.BBPixel;
  const api = window.bb;
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');

  const MAX_THINGS = 40;
  const GRAVITY = 2200;
  const REG = {};            // "pack/item" -> definition
  let things = [];
  let scale = 4, hidden = false, ready = false, uidSeq = 1, mischief = true, gore = false;
  let ignoring = true, drag = null, clock = 0, windowGrab = false;
  const particles = [], battles = [], treats = [], frames = new Map(), splats = [];
  let ball = null, partyUntil = 0, conga = null;
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, t: -99, seen: false, lastT: 0 };
  const hover = { t: null, since: 0, nextHeart: 0 };

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const W = () => innerWidth, H = () => innerHeight;

  // ---------- setup ----------
  function resize() {
    const d = devicePixelRatio || 1;
    canvas.width = Math.round(innerWidth * d);
    canvas.height = Math.round(innerHeight * d);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.imageSmoothingEnabled = false;
    things.forEach(t => t.clamp());
  }
  addEventListener('resize', resize);

  function loadPacks(files) {
    return files.reduce((p, f) => p.then(() => new Promise(res => {
      const s = document.createElement('script');
      s.src = '../packs/' + f;
      s.onload = res;
      s.onerror = () => { console.error('Pack failed to load:', f); res(); };
      document.body.appendChild(s);
    })), Promise.resolve()).then(() => {
      for (const pack of window.BBPacks || [])
        for (const [key, item] of Object.entries(pack.items))
          REG[`${pack.id}/${key}`] = PX.withDefaults(item);
    });
  }

  function frameFor(t, st) {
    const key = [t.id, st.pose, st.frame, st.blink ? 1 : 0, t.dir, st.power || '', st.step || 0, st.net === false ? 0 : 1, st.seed || 0, st.alert ? 1 : 0, t.infected ? 1 : 0].join('|');
    let f = frames.get(key);
    if (!f) {
      let g = PX.drawItem(t.def, st);
      if (t.infected) g = g.map(row => row.map(zombify));
      if (t.dir < 0) g = g.map(row => row.slice().reverse());
      const oc = document.createElement('canvas');
      oc.width = t.def.w; oc.height = t.def.h;
      const o = oc.getContext('2d');
      g.forEach((row, y) => row.forEach((c, x) => { if (c) { o.fillStyle = c; o.fillRect(x, y, 1, 1); } }));
      f = { img: oc, grid: g };
      frames.set(key, f);
    }
    return f;
  }

  // ---------- Outbreak: zombies bite, bitten buddies turn green, only the Field Medic can cure them ----------
  const zcols = new Map();
  function zombify(c) {
    if (!c || c[0] !== '#' || c.length !== 7) return c;
    let z = zcols.get(c);
    if (!z) {
      const n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
      const lum = 0.3 * r + 0.59 * g + 0.11 * b;
      const hex = v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
      z = '#' + hex(lum * 0.62 + r * 0.12) + hex(lum * 0.9 + 34) + hex(lum * 0.5 + b * 0.1);
      zcols.set(c, z);
    }
    return z;
  }
  const canCatch = d => d && d.kind !== 'build' && !d.zombie && !d.immune;
  const isBiter = t => !t.isBuild && (t.def.zombie || t.infected);
  const NOBITE = ['held', 'ride', 'leap', 'carried', 'climb', 'cling', 'fly', 'winJump', 'tug', 'battle', 'conga', 'fall'];
  // Zombies get tangled up in barbed wire.
  function onWire(t) {
    const cx = t.x + t.wpx() / 2;
    const w = things.find(b => b.isBuild && b.def.slows && Math.abs(b.x + b.wpx() / 2 - cx) < b.wpx() / 2);
    if (w && Math.random() < 0.004) t.say('!', 0.8);
    return !!w;
  }
  // Soldiers and the army dog fend off a zombie that's hunting nearby.
  function defend(z) {
    const zx = z.x + z.wpx() / 2;
    const d = things.find(g => g.def.defender && !g.infected && !LOCKED.includes(g.state) && g.state !== 'sleep' &&
      Math.abs(g.x + g.wpx() / 2 - zx) < 300 * (scale / 4) && !(g.shotAt > clock - 4));
    if (!d) return false;
    d.shotAt = clock;
    const gx = d.x + d.wpx() / 2;
    d.dir = zx > gx ? 1 : -1; d.set('idle', 1.2);
    if (d.def.barks) { d.say('🐕', 1.4); d.lunge = 0.3; }
    else {
      d.say('💥', 1);
      const y0 = d.top() + d.hpx() * 0.55, y1 = z.top() + z.hpx() * 0.45;
      for (let k = 0; k < 6; k++) { const f = k / 6; puff('spark', gx + (zx - gx) * f, y0 + (y1 - y0) * f, { life: 0.12 + f * 0.1, col: '#FFE066' }); }
    }
    puff('pow', zx, z.top() + z.hpx() * 0.4, { life: 0.35 });
    bleed(zx, z.top() + z.hpx() * 0.4, d.def.barks ? 0 : 6);
    z.prey = null; z.set('dizzy', 2.4); z.say(d.def.barks ? '😱' : '💫', 1.4);
    z.x = clamp(z.x - d.dir * -1 * 3 * scale, 0, Math.max(0, W() - z.wpx()));
    return true;
  }
  // Helicopters drop a supply crate (a treat) as they fly over.
  function dropSupply(h) {
    const kinds = Object.keys(TREATS).filter(k => !TREATS[k].mitty);
    if (!kinds.length) return;
    treats.push({ kind: pick(kinds), x: clamp(h.x + h.wpx() / 2, 10, W() - 10), y: h.y, vy: 0, landed: false, claimed: null, life: 60 });
    h.say('📦', 1.4);
  }
  function findPrey(z) {
    return things.filter(p => p !== z && !p.isBuild && canCatch(p.def) && !p.infected && !NOBITE.includes(p.state) && Math.abs(p.x - z.x) < 900)
      .sort((a, b) => Math.abs(a.x - z.x) - Math.abs(b.x - z.x))[0] || null;
  }
  function findSick(m) {
    return things.filter(p => p.infected && !things.some(o => o !== m && o.patient === p && o.state === 'goCure'))
      .sort((a, b) => Math.abs(a.x - m.x) - Math.abs(b.x - m.x))[0] || null;
  }
  // Gore (off unless turned on in the tray): blood drops fly, land and leave splats that fade away.
  function bleed(x, y, n) {
    if (!gore) return;
    for (let i = 0; i < n; i++) puff('blood', x, y, { vx: rand(-110, 110), vy: rand(-180, -40), g: 900, life: 2, size: rand(0.6, 1.2) });
  }
  function splat(x, size) {
    if (!gore) return;
    splats.push({ x, w: size, born: clock, life: rand(18, 30), dots: Array.from({ length: 3 + Math.floor(size) }, () => [rand(-size, size), rand(0, 1)]) });
    if (splats.length > 80) splats.shift();
  }

  // ---------- particles ----------
  function puff(kind, x, y, extra = {}) {
    particles.push(Object.assign({ kind, x, y, vx: 0, vy: 0, g: 0, t: 0, life: 1 }, extra));
  }
  // Buddy Bucks: tell the app something worth a few Bucks happened (it applies the limits).
  function earn(kind) { if (api.earn && !hidden) api.earn(kind); }
  function coinFrom(t, n = 1) {
    if (!t) return;
    for (let i = 0; i < Math.min(5, n); i++) puff('coin', t.x + t.wpx() / 2 + rand(-6, 6), t.top() - 2, { vy: -rand(34, 48), vx: rand(-14, 14), life: 1.5 + i * 0.15 });
  }
  function heart(t) { puff('heart', t.x + t.wpx() / 2, t.top(), { vy: -32, life: 1.4 }); }
  function dust(x, y, n = 5) {
    for (let i = 0; i < n; i++) puff('dust', x, y, { vx: rand(-60, 60), vy: rand(-60, -10), life: rand(.35, .6) });
  }

  // States where a pet is doing its own thing and shouldn't be pulled into games.
  const LOCKED = ['held', 'ride', 'leap', 'climb', 'cling', 'battle', 'fall', 'dizzy', 'cheer', 'eat', 'love', 'carried', 'goGrab', 'haul', 'goWin', 'winJump', 'tug', 'goFix', 'fix', 'fly', 'cast', 'hunt', 'bite', 'goCure', 'cure'];
  const MOVERS = ['walk', 'chase', 'fetch', 'snack', 'conga', 'toWall', 'goGrab', 'haul', 'goWin', 'goFix', 'fly', 'hunt', 'goCure'];

  // ---------- things (pets + builds) ----------
  class Thing {
    constructor(id, opts = {}) {
      this.uid = uidSeq++;
      this.id = id;
      this.def = REG[id];
      this.hat = opts.hat && OUTFITS[opts.hat] ? opts.hat : null;
      this.isBuild = this.def.kind === 'build';
      this.dir = this.isBuild ? 1 : (Math.random() < 0.5 ? 1 : -1);
      const w = this.wpx();
      this.x = typeof opts.x === 'number' ? opts.x * (W() - w) : rand(20, Math.max(21, W() - w - 20));
      this.y = -rand(20, 200);           // y = feet position; spawn above the screen and drop in
      this.vx = 0; this.vy = 0;
      this.state = 'fall'; this.timer = 0;
      this.frame = 0; this.animT = rand(0, 0.3);
      this.blink = false; this.blinkT = rand(1, 5);
      this.hop = 0; this.zT = 0; this.crumbT = 0;
      this.bubble = null; this.target = null;
      this.side = 0; this.cy = 0; this.climbTo = 0;
      this.lunge = 0; this.knockT = 0; this.offX = 0;
      this.carry = null; this.goal = 0; this.carrier = null; this.win = null;
      this.job = null;                          // engineers: the kit they're off to fix
      this.infected = !!opts.zombie && canCatch(this.def);   // bitten by a zombie (stays that way until the medic cures it)
      this.prey = null; this.patient = null; this.dripT = rand(0.5, 2);
      if (this.def.power === 'device') {        // Server Room kit starts unplugged
        this.power = 'off'; this.bootT = 0; this.faultT = rand(60, 150); this.pwr = null; this.lan = null; this.fixer = null;
      }
    }
    wpx() { return this.def.w * scale; }
    hpx() { return this.def.h * scale; }
    walkSpeed() { return this.def.speed * (scale / 4) * (this.infected ? 0.6 : 1) * (isBiter(this) && onWire(this) ? 0.3 : 1); }
    runSpeed() { return Math.max(70, this.def.speed * 2.4) * (scale / 4); }
    clamp() {
      if (['climb', 'cling', 'ride'].includes(this.state)) return;
      this.x = clamp(this.x, 0, Math.max(0, W() - this.wpx()));
      if (this.state !== 'held' && this.y > H()) this.y = H();
    }
    moving() { return MOVERS.includes(this.state); }
    bounce() {
      let b = 0;
      if (this.def.move === 'hop' && this.moving()) b = -Math.abs(Math.sin(this.hop * Math.PI)) * 5 * scale;
      if (this.state === 'dance') b = -Math.abs(Math.sin((clock + this.uid * 0.13) * Math.PI * 2)) * 3 * scale;
      if (this.state === 'cheer') b = -Math.abs(Math.sin(clock * Math.PI * 3)) * 5 * scale;
      if (this.knockT > 0) b -= Math.sin((this.knockT / 0.25) * Math.PI) * 3 * scale;
      return b;
    }
    top() { return this.y - this.def.feet * scale + this.bounce(); }
    spriteState() {
      if (this.isBuild) {
        const st = { pose: 'idle', frame: this.frame, blink: false };
        if (this.def.power === 'device') Object.assign(st, { power: this.power, step: this.power === 'boot' ? Math.min(5, Math.floor(this.bootT / 0.45)) : 0, net: this.def.network === 'device' ? !!(this.lan && this.lan.prog >= 1) : true, seed: this.uid % 5 });
        if (this.def.glow && things.some(k => k.power === 'fault')) st.alert = true;
        return st;
      }
      let pose = 'idle', frame = this.frame, blink = this.blink;
      if (this.moving() || this.state === 'climb' || this.state === 'dance' || this.lunge > 0) pose = 'walk';
      if (['sit', 'eat', 'dizzy'].includes(this.state)) pose = 'sit';
      if (this.state === 'sleep') pose = 'sleep';
      if (this.state === 'love') pose = 'sit';
      const own = this.def.poses || [];              // some pets have their own poses (Mitty's eat and love)
      if (own.includes(this.state)) pose = this.state;
      if (this.state === 'fly' && own.includes('fly')) { pose = 'fly'; frame = this.frame; }
      if (this.state === 'cast' && own.includes('cast')) { pose = 'cast'; frame = this.timer < 1.0 ? 1 : 0; }
      if (this.state === 'fix') pose = 'fix';
      if (this.state === 'bite') { pose = 'walk'; frame = 1; }
      if (this.state === 'cure') pose = 'idle';
      if (this.state === 'dizzy') blink = true;
      if (this.def.move === 'hop' && this.moving()) frame = Math.abs(Math.sin(this.hop * Math.PI)) < 0.25 ? 1 : 0;
      if (['fall', 'held', 'ride', 'leap', 'cling', 'winJump', 'tug'].includes(this.state)) frame = 0;
      if (this.lunge > 0) frame = 1;
      return { pose, frame, blink };
    }
    say(icon, dur = 1.6) { this.bubble = { icon, until: clock + dur }; }
    set(state, dur) {
      if (this.carry && state !== 'goGrab' && state !== 'haul') {   // interrupted mid-carry: let go
        const c = this.carry;
        this.carry = null;
        if (c.kind === 'treat' && c.obj.claimed === this) { c.obj.claimed = null; c.obj.carried = false; c.obj.landed = false; }
        if (c.kind === 'ball' && c.obj.carrier === this) c.obj.carrier = null;
      }
      if (this.target && this.target.claimed === this) this.target.claimed = null;
      this.target = null;
      // Buddy Bucks: a proper nap (not a doze that was interrupted straight away) earns a little.
      if (this.state === 'sleep' && state !== 'sleep' && clock - (this.sleptAt || clock) > 5) earn('nap');
      if (state === 'sleep' && this.state !== 'sleep') this.sleptAt = clock;
      this.state = state;
      this.timer = dur != null ? dur : rand(2, 6);
      if (state === 'walk' && Math.random() < 0.5) this.dir *= -1;
    }
    nearBuild() {
      const cx = this.x + this.wpx() / 2;
      return things.find(b => b.isBuild && Math.abs(b.x + b.wpx() / 2 - cx) < b.wpx() / 2 + 8 * scale);
    }
    next() {
      if (this.isBuild) { this.state = 'rest'; return; }
      // Treats and balls are irresistible.
      const tr = nearestTreat(this);
      if (tr && Math.random() < 0.85) { this.set('snack', 14); this.target = tr; tr.claimed = this; return; }
      if (ball && Math.random() < 0.6) return this.set('fetch', rand(5, 9));
      if (this.def.fixer) {                     // something's broken? an engineer's on it
        const broken = things.find(k => k.power === 'fault' && (!k.fixer || !things.includes(k.fixer) || k.fixer.job !== k));
        if (broken) { this.set('goFix', 25); this.job = broken; broken.fixer = this; this.say('!', 1.2); return; }
      }

      if (this.def.curer) {                     // someone's been bitten? the medic's on it
        const sick = findSick(this);
        if (sick) { this.set('goCure', 30); this.patient = sick; this.say('!', 1.2); return; }
      }
      if (mischief && isBiter(this) && Math.random() < (this.def.zombie ? 0.35 : 0.25)) {
        const prey = findPrey(this);
        if (prey) { this.set('hunt', 20); this.prey = prey; this.say('🧠', 1.6); return; }
      }
      if (this.infected && Math.random() < 0.2) this.say(pick(['🧠', '…']), 1.6);

      if (this.def.flies && Math.random() < (this.def.vehicle ? 0.45 : 0.18)) return startFly(this);        // the witch takes to the sky
      if (this.def.caster && Math.random() < 0.16) return this.set('cast', 1.8); // the wizard casts a spell

      const r = Math.random();
      if (this.nearBuild() && r < 0.5) return this.set(Math.random() < 0.5 ? 'sit' : 'sleep', rand(6, 14));
      if (mischief && !this.def.vehicle) {
        if (r < 0.08 && mouse.seen && clock - mouse.t < 5) { this.say('!'); return this.set('chase', rand(5, 9)); }
        if (r < 0.13) { this.dir = this.x < W() / 2 ? -1 : 1; return this.set('toWall', 15); }
        if (r < 0.19 && startGrab(this)) return;
        if (r < 0.215 && windowGrab && !things.some(o => o.win)) { startWindowTug(this); if (this.win) return; }
      }
      if (r < 0.5) this.set('walk', rand(2, 7));
      else if (r < 0.72) {
        this.set('idle', rand(2, 5));
        if (this.def.favourite && Math.random() < 0.3) this.say(pick(['🍫', '🍬']), 2.2);   // Mitty hinting for a treat
        else if (Math.random() < 0.25) this.say(pick(['?', '♪', '❤']));
      }
      else if (r < 0.88) this.set('sit', rand(3, 8));
      else this.set('sleep', rand(8, 16));
    }
    startClimb(side) {
      this.state = 'climb';
      this.side = side;                       // -1 left wall, 1 right wall
      this.dir = side < 0 ? -1 : 1;           // with the rotation below this faces "up" the wall
      this.cy = H() - this.wpx() / 2 - scale;
      this.climbTo = H() * rand(0.2, 0.6);
      this.say('!', 1);
    }
    update(dt) {
      this.animT += dt;
      const rate = this.isBuild ? 0.35 : this.state === 'chase' ? 0.11 : (this.moving() || this.state === 'climb' || this.state === 'dance') ? 0.18 : 0.5;
      if (this.animT > rate) { this.animT = 0; this.frame ^= 1; }
      if (!this.isBuild) {
        this.blinkT -= dt;
        if (this.blinkT <= 0) { this.blink = !this.blink; this.blinkT = this.blink ? 0.15 : rand(2, 6); }
      }
      if (this.bubble && clock > this.bubble.until) this.bubble = null;
      if (this.lunge > 0) this.lunge = Math.max(0, this.lunge - dt);
      if (this.knockT > 0) this.knockT = Math.max(0, this.knockT - dt);
      this.offX = this.lunge > 0 ? this.dir * Math.sin((1 - this.lunge / 0.3) * Math.PI) * 3 * scale : 0;

      const ground = H(), maxX = Math.max(0, W() - this.wpx());
      const S = this.state;

      if (S === 'carried') {
        const c = this.carrier;
        if (!c || !things.includes(c) || c.state !== 'haul' || !c.carry || c.carry.obj !== this) { this.carrier = null; this.vy = 0; this.vx = 0; this.state = 'fall'; }
        return;
      }
      if (this.win && !this.win.pending && !['goWin', 'winJump', 'tug'].includes(S)) { api.releaseWindow(); this.win = null; }
      if (S === 'held' || S === 'battle' || S === 'conga') return;
      if (gore && isBiter(this) && this.moving() && this.y >= H() - 1) {   // zombies leave a drippy trail
        this.dripT -= dt;
        if (this.dripT <= 0) { this.dripT = rand(0.6, 1.6); splat(this.x + this.wpx() * (this.dir > 0 ? 0.3 : 0.7), rand(0.8, 1.6) * scale); }
      }
      if (S === 'hunt' || S === 'goCure' || S === 'bite' || S === 'cure') return outbreakStep(this, dt);

      if (S === 'goWin') {                     // run to just under the window's bottom edge
        const w = this.win;
        if (!w) return this.next();
        this.timer -= dt;
        const dx = w.gx - this.x;
        if (Math.abs(dx) > 2 * scale) { this.dir = Math.sign(dx); this.x += this.dir * this.runSpeed() * dt; }
        else {
          this.vy = -Math.sqrt(2 * GRAVITY * (ground - w.hangY)) * 1.12;
          this.state = 'winJump';
          dust(this.x + this.wpx() / 2, ground, 4);
        }
        if (this.timer <= 0) { this.win = null; api.releaseWindow(); this.next(); }
        return;
      }
      if (S === 'winJump') {
        const w = this.win;
        this.vy += GRAVITY * dt;
        this.y += this.vy * dt;
        if (w && (this.y <= w.hangY || (this.vy >= 0 && this.y <= w.hangY + 4 * scale))) { // caught the edge!
          this.y = w.hangY; this.vy = 0;
          this.state = 'tug'; this.timer = rand(1.6, 3.2);
          const roomR = W() - (w.rect.x + w.rect.width), roomL = w.rect.x;
          w.dir = roomR > roomL ? 1 : -1;
          w.room = Math.max(0, Math.min(w.dir > 0 ? roomR : roomL, 420));
          this.dir = w.dir;
          this.say('!', 1);
        } else if (this.y >= ground) { this.y = ground; this.vy = 0; this.win = null; api.releaseWindow(); this.say('?', 1.2); this.next(); }
        return;
      }
      if (S === 'tug') {                       // hanging off the window, dragging it along
        const w = this.win;
        if (!w) { this.state = 'fall'; return; }
        this.timer -= dt;
        const step = Math.min(160 * (scale / 4) * dt, w.room - Math.abs(w.offset));
        if (step > 0) {
          w.offset += w.dir * step;
          this.x += w.dir * step;
          if (!w.busy) {
            w.busy = true;
            api.moveWindow(w.offset).then(ok => { w.busy = false; if (!ok && this.win === w) { this.win = null; this.state = 'fall'; this.say('!', 1); } });
          }
        }
        this.y = w.hangY + Math.sin(clock * 12) * scale * 0.6;   // little wiggle while pulling
        if (this.timer <= 0 || step <= 0) {
          api.moveWindow(w.offset).finally(() => api.releaseWindow());
          this.win = null; this.y = w.hangY; this.vy = 0; this.vx = w.dir * 120;
          this.state = 'fall'; this.say(pick(['♪', '❤']), 1.4);
        }
        return;
      }

      if (S === 'ride') {                      // dangling from the mouse pointer
        this.x = mouse.x - this.wpx() / 2;
        this.y = mouse.y + scale + this.def.feet * scale;
        if (Math.abs(mouse.vx) > 40) this.dir = mouse.vx > 0 ? -1 : 1; // swings behind the cursor
        this.timer -= dt;
        const speed = Math.hypot(mouse.vx, mouse.vy);
        if (this.timer <= 0 || speed > 2600) {
          this.vx = clamp(mouse.vx * 0.5, -900, 900);
          this.vy = clamp(mouse.vy * 0.5, -800, 800);
          this.state = 'fall';
          this.say(speed > 2600 ? '!' : '❤', 1.2);
        }
        return;
      }

      if (S === 'fall' || S === 'leap') {
        this.vy += GRAVITY * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < 0) { this.x = 0; this.vx = -this.vx * 0.5; }
        if (this.x > maxX) { this.x = maxX; this.vx = -this.vx * 0.5; }
        if (S === 'leap' && mouse.seen && !things.some(o => o.state === 'ride')) { // grab the cursor mid-air (one rider at a time)
          const d = Math.hypot(this.x + this.wpx() / 2 - mouse.x, this.top() + 2 * scale - mouse.y);
          if (d < 9 * scale) { this.state = 'ride'; this.timer = rand(3, 6); this.say('❤', 1.4); heart(this); return; }
        }
        if (this.y >= ground) {
          this.y = ground;
          if (this.vy > 700) { this.vy = -this.vy * 0.3; this.vx *= 0.6; }
          else {
            this.vy = 0; this.vx = 0;
            if (S === 'leap' && this.timer > 0) this.state = 'chase';
            else this.next();
          }
        }
        return;
      }

      if (S === 'fly') {
        this.timer -= dt;
        const air = this.timer > 0;
        if (air) {
          this.x += this.dir * this.runSpeed() * 0.75 * dt;
          if (this.x <= 0 || this.x >= maxX) { this.x = clamp(this.x, 0, maxX); this.dir = -this.dir; }
          if (Math.random() < dt * 0.6) this.flyY = ground - rand(50, Math.min(260, ground * 0.5));   // swoop up or down now and then
          const want = this.flyY + Math.sin(clock * 2.4 + this.uid) * 6 * scale;
          this.y += (want - this.y) * Math.min(1, dt * 1.6);
          if (this.def.drops && Math.random() < dt * 0.12) dropSupply(this);
          if (!this.def.vehicle && Math.random() < dt * 14) puff('spark', this.x + (this.dir > 0 ? 0 : this.wpx()), this.y - 3 * scale, { vy: rand(-10, 30), vx: -this.dir * rand(20, 60), life: rand(0.4, 0.8), col: pick(['#B67CF0', '#FFD84A', '#E7D6FF']) });
        } else {                                                  // glide down to land
          this.x += this.dir * this.runSpeed() * 0.5 * dt;
          this.x = clamp(this.x, 0, maxX);
          this.y = Math.min(ground, this.y + 140 * (scale / 4) * dt);
          if (this.y >= ground) { this.y = ground; dust(this.x + this.wpx() / 2, ground, 4); this.next(); }
        }
        return;
      }

      if (S === 'cast') {
        if (!this.aimed) {                                          // turn to face the nearest buddy first
          this.aimed = true;
          const near = pets(false).filter(p => p !== this).sort((a, b) => Math.abs(a.x - this.x) - Math.abs(b.x - this.x))[0];
          if (near) this.dir = Math.sign(near.x - this.x) || this.dir;
        }
        this.timer -= dt;
        if (!this.casted && this.timer < 1.0) { this.casted = true; castOrb(this); }
        if (this.timer <= 0) { this.casted = false; this.aimed = false; this.next(); }
        return;
      }

      if (S === 'climb') {
        this.cy -= this.walkSpeed() * 0.8 * dt;
        if (this.cy <= this.climbTo) { this.state = 'cling'; this.timer = rand(1.5, 3); this.say(pick(['!', '♪', '❤'])); }
        return;
      }
      if (S === 'cling') {
        this.timer -= dt;
        if (this.timer <= 0) {                // jump off the wall
          this.x = this.side < 0 ? 4 * scale : W() - this.wpx() - 4 * scale;
          this.y = this.cy + this.wpx() / 2;
          this.vx = -this.side * rand(250, 420);
          this.vy = -rand(150, 350);
          this.dir = -this.side;
          this.state = 'fall';
        }
        return;
      }

      if (this.y < ground - 1 && !this.isBuild) { this.vy = 0; this.state = 'fall'; return; } // screen got taller
      if (this.isBuild) return;

      if (S === 'walk') {
        this.x += this.dir * this.walkSpeed() * dt;
        if (this.x <= 0) { this.x = 0; this.dir = 1; } else if (this.x >= maxX) { this.x = maxX; this.dir = -1; }
      } else if (S === 'toWall') {
        this.x += this.dir * this.walkSpeed() * 1.6 * dt;
        if (this.x <= 0) return this.startClimb(-1);
        if (this.x >= maxX) return this.startClimb(1);
      } else if (S === 'chase') {
        if (!mouse.seen || clock - mouse.t > 6) return this.next();
        const dx = mouse.x - (this.x + this.wpx() / 2);
        if (Math.abs(dx) > 3 * scale) { this.dir = Math.sign(dx); this.x += this.dir * this.runSpeed() * dt; }
        const reachable = mouse.y < ground && ground - mouse.y < 34 * scale;
        if (Math.abs(dx) < 10 * scale && reachable && Math.random() < dt * 3) {
          // Aim so the pet's head peaks right at the pointer.
          const rise = Math.max(3 * scale, this.y - this.def.feet * scale - mouse.y + scale);
          this.vy = -Math.min(1400, Math.sqrt(2 * GRAVITY * rise));
          this.vx = dx / Math.max(0.12, -this.vy / GRAVITY);
          this.state = 'leap';
          dust(this.x + this.wpx() / 2, ground, 4);
        } else if (!reachable && Math.abs(dx) < 4 * scale && !this.bubble) this.say('?', 1.2);
      } else if (S === 'fetch') {
        if (!ball) return this.next();
        const dx = ball.x - (this.x + this.wpx() / 2);
        if (Math.abs(dx) > 2 * scale) { this.dir = Math.sign(dx); this.x += this.dir * this.runSpeed() * dt; }
        if (Math.abs(dx) < this.wpx() / 2 && ball.y > ground - 14 * scale) {
          ball.vx = this.dir * rand(350, 700);
          ball.vy = -rand(350, 750);
          dust(ball.x, ground, 3);
          if (Math.random() < 0.3) this.say('♪', 1);
        }
      } else if (S === 'snack') {
        const tr = this.target;
        if (!tr || !treats.includes(tr)) return this.next();
        const dx = tr.x - (this.x + this.wpx() / 2);
        if (Math.abs(dx) < 3 * scale && tr.landed) { this.state = 'eat'; this.timer = 1.8; this.dir = dx >= 0 ? 1 : -1; return; }
        if (Math.abs(dx) > scale) { this.dir = Math.sign(dx); this.x += this.dir * this.runSpeed() * 0.8 * dt; }
      } else if (S === 'eat') {
        this.crumbT -= dt;
        if (this.crumbT <= 0) {
          this.crumbT = 0.22;
          const tx = this.x + this.wpx() / 2 + this.dir * 4 * scale;
          const crumbs = (this.target && TREATS[this.target.kind] && TREATS[this.target.kind].crumbs) || ['#D9A35B', '#6B4423', '#F3E2C3'];
          puff('crumb', tx, ground - 3 * scale, { vx: rand(-80, 80), vy: rand(-220, -120), g: 1400, life: 0.5, col: pick(crumbs) });
        }
        this.timer -= dt;
        if (this.timer <= 0) {
          const tr = this.target;
          const i = treats.indexOf(tr);
          if (i >= 0) treats.splice(i, 1);
          const special = tr && tr.forUid === this.uid;
          this.target = null;
          if (special) {
            // A treat just for her: a happy little moment with a burst of hearts.
            this.set('love', rand(3, 4.5));
            for (let k = 0; k < 4; k++) setTimeout(() => { if (things.includes(this)) heart(this); }, k * 350);
            this.say(pick(['❤', '😋', 'prr']), 2);
          } else {
            heart(this); this.say('❤', 1.2);
            this.set('sit', rand(2, 4));
          }
        }
        return;
      } else if (S === 'love') {
        this.crumbT -= dt;
        if (this.crumbT <= 0) { this.crumbT = 0.7; heart(this); }
      } else if (S === 'goGrab' || S === 'haul') {
        if (!carryStillValid(this)) { this.carry = null; return this.next(); }
        const tx = S === 'goGrab' ? carryX(this.carry) : this.goal + this.wpx() / 2;
        const dx = tx - (this.x + this.wpx() / 2);
        if (Math.abs(dx) > 2 * scale) {
          this.dir = Math.sign(dx);
          this.x += this.dir * (S === 'goGrab' ? this.runSpeed() : this.walkSpeed() * 1.2) * dt;
        }
        if (S === 'goGrab' && Math.abs(dx) < Math.max(3 * scale, this.wpx() / 4)) pickUp(this);
        else if (S === 'haul' && (Math.abs(dx) <= 2 * scale || this.timer < 0.1)) { putDown(this); return; }
      } else if (S === 'goFix' || S === 'fix') {
        const k = this.job;
        if (!k || !things.includes(k) || k.power !== 'fault') { this.job = null; return this.next(); }
        const spot = k.x + k.wpx() / 2 + (this.x + this.wpx() / 2 < k.x + k.wpx() / 2 ? -1 : 1) * (k.wpx() / 2 + this.wpx() * 0.3);
        const dx = spot - (this.x + this.wpx() / 2);
        if (S === 'goFix') {
          if (Math.abs(dx) > 2 * scale) { this.dir = Math.sign(dx); this.x += this.dir * this.runSpeed() * dt; }
          else { this.state = 'fix'; this.timer = rand(3, 4.5); this.dir = Math.sign(k.x + k.wpx() / 2 - (this.x + this.wpx() / 2)) || 1; }
        } else {
          this.sparkT = (this.sparkT || 0) - dt;
          if (this.sparkT <= 0) { this.sparkT = 0.18; sparks(this.x + this.wpx() / 2 + this.dir * this.wpx() * 0.45, this.top() + 6 * scale, 3); }
          if (this.timer - dt <= 0) {           // fixed! reboot it
            k.power = 'boot'; k.bootT = 0; k.faultT = rand(60, 150); k.fixer = null; k.bubble = null;
            this.job = null; heart(this); this.say('❤', 1.4); this.set('cheer', 1.2); return;
          }
        }
      } else if (S === 'dance') {
        this.dir = (Math.floor(clock * 2) + this.uid) % 2 ? 1 : -1;
      } else if (S === 'sleep') {
        this.zT -= dt;
        if (this.zT <= 0) {
          this.zT = 1.3;
          puff('z', this.x + this.wpx() * (this.dir > 0 ? 0.65 : 0.35), this.top() + 2 * scale, { vy: -18, life: 2.2 });
        }
      }
      this.x = clamp(this.x, 0, maxX);
      this.timer -= dt;
      if (this.timer <= 0) this.next();
    }
  }

  // ---------- Server Room kit: cables, boot-up, faults ----------
  // A UPS powers kit near it; a powered network cabinet links racks and storage near it.
  // Cables snake out along the floor, the kit boots up, and now and then something breaks.
  const REACH = 70;                            // in sprite pixels, so it scales with the size setting
  function sparks(x, y, n = 4) {
    for (let i = 0; i < n; i++) puff('spark', x, y, { vx: rand(-90, 90), vy: rand(-160, -40), g: 600, life: rand(.25, .45), col: pick(['#FFE066', '#FFFFFF', '#FFB43C']) });
  }
  function smoke(t) {
    puff('smoke', t.x + rand(0.2, 0.8) * t.wpx(), t.top() + 2 * scale, { vx: rand(-8, 8), vy: rand(-30, -18), life: rand(1.4, 2.2) });
  }
  const mid = t => t.x + t.wpx() / 2;
  const portX = (t, key) => t.x + (t.dir < 0 ? t.def.w - 1 - (t.def[key] ?? t.def.w / 2) : (t.def[key] ?? t.def.w / 2)) * scale + scale / 2;
  function nearestSource(d, test, maxEach) {
    let best = null, bd = Infinity;
    for (const s of things) {
      if (s === d || !test(s)) continue;
      const dist = Math.abs(mid(s) - mid(d));
      if (dist > REACH * scale || dist >= bd) continue;
      const used = things.filter(o => o !== d && ((o.pwr && o.pwr.src === s) || (o.lan && o.lan.src === s))).length;
      if (used >= maxEach) continue;
      best = s; bd = dist;
    }
    return best;
  }
  function link(d, key, src, dt, onDone, onCut) {
    let c = d[key];
    if (c && c.src !== src && c.prog > 0) { c.prog -= dt / 0.35; if (c.prog <= 0) { d[key] = null; onCut && onCut(); } return; } // pull the old one back first
    if (!src) { if (c) { c.prog -= dt / 0.35; if (c.prog <= 0) { d[key] = null; onCut && onCut(); } } return; }
    if (!c || c.src !== src) c = d[key] = { src, prog: 0 };
    if (c.prog < 1) { c.prog = Math.min(1, c.prog + dt / 0.8); if (c.prog >= 1) { sparks(portX(d, key === 'pwr' ? 'port' : 'lan'), H() - scale, 6); onDone && onDone(); } }
  }
  function updateKit(dt) {
    for (const d of things) {
      if (d.def.power !== 'device') continue;
      const ups = d.state === 'held' ? null : nearestSource(d, s => s.def.power === 'source', 8);
      link(d, 'pwr', ups, dt,
        () => { if (d.power === 'off') { d.power = 'boot'; d.bootT = 0; } },
        () => { d.power = 'off'; d.bubble = null; });
      if (!d.pwr || d.pwr.prog < 1) { if (d.power !== 'off' && !d.pwr) d.power = 'off'; }
      if (d.def.network === 'device') {
        const sw = d.state === 'held' ? null : nearestSource(d, s => s.def.network === 'source' && s.power === 'on', 12);
        link(d, 'lan', sw, dt);
      }
      if (d.power === 'boot') {
        d.bootT += dt;
        if (d.bootT >= 2.7) { d.power = 'on'; d.faultT = rand(60, 150); }
      } else if (d.power === 'on') {
        d.faultT -= dt;
        if (d.faultT <= 0 && !things.some(k => k.power === 'fault')) breakKit(d);
        else if (d.faultT <= 0) d.faultT = rand(20, 60);
      } else if (d.power === 'fault') {
        if (!d.fixer || !things.includes(d.fixer) || d.fixer.job !== d) callEngineer(d);
        d.smokeT = (d.smokeT || 0) - dt;
        if (d.smokeT <= 0) { d.smokeT = 0.35; smoke(d); }
        if (!d.bubble) d.say('!', 4);
      }
    }
  }
  // The nearest engineer who isn't busy drops what they're doing (even a nap) and heads over.
  function callEngineer(d) {
    const free = things.filter(e => e.def.fixer && !e.job && ['idle', 'walk', 'sit', 'sleep', 'fall'].includes(e.state) && e.y >= H() - 1);
    if (!free.length) return;
    const e = free.sort((a, b) => Math.abs(mid(a) - mid(d)) - Math.abs(mid(b) - mid(d)))[0];
    e.set('goFix', 25); e.job = d; d.fixer = e; e.say('!', 1.2);
  }
  function breakKit(d) {
    if (!d || d.power !== 'on') return false;
    d.power = 'fault'; d.fixer = null; d.say('!', 4); sparks(mid(d), d.top() + d.hpx() / 2, 10);
    return true;
  }
  // A cable along the floor: out of one box, droops to the ground, into the other. Drawn in chunky pixels.
  function drawCable(a, b, prog, colour, lift) {
    const px = Math.max(2, Math.round(scale * 0.75));
    const ay = H() - lift * scale, by = H() - lift * scale, fy = H() - px;
    const len = Math.abs(b - a) + 2 * (fy - ay);
    const n = Math.max(2, Math.ceil(len / px * prog));
    ctx.fillStyle = colour;
    for (let i = 0; i <= n; i++) {
      const u = i / Math.max(1, len / px);
      if (u > prog) break;
      const t = u;
      const x = a + (b - a) * t;
      const y = Math.min(fy, ay + (fy - ay) * Math.min(1, Math.sin(Math.PI * t) * 3));
      ctx.fillRect(Math.round(x - px / 2), Math.round(y - px / 2), px, px);
    }
  }
  function drawCables() {
    for (const d of things) {
      if (d.pwr) drawCable(portX(d.pwr.src, 'port'), portX(d, 'port'), d.pwr.prog, '#15171C', 2);
      if (d.lan) drawCable(portX(d.lan.src, 'lan'), portX(d, 'lan'), d.lan.prog, '#3C74E0', 3);
    }
  }

  // Zombie chases its prey and bites; the medic runs to a bitten buddy and cures them.
  function outbreakStep(t, dt) {
    const S = t.state;
    t.timer -= dt;
    if (S === 'bite' || S === 'cure') {
      const p = S === 'bite' ? t.prey : t.patient;
      if (!t.done && t.timer < (S === 'bite' ? 0.5 : 0.6)) {
        t.done = true;
        if (p && things.includes(p)) {
          const px = p.x + p.wpx() / 2;
          if (S === 'bite' && canCatch(p.def) && !p.infected) {
            t.lunge = 0.3; t.say('😋', 1.4);
            p.infected = true; p.say('🧟', 2.2);
            for (let k = 0; k < 8; k++) puff('spark', px, p.top() + p.hpx() * 0.4, { vx: rand(-90, 90), vy: rand(-110, -20), g: 200, life: 0.7, col: pick(['#8DB87A', '#B8E08A', '#6A9258']) });
            bleed(px, p.top() + p.hpx() * 0.4, 12); splat(px, rand(2.5, 4) * scale);
            report();
          } else if (S === 'cure' && p.infected) {
            p.infected = false; heart(p); p.say('❤', 1.8); t.say('💉', 1.4);
            for (let k = 0; k < 8; k++) puff('spark', px, p.top() + p.hpx() * 0.3, { vx: rand(-80, 80), vy: rand(-120, -30), g: 150, life: 0.8, col: pick(['#FFFFFF', '#FF7A8A', '#7FE8FF']) });
            report();
          }
        }
      }
      if (t.timer <= 0) { t.done = false; t.prey = null; t.patient = null; t.set(S === 'cure' ? 'cheer' : 'idle', S === 'cure' ? 1.4 : 1.5); }
      return;
    }
    const tgt = S === 'hunt' ? t.prey : t.patient;
    const ok = tgt && things.includes(tgt) && (S === 'hunt' ? !tgt.infected && canCatch(tgt.def) && !NOBITE.includes(tgt.state) : tgt.infected);
    if (!ok || t.timer <= 0) { t.prey = null; t.patient = null; return t.next(); }
    if (S === 'hunt' && Math.random() < dt * 0.9 && defend(t)) return;
    const dx = (tgt.x + tgt.wpx() / 2) - (t.x + t.wpx() / 2);
    const reach = (t.wpx() + tgt.wpx()) / 2 - 5 * scale;
    if (Math.abs(dx) > Math.max(2 * scale, reach)) {
      t.dir = Math.sign(dx) || 1;
      t.x = clamp(t.x + t.dir * (S === 'hunt' ? t.walkSpeed() * 1.7 : t.runSpeed()) * dt, 0, Math.max(0, W() - t.wpx()));
      if (S === 'hunt' && Math.abs(dx) < 150 * (scale / 4) && !(tgt.fleeing > clock) && !LOCKED.includes(tgt.state) && tgt.state !== 'sleep') {
        tgt.fleeing = clock + 5;                 // spotted it! run away
        tgt.say('😱', 1.4); tgt.set('walk', rand(1.5, 3)); tgt.dir = Math.sign(dx) || 1;
      }
      return;
    }
    t.dir = Math.sign(dx) || t.dir;
    t.done = false;
    if (S === 'hunt') { t.state = 'bite'; t.timer = 1; tgt.set('dizzy', 2.6); tgt.dir = -t.dir; }
    else { t.state = 'cure'; t.timer = 1.6; tgt.set('sit', 2.4); }
  }

  // ---------- games ----------
  const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

  function pets(filterFree = true) {
    return things.filter(t => !t.isBuild && (!filterFree || !LOCKED.includes(t.state)));
  }

  function startBattle(a, b) {
    if (!a || !b || a === b || a.isBuild || b.isBuild) return false;
    if (LOCKED.includes(a.state) || LOCKED.includes(b.state)) return false;
    for (const t of [a, b]) { t.set('battle', 99); t.say('!', 1.2); }
    battles.push({ a, b, phase: 'approach', t: 0, hits: 0, max: 3 + Math.floor(Math.random() * 3), turn: Math.random() < 0.5 ? a : b, impact: null });
    return true;
  }

  function updateBattles(dt) {
    for (let i = battles.length - 1; i >= 0; i--) {
      const B = battles[i], { a, b } = B;
      if (!things.includes(a) || !things.includes(b) || a.state !== 'battle' || b.state !== 'battle') {
        for (const t of [a, b]) if (t.state === 'battle') t.next();
        battles.splice(i, 1);
        continue;
      }
      const ca = a.x + a.wpx() / 2, cb = b.x + b.wpx() / 2;
      a.dir = cb >= ca ? 1 : -1; b.dir = -a.dir;
      if (B.phase === 'approach') {
        const gap = (a.wpx() + b.wpx()) / 2 - 3 * scale;
        if (Math.abs(cb - ca) > gap) {
          for (const t of [a, b]) {
            t.x += t.dir * t.runSpeed() * 0.7 * dt;
            t.animT += dt; if (t.animT > 0.15) { t.animT = 0; t.frame ^= 1; }
          }
          B.t += dt;
          if (B.t > 12) { a.next(); b.next(); battles.splice(i, 1); }
        } else { B.phase = 'fight'; B.t = 0.35; }
      } else {
        B.t -= dt;
        if (B.t <= 0) {
          if (B.hits >= B.max) {
            const loser = Math.random() < 0.5 ? a : b, winner = loser === a ? b : a;
            loser.set('dizzy', 3.2);
            winner.set('cheer', 2.6);
            earn('battle');
            puff('crown', winner.x + winner.wpx() / 2, winner.top() - 2 * scale, { vy: -12, life: 2.4 });
            battles.splice(i, 1);
            continue;
          }
          const att = B.turn, def = att === a ? b : a;
          att.lunge = 0.3;
          B.impact = { t: 0.15, att, def };
          B.turn = def; B.hits++; B.t = 0.6;
        }
        if (B.impact) {
          B.impact.t -= dt;
          if (B.impact.t <= 0) {
            const { att, def } = B.impact;
            B.impact = null;
            const mx = (att.x + att.wpx() / 2 + def.x + def.wpx() / 2) / 2;
            puff('pow', mx, H() - def.hpx() * 0.55, { life: 0.35 });
            dust(def.x + def.wpx() / 2, H(), 4);
            def.x += att.dir * 2 * scale;
            def.knockT = 0.25;
          }
        }
      }
      for (const t of [a, b]) t.x = clamp(t.x, 0, Math.max(0, W() - t.wpx()));
    }
  }

  function throwBall() {
    ball = { x: rand(0.2, 0.8) * W(), y: -20, vx: rand(-200, 200), vy: 0, life: 45 };
    pets().forEach(p => { p.say('!', 1); p.set('fetch', rand(6, 10)); });
  }
  function updateBall(dt) {
    if (!ball) return;
    const r = 3 * scale, floor = H() - r;
    if (ball.held || ball.carrier) return;
    ball.vy += 1800 * dt; ball.x += ball.vx * dt; ball.y += ball.vy * dt;
    if (ball.y > floor) {
      ball.y = floor;
      if (ball.vy > 120) ball.vy = -ball.vy * 0.55; else ball.vy = 0;
      ball.vx *= Math.max(0, 1 - 2 * dt);
    }
    if (ball.x < r) { ball.x = r; ball.vx = -ball.vx * 0.7; }
    if (ball.x > W() - r) { ball.x = W() - r; ball.vx = -ball.vx * 0.7; }
    ball.life -= dt;
    if (ball.life <= 0) { dust(ball.x, ball.y, 8); ball = null; }
  }

  const TREATS = {
    cookie: { rows: ['.CCCC.', 'CCDCCC', 'CCCCDC', 'CDCCCC', 'CCCDCC', '.CCCC.'], cols: { C: '#D9A35B', D: '#6B4423' } },
    bone: { rows: ['WW....WW', 'WWWWWWWW', 'WWWWWWWW', 'WW....WW'], cols: { W: '#F3EFE6' } },
    fish: { rows: ['..BBB..B', '.BBBBBBB', 'BEBBBBB.', '.BBBBBBB', '..BBB..B'], cols: { B: '#5DA0E0', E: '#1B1B1B' } },
    berry: { rows: ['..G.', '.RR.', 'RRWR', 'RRRR', '.RR.'], cols: { R: '#E04466', W: '#FFC0D0', G: '#58C24A' } },
    // Mitty's treats (only dropped by Feed Mitty, never by "Drop some treats").
    chocbar: { mitty: true, rows: ['SSSSSSS', 'BBDBBDB', 'BDBBDBB', 'RRRRRRR'], cols: { S: '#D8DCE4', B: '#7A4424', D: '#5A2E16', R: '#C8283A' }, crumbs: ['#7A4424', '#5A2E16', '#D8DCE4'] },
    chocheart: { mitty: true, rows: ['.BB.BB.', 'BLBBBBB', 'BBBBBBB', '.BBBBB.', '..BBB..', '...B...'], cols: { B: '#6A3418', L: '#A0603A' }, crumbs: ['#6A3418', '#A0603A'] },
    sweet: { mitty: true, rows: ['T.PPP.T', 'TTPWPTT', 'T.PPP.T'], cols: { P: '#F05A9A', W: '#FFC0DC', T: '#F8A8CC' }, crumbs: ['#F05A9A', '#FFC0DC', '#FFFFFF'] },
    sweet2: { mitty: true, rows: ['T.GGG.T', 'TTGWGTT', 'T.GGG.T'], cols: { G: '#3CC8B0', W: '#B8F4E8', T: '#88E0D0' }, crumbs: ['#3CC8B0', '#B8F4E8', '#FFFFFF'] },
    lolly: { mitty: true, rows: ['.YRY.', 'YRYRY', 'RYRYR', '.YRY.', '..W..', '..W..'], cols: { Y: '#FFE066', R: '#E8394A', W: '#F4F2EE' }, crumbs: ['#FFE066', '#E8394A'] }
  };
  function dropTreats(n = 3) {
    for (let i = 0; i < n; i++) {
      const kind = pick(Object.keys(TREATS).filter(k => !TREATS[k].mitty));
      treats.push({ kind, x: rand(0.1, 0.9) * W(), y: -rand(10, 260), vy: 0, landed: false, claimed: null, life: 60 });
    }
    pets().forEach(p => { if (['walk', 'idle', 'sit', 'sleep'].includes(p.state)) p.say('!', 1); });
  }
  // Feed Mitty: drop chocolate or sweets right next to her (spawning her first if needed).
  // Only she can eat them, and she drops whatever she's doing to come and get them.
  function feedFavourite(what) {
    const fav = id => REG[id] && REG[id].favourite;
    let pet = things.find(t => !t.isBuild && fav(t.id));
    if (!pet) {
      const id = Object.keys(REG).find(fav);
      if (!id) return;
      pet = new Thing(id); things.push(pet); report();
    }
    const kinds = what === 'chocolate' ? [pick(['chocbar', 'chocheart'])] : ['sweet', 'sweet2', 'lolly'];
    const cx = clamp(pet.x + pet.wpx() / 2, 40, W() - 40);
    kinds.forEach((kind, i) => {
      const x = clamp(cx + (i - (kinds.length - 1) / 2) * 14 * scale + rand(-20, 20) + (i === 0 && kinds.length === 1 ? pet.dir * 18 * scale : 0), 20, W() - 20);
      treats.push({ kind, x, y: -rand(10, 120) - i * 60, vy: 0, landed: false, claimed: null, life: 90, forUid: pet.uid });
    });
    if (!['held', 'ride', 'carried', 'battle', 'climb', 'cling', 'eat', 'snack'].includes(pet.state)) {
      const first = treats.find(t => t.forUid === pet.uid && !t.claimed);
      pet.set('snack', 20); pet.target = first; first.claimed = pet; pet.say('!', 1);
    }
  }
  function nearestTreat(p) {
    const cx = p.x + p.wpx() / 2;
    let best = null, bd = Infinity;
    for (const t of treats) if (!t.claimed && (!t.forUid || t.forUid === p.uid)) { const d = Math.abs(t.x - cx); if (d < bd) { bd = d; best = t; } }
    return best;
  }
  function updateTreats(dt) {
    for (let i = treats.length - 1; i >= 0; i--) {
      const t = treats[i];
      if (t.carried) continue;
      if (!t.landed) {
        t.vy += 1600 * dt; t.y += t.vy * dt;
        if (t.y >= H()) { t.y = H(); t.landed = true; dust(t.x, H(), 3); }
      }
      t.life -= dt;
      if (t.life <= 0 && !(t.claimed && t.claimed.state === 'eat')) treats.splice(i, 1);
    }
    // Free pets wander over to unclaimed treats.
    if (treats.some(t => !t.claimed)) {
      for (const p of pets()) {
        if (!['walk', 'idle', 'sit', 'sleep'].includes(p.state)) continue;
        const tr = nearestTreat(p);
        if (tr) { p.set('snack', 14); p.target = tr; tr.claimed = p; }
      }
    }
  }


  // ---------- carrying things around ----------
  // A carry is { kind: 'thing' | 'treat' | 'ball', obj }.
  function carryX(c) {
    if (c.kind === 'thing') return c.obj.x + c.obj.wpx() / 2;
    return c.obj.x;
  }
  function carryStillValid(p) {
    const c = p.carry;
    if (!c) return false;
    if (c.kind === 'thing') {
      if (!things.includes(c.obj)) return false;
      if (p.state === 'haul') return c.obj.state === 'carried' && c.obj.carrier === p;
      return !c.obj.carrier && !LOCKED.includes(c.obj.state);
    }
    if (c.kind === 'treat') return treats.includes(c.obj) && c.obj.claimed === p;
    if (c.kind === 'ball') return ball === c.obj && !ball.held && (p.state === 'goGrab' ? !ball.carrier : ball.carrier === p);
    return false;
  }
  function grabTargets(p) {
    const list = [];
    for (const t of things) {
      if (t === p || t.carrier || LOCKED.includes(t.state)) continue;
      if (things.some(o => o.carry && o.carry.obj === t)) continue;
      list.push({ kind: 'thing', obj: t });
    }
    for (const tr of treats) if (!tr.claimed && tr.landed) list.push({ kind: 'treat', obj: tr });
    if (ball && !ball.held && !ball.carrier && !things.some(o => o.carry && o.carry.obj === ball)) list.push({ kind: 'ball', obj: ball });
    return list;
  }
  // Grab the window the user is working in and give it a tug (Windows, Mischief only).
  async function startWindowTug(p) {
    if (!windowGrab || !p || p.isBuild || LOCKED.includes(p.state) || p.y < H() - 1) return false;
    p.win = { pending: true };                 // reserve so we only try one window at a time
    const rect = await api.grabWindow().catch(() => null);
    if (!rect || !things.includes(p) || LOCKED.includes(p.state)) { p.win = null; if (rect) api.releaseWindow(); return false; }
    const hangY = rect.y + rect.height + p.def.feet * scale;  // pet's head just under the bottom edge
    if (H() - hangY > 440 || hangY > H() - 4 * scale) { p.win = null; api.releaseWindow(); p.say('?', 1.2); return false; }
    const lo = Math.max(0, rect.x + 10), hi = Math.min(W() - p.wpx(), rect.x + rect.width - p.wpx() - 10);
    p.win = { rect, hangY, gx: clamp(rand(lo, Math.max(lo, hi)), 0, Math.max(0, W() - p.wpx())), offset: 0, dir: 1, room: 0, busy: false };
    p.set('goWin', 12);
    p.say('!', 1);
    return true;
  }

  function startGrab(p) {
    if (!p || p.isBuild || LOCKED.includes(p.state) || p.y < H() - 1) return false;
    const options = grabTargets(p);
    if (!options.length) return false;
    const c = pick(options);
    p.set('goGrab', 12);
    p.carry = c;
    if (c.kind === 'treat') c.obj.claimed = p;
    p.say('!', 1);
    return true;
  }
  function pickUp(p) {
    const c = p.carry;
    if (c.kind === 'thing') {
      const o = c.obj;
      if (o.state === 'battle' || o.state === 'conga') { p.carry = null; return p.next(); }
      o.set('carried', 99); o.carrier = p;
      if (!o.isBuild) o.say(pick(['!', '❤', '?']), 1.4);
    } else if (c.kind === 'treat') c.obj.carried = true;
    else if (c.kind === 'ball') { c.obj.carrier = p; earn('ball'); }
    p.state = 'haul';
    p.timer = 14;
    let goal;
    for (let k = 0; k < 6; k++) { goal = rand(0, Math.max(0, W() - p.wpx())); if (Math.abs(goal - p.x) > 160) break; }
    p.goal = goal;
    p.say('♪', 1.2);
    dust(p.x + p.wpx() / 2, H(), 3);
  }
  function putDown(p) {
    const c = p.carry;
    p.carry = null;
    if (c && c.kind === 'thing' && things.includes(c.obj)) {
      const o = c.obj;
      o.carrier = null;
      o.vx = p.dir * rand(60, 160); o.vy = -rand(150, 300);
      o.state = 'fall';
      if (o.isBuild) setTimeout(report, 1500);
    } else if (c && c.kind === 'treat' && treats.includes(c.obj)) {
      c.obj.carried = false; c.obj.landed = false; c.obj.vy = -220; c.obj.claimed = null;
    } else if (c && c.kind === 'ball' && ball === c.obj) {
      ball.carrier = null; ball.vx = p.dir * 320; ball.vy = -420;
    }
    heart(p);
    p.set('idle', rand(1.5, 3));
  }
  function positionCarried() {
    for (const p of things) {
      if (p.state !== 'haul' || !p.carry) continue;
      const c = p.carry, cx = p.x + p.wpx() / 2, head = p.top() + scale;
      if (c.kind === 'thing' && c.obj.state === 'carried') {
        c.obj.x = cx - c.obj.wpx() / 2;
        c.obj.y = head;                               // its feet sit on the carrier's head
        if (!c.obj.isBuild) c.obj.dir = p.dir;
      } else if (c.kind === 'treat') { c.obj.x = cx; c.obj.y = head; }
      else if (c.kind === 'ball') { c.obj.x = cx; c.obj.y = head - 3 * scale; }
    }
  }

  function party() {
    partyUntil = clock + 9;
    pets().forEach(p => { if (p.y >= H() - 1) { p.set('dance', 9); p.say('♪', 1.5); } });
  }

  function startConga() {
    const line = pets().filter(p => p.y >= H() - 1).sort((a, b) => a.x - b.x);
    if (line.length < 2) return;
    const dir = Math.random() < 0.5 ? 1 : -1;
    if (dir > 0) line.reverse();               // leader is the one at the front
    conga = { line, until: clock + 14, dir };
    line.forEach(p => { p.set('conga', 99); p.say('♪', 1.5); });
  }
  function updateConga(dt) {
    if (!conga) return;
    conga.line = conga.line.filter(p => things.includes(p) && p.state === 'conga');
    if (clock > conga.until || conga.line.length < 2) {
      conga.line.forEach(p => p.next());
      conga = null;
      return;
    }
    const speed = 50 * (scale / 4);
    const L = conga.line[0];
    L.dir = conga.dir;
    L.x += conga.dir * speed * dt;
    if (L.x <= 0 || L.x >= W() - L.wpx()) { conga.dir *= -1; L.x = clamp(L.x, 0, W() - L.wpx()); }
    for (let i = 1; i < conga.line.length; i++) {
      const p = conga.line[i], prev = conga.line[i - 1];
      const target = conga.dir > 0 ? prev.x - p.wpx() - scale : prev.x + prev.wpx() + scale;
      const dx = target - p.x;
      if (Math.abs(dx) > 1) p.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * 2 * dt);
      p.dir = Math.abs(dx) > 8 * scale ? Math.sign(dx) : conga.dir;
      p.x = clamp(p.x, 0, W() - p.wpx());
    }
    for (const p of conga.line) {
      p.hop += dt * 2.4;
      p.animT += dt; if (p.animT > 0.18) { p.animT = 0; p.frame ^= 1; }
      if (p.bubble && clock > p.bubble.until) p.bubble = null;
    }
    if (Math.random() < dt * 1.5) { const p = pick(conga.line); puff('note', p.x + p.wpx() / 2, p.top(), { vy: -30, vx: rand(-15, 15), life: 1.6 }); }
  }

  // Pets that bump into each other: say hi, or (with mischief on) start a scrap.
  function socialise() {
    const walkers = things.filter(t => !t.isBuild && t.state === 'walk');
    for (let i = 0; i < walkers.length; i++)
      for (let j = i + 1; j < walkers.length; j++) {
        const a = walkers[i], b = walkers[j];
        if (Math.abs(a.x - b.x) < 10 * scale && Math.random() < 0.01) {
          if (mischief && Math.random() < 0.35) { startBattle(a, b); continue; }
          a.dir = b.x > a.x ? 1 : -1; b.dir = -a.dir;
          a.set('idle', rand(2, 4)); b.set('idle', rand(2, 4));
          heart(a); heart(b);
        }
      }
  }

  function report() {
    api.thingsChanged(things.map(t => t.isBuild
      ? { id: t.id, uid: t.uid, x: t.x / Math.max(1, W() - t.wpx()) }
      : Object.assign({ id: t.id, uid: t.uid }, t.hat ? { hat: t.hat } : {}, t.infected ? { zombie: true } : {})));
  }

  // ---------- drawing ----------
  const PATTERNS = {
    heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    z: ['XXXX', '..X.', '.X..', 'XXXX'],
    pow: ['X..X..X', '.X.X.X.', '..XXX..', 'XXXXXXX', '..XXX..', '.X.X.X.', 'X..X..X'],
    star: ['.X.', 'XXX', '.X.'],
    note: ['..XX', '..X.', '..X.', 'XXX.', 'XX..'],
    crown: ['X..X..X', 'XXXXXXX', 'XXXXXXX']
  };
  const ICONS = {
    '!': { rows: ['X', 'X', 'X', '.', 'X'], col: '#E04444' },
    '?': { rows: ['XXX', '..X', '.XX', '...', '.X.'], col: '#3C74E0' },
    '♪': { rows: ['..XX', '..X.', '..X.', 'XXX.', 'XX..'], col: '#8B5CF6' },
    '❤': { rows: ['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'], col: '#FF4F7B' },
    '🍫': { rows: ['XXXXX', 'X.X.X', 'XXXXX', 'X.X.X', 'XXXXX'], col: '#7A4424' },
    '🍬': { rows: ['X...X', 'XXXXX', '.XXX.', 'XXXXX', 'X...X'], col: '#F05A9A' },
    '😋': { rows: ['X...X', '.....', 'X...X', '.XXX.', '..XX.'], col: '#E8394A' },
    'prr': { rows: ['XX.X.', 'X.XX.', 'XX.X.', 'X..X.', 'X..X.'], col: '#8B5CF6' },
    '🎁': { rows: ['X.X.X', '.XXX.', 'XXXXX', 'XXXXX', 'XXXXX'], col: '#E0483A' }
  };
  const COIN = { rows: ['.GGG.', 'GYYYG', 'GYGYG', 'GYYYG', '.GGG.'], cols: { G: '#D99A1E', Y: '#FFD84A' } };
  const BALL = { rows: ['.RRRR.', 'RWRRRR', 'RRRRRR', 'RRYYRR', 'RRRRRD', '.RDDD.'], cols: { R: '#E0483A', W: '#FFFFFF', Y: '#FFD84A', D: '#A82E24' } };

  function pattern(rows, cx, y, px, colour) {
    const ox = cx - (rows[0].length * px) / 2;
    ctx.fillStyle = colour;
    rows.forEach((row, j) => [...row].forEach((ch, i) => {
      if (ch === 'X') ctx.fillRect(Math.round(ox + i * px), Math.round(y + j * px), px, px);
    }));
  }
  function patternC(art, x, y, px) {
    art.rows.forEach((row, j) => [...row].forEach((ch, i) => {
      const c = art.cols[ch];
      if (c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x + i * px), Math.round(y + j * px), px, px); }
    }));
  }

  function drawBubble(t) {
    const icon = ICONS[t.bubble.icon];
    if (!icon) return;
    const px = Math.max(2, Math.round(scale / 2));
    const bw = 9 * px, bh = 8 * px;
    const cx = t.x + t.offX + t.wpx() / 2;
    const bx = Math.round(cx - bw / 2), by = Math.round(t.top() - bh - 3 * px);
    ctx.fillStyle = '#2E345C';
    ctx.fillRect(bx - px, by - px, bw + 2 * px, bh + 2 * px);
    ctx.fillRect(Math.round(cx - px), by + bh, 2 * px, 2 * px);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillRect(Math.round(cx - px / 2), by + bh, px, px);
    pattern(icon.rows, cx, by + Math.round((bh - icon.rows.length * px) / 2), px, icon.col);
  }

  const sorted = () => [...things].sort((a, b) =>
    a.isBuild === b.isBuild ? a.uid - b.uid : (a.isBuild ? -1 : 1));

  function drawThing(t) {
    const f = frameFor(t, t.spriteState());
    if (t.state === 'climb' || t.state === 'cling') {
      // Feet on the wall: rotate the sprite so it climbs "up" the screen edge.
      ctx.save();
      ctx.translate(t.side < 0 ? 0 : W(), t.cy);
      ctx.rotate(t.side < 0 ? Math.PI / 2 : -Math.PI / 2);
      ctx.drawImage(f.img, -t.wpx() / 2, -t.def.feet * scale, t.wpx(), t.hpx());
      ctx.restore();
      return;
    }
    ctx.drawImage(f.img, Math.round(t.x + t.offX), Math.round(t.top()), t.wpx(), t.hpx());
    if (t.hat && !t.isBuild) drawHat(t, f.grid, t.x + t.offX, t.top());
  }

  function draw() {
    ctx.clearRect(0, 0, W(), H());

    for (const t of things) {
      if (!t.isBuild || !t.def.glow) continue;
      const g = t.def.glow;
      const cx = t.x + g.x * scale, cy = t.top() + g.y * scale;
      const rad = g.r * scale * (1 + 0.05 * Math.sin(clock * 3.5 + t.uid));
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      grad.addColorStop(0, `rgba(${g.rgb},0.35)`);
      grad.addColorStop(1, `rgba(${g.rgb},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
    }

    for (let i = splats.length - 1; i >= 0; i--) {      // gore: splats on the ground, fading out
      const sp = splats[i], age = clock - sp.born;
      if (age > sp.life) { splats.splice(i, 1); continue; }
      ctx.globalAlpha = Math.min(1, (sp.life - age) / 4) * 0.9;
      ctx.fillStyle = '#8E1A1A';
      ctx.fillRect(Math.round(sp.x - sp.w), H() - Math.max(1, scale * 0.5), Math.round(sp.w * 2), Math.max(1, scale * 0.5));
      ctx.fillStyle = '#B82A2A';
      for (const [dx, k] of sp.dots) ctx.fillRect(Math.round(sp.x + dx), H() - scale * (0.5 + k * 0.5), scale * 0.5, scale * 0.5);
      ctx.globalAlpha = 1;
    }
    drawCables();

    for (const tr of treats) {
      const art = TREATS[tr.kind];
      patternC(art, tr.x - (art.rows[0].length * scale) / 2, tr.y - art.rows.length * scale, scale);
    }

    const list = sorted();
    for (const t of list) {
      if (t.state === 'ride' || t.state === 'carried') continue; // drawn last, on top
      if (!t.isBuild && !['climb', 'cling'].includes(t.state)) {
        const lift = Math.max(0, H() - t.y - t.bounce());
        const k = Math.min(1, lift / (30 * scale));
        ctx.fillStyle = `rgba(0,0,0,${0.22 * (1 - k)})`;
        ctx.beginPath();
        ctx.ellipse(t.x + t.offX + t.wpx() / 2, H() - scale * 0.6, t.wpx() * 0.32 * (1 - 0.4 * k), scale * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      drawThing(t);
      if (t.state === 'dizzy') {
        const cx = t.x + t.wpx() / 2, px = Math.max(2, Math.round(scale / 2));
        for (let k = 0; k < 3; k++) {
          const a = clock * 4 + k * 2.09;
          pattern(PATTERNS.star, cx + Math.cos(a) * 5 * scale, t.top() - scale + Math.sin(a) * 1.5 * scale, px, '#FFD84A');
        }
      }
    }

    if (ball) {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath(); ctx.ellipse(ball.x, H() - scale * 0.5, 2.5 * scale, scale * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      patternC(BALL, ball.x - 3 * scale, ball.y - 3 * scale, scale);
    }

    drawSnowCaps();
    drawDrift();

    for (const t of list) if (t.state === 'carried') drawThing(t);
    for (const t of list) if (t.state === 'ride') drawThing(t);

    drawRockets();
    drawOrbs();
    drawFlakes();

    const px = Math.max(2, Math.round(scale / 2));
    for (const p of particles) {
      const fade = 1 - p.t / p.life;
      ctx.globalAlpha = p.kind === 'confetti' ? 1 : Math.max(0, fade);
      switch (p.kind) {
        case 'heart': pattern(PATTERNS.heart, p.x, p.y - 6 * px, px, '#FF4F7B'); break;
        case 'z': pattern(PATTERNS.z, p.x + Math.sin(p.t * 3) * 3 * px, p.y, px, '#8FA2FF'); break;
        case 'note': pattern(PATTERNS.note, p.x + Math.sin(p.t * 4) * 2 * px, p.y, px, '#8B5CF6'); break;
        case 'crown': pattern(PATTERNS.crown, p.x, p.y - 3 * px, px, '#FFC93C'); break;
        case 'coin': patternC(COIN, Math.round(p.x - 2.5 * px), Math.round(p.y - 5 * px), px); break;
        case 'star': pattern(PATTERNS.star, p.x, p.y - 1.5 * px, px, '#FFD84A'); break;
        case 'pow': {
          const s = Math.max(2, Math.round(scale * (0.8 + 0.6 * (p.t / p.life))));
          pattern(PATTERNS.pow, p.x, p.y - 3.5 * s, s, '#FFD84A');
          pattern(['X'], p.x, p.y - 0.5 * s, s, '#FF7A2E');
          break;
        }
        case 'blood': { const sz = Math.max(1, Math.round(px * p.size)); ctx.fillStyle = '#A81E1E'; ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz); break; }
        case 'dust': ctx.fillStyle = '#C9C2B8'; ctx.fillRect(Math.round(p.x), Math.round(p.y), px, px); break;
        case 'spark': ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), px, px); break;
        case 'smoke': { const k = p.t / p.life, sz = Math.round(px * (1 + k * 2)); ctx.fillStyle = `rgba(90,94,104,${0.55 * (1 - k)})`; ctx.fillRect(Math.round(p.x - sz / 2), Math.round(p.y - sz / 2), sz, sz); break; }
        case 'crumb': ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x), Math.round(p.y), px, px); break;
        case 'snow': ctx.fillStyle = '#FFFFFF'; ctx.fillRect(Math.round(p.x), Math.round(p.y), px, px); break;
        case 'confetti':
          ctx.fillStyle = p.col;
          ctx.fillRect(Math.round(p.x + Math.sin(p.t * 3 + p.seed) * 6), Math.round(p.y), p.size, p.size * (Math.abs(Math.sin(p.t * 6 + p.seed)) + 0.3));
          break;
      }
    }
    ctx.globalAlpha = 1;

    for (const t of list) if (t.bubble && !['climb', 'cling'].includes(t.state)) drawBubble(t);
  }

  // ---------- mouse ----------
  function thingAt(mx, my) {
    const list = sorted();
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      if (['ride', 'climb', 'cling'].includes(t.state)) continue; // never block clicks under the pointer
      const gx = Math.floor((mx - t.x - t.offX) / scale), gy = Math.floor((my - t.top()) / scale);
      if (gx < -1 || gy < -1 || gx > t.def.w || gy > t.def.h) continue;
      const g = frameFor(t, t.spriteState()).grid;
      for (let dy = -1; dy <= 1; dy++)            // 1-pixel grace so thin bits are clickable
        for (let dx = -1; dx <= 1; dx++)
          if (g[gy + dy] && g[gy + dy][gx + dx]) return t;
    }
    return null;
  }
  const ballAt = (mx, my) => ball && Math.hypot(mx - ball.x, my - ball.y) < 4 * scale;

  function setInteractive(on) {
    if (on === !ignoring) return;
    ignoring = !on;
    api.setIgnore(!on);
  }

  addEventListener('mousemove', e => {
    const now = performance.now() / 1000;
    if (mouse.seen) {
      const dtm = Math.max(0.004, now - mouse.lastT);
      mouse.vx = mouse.vx * 0.5 + ((e.clientX - mouse.x) / dtm) * 0.5;
      mouse.vy = mouse.vy * 0.5 + ((e.clientY - mouse.y) / dtm) * 0.5;
    }
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = clock; mouse.lastT = now; mouse.seen = true;

    if (drag) {
      const t = drag.t;
      if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 4) drag.moved = true;
      if (!drag.moved) return;
      const dtm = Math.max(1, performance.now() - drag.lt);
      drag.vx = drag.vx * 0.5 + ((e.clientX - drag.lx) / dtm) * 500;
      drag.vy = drag.vy * 0.5 + ((e.clientY - drag.ly) / dtm) * 500;
      drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = performance.now();
      if (drag.ball) { ball.carrier = null; ball.held = true; ball.x = e.clientX; ball.y = Math.min(e.clientY, H() - 3 * scale); return; }
      t.state = 'held';
      if (!t.isBuild && Math.abs(drag.vx) > 20) t.dir = drag.vx > 0 ? 1 : -1;
      t.x = clamp(e.clientX - drag.ox, 0, Math.max(0, W() - t.wpx()));
      t.y = t.isBuild ? H() : Math.min(H(), e.clientY + drag.oy);
      return;
    }
    const t = hidden ? null : thingAt(e.clientX, e.clientY);
    const overBall = !hidden && ballAt(e.clientX, e.clientY);
    if (t !== hover.t) { hover.t = t; hover.since = clock; }
    setInteractive(!!t || overBall);
    document.body.style.cursor = t || overBall ? 'grab' : 'default';
  });

  // Cursor position from the main process, so pets can be grabbed even when the system
  // doesn't forward mouse movement to the click-through overlay.
  api.on('cursor', p => {
    if (drag || !ignoring) return;            // the window already gets real mouse events
    mouse.x = p.x; mouse.y = p.y; mouse.t = clock; mouse.seen = true;
    if (hidden) return;
    const t = thingAt(p.x, p.y);
    const overBall = ballAt(p.x, p.y);
    if (t !== hover.t) { hover.t = t; hover.since = clock; }
    for (const q of pets()) {
      if ((friends[q.id] || 1) < 2 || !['idle', 'walk', 'sit'].includes(q.state) || clock < (q.hopAt || 0)) continue;
      const cx = q.x + q.wpx() / 2;
      if (Math.abs(p.x - cx) < 40 && p.y > q.top() - 60 && p.y < H()) { q.hopAt = clock + 25; q.set('cheer', 0.9); heart(q); }
    }
    if (t || overBall) { setInteractive(true); document.body.style.cursor = 'grab'; }
  });

  addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (ballAt(e.clientX, e.clientY)) {
      drag = { ball: true, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0, moved: false };
      return;
    }
    const t = thingAt(e.clientX, e.clientY);
    if (!t) return;
    drag = { t, sx: e.clientX, sy: e.clientY, ox: e.clientX - t.x, oy: t.y - e.clientY,
      lx: e.clientX, ly: e.clientY, lt: performance.now(), vx: 0, vy: 0, moved: false };
    document.body.style.cursor = 'grabbing';
  });

  addEventListener('mouseup', () => {
    if (!drag) return;
    if (drag.ball) {
      if (ball) {
        ball.held = false;
        if (drag.moved) { ball.vx = clamp(drag.vx, -1500, 1500); ball.vy = clamp(drag.vy, -1500, 1500); }
        else { ball.vy = -800; ball.vx = rand(-200, 200); }
        ball.life = Math.max(ball.life, 20);
      }
      drag = null;
      return;
    }
    const t = drag.t;
    if (!drag.moved) {
      if (!t.isBuild) {
        if (t.state === 'dizzy') t.say('?', 1);
        t.vx = 0; t.vy = -650; t.state = 'fall';   // click = happy jump
      }
      heart(t);
    } else {
      t.vx = t.isBuild ? 0 : clamp(drag.vx, -1500, 1500);
      t.vy = t.isBuild ? 0 : clamp(drag.vy, -1500, 1500);
      t.state = 'fall';
      report();
    }
    drag = null;
    document.body.style.cursor = 'grab';
  });

  addEventListener('contextmenu', e => {
    e.preventDefault();
    const t = thingAt(e.clientX, e.clientY);
    if (t) api.thingMenu(t.uid, t.id);
  });

  // ---------- messages from the tray ----------
  function setHidden(h) {
    hidden = !!h;
    canvas.style.display = hidden ? 'none' : 'block';
    if (hidden) setInteractive(false);
  }

  api.on('init', async d => {
    scale = d.scale || 4;
    mischief = d.mischief !== false;
    gore = !!d.gore;
    windowGrab = !!d.windowGrab;
    await loadPacks(d.packFiles || []);
    resize();
    setHidden(d.hidden);
    things = (d.things || []).filter(s => REG[s.id]).map(s => new Thing(s.id, { x: s.x, hat: s.hat, zombie: s.zombie }));
    setSnow(d.snow);
    ready = true;
    report();   // so the Control Centre knows who's on screen straight away
  });
  api.on('spawn', id => {
    if (!ready || !REG[id] || things.length >= MAX_THINGS) return;
    things.push(new Thing(id));
    if (hidden) setHidden(false);
    report();
  });
  api.on('clear', kind => {
    things = things.filter(t => kind === 'all' ? false : kind === 'build' ? !t.isBuild : t.isBuild);
    setInteractive(false);
    report();
  });
  api.on('set-scale', v => { scale = v; things.forEach(t => t.clamp()); });
  api.on('set-hidden', setHidden);
  api.on('set-mischief', v => { mischief = !!v; });
  api.on('set-gore', v => { gore = !!v; if (!gore) { splats.length = 0; for (let i = particles.length - 1; i >= 0; i--) if (particles[i].kind === 'blood') particles.splice(i, 1); } });
  api.on('set-snow', setSnow);
  // Hats for everyone at once (null takes them all off).
  api.on('set-hats', hat => { for (const p of pets()) p.hat = hat && OUTFITS[hat] ? hat : null; report(); });
  // A Buck dropped: a little coin floats up from one of the buddies out on screen.
  api.on('bucks-drop', n => { if (hidden || !pets().length) return; const ps = pets().filter(p => !LOCKED.includes(p.state)); coinFrom(pick(ps.length ? ps : pets()), n); });
  // The daily gift: a buddy cheers and showers coins.
  api.on('bucks-gift', () => {
    if (hidden) return;
    const p = pick(pets());
    if (!p) return;
    if (!LOCKED.includes(p.state)) p.set('cheer', 2.4);
    p.say('🎁', 3);
    setTimeout(() => coinFrom(p, 5), 600);
  });
  // Friendship levels by item id: Pals (level 2+) hop happily when your cursor comes by.
  let friends = {};
  api.on('set-friends', map => { friends = map && typeof map === 'object' ? map : {}; });
  api.on('play', action => {
    if (!ready) return;
    if (hidden) setHidden(false);
    if (action === 'battle') {
      const free = pets();
      if (free.length < 2) return;
      const a = pick(free);
      const b = free.filter(p => p !== a).sort((p, q) => Math.abs(p.x - a.x) - Math.abs(q.x - a.x))[0];
      startBattle(a, b);
    } else if (action === 'outage') {
      const live = things.filter(k => k.power === 'on');
      if (live.length) breakKit(pick(live));
    } else if (action === 'outbreak') {        // every zombie goes hunting at once
      for (const z of things.filter(t => isBiter(t) && !LOCKED.includes(t.state))) {
        const p = findPrey(z);
        if (p) { z.set('hunt', 25); z.prey = p; z.say('🧠', 1.6); }
      }
    } else if (action === 'supplydrop') {
      const h = things.find(t => t.def.drops && !LOCKED.includes(t.state));
      if (h) { startFly(h); setTimeout(() => { if (things.includes(h) && h.state === 'fly') dropSupply(h); }, 1500); }
      else { dropTreats(3); }
    } else if (action === 'ball') throwBall();
    else if (action === 'treats') dropTreats(3);
    else if (action === 'feed-chocolate') feedFavourite('chocolate');
    else if (action === 'feed-sweets') feedFavourite('sweets');
    else if (action === 'party') party();
    else if (action === 'fireworks') fireworks();
    else if (action === 'conga') startConga();
    else if (action === 'tidy') {
      // One pet at a time picks a target, and a pet that's about to be carried doesn't
      // also run off to grab something (that used to cancel everyone out).
      let started = 0;
      for (const p of shuffle(pets())) {
        if (things.some(o => o.carry && o.carry.obj === p)) continue;
        if (startGrab(p)) started++;
      }
      if (!started) { throwBall(); setTimeout(() => { const p = pick(pets()); if (p) startGrab(p); }, 1200); }
    } else if (action === 'window') {
      const p = pets().filter(q => !LOCKED.includes(q.state)).sort((a, b) => Math.random() - 0.5)[0];
      if (p) startWindowTug(p).then(ok => { if (!ok && !p.bubble) p.say('?', 1.2); });
    }
  });
  api.on('thing-action', ({ uid, action }) => {
    const t = things.find(x => x.uid === uid);
    if (!t) return;
    if (action === 'remove') { things = things.filter(x => x !== t); setInteractive(false); report(); return; }
    if (t.isBuild || LOCKED.includes(t.state)) return;
    if (action === 'battle') {
      const other = pets().filter(p => p !== t).sort((p, q) => Math.abs(p.x - t.x) - Math.abs(q.x - t.x))[0];
      startBattle(t, other);
    } else if (action === 'chase') { t.say('!'); t.set('chase', rand(8, 12)); }
    else if (action === 'climb') { t.dir = t.x < W() / 2 ? -1 : 1; t.set('toWall', 15); }
    else if (action === 'fly') startFly(t);
    else if (action === 'cast') t.set('cast', 1.8);
    else if (action === 'bite') { const p = isBiter(t) && findPrey(t); if (p) { t.set('hunt', 25); t.prey = p; t.say('🧠', 1.6); } else t.say('?', 1.2); }
    else if (action === 'cure') { const p = t.def.curer && findSick(t); if (p) { t.set('goCure', 30); t.patient = p; t.say('!', 1.2); } else t.say('?', 1.2); }
    else if (action === 'hat-off') { t.hat = null; report(); }
    else if (action.startsWith('hat:')) { const h = action.slice(4); if (OUTFITS[h]) { t.hat = h; heart(t); report(); } }
    else if (action === 'hat-santa') { t.hat = 'santa'; heart(t); report(); }
    else if (action === 'trick') {        // Best buddies (friendship level 3) show off
      t.set('cheer', 1.8); heart(t);
      for (let k = 0; k < 6; k++) puff('star', t.x + t.wpx() / 2, t.top(), { vx: Math.cos(k) * 70, vy: -rand(60, 110), g: 120, life: 1 });
    }
    else if (action === 'grab') { if (!startGrab(t)) t.say('?', 1.2); }
    else t.set(action, action === 'sleep' ? rand(10, 20) : action === 'sit' ? rand(6, 12) : rand(4, 8));
  });

  // ---------- magic: the witch flies on her broom, the wizard casts magic balls ----------
  function startFly(t) {
    t.set('fly', rand(7, 14));
    t.flyY = H() - rand(60, Math.min(240, H() * 0.45));
    t.dir = t.x < W() / 2 ? 1 : -1;
    t.say('♪', 1.2);
  }
  const orbs = [];
  function castOrb(t) {
    const x = t.x + (t.dir > 0 ? t.wpx() - 3 * scale : 3 * scale), y = t.top() + 2 * scale;
    // aim at the nearest buddy in front, if there is one
    const ahead = pets(false).filter(p => p !== t && Math.sign(p.x - t.x) === t.dir && Math.abs(p.x - t.x) < 520)
      .sort((a, b) => Math.abs(a.x - t.x) - Math.abs(b.x - t.x))[0];
    orbs.push({ x, y, vx: t.dir * 320 * (scale / 4), vy: 0, life: 2.2, t: 0, target: ahead || null, col: pick(['#7FE8FF', '#B67CF0', '#FF7AD9', '#9BFF8A']) });
    for (let k = 0; k < 6; k++) puff('spark', x, y, { vx: rand(-80, 80), vy: rand(-80, 40), life: 0.5, col: '#FFFFFF' });
  }
  function updateOrbs(dt) {
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i];
      o.t += dt;
      if (o.target && things.includes(o.target)) {               // curve gently towards the target
        const tx = o.target.x + o.target.wpx() / 2, ty = o.target.top() + o.target.hpx() * 0.4;
        o.vy += clamp((ty - o.y) * 4, -600, 600) * dt;
        if (Math.hypot(tx - o.x, ty - o.y) < 6 * scale) {
          burstOrb(o);
          const p = o.target;
          if (!['held', 'carried', 'ride', 'climb', 'cling', 'fly'].includes(p.state)) {   // a harmless magic boing!
            p.say('!', 1.2); p.vy = -520; p.vx = rand(-80, 80); p.state = 'fall';
          }
          orbs.splice(i, 1); continue;
        }
      }
      o.x += o.vx * dt; o.y += o.vy * dt;
      if (Math.random() < 0.8) puff('spark', o.x, o.y, { vx: rand(-20, 20), vy: rand(-20, 20), life: 0.45, col: o.col });
      if (o.t > o.life || o.x < -20 || o.x > W() + 20) { burstOrb(o); orbs.splice(i, 1); }
    }
  }
  function burstOrb(o) {
    for (let k = 0; k < 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      puff('spark', o.x, o.y, { vx: Math.cos(a) * rand(80, 160), vy: Math.sin(a) * rand(80, 160), g: 200, life: rand(0.5, 0.9), col: Math.random() < 0.3 ? '#FFFFFF' : o.col });
    }
  }
  function drawOrbs() {
    for (const o of orbs) {
      const r = 3 * scale * (1 + 0.15 * Math.sin(o.t * 20));
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r * 2);
      g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(0.35, o.col); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(o.x - r * 2, o.y - r * 2, r * 4, r * 4);
    }
  }

  // ---------- seasons: snow, hats and New Year fireworks ----------
  // Snow falls gently, piles up in a drift along the bottom of the screen and settles on top of builds.
  let snowing = false;
  const flakes = [];
  let drift = new Float32Array(0);               // snow depth (in sprite pixels) for each column along the bottom
  const DRIFT_MAX = 3;
  const driftCol = () => Math.max(2, scale);     // one drift column = one sprite pixel wide
  function setSnow(on) {
    snowing = !!on;
    if (!snowing) flakes.length = 0;
  }
  // The top edge of a build's sprite, column by column (sprite pixels from the top, or -1 if empty).
  function topProfile(t) {
    const g = frameFor(t, t.spriteState()).grid;
    if (t._profileKey === g) return t._profile;
    const prof = [];
    for (let x = 0; x < t.def.w; x++) { let y = 0; while (y < g.length && !g[y][x]) y++; prof.push(y < g.length ? y : -1); }
    t._profileKey = g; t._profile = prof;
    if (!t.snowCap || t.snowCap.length !== prof.length) t.snowCap = new Float32Array(prof.length);
    return prof;
  }
  function updateSnow(dt) {
    const cols = Math.ceil(W() / driftCol());
    if (drift.length !== cols) drift = new Float32Array(cols);
    if (snowing && flakes.length < 140) {
      const want = W() / 1400 * 22 * dt;        // about 22 flakes a second on a 1400px wide screen
      for (let n = want + Math.random(); n >= 1; n--) flakes.push({ x: rand(-20, W() + 20), y: -6, vy: rand(26, 52), sway: rand(0, 6), size: Math.random() < 0.2 ? 2 : 1 });
    }
    const builds = things.filter(t => t.isBuild && !['carried', 'fall'].includes(t.state) && t.y >= H() - 1);
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      f.y += f.vy * dt;
      f.x += Math.sin(clock * 0.9 + f.sway) * 14 * dt + 6 * dt;   // a little breeze to the right
      let landed = false;
      for (const b of builds) {
        const gx = Math.floor((f.x - b.x) / scale);
        if (gx < 0 || gx >= b.def.w) continue;
        const prof = topProfile(b);
        if (prof[gx] < 0) continue;
        const surface = b.top() + (prof[gx] - b.snowCap[gx]) * scale;
        if (f.y >= surface && f.y < surface + 3 * scale) {
          b.snowCap[gx] = Math.min(2, b.snowCap[gx] + 0.35);
          landed = true; break;
        }
      }
      if (!landed && f.y >= H() - (drift[Math.floor(f.x / driftCol())] || 0) * scale) {
        const c = Math.floor(f.x / driftCol());
        if (c >= 0 && c < drift.length) drift[c] = Math.min(DRIFT_MAX, drift[c] + 0.3);
        landed = true;
      }
      if (landed || f.y > H() + 10) flakes.splice(i, 1);
    }
    // Drifts even out a little, and melt away slowly once the snow stops.
    for (let c = 1; c < drift.length - 1; c++) {
      const avg = (drift[c - 1] + drift[c + 1]) / 2;
      if (drift[c] - avg > 1) { drift[c] -= 0.02; drift[c - 1] += 0.01; drift[c + 1] += 0.01; }
    }
    if (!snowing) {
      for (let c = 0; c < drift.length; c++) drift[c] = Math.max(0, drift[c] - dt * 0.05);
      for (const b of things) if (b.snowCap) for (let x = 0; x < b.snowCap.length; x++) b.snowCap[x] = Math.max(0, b.snowCap[x] - dt * 0.05);
    }
    // Pets walking through a drift kick up a little snow.
    for (const t of things) {
      if (t.isBuild || !t.moving() || Math.random() > dt * 6) continue;
      const c = Math.floor((t.x + t.wpx() / 2) / driftCol());
      if (drift[c] > 0.8) puff('snow', t.x + t.wpx() / 2, H() - drift[c] * scale, { vx: rand(-40, 40), vy: rand(-90, -40), g: 300, life: 0.6 });
    }
  }
  function drawSnowCaps() {
    ctx.fillStyle = '#F4F8FF';
    for (const b of things) {
      if (!b.isBuild || !b.snowCap || b.state === 'carried') continue;
      const prof = topProfile(b);
      for (let x = 0; x < prof.length; x++) {
        const d = Math.round(b.snowCap[x]);
        if (d > 0 && prof[x] >= 0) ctx.fillRect(Math.round(b.x + x * scale), Math.round(b.top() + (prof[x] - d) * scale), scale, d * scale);
      }
    }
  }
  function drawDrift() {
    const cw = driftCol();
    for (let c = 0; c < drift.length; c++) {
      const d = Math.round(drift[c]);
      if (d <= 0) continue;
      ctx.fillStyle = '#F4F8FF';
      ctx.fillRect(c * cw, H() - d * scale, cw, d * scale);
      ctx.fillStyle = '#D5E2F2';
      ctx.fillRect(c * cw, H() - scale * 0.5, cw, scale * 0.5);   // a touch of shadow at the bottom
    }
  }
  function drawFlakes() {
    ctx.fillStyle = '#FFFFFF';
    const px = Math.max(2, Math.round(scale / 2));
    for (const f of flakes) ctx.fillRect(Math.round(f.x), Math.round(f.y), px * f.size, px * f.size);
  }

  // Hats and outfits (src/shared/outfits.js): drawn on top of a pet's sprite, sitting on the highest part of its head.
  const OUTFITS = BBOutfits.OUTFITS;
  function drawHat(t, grid, x0, y0) {
    for (const d of BBOutfits.hatPixels(grid, t.hat, t.dir)) {
      ctx.fillStyle = d.col;
      ctx.fillRect(Math.round(x0 + d.x * scale), Math.round(y0 + d.y * scale), scale, scale);
    }
  }

  // New Year's Eve: rockets fly up from the taskbar and burst into colour.
  let fireworksUntil = 0, nextRocket = 0;
  const rockets = [];
  function fireworks(seconds = 45) {
    fireworksUntil = clock + seconds;
    nextRocket = clock;
    for (const p of pets()) { p.say('♪', 2); if (!LOCKED.includes(p.state)) p.set('cheer', 3); }
  }
  function updateFireworks(dt) {
    if (clock < fireworksUntil && clock >= nextRocket) {
      nextRocket = clock + rand(0.35, 1.1);
      rockets.push({ x: rand(W() * 0.08, W() * 0.92), y: H(), vy: -rand(520, 760), fuse: rand(0.7, 1.15), col: pick(['#FF4F7B', '#FFD84A', '#5DA0E0', '#58C24A', '#B67CF0', '#FF9A2E', '#FFFFFF']) });
    }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.fuse -= dt; r.y += r.vy * dt; r.vy += 260 * dt;
      if (Math.random() < 0.7) puff('spark', r.x + rand(-1, 1), r.y + 4, { vy: rand(20, 60), life: 0.35, col: '#FFC98A' });
      if (r.fuse <= 0) {
        const n = 34;
        for (let k = 0; k < n; k++) {
          const ang = (k / n) * Math.PI * 2 + rand(-0.05, 0.05), sp = rand(150, 260);
          puff('spark', r.x, r.y, { vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 180, life: rand(0.9, 1.5), col: Math.random() < 0.15 ? '#FFFFFF' : r.col });
        }
        rockets.splice(i, 1);
        if (Math.random() < 0.5) { const p = pick(pets()); if (p) p.say(pick(['!', '❤', '♪']), 1.4); }
      }
    }
  }
  function drawRockets() {
    const px = Math.max(2, Math.round(scale / 2));
    for (const r of rockets) { ctx.fillStyle = r.col; ctx.fillRect(Math.round(r.x), Math.round(r.y), px, px * 2); }
  }

  // ---------- loop (~40fps) ----------
  let last = performance.now();
  function loop(now) {
    requestAnimationFrame(loop);
    const elapsed = now - last;
    if (elapsed < 1000 / 40) return;
    last = now;
    if (!ready || hidden) return;
    const dt = Math.min(0.05, elapsed / 1000);
    clock += dt;
    if (clock - mouse.t > 0.1) { mouse.vx *= 0.8; mouse.vy *= 0.8; }

    things.forEach(t => t.update(dt));
    updateBattles(dt);
    updateConga(dt);
    updateBall(dt);
    positionCarried();
    updateKit(dt);
    updateTreats(dt);
    updateSnow(dt);
    updateFireworks(dt);
    updateOrbs(dt);
    socialise();

    // Hover over a pet for a moment to give it a pat.
    const ht = hover.t;
    if (ht && !drag && things.includes(ht) && !ht.isBuild && clock - hover.since > 1 && clock > hover.nextHeart &&
        ['idle', 'walk', 'sit', 'sleep'].includes(ht.state)) {
      heart(ht);
      hover.nextHeart = clock + 0.7;
      if (ht.state !== 'sit') ht.set('sit', rand(3, 6));
    }

    if (clock < partyUntil) {
      const colours = ['#FF4F7B', '#FFD84A', '#5DA0E0', '#58C24A', '#B67CF0', '#FF9A2E'];
      for (let k = 0; k < 2; k++)
        puff('confetti', rand(0, W()), -10, { vy: rand(90, 170), life: 8, col: pick(colours), size: rand(0.6, 1.1) * scale, seed: rand(0, 6) });
      if (Math.random() < dt * 2) {
        const dancers = things.filter(t => t.state === 'dance');
        if (dancers.length) { const p = pick(dancers); puff('note', p.x + p.wpx() / 2, p.top(), { vy: -30, life: 1.6 }); }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.t += dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'blood' && p.y >= H() - 1) { splat(p.x, p.size * scale * 0.7); particles.splice(i, 1); continue; }
      if (p.t >= p.life || (p.kind === 'confetti' && p.y > H())) particles.splice(i, 1);
    }
    draw();
  }
  resize();
  requestAnimationFrame(loop);
})();
