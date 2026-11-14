// Mitty's Pack — Mitty, a brown tabby with a white bib and chin, pink nose and green eyes.
// Sprites face RIGHT. Besides the usual poses Mitty has two of her own:
//   'eat'  — head down munching a treat (frame 0/1 = chew)
//   'love' — sitting with happy closed eyes and pink cheeks, after a treat
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const c = {
    fur: '#66584A', furL: '#857664', tick: '#9A8A72', stripe: '#28201A', dark: '#1D1915',
    white: '#F4F2EE', whiteS: '#D9D4CB', nose: '#F2A2AC', earIn: '#D99A90',
    eye: '#B9C44E', pupil: '#1B1B1B', blush: '#F6B8C4'
  };

  // Shared head, facing right. (x, y) is the top-left of the 6x5 head block.
  function head(P, x, y, s, mood) {
    P.r(x, y, 6, 5, c.fur);
    P.r(x, y, 6, 1, c.furL);
    P.p(x + 1, y, c.stripe); P.p(x + 3, y, c.stripe); P.p(x + 2, y + 1, c.stripe);   // tabby "M"
    P.p(x, y + 2, c.stripe);
    P.r(x, y - 1, 2, 1, c.fur); P.p(x + 1, y - 1, c.earIn);                        // ears
    P.r(x + 3, y - 1, 2, 1, c.fur); P.p(x + 4, y - 1, c.earIn);
    P.p(x, y - 2, c.fur); P.p(x + 4, y - 2, c.fur);
    P.r(x + 2, y + 3, 4, 2, c.white); P.r(x + 3, y + 2, 3, 1, c.white);           // white muzzle + chin
    P.p(x + 1, y + 4, c.white);
    P.p(x + 5, y + 3, c.nose);
    if (mood === 'love') {                                                          // ^ ^ happy eyes
      P.p(x + 3, y + 1, c.dark); P.p(x + 2, y + 2, c.dark); P.p(x + 4, y + 2, c.dark); P.p(x + 3, y + 2, c.fur);
      P.p(x + 2, y + 3, c.blush);
    } else if (s.blink || s.pose === 'sleep') P.r(x + 3, y + 2, 2, 1, c.stripe);
    else { P.p(x + 3, y + 2, c.eye); P.p(x + 4, y + 2, c.pupil); }
  }

  // Striped tail; pts is a list of [x, y] from the base to the tip.
  function tail(P, pts) {
    pts.forEach(([x, y], i) => P.p(x, y, i === pts.length - 1 || i === pts.length - 2 ? c.dark : (i % 2 ? c.stripe : c.fur)));
  }

  function standing(P, s, headDown) {
    const step = s.pose === 'walk' && s.frame === 1;
    const by = 7;
    if (!headDown) tail(P, [[2, by + 1], [1, by], [1, by - 1], [1, by - 2], [2, by - 3], [2, by - 4]]);
    else tail(P, [[2, by + 1], [1, by + 2], [1, by + 3], [0, by + 4], [0, by + 5], [1, by + 6]]);
    P.r(3, by, 9, 4, c.fur); P.r(3, by, 9, 1, c.furL);                               // body
    [4, 6, 8].forEach(x => { P.r(x, by, 1, 3, c.stripe); });                      // mackerel stripes
    P.p(5, by + 1, c.tick); P.p(7, by + 1, c.tick);
    P.p(3, by + 3, c.white); P.p(4, by + 3, c.whiteS);                            // little white patch on the hip
    P.r(10, by + 1, 2, 3, c.white);                                               // white chest
    P.r(3, by + 3, 9, 1, c.fur); P.p(3, by + 3, c.white); P.r(10, by + 3, 2, 1, c.white);
    const leg = (x) => { P.r(x, 11, 2, 3, c.fur); P.p(x, 11, c.stripe); };
    leg(step ? 4 : 3); leg(step ? 9 : 10);
    P.r(step ? 9 : 10, 13, 2, 1, c.white);                                        // white front paw
    if (headDown) {
      head(P, 11, 8 + (s.frame ? 1 : 0), s, 'eat');
      P.r(11, 7, 1, 2, c.white);
    } else {
      head(P, 11, 2, s);
      P.r(11, 6, 3, 2, c.white);                                                  // bib joining chin to chest
    }
  }

  function sitting(P, s, mood) {
    tail(P, [[4, 13], [3, 13], [2, 13], [1, 13], [0, 13], [0, 12]]);              // tail curled round the front
    P.r(3, 8, 6, 5, c.fur); P.r(4, 7, 4, 1, c.fur);                               // haunch
    P.r(4, 8, 1, 4, c.stripe); P.r(6, 7, 1, 4, c.stripe); P.p(5, 9, c.tick);
    P.r(4, 12, 2, 1, c.white);                                                    // white hip patch, like the photo
    P.r(8, 6, 4, 7, c.fur); P.r(10, 6, 2, 5, c.white); P.p(11, 11, c.white);      // upright chest with white bib
    P.p(8, 7, c.stripe); P.p(8, 9, c.stripe);
    P.r(10, 12, 3, 1, c.white);                                                   // front paws
    P.r(5, 13, 8, 1, c.fur); P.r(10, 13, 3, 1, c.whiteS);
    head(P, 8, 2, s, mood);
  }

  function sleeping(P, s) {
    P.r(3, 10, 10, 4, c.fur); P.r(4, 9, 9, 1, c.fur); P.r(5, 8, 6, 1, c.furL);   // curled loaf
    [5, 7, 9].forEach(x => P.r(x, 8, 1, 3, c.stripe));
    P.p(4, 12, c.white);
    P.r(10, 9, 5, 4, c.fur); P.r(12, 11, 3, 2, c.white); P.p(14, 11, c.nose);     // tucked head
    P.p(10, 8, c.fur); P.p(11, 8, c.earIn); P.p(13, 8, c.fur);
    P.r(12, 10, 2, 1, c.stripe);                                                  // closed eye
    tail(P, [[3, 13], [4, 14], [6, 14], [8, 14], [10, 14], [12, 14], [13, 14]].map(([x, y]) => [x, y - 1]));
    P.r(3, 13, 11, 1, c.dark); [4, 6, 8, 10].forEach(x => P.p(x, 13, c.fur));
    if (s.frame) P.r(4, 9, 6, 1, c.furL);                                         // breathing
  }

  return {
    id: 'mitty',
    name: "Mitty's Pack",
    licensed: true, // needs a licence key that includes 'mitty'
    hidden: true,   // private: doesn't appear in the menus at all until unlocked
    items: {
      mitty: {
        name: 'Mitty', blurb: 'our tabby girl, loves chocolate and sweets', move: 'walk', speed: 34, w: 17,
        poses: ['eat', 'love'], favourite: true,
        draw(P, s) {
          if (s.pose === 'sleep') return sleeping(P, s);
          if (s.pose === 'sit') return sitting(P, s);
          if (s.pose === 'love') return sitting(P, s, 'love');
          if (s.pose === 'eat') return standing(P, s, true);
          return standing(P, s, false);
        }
      },

      cushion: {
        name: "Mitty's Cushion", blurb: 'her favourite spot for a nap',
        kind: 'build', move: 'none', w: 22, h: 8, feet: 8,
        draw(P, s) {
          const k = { a: '#E8DCE4', b: '#D2C2CE', d: '#B8A6B4', pat: '#F6F0F4', tassel: '#C8A0B8' };
          P.r(1, 2, 20, 5, k.a); P.r(2, 1, 18, 1, k.a); P.r(1, 6, 20, 1, k.d); P.r(2, 7, 18, 1, k.d);
          P.r(2, 2, 18, 1, k.pat);
          [[4, 4], [8, 3], [12, 5], [16, 3], [6, 5], [14, 4], [18, 5]].forEach(([x, y]) => P.p(x, y, k.b));
          [[5, 3], [9, 4], [13, 3], [17, 4]].forEach(([x, y]) => P.p(x, y, k.pat));
          P.p(0, 2, k.tassel); P.p(21, 2, k.tassel); P.p(0, 6, k.tassel); P.p(21, 6, k.tassel);
        }
      }
    }
  };
})());
