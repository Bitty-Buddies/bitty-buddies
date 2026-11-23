// Rider's Pack — Rider's two dachshunds, drawn from his photos, plus their bed and ball.
// Private: hidden from everyone until a licence key that includes 'rider' unlocks it.
// Sprites face RIGHT; the app mirrors them when walking left.
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const DARK = '#1B1514';

  // A long, low sausage dog. c = colours; extras(P, L) adds markings and the harness.
  // Canvas 22 x 16, feet on row 13.
  function doxie(P, s, c, extras) {
    const sleep = s.pose === 'sleep', sit = s.pose === 'sit';
    const step = s.pose === 'walk' && s.frame === 1;
    const closed = s.blink || sleep;
    if (sleep) {                                        // curled up like a cinnamon bun, nose on paws
      P.r(3, 9, 14, 4, c.body); P.r(4, 8, 12, 1, c.body); P.r(3, 12, 14, 1, c.shade);
      P.r(4, 9, 11, 1, c.light);                        // light on the back
      P.r(2, 11, 3, 1, c.body);                         // tail wrapped round
      P.r(13, 9, 6, 4, c.body); P.r(18, 11, 2, 2, c.muzzle || c.body); P.p(19, 11, DARK);
      P.r(13, 9, 2, 4, c.ear);                          // ear flopped over
      P.r(16, 10, 2, 1, c.shade);                       // closed eye
      if (s.frame) P.r(5, 8, 8, 1, c.light);            // breathing
      extras(P, { mode: 'sleep', c });
      return;
    }
    if (sit) {                                          // bum down, chest up, head high
      P.r(2, 10, 9, 4, c.body); P.r(2, 13, 9, 1, c.shade);
      P.r(1, 12, 2, 1, c.body);                         // tail on the floor
      P.r(9, 6, 5, 7, c.body); P.r(9, 6, 1, 7, c.shade);
      P.r(11, 12, 2, 2, c.leg); P.r(13, 12, 1, 2, c.leg);
      P.r(11, 1, 5, 5, c.body); P.r(16, 3, 4, 2, c.muzzle || c.body); P.p(19, 3, DARK);
      P.r(11, 2, 2, 5, c.ear);
      P.p(14, 2, closed ? c.shade : DARK);
      extras(P, { mode: 'sit', c, hx: 11, hy: 1, cx: 9, cy: 6 });
      return;
    }
    // standing / walking / idle
    const wag = s.frame ? -1 : 0;
    P.p(1, 6 + wag, c.body); P.p(2, 7 + wag, c.body); P.p(2, 8, c.body);      // thin tail
    P.r(3, 8, 12, 4, c.body); P.r(3, 11, 12, 1, c.shade); P.r(4, 8, 10, 1, c.light);
    P.r(13, 7, 3, 5, c.body);                                                 // deep chest
    // short legs (front pair and back pair), stepping when walking
    P.r(step ? 4 : 3, 12, 2, 2, c.leg); P.r(step ? 6 : 6, 12, 1, 2, c.leg);
    P.r(step ? 12 : 13, 12, 2, 2, c.leg); P.r(15, 12, 1, 2, c.leg);
    // head and long snout
    P.r(14, 3, 5, 5, c.body); P.r(19, 5, 3, 2, c.muzzle || c.body); P.p(21, 5, DARK);
    P.r(14, 4, 2, 5, c.ear); P.p(15, 9, c.ear);                               // long floppy ear
    P.p(17, 4, closed ? c.shade : DARK);
    if (s.pose === 'idle' && s.frame) P.p(19, 7, '#E8737E');                  // tongue out
    extras(P, { mode: 'stand', c, hx: 14, hy: 3 });
  }

  const RED = { body: '#A9572B', shade: '#7C3A1B', light: '#C26E3B', ear: '#7A3618', leg: '#8E4722', muzzle: '#B66334' };
  const BT = { body: '#221E1C', shade: '#0F0D0C', light: '#3A3431', ear: '#171413', leg: '#B8692E', muzzle: '#C07535', tan: '#B8692E' };

  return {
    id: 'rider',
    name: "Rider's Pack",
    licensed: true, // needs a licence key that includes 'rider'
    hidden: true,   // private: doesn't appear in the menus at all until unlocked
    items: {
      red: {
        name: 'Ginger', blurb: 'red-brown sausage dog', move: 'walk', speed: 32, w: 22, favourite: true,
        draw(P, s) {
          doxie(P, s, RED, (P, L) => {
            const W = '#F2EDE6';                                              // all brown, just a little white on his tummy
            if (L.mode === 'stand') { P.r(9, 11, 4, 1, W); P.p(14, 11, W); }
            else if (L.mode === 'sit') { P.r(L.cx + 2, L.cy + 4, 2, 2, W); }
          });
        }
      },

      blacktan: {
        name: 'Shadow', blurb: 'black and tan sausage dog', move: 'walk', speed: 34, w: 22, favourite: true,
        draw(P, s) {
          doxie(P, s, BT, (P, L) => {
            const H = '#55555F', T = BT.tan;
            if (L.mode === 'stand') {
              P.p(17, 3, T);                                                  // tan eyebrow
              P.r(15, 9, 1, 2, T); P.p(14, 11, T);                            // tan chest
              P.r(13, 7, 2, 4, H); P.r(5, 8, 8, 1, H);                        // black harness
              P.p(1, 6 + (s.frame ? -1 : 0), BT.shade);
            } else if (L.mode === 'sit') {
              P.p(14, 1, T); P.r(L.cx + 3, L.cy + 2, 2, 4, T); P.r(L.cx + 1, L.cy, 2, 5, H);
            } else {
              P.p(17, 9, T);                                                  // eyebrow while sleeping
            }
          });
        }
      },

      bed: {
        name: 'Doggy Bed', blurb: 'their comfy white bed with black bows',
        kind: 'build', move: 'none', w: 24, h: 9, feet: 9,
        draw(P) {
          const k = { a: '#F1EFEA', b: '#D6D2CA', bow: '#2A2A2E', rim: '#BDB7AC' };
          P.r(1, 2, 22, 6, k.a); P.r(0, 3, 1, 4, k.rim); P.r(23, 3, 1, 4, k.rim);
          P.r(1, 7, 22, 1, k.b); P.r(2, 8, 20, 1, k.rim);
          P.r(2, 1, 20, 1, k.a); P.r(3, 4, 18, 2, k.b);                      // the dip where they sleep
          [[3, 2], [9, 4], [15, 2], [19, 4]].forEach(([x, y]) => {   // little bows
            P.p(x, y, k.bow); P.p(x + 2, y, k.bow); P.p(x + 1, y + 1, k.bow); P.p(x, y + 1, k.bow); P.p(x + 2, y + 1, k.bow); P.p(x + 1, y + 2, k.bow);
          });
        }
      },

      ball: {
        name: 'Blue Ball', blurb: 'the garden ball, slightly chewed',
        kind: 'build', move: 'none', w: 8, h: 8, feet: 8,
        draw(P) {
          const k = { a: '#3F86D6', b: '#2C64A8', l: '#7DB4EE' };
          P.r(2, 1, 4, 6, k.a); P.r(1, 2, 6, 4, k.a); P.r(2, 6, 4, 1, k.b); P.r(6, 3, 1, 2, k.b);
          P.p(2, 2, k.l); P.p(3, 2, k.l); P.p(2, 3, k.l);
          P.p(5, 4, k.b); P.p(4, 5, k.b);                                     // chew marks
        }
      }
    }
  };
})());
