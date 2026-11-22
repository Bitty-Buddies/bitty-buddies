const assert = require('assert');
const B = require('../src/bucks');
const at = (h, m = 0, d = 22) => new Date(2026, 10, d, h, m);
let w = B.normalise({});
assert.strictEqual(B.balance(w), 0);
// 4 hours out = 120 Bucks
for (let i = 0; i < 240; i++) B.minute(w, at(9, 0));
assert.strictEqual(B.balance(w), 120, 'minutes');
// gift once a day
assert.strictEqual(B.dailyGift(w, at(10)), 25);
assert.strictEqual(B.dailyGift(w, at(11)), 0);
assert.strictEqual(B.dailyGift(w, at(9, 0, 23)), 25);
w = B.normalise({});
// cap: 10 hours of minutes = 300 full + 0 more... 1200 minutes*0.5=600 → 300 + 300*0.25 = 375
for (let i = 0; i < 1200; i++) B.minute(w, at(1, 0));
assert.strictEqual(B.balance(w), 375, 'cap ' + B.balance(w));
// next day resets
B.minute(w, at(1, 0, 23)); B.minute(w, at(1, 0, 23));
assert.strictEqual(B.balance(w), 376);
// events limited per hour
w = B.normalise({});
let got = 0; for (let i = 0; i < 50; i++) got += B.event(w, 'play', at(12));
assert.strictEqual(got, 30, 'play limit ' + got);
got = 0; for (let i = 0; i < 50; i++) got += B.event(w, 'nap', at(12));
assert.strictEqual(got, 40, 'event limit ' + got);
assert.strictEqual(B.event(w, 'play', at(13)), 3, 'new hour');
// buying
w = B.normalise({ earned: { aaaaaaaaaaaa: 260 } });
assert.throws(() => B.buy(w, 'wizard'), /more Buddy Bucks/);
B.buy(w, 'party'); assert.strictEqual(B.balance(w), 160);
assert.throws(() => B.buy(w, 'party'), /already/);
assert.throws(() => B.buy(w, 'nope'), /isn’t in the shop/);
// friendship
w = B.normalise({});
let ups = [];
for (let i = 0; i < 1500; i++) ups.push(...B.friendMinute(w, ['critters/pup', 'critters/pup'], at(3)));
assert.deepStrictEqual(ups.map(u => u.level), [2, 3, 4]);
assert.strictEqual(ups[2].gift, 200);
assert.strictEqual(B.view(w).friends['critters/pup'].level, 4);
// merge from two PCs
const a = B.normalise({ device: 'aaaaaaaaaaaa', earned: { aaaaaaaaaaaa: 500 }, owned: ['party'] });
const b = B.normalise({ device: 'bbbbbbbbbbbb', earned: { bbbbbbbbbbbb: 300, aaaaaaaaaaaa: 400 }, owned: ['party', 'beanie'], friends: { 'critters/kit': 50 } });
const m = B.merge(a, b);
assert.strictEqual(m.device, 'aaaaaaaaaaaa');
assert.strictEqual(B.balance(m), 800 - 100 - 120);
assert.strictEqual(m.friends['critters/kit'], 50);
// names
B.setName(m, 'critters/pup', '  <b>Biscuit</b> that is way too long a name ');
assert.ok(!/[<>]/.test(m.names['critters/pup']) && m.names['critters/pup'].length <= 20);
console.log('bucks: all good');
