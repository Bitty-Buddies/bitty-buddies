// Builds pack — structures you place on the desktop. Pets like to rest near them.
// kind: 'build' items don't walk; they can be dragged along the ground.
// glow: optional soft light { x, y, r } in grid pixels plus an rgb colour.
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, {
  id: 'builds',
  name: 'Builds',
  items: {
    shrine: {
      name: 'Shrine', blurb: 'stone shrine with a glowing crystal',
      kind: 'build', move: 'none', w: 24, h: 24, feet: 24,
      glow: { x: 12, y: 11, r: 14, rgb: '170,120,255' },
      draw(P, s) {
        const c = { stone: '#8E8E8E', light: '#ABABAB', dark: '#666666', slate: '#5E6670', slateL: '#76808C', moss: '#4E9A3C', mossL: '#6CBF55', gem: '#9B6BFF', gemL: '#D9C6FF', gemD: '#6A3FD0', rune: '#7FE8FF', spark: '#EDE3FF' };
        P.r(1, 21, 22, 3, c.stone); P.r(1, 21, 22, 1, c.light); P.r(1, 23, 22, 1, c.dark);
        P.r(3, 19, 18, 2, c.stone); P.r(3, 19, 18, 1, c.light);
        [4, 17].forEach(x => { P.r(x, 7, 3, 12, c.stone); P.r(x, 7, 1, 12, c.light); P.r(x + 2, 7, 1, 12, c.dark); });
        P.r(2, 6, 20, 1, c.slate); P.r(3, 5, 18, 1, c.slateL); P.r(5, 4, 14, 1, c.slate);
        P.r(7, 3, 10, 1, c.slateL); P.r(9, 2, 6, 1, c.slate); P.r(11, 1, 2, 1, c.slateL);
        P.r(9, 15, 6, 4, c.stone); P.r(9, 15, 6, 1, c.light); P.r(14, 16, 1, 3, c.dark);
        P.p(11, 17, s.frame ? c.rune : c.gem); P.p(12, 17, s.frame ? c.gem : c.rune);
        P.r(11, 8, 2, 1, c.gemL); P.r(10, 9, 4, 5, c.gem); P.r(11, 14, 2, 1, c.gemD);
        P.r(10, 9, 1, 4, c.gemL); P.r(13, 10, 1, 4, c.gemD);
        if (s.frame) { P.p(8, 10, c.spark); P.p(15, 12, c.spark); }
        else { P.p(9, 7, c.spark); P.p(15, 9, c.spark); }
        P.p(2, 20, c.moss); P.p(3, 20, c.mossL); P.p(19, 20, c.moss); P.p(21, 20, c.moss);
        P.p(4, 12, c.moss); P.p(4, 13, c.mossL); P.p(19, 9, c.moss); P.p(19, 10, c.moss);
        P.r(5, 6, 2, 1, c.moss); P.p(16, 5, c.mossL);
      }
    },

    campfire: {
      name: 'Campfire', blurb: 'crackling fire for cosy naps',
      kind: 'build', move: 'none',
      glow: { x: 8, y: 9, r: 11, rgb: '255,150,60' },
      draw(P, s) {
        const c = { log: '#6B4423', logL: '#A0703A', rock: '#7D7D7D', rockL: '#9C9C9C', f1: '#FFE27A', f2: '#FF9A2E', f3: '#FF5A1F' };
        P.r(1, 12, 2, 2, c.rock); P.p(1, 12, c.rockL); P.r(13, 12, 2, 2, c.rock); P.p(13, 12, c.rockL);
        P.r(3, 12, 10, 2, c.log); P.p(3, 12, c.logL); P.p(12, 12, c.logL); P.r(5, 13, 6, 1, '#4E301A');
        if (s.frame === 0) {
          P.r(5, 9, 6, 3, c.f3); P.r(6, 7, 4, 2, c.f2); P.r(7, 5, 2, 2, c.f2); P.p(8, 4, c.f1);
          P.r(7, 9, 2, 2, c.f1); P.p(4, 10, c.f3); P.p(11, 8, c.f2);
        } else {
          P.r(5, 9, 6, 3, c.f3); P.r(6, 8, 4, 1, c.f2); P.r(6, 6, 3, 2, c.f2); P.p(6, 5, c.f1);
          P.r(7, 9, 3, 2, c.f1); P.p(11, 10, c.f3); P.p(4, 7, c.f2);
        }
      }
    },

    lantern: {
      name: 'Lantern Post', blurb: 'warm light on a wooden post',
      kind: 'build', move: 'none', w: 16, h: 24, feet: 24,
      glow: { x: 12, y: 9, r: 10, rgb: '255,215,110' },
      draw(P, s) {
        const c = { stone: '#8E8E8E', light: '#ABABAB', wood: '#4A3424', woodL: '#6B4E36', iron: '#2E2E2E', glass: '#FFD86B', glassL: '#FFF0A0' };
        P.r(5, 22, 6, 2, c.stone); P.r(5, 22, 6, 1, c.light);
        P.r(7, 4, 2, 18, c.wood); P.r(7, 4, 1, 18, c.woodL);
        P.r(6, 3, 4, 1, c.wood);
        P.r(9, 5, 4, 1, c.wood); P.p(12, 6, c.iron);
        P.r(11, 7, 3, 5, c.iron); P.r(10, 7, 5, 1, c.iron);
        P.r(12, 8, 1, 3, s.frame ? c.glassL : c.glass);
        P.p(11, 9, c.glass); P.p(13, 9, c.glass);
      }
    },
    // ---------- added in 1.1.9 ----------
    well: {
      name: 'Wishing Well', blurb: 'toss in a coin and make a wish',
      kind: 'build', move: 'none', w: 20, h: 22, feet: 22,
      draw(P, s) {
        const c = { stone: '#8E8E8E', light: '#ABABAB', dark: '#666666', wood: '#7A4E2A', woodL: '#9A6A3A', roof: '#B8462E', roofL: '#D65A3A', rope: '#D8C49A', bucket: '#6B4423', water: '#3E8AD6', moss: '#5AA84A' };
        P.r(2, 14, 16, 8, c.stone); P.r(2, 14, 16, 1, c.light); P.r(2, 21, 16, 1, c.dark);
        for (let y = 16; y < 21; y += 2) for (let x = (y % 4 ? 3 : 5); x < 17; x += 4) P.p(x, y, c.dark);   // brick lines
        P.r(4, 13, 12, 1, c.water); P.p(6, 13, '#7FB8EE');
        P.r(3, 5, 1, 9, c.wood); P.r(16, 5, 1, 9, c.wood);                                   // posts
        P.r(1, 4, 18, 1, c.roof); P.r(3, 3, 14, 1, c.roofL); P.r(5, 2, 10, 1, c.roof); P.r(7, 1, 6, 1, c.roofL);   // little roof
        P.r(4, 6, 12, 1, c.woodL);                                                           // winch bar
        P.r(10, 7, 1, s.frame ? 4 : 3, c.rope); P.r(9, s.frame ? 11 : 10, 3, 2, c.bucket);
        P.p(2, 20, c.moss); P.p(17, 19, c.moss); P.p(3, 21, c.moss);
      }
    },

    windmill: {
      name: 'Windmill', blurb: 'little windmill with turning sails',
      kind: 'build', move: 'none', w: 24, h: 32, feet: 32,
      draw(P, s) {
        const c = { wall: '#E8DCC4', wallS: '#C8B89C', roof: '#7A4E2A', roofL: '#9A6A3A', door: '#5A3A22', win: '#6AA8E0', sail: '#F4F0E6', frame: '#6B4423', hub: '#3A2A1C' };
        P.r(7, 14, 10, 18, c.wall); P.r(6, 20, 12, 12, c.wall); P.r(14, 14, 3, 18, c.wallS);   // tower
        P.r(6, 11, 12, 3, c.roof); P.r(8, 9, 8, 2, c.roofL); P.r(10, 8, 4, 1, c.roof);
        P.r(10, 26, 4, 6, c.door); P.p(13, 29, '#E7B93C'); P.r(10, 17, 3, 3, c.win); P.p(11, 18, '#F4F4EC');
        const cx = 12, cy = 11;
        const arms = s.frame ? [[1, 1], [-1, 1], [-1, -1], [1, -1]] : [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (const [dx, dy] of arms) {
          for (let k = 1; k <= 9; k++) {
            const x = cx + Math.round(dx * k), y = cy + Math.round(dy * k);
            P.p(x, y, c.frame);
            if (k >= 3) {                                         // the sail cloth beside each arm
              const ox = -dy, oy = dx;
              P.p(x + ox, y + oy, c.sail); if (!(dx && dy)) P.p(x + 2 * ox, y + 2 * oy, c.sail);
            }
          }
        }
        P.r(cx - 1, cy - 1, 2, 2, c.hub);
      }
    },

    bench: {
      name: 'Park Bench', blurb: 'a comfy bench for a sit-down',
      kind: 'build', move: 'none', w: 22, h: 12, feet: 12,
      draw(P) {
        const c = { wood: '#9A6A3A', woodL: '#B8844A', woodD: '#6B4423', iron: '#2E3238' };
        P.r(2, 1, 18, 2, c.wood); P.r(2, 1, 18, 1, c.woodL); P.r(2, 4, 18, 1, c.wood);     // back rest
        P.r(1, 6, 20, 2, c.wood); P.r(1, 6, 20, 1, c.woodL); P.r(1, 8, 20, 1, c.woodD);     // seat
        [[2, 1], [18, 1]].forEach(([x]) => { P.r(x, 1, 2, 11, c.iron); });
        P.p(1, 11, c.iron); P.p(4, 11, c.iron); P.p(17, 11, c.iron); P.p(20, 11, c.iron);    // curly feet
        P.r(0, 5, 2, 1, c.iron); P.r(20, 5, 2, 1, c.iron);                                     // arm rests
      }
    },

    postbox: {
      name: 'Post Box', blurb: 'red post box for letters to friends',
      kind: 'build', move: 'none', w: 12, h: 20, feet: 20,
      draw(P, s) {
        const c = { red: '#D6392F', redL: '#E85A4A', redD: '#A82A22', slot: '#1E1E1E', gold: '#E7B93C', base: '#2E2E2E', letter: '#F4F0E6' };
        P.r(2, 3, 8, 15, c.red); P.r(3, 2, 6, 1, c.red); P.r(4, 1, 4, 1, c.redL);           // round top
        P.r(2, 3, 1, 15, c.redL); P.r(9, 3, 1, 15, c.redD);
        P.r(1, 5, 10, 1, c.redD); P.r(1, 18, 10, 2, c.base);
        P.r(4, 7, 4, 1, c.slot);
        if (s.frame) P.r(5, 6, 2, 1, c.letter);                                               // a letter going in
        P.r(4, 10, 4, 3, c.redD); P.p(5, 11, c.gold); P.p(6, 11, c.gold);                     // little plaque
      }
    },

    fountain: {
      name: 'Fountain', blurb: 'splashing stone fountain',
      kind: 'build', move: 'none', w: 24, h: 18, feet: 18,
      draw(P, s) {
        const c = { stone: '#9A9A9A', light: '#B8B8B8', dark: '#6E6E6E', water: '#4A9AE0', waterL: '#8AC4F2', spray: '#E4F2FF' };
        P.r(1, 13, 22, 5, c.stone); P.r(1, 13, 22, 1, c.light); P.r(1, 17, 22, 1, c.dark);   // basin
        P.r(2, 12, 20, 1, c.water); P.p(5, 12, c.waterL); P.p(16, 12, c.waterL);
        P.r(10, 7, 4, 6, c.stone); P.r(10, 7, 1, 6, c.light);                                  // pillar
        P.r(7, 6, 10, 2, c.stone); P.r(7, 6, 10, 1, c.light); P.r(8, 5, 8, 1, c.water);        // top bowl
        const f = s.frame;
        P.r(11, 1 + f, 2, 4 - f, c.spray); P.p(11, 0 + f, c.spray);                              // the spout
        [[8, 3], [15, 3], [6, 6], [17, 6], [5, 9], [18, 9]].forEach(([x, y], i) => P.p(x + (i % 2 ? f : -f), y + f, i % 3 ? c.waterL : c.spray));
      }
    },

    stall: {
      name: 'Market Stall', blurb: 'striped stall full of tasty treats',
      kind: 'build', move: 'none', w: 24, h: 22, feet: 22,
      draw(P) {
        const c = { red: '#D6392F', white: '#F4F0E6', wood: '#9A6A3A', woodD: '#6B4423', apple: '#E04A3A', pear: '#B8D24A', bread: '#D8A050', pie: '#C87A3A' };
        for (let x = 0; x < 24; x++) P.r(x, 2, 1, 4, Math.floor(x / 3) % 2 ? c.white : c.red);   // striped awning
        for (let x = 0; x < 24; x += 3) { P.p(x, 6, c.red); P.p(x + 1, 6, c.red); }            // scalloped edge
        P.r(1, 6, 1, 16, c.woodD); P.r(22, 6, 1, 16, c.woodD);                                  // poles
        P.r(1, 14, 22, 2, c.wood); P.r(1, 14, 22, 1, '#B8844A'); P.r(2, 16, 20, 6, c.woodD);   // counter
        [[3, 12, c.apple], [5, 12, c.apple], [4, 11, c.apple], [8, 12, c.pear], [10, 12, c.pear], [9, 11, c.pear]].forEach(([x, y, col]) => P.r(x, y, 2, 2, col));
        P.r(13, 12, 4, 2, c.bread); P.p(14, 12, '#F0C27A'); P.r(18, 12, 3, 2, c.pie); P.r(18, 12, 3, 1, '#E8B060');
      }
    },

    signpost: {
      name: 'Signpost', blurb: 'points the way to adventure',
      kind: 'build', move: 'none', w: 16, h: 22, feet: 22,
      draw(P) {
        const c = { wood: '#8A5A2E', woodL: '#A8743E', woodD: '#5E3C1C', text: '#3A2A1C', grass: '#5AA84A' };
        P.r(7, 3, 2, 19, c.woodD); P.r(7, 3, 1, 19, c.wood);
        P.r(2, 4, 11, 4, c.wood); P.r(13, 5, 1, 2, c.wood); P.r(2, 4, 11, 1, c.woodL);          // sign pointing right
        P.r(4, 6, 6, 1, c.text);
        P.r(3, 10, 11, 4, c.wood); P.r(2, 11, 1, 2, c.wood); P.r(3, 10, 11, 1, c.woodL);        // sign pointing left
        P.r(5, 12, 7, 1, c.text);
        P.p(5, 21, c.grass); P.p(6, 20, c.grass); P.p(9, 21, c.grass); P.p(10, 20, c.grass);
      }
    }
  }
});
