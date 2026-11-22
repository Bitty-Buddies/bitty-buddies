// The Bitty Shop pack: buddies and decorations bought with Buddy Bucks (see src/shop/catalogue.js).
// Each item only shows up once you own it. Sprites face RIGHT; the app mirrors them when walking left.
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const DARK = '#1B1B1B';

  // Chunky bear, used by both bears. 16 x 16, feet on row 13.
  function bear(P, s, c) {
    const low = s.pose === 'sit' || s.pose === 'sleep', sleep = s.pose === 'sleep';
    const step = s.pose === 'walk' && s.frame === 1;
    const closed = s.blink || sleep;
    if (sleep) {
      P.r(1, 8, 13, 6, c.fur); P.r(2, 7, 10, 1, c.fur); P.r(1, 13, 13, 1, c.shade); P.r(3, 8, 8, 1, c.light);
      P.r(10, 9, 5, 5, c.fur); P.r(13, 11, 3, 2, c.muzzle); P.p(15, 11, DARK);
      P.p(10, 8, c.fur); P.p(13, 8, c.fur);            // ears
      P.r(12, 10, 2, 1, c.shade);
      if (s.frame) P.r(3, 7, 6, 1, c.light);
      return;
    }
    const by = low ? 8 : 6;
    P.r(1, by, 11, low ? 6 : 6, c.fur); P.r(2, by - 1, 8, 1, c.fur); P.r(1, by + (low ? 5 : 5), 11, 1, c.shade);
    P.r(3, by, 6, 1, c.light);
    if (low) { P.r(9, 12, 3, 2, c.shade); P.r(1, 12, 3, 2, c.shade); }
    else { P.r(step ? 2 : 1, 12, 3, 2, c.shade); P.r(step ? 9 : 8, 12, 3, 2, c.shade); }
    const hy = low ? 4 : 3;
    P.r(10, hy, 6, 6, c.fur); P.r(13, hy + 3, 3, 3, c.muzzle); P.p(15, hy + 3, DARK);
    P.r(10, hy - 1, 2, 1, c.fur); P.r(13, hy - 1, 2, 1, c.fur); P.p(10, hy - 1, c.ear); P.p(14, hy - 1, c.ear);
    P.p(12, hy + 2, closed ? c.shade : DARK);
    if (s.pose === 'idle' && s.frame) P.p(14, hy + 6, '#E8737E');
  }

  return {
    id: 'shop',
    name: 'Bitty Shop',
    shop: true,       // items unlock one by one when bought with Buddy Bucks
    items: {
      bruno: {
        name: 'Bruno', blurb: 'big brown bear, loves a nap', move: 'walk', speed: 22,
        draw(P, s) { bear(P, s, { fur: '#7A4E2C', shade: '#5A3820', light: '#93613A', muzzle: '#C9A27A', ear: '#4A2E18' }); }
      },

      frost: {
        name: 'Frost', blurb: 'fluffy polar bear', move: 'walk', speed: 22,
        draw(P, s) { bear(P, s, { fur: '#F2F4F6', shade: '#C9D3DE', light: '#FFFFFF', muzzle: '#E6EAEE', ear: '#C9D3DE' }); }
      },

      goblin: {
        name: 'Goblin', blurb: 'cheeky green goblin with a sack of shinies', move: 'walk', speed: 36,
        draw(P, s) {
          const c = { skin: '#6DB04A', skinS: '#4F8A34', tunic: '#7A5A36', tunicS: '#5C4228', sack: '#C8A66A', eye: '#F2D43C' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const stride = s.pose === 'walk' && s.frame === 0;
          const hy = low ? 5 : 3;
          if (low) { P.r(5, 12, 6, 1, c.tunicS); P.r(10, 12, 2, 2, c.skinS); }
          else if (stride) { P.r(5, 11, 2, 3, c.skin); P.r(9, 11, 2, 3, c.skin); }
          else { P.r(6, 11, 2, 3, c.skin); P.r(8, 11, 2, 3, c.skin); }
          P.r(5, hy + 5, 6, low ? 5 : 4, c.tunic); P.r(5, hy + 5, 1, low ? 5 : 4, c.tunicS);
          P.r(5, hy, 6, 5, c.skin); P.r(5, hy, 6, 1, c.skinS);
          P.r(3, hy + 1, 2, 1, c.skin); P.p(2, hy, c.skin);              // big pointy ears
          P.r(11, hy + 1, 2, 1, c.skin); P.p(13, hy, c.skin);
          P.p(11, hy + 3, c.skinS);                                     // long nose
          if (s.blink || s.pose === 'sleep') P.r(8, hy + 2, 2, 1, c.skinS);
          else { P.p(8, hy + 2, c.eye); P.p(9, hy + 2, DARK); }
          P.r(8, hy + 4, 2, 1, DARK); P.p(9, hy + 4, '#FFFFFF');        // toothy grin
          P.r(1, hy + 5, 4, 4, c.sack); P.p(2, hy + 4, c.tunicS);       // sack of shinies
          P.p(2, hy + 6, '#F2D43C');
        }
      },

      sparkle: {
        name: 'Sparkle', blurb: 'little unicorn with a rainbow mane', move: 'walk', speed: 34, w: 18,
        draw(P, s) {
          const c = { body: '#FAF7FF', shade: '#DCD3EE', horn: '#F2C94C', hoof: '#B9A6D8' };
          const mane = ['#F06A8A', '#F2A541', '#F2D43C', '#6CC46A', '#5BA8E8', '#9B7BE0'];
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const step = s.pose === 'walk' && s.frame === 1;
          const y = low ? 3 : 0;
          P.r(2, 6 + y, 10, 4, c.body); P.r(2, 9 + y, 10, 1, c.shade);
          mane.slice(0, 4).forEach((m, i) => P.p(1, 5 + i + y - (s.frame && !low ? 1 : 0), m));    // rainbow tail
          if (!low) { P.r(step ? 3 : 2, 10, 2, 3, c.body); P.r(step ? 10 : 9, 10, 2, 3, c.body); P.r(step ? 3 : 2, 13, 2, 1, c.hoof); P.r(step ? 10 : 9, 13, 2, 1, c.hoof); }
          else { P.r(2, 12, 10, 1, c.hoof); }
          P.r(10, 2 + y, 3, 5, c.body);                                 // neck
          P.r(11, 1 + y, 5, 4, c.body); P.r(15, 3 + y, 2, 2, c.body); P.p(16, 4 + y, c.shade);
          mane.forEach((m, i) => P.p(10, 1 + i + y, m));                 // rainbow mane
          P.p(12, 0 + y, c.body);                                        // ear
          P.p(14, 0 + y, c.horn); P.p(15, -1 + y, c.horn); if (y) P.p(16, y - 2, c.horn);
          if (s.blink || s.pose === 'sleep') P.p(14, 2 + y, c.shade); else P.p(14, 2 + y, DARK);
          if (s.pose === 'idle' && s.frame) [[5, 3], [8, 1], [15, 7]].forEach(([x, yy]) => P.p(x, yy, '#F2D43C'));   // sparkles
        }
      },

      flowerbed: {
        name: 'Flower patch', blurb: 'bright flowers by the taskbar', kind: 'build', move: 'none',
        draw(P, s) {
          const c = { soil: '#6B4423', soilL: '#8A5A30', stem: '#4E9A3C', leaf: '#6CBF55' };
          P.r(1, 12, 14, 2, c.soil); P.r(1, 12, 14, 1, c.soilL);
          [[2, '#F06A8A'], [5, '#F2D43C'], [8, '#9B7BE0'], [11, '#5BA8E8'], [13, '#F2A541']].forEach(([x, col], i) => {
            const t = 7 + (i % 2) + (s.frame && i % 2 ? 1 : 0);
            P.r(x, t + 1, 1, 12 - t - 1, c.stem); P.p(x + 1, t + 3, c.leaf);
            P.p(x, t - 1, col); P.p(x - 1, t, col); P.p(x + 1, t, col); P.p(x, t + 1, col); P.p(x, t, '#FFF3A0');
          });
        }
      },

      fence: {
        name: 'Picket fence', blurb: 'a little white fence', kind: 'build', move: 'none', w: 24,
        draw(P) {
          const c = { white: '#F4F1EA', shade: '#C9C3B6' };
          P.r(0, 8, 24, 1, c.white); P.r(0, 11, 24, 1, c.white); P.r(0, 9, 24, 1, c.shade); P.r(0, 12, 24, 1, c.shade);
          for (let x = 1; x < 24; x += 4) { P.p(x, 5, c.white); P.r(x, 6, 2, 8, c.white); P.r(x + 1, 6, 1, 8, c.shade); }
        }
      },

      mailbox: {
        name: 'Mailbox', blurb: 'with the flag up', kind: 'build', move: 'none',
        draw(P, s) {
          const c = { post: '#6B4E36', postL: '#8A6A4A', box: '#4C7BD6', boxL: '#7AA2EA', boxD: '#335CA8', flag: '#D6392F' };
          P.r(7, 8, 2, 6, c.post); P.r(7, 8, 1, 6, c.postL); P.r(5, 13, 6, 1, c.post);
          P.r(3, 4, 10, 4, c.box); P.r(4, 3, 8, 1, c.box); P.r(4, 3, 8, 1, c.boxL); P.r(3, 7, 10, 1, c.boxD);
          P.r(3, 4, 1, 3, c.boxD); P.p(4, 5, '#1B1B1B');
          if (s.frame) { P.r(13, 1, 1, 6, c.post); P.r(14, 1, 2, 2, c.flag); }
          else { P.r(13, 2, 1, 5, c.post); P.r(14, 2, 2, 2, c.flag); }
        }
      },

      pond: {
        name: 'Lily pond', blurb: 'a tiny pond with a lily pad', kind: 'build', move: 'none', w: 24,
        draw(P, s) {
          const c = { rim: '#8E8E8E', rimL: '#ABABAB', water: '#3E8FD0', waterL: '#7CC0F0', pad: '#4E9A3C', padL: '#6CBF55', lily: '#F48FB1' };
          P.r(3, 10, 18, 4, c.water); P.r(1, 11, 22, 2, c.water);
          P.r(2, 10, 1, 1, c.rim); P.r(21, 10, 1, 1, c.rim); P.r(0, 12, 1, 1, c.rimL); P.r(23, 12, 1, 1, c.rimL);
          P.r(3, 9, 18, 1, c.rimL); P.r(2, 14, 20, 1, c.rim);
          P.r(5 + (s.frame ? 1 : 0), 11, 3, 1, c.waterL); P.r(12 - (s.frame ? 1 : 0), 12, 4, 1, c.waterL);
          P.r(15, 10, 4, 2, c.pad); P.p(15, 10, c.padL); P.p(17, 11, c.water);
          P.p(16, 9, c.lily); P.p(17, 9, '#FFFFFF');
        }
      }
    }
  };
})());
