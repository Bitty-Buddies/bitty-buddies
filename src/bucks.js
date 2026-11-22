// Buddy Bucks: the coin buddies earn while they're out on your desktop.
// Rules (see the "coins and unlocks" plan):
//  - earned only while the app runs; nothing is lost while it's closed
//  - 1 Buck every 2 minutes with buddies out, small amounts for naps, games and battles
//  - a 25 Buck gift once a day, the same every day (no streaks)
//  - a gentle daily cap: after 300 in a day, earning slows to a quarter until midnight
//  - Bucks are never sold for money, and nothing is random
// The balance is worked out, not stored: everything earned (per PC) minus the price of everything owned.
// That makes it safe to merge the copies from several PCs through the account backup.
const crypto = require('crypto');
const CATALOGUE = require('./shop/catalogue');

const DAILY_CAP = 300;
const SLOW_RATE = 0.25;
const DAILY_GIFT = 25;
const PER_MINUTE = 0.5;                         // buddies out: 1 every 2 minutes
const EVENT_BUCKS = { nap: 2, ball: 3, battle: 5, play: 3 };
const EVENTS_PER_HOUR = 20;                     // naps, games and battles together
const PLAY_PER_HOUR = 10;                       // you playing with them (clicks): spam earns nothing extra
const LEVELS = [0, 180, 600, 1500, 3000];       // friendship: minutes that buddy has been out (0, 3h, 10h, 25h, 50h)
const LEVEL_NAMES = ['New friend', 'Pal', 'Best buddy', 'Bestie', 'Forever friend'];
const BESTIE_GIFT = 200;
const ITEM = Object.fromEntries(CATALOGUE.map(c => [c.id, c]));

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const hourKey = (d = new Date()) => `${dayKey(d)}T${d.getHours()}`;
const num = v => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0);
const obj = v => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});

// Tidy a saved wallet (or make a new one) so the rest of the code can trust its shape.
function normalise(w) {
  w = obj(w);
  const out = {
    device: typeof w.device === 'string' && /^[0-9a-f]{12}$/.test(w.device) ? w.device : crypto.randomBytes(6).toString('hex'),
    earned: {}, owned: [], friends: {}, rewarded: {}, names: {}, stats: {},
    day: typeof w.day === 'string' ? w.day : '', today: num(w.today), frac: num(w.frac) % 1,
    lastGift: typeof w.lastGift === 'string' ? w.lastGift : '',
    hour: typeof w.hour === 'string' ? w.hour : '', hourEvents: num(w.hourEvents), hourPlay: num(w.hourPlay),
    updated: num(w.updated)
  };
  for (const [k, v] of Object.entries(obj(w.earned))) if (/^[0-9a-f]{12}$/.test(k)) out.earned[k] = Math.floor(num(v));
  if (!(out.device in out.earned)) out.earned[out.device] = 0;
  out.owned = [...new Set((Array.isArray(w.owned) ? w.owned : []).filter(id => ITEM[id]))];
  for (const [k, v] of Object.entries(obj(w.friends))) if (/^[a-z0-9-]+\/[a-z0-9-]+$/i.test(k)) out.friends[k] = Math.floor(num(v));
  for (const [k, v] of Object.entries(obj(w.rewarded))) out.rewarded[k] = Math.min(LEVELS.length, Math.floor(num(v)));
  for (const [k, v] of Object.entries(obj(w.names))) { const n = cleanName(v); if (n) out.names[k] = n; }
  for (const k of ['naps', 'balls', 'battles', 'plays', 'gifts', 'bought']) out.stats[k] = Math.floor(num(obj(w.stats)[k]));
  return out;
}
const cleanName = v => String(v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 20);

const spent = w => w.owned.reduce((s, id) => s + (ITEM[id] ? ITEM[id].price : 0), 0);
const balance = w => Math.max(0, Object.values(w.earned).reduce((a, b) => a + b, 0) - spent(w));

// New day or hour: reset the counters that limit earning.
function roll(w, now) {
  const d = dayKey(now), h = hourKey(now);
  if (w.day !== d) { w.day = d; w.today = 0; }
  if (w.hour !== h) { w.hour = h; w.hourEvents = 0; w.hourPlay = 0; }
}

// Add Bucks through the daily cap. Returns the whole Bucks actually added (fractions carry over).
function add(w, amount, now = new Date(), { capped = true } = {}) {
  roll(w, now);
  let gain = amount;
  if (capped) {
    const room = Math.max(0, DAILY_CAP - w.today);
    gain = Math.min(amount, room) + Math.max(0, amount - room) * SLOW_RATE;
    w.today += amount;
  }
  w.frac += gain;
  const whole = Math.floor(w.frac);
  w.frac -= whole;
  if (whole) { w.earned[w.device] = (w.earned[w.device] || 0) + whole; w.updated = now.getTime(); }
  return whole;
}

// A minute with buddies out on screen.
const minute = (w, now) => add(w, PER_MINUTE, now);

// Something happened: 'nap' | 'ball' | 'battle' (by themselves) or 'play' (you clicked something).
function event(w, kind, now = new Date()) {
  const amount = EVENT_BUCKS[kind];
  if (!amount) return 0;
  roll(w, now);
  if (kind === 'play') { if (w.hourPlay >= PLAY_PER_HOUR) return 0; w.hourPlay++; }
  else { if (w.hourEvents >= EVENTS_PER_HOUR) return 0; w.hourEvents++; }
  const stat = { nap: 'naps', ball: 'balls', battle: 'battles', play: 'plays' }[kind];
  w.stats[stat] = (w.stats[stat] || 0) + 1;
  return add(w, amount, now);
}

// The once-a-day gift. Returns 25 the first time each day, otherwise 0.
function dailyGift(w, now = new Date()) {
  const d = dayKey(now);
  if (w.lastGift === d) return 0;
  w.lastGift = d;
  w.stats.gifts = (w.stats.gifts || 0) + 1;
  return add(w, DAILY_GIFT, now, { capped: false });
}

function buy(w, id, now = new Date()) {
  const it = ITEM[id];
  if (!it) throw new Error('That isn’t in the shop.');
  if (w.owned.includes(id)) throw new Error(`You already have the ${it.name}.`);
  if (balance(w) < it.price) throw new Error(`You need ${it.price - balance(w)} more Buddy Bucks for the ${it.name}.`);
  w.owned.push(id);
  w.stats.bought = (w.stats.bought || 0) + 1;
  w.updated = now.getTime();
  return it;
}

const level = minutes => LEVELS.reduce((l, need, i) => (minutes >= need ? i + 1 : l), 1);

// A minute out for each of these buddies (by item id). Returns any level-ups: [{ id, level, gift }].
function friendMinute(w, ids, now = new Date()) {
  const ups = [];
  for (const id of new Set(ids)) {
    const before = level(w.friends[id] || 0);
    w.friends[id] = (w.friends[id] || 0) + 1;
    const after = level(w.friends[id]);
    if (after > before && after > (w.rewarded[id] || 1)) {
      w.rewarded[id] = after;
      let gift = 0;
      if (after === 4) gift = add(w, BESTIE_GIFT, now, { capped: false });
      ups.push({ id, level: after, name: LEVEL_NAMES[after - 1], gift });
    }
  }
  if (ids.length) w.updated = now.getTime();
  return ups;
}

function setName(w, id, name, now = new Date()) {
  const n = cleanName(name);
  if (n) w.names[id] = n; else delete w.names[id];
  w.updated = now.getTime();
  return n;
}

// Two copies of the same account's wallet (this PC and the account backup) → one.
// Nothing earned on any PC is lost and nothing can be bought twice.
function merge(local, remote) {
  const a = normalise(local), b = normalise(remote);
  const out = normalise({ ...a, device: a.device });
  for (const [k, v] of Object.entries(b.earned)) out.earned[k] = Math.max(out.earned[k] || 0, v);
  out.owned = [...new Set([...a.owned, ...b.owned])];
  for (const [k, v] of Object.entries(b.friends)) out.friends[k] = Math.max(out.friends[k] || 0, v);
  for (const [k, v] of Object.entries(b.rewarded)) out.rewarded[k] = Math.max(out.rewarded[k] || 0, v);
  for (const [k, v] of Object.entries(b.names)) if (!(k in out.names)) out.names[k] = v;
  for (const [k, v] of Object.entries(b.stats)) out.stats[k] = Math.max(out.stats[k] || 0, v);
  if (b.lastGift > out.lastGift) out.lastGift = b.lastGift;
  out.updated = Math.max(a.updated, b.updated);
  return out;
}

// What the shop window and tray need to know.
function view(w) {
  return {
    balance: balance(w), today: Math.floor(w.today), cap: DAILY_CAP, owned: [...w.owned],
    friends: Object.fromEntries(Object.entries(w.friends).map(([k, m]) => [k, { minutes: m, level: level(m), name: LEVEL_NAMES[level(m) - 1] }])),
    names: { ...w.names }, stats: { ...w.stats }, levels: LEVELS, levelNames: LEVEL_NAMES
  };
}

module.exports = { normalise, balance, minute, event, dailyGift, buy, friendMinute, setName, merge, view, level, dayKey, CATALOGUE, ITEM, DAILY_CAP, LEVELS, LEVEL_NAMES };
