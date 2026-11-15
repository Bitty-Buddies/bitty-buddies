#!/usr/bin/env node
// Builds js/advent.js for the website's Jolly Winter advent calendar.
// Only the doors opened so far (by UK date) are written out, so nobody can peek at tomorrow's buddy
// in the page source. The website workflow runs this just after midnight every day in December.
// Usage: node scripts/advent-site.js > _site/js/advent.js   (ADVENT_DATE=2026-12-05 to pretend it's another day)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const full = path.join(root, 'src/packs/winter.js');          // the real pack, once it's released
const preview = path.join(root, 'site/js/soon/winter.js');    // the buddies already shown before December
const load = f => { delete require.cache[require.resolve(f)]; return require(f); };
const pack = load(fs.existsSync(full) ? full : preview);
const shown = new Set(Object.keys(load(preview).items));       // these are in the trailer already

const now = process.env.ADVENT_DATE ? new Date(`${process.env.ADVENT_DATE}T12:00:00Z`) : new Date();
const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' })
  .format(now).split('-').map(Number);
const year = pack.advent || 2026;
const openDay = y > year ? 25 : y === year && m === 12 ? Math.min(d, 25) : 0;

const items = Object.entries(pack.items).filter(([key, it]) => it.day <= openDay || shown.has(key));
const value = v => typeof v === 'function' ? v.toString().replace(/^draw\s*\(/, 'function (') : JSON.stringify(v);
const item = it => `{ ${Object.entries(it).map(([k, v]) => `${JSON.stringify(k)}: ${value(v)}`).join(', ')} }`;
const doors = Array.from({ length: 25 }, (_, i) => {
  const hit = i + 1 <= openDay && items.find(([, it]) => it.day === i + 1);
  return { day: i + 1, key: hit ? hit[0] : null };
});

process.stdout.write(`// Made by scripts/advent-site.js. Only the doors opened so far are in here, so no peeking!
(function () {
  const DARK = '#1B1B1B';
  const pack = { id: 'winter', name: ${JSON.stringify(pack.name)}, advent: ${year}, items: {
${items.map(([k, it]) => `    ${JSON.stringify(k)}: ${item(it)}`).join(',\n')}
  } };
  (self.BBPacks = self.BBPacks || []).push(pack);
  self.BBAdvent = { pack: 'winter', year: ${year}, openDay: ${openDay}, doors: ${JSON.stringify(doors)} };
})();
`);
