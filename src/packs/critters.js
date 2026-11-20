// Critters pack — original blocky animals.
// Sprites face RIGHT; the app mirrors them when walking left.
// state = { pose: 'walk'|'idle'|'sit'|'sleep', frame: 0|1, blink: bool }
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, {
  id: 'critters',
  name: 'Critters',
  items: {
    pup: {
      name: 'Pup', blurb: 'loyal blocky doggo', move: 'walk', speed: 45,
      draw(P, s) {
        const c = { body: '#9A6332', shade: '#71461F', muzzle: '#E2BE8E', ear: '#4E2F14', dark: '#1B1B1B', band: '#3C74E0', tongue: '#E8737E' };
        const low = s.pose === 'sit' || s.pose === 'sleep';
        const by = low ? 9 : 7, hy = low ? 3 : 2;
        const step = s.pose === 'walk' && s.frame === 1;
        P.r(1, by - (s.frame ? 2 : 1), 1, 2, c.shade);              // wagging tail
        P.r(2, by, 9, 4, c.body); P.r(2, by + 3, 9, 1, c.shade);     // body
        if (low) { P.r(2, 13, 3, 1, c.shade); P.r(9, 13, 3, 1, c.shade); }
        else { P.r(step ? 3 : 2, 11, 2, 3, c.shade); P.r(step ? 8 : 9, 11, 2, 3, c.shade); }
        P.r(9, hy, 6, 6, c.body);                                    // head
        P.r(12, hy + 3, 4, 3, c.muzzle);
        P.p(15, hy + 3, c.dark);                                     // nose
        P.r(9, hy, 2, 4, c.ear);                                     // floppy ear
        const closed = s.blink || s.pose === 'sleep';
        P.p(12, hy + 2, closed ? c.shade : c.dark);
        if (s.pose === 'idle' && s.frame) P.p(13, hy + 6, c.tongue);
        P.r(9, hy + 6, 3, 1, c.band); P.p(10, hy + 7, c.band);       // bandana
      }
    },

    kit: {
      name: 'Kit', blurb: 'stripy orange cat', move: 'walk', speed: 38,
      draw(P, s) {
        const c = { body: '#E58B32', shade: '#B9661C', stripe: '#A2521A', cream: '#F6E6C8', dark: '#1B1B1B', eye: '#52C46A', nose: '#E98A9A' };
        const low = s.pose === 'sit' || s.pose === 'sleep';
        const by = low ? 10 : 8, hy = low ? 5 : 3;
        const step = s.pose === 'walk' && s.frame === 1;
        if (low) P.r(0, 12, 3, 1, c.body);                           // tail curled on floor
        else { P.r(1, by - 3, 1, 4, c.body); P.p(1, by - 4 + s.frame, c.stripe); }
        P.r(2, by, 9, 3, c.body);
        P.p(4, by, c.stripe); P.p(6, by, c.stripe); P.p(8, by, c.stripe);
        P.r(4, by + 2, 5, 1, c.cream);
        if (low) { P.r(2, 13, 2, 1, c.shade); P.r(8, 13, 3, 1, c.cream); }
        else { P.r(step ? 3 : 2, 11, 2, 3, c.shade); P.r(step ? 8 : 9, 11, 2, 3, c.shade); }
        P.r(9, hy, 6, 5, c.body);                                    // head
        P.r(9, hy - 1, 2, 1, c.body); P.r(12, hy - 1, 2, 1, c.body); // pointy ears
        P.p(11, hy, c.stripe);
        P.r(12, hy + 3, 3, 2, c.cream); P.p(14, hy + 3, c.nose);
        if (s.blink || s.pose === 'sleep') P.r(12, hy + 2, 2, 1, c.shade);
        else { P.p(12, hy + 2, c.eye); P.p(13, hy + 2, c.dark); }
      }
    },

    bun: {
      name: 'Bun', blurb: 'hoppy fluff bunny', move: 'hop', speed: 35,
      draw(P, s) {
        const c = { fur: '#F4F1EC', shade: '#D3CEC6', pink: '#F2A5B8', dark: '#222222', tail: '#FFFFFF' };
        const sleep = s.pose === 'sleep';
        P.r(3, 9, 7, 4, c.fur); P.r(3, 12, 7, 1, c.shade);           // body
        P.r(2, 9, 2, 2, c.tail);                                     // puff tail
        if (s.pose === 'walk' && s.frame) P.r(1, 12, 3, 1, c.shade); // legs stretched mid-hop
        else P.r(3, 13, 4, 1, c.shade);
        P.r(9, 13, 2, 1, c.shade);
        P.r(9, 6, 5, 5, c.fur);                                      // head
        if (sleep) { P.r(5, 6, 4, 1, c.fur); P.r(5, 7, 4, 1, c.pink); } // ears flopped back
        else {
          P.r(9, 1, 2, 5, c.fur); P.r(10, 2, 1, 3, c.pink);
          P.r(12, 2, 2, 4, c.fur); P.r(12, 3, 1, 2, c.pink);
        }
        P.p(11, 8, s.blink || sleep ? c.shade : c.dark);
        P.p(13, 9, c.pink);
      }
    },

    mossling: {
      name: 'Mossling', blurb: 'mossy stone cube with a flower', move: 'hop', speed: 25,
      draw(P, s) {
        const c = { stone: '#7A8A68', light: '#93A47E', dark: '#55623F', moss: '#4E9A3C', mossD: '#3C7A2D', eye: '#1D2216', shine: '#E8F0D8', leaf: '#58C24A', petal: '#F07FB2', center: '#FFE066' };
        const squash = s.pose === 'walk' && s.frame === 1;
        const x0 = squash ? 2 : 3, w = squash ? 12 : 10, y0 = squash ? 6 : 5, h = 14 - y0;
        P.r(x0, y0, w, h, c.stone);
        P.r(x0, y0 + 1, 1, h - 2, c.light);
        P.r(x0, y0 + h - 1, w, 1, c.dark); P.r(x0 + w - 1, y0 + 1, 1, h - 1, c.dark);
        P.r(x0, y0, w, 2, c.moss);                                   // mossy top + drips
        P.p(x0 + 1, y0 + 2, c.moss); P.p(x0 + 4, y0 + 2, c.mossD);
        P.p(x0 + w - 3, y0 + 2, c.moss); P.p(x0 + w - 3, y0 + 3, c.moss);
        const cx = x0 + w / 2;
        if (s.pose !== 'sleep') {                                    // sprout + flower
          P.r(cx, y0 - 3, 1, 3, c.leaf);
          P.p(cx - 1, y0 - 2, c.leaf); P.p(cx + 1, y0 - 3, c.leaf);
          P.p(cx, y0 - 4, c.center);
          P.p(cx - 1, y0 - 4, c.petal); P.p(cx + 1, y0 - 4, c.petal); P.p(cx, y0 - 5, c.petal);
        } else { P.r(cx, y0 - 1, 1, 1, c.leaf); P.p(cx + 1, y0 - 2, c.petal); }
        const ey = y0 + 4;
        [x0 + 2, x0 + w - 4].forEach(ex => {
          if (s.blink || s.pose === 'sleep') P.r(ex, ey + 1, 2, 1, c.eye);
          else { P.r(ex, ey, 2, 2, c.eye); P.p(ex, ey, c.shine); }
        });
        P.r(cx - 1, ey + 3, 2, 1, c.dark);                           // mouth
      }
    },

    ember: {
      name: 'Ember', blurb: 'cosy little flame cube', move: 'hop', speed: 40,
      draw(P, s) {
        const c = { base: '#F0782A', light: '#FFB04A', dark: '#B4471C', eye: '#3A1608', f1: '#FFE27A', f2: '#FF9A2E', f3: '#FF5A1F' };
        const squash = s.pose === 'walk' && s.frame === 1;
        const x0 = squash ? 3 : 4, w = squash ? 10 : 8, y0 = squash ? 8 : 7, h = 14 - y0;
        P.r(x0, y0, w, h, c.base);
        P.r(x0, y0, w - 1, 1, c.light); P.r(x0, y0, 1, h - 1, c.light);
        P.r(x0 + 1, y0 + h - 1, w - 1, 1, c.dark); P.r(x0 + w - 1, y0 + 1, 1, h - 1, c.dark);
        const cx = x0 + w / 2;
        if (s.pose === 'sleep') P.r(cx - 1, y0 - 1, 2, 1, c.f2);
        else if (s.frame === 0) {
          P.r(cx - 2, y0 - 2, 4, 2, c.f3); P.r(cx - 1, y0 - 4, 2, 2, c.f2);
          P.p(cx - 1, y0 - 5, c.f1); P.p(cx + 2, y0 - 3, c.f2); P.r(cx - 1, y0 - 2, 2, 1, c.f1);
        } else {
          P.r(cx - 2, y0 - 2, 4, 2, c.f3); P.r(cx - 1, y0 - 3, 2, 1, c.f2);
          P.r(cx, y0 - 5, 1, 2, c.f2); P.p(cx, y0 - 6, c.f1); P.p(cx - 3, y0 - 3, c.f2);
          P.r(cx - 1, y0 - 2, 2, 1, c.f1);
        }
        const ey = y0 + 2;
        [x0 + 2, x0 + w - 3].forEach(ex => {
          if (s.blink || s.pose === 'sleep') P.p(ex, ey + 1, c.eye); else P.r(ex, ey, 1, 2, c.eye);
        });
        P.r(cx - 1, ey + 3, 2, 1, c.dark);
      }
    },

    pip: {
      name: 'Pip', blurb: 'waddly penguin', move: 'walk', speed: 22,
      draw(P, s) {
        const c = { black: '#23262E', grey: '#3B404C', white: '#F3F3F0', beak: '#F5A524', feet: '#F08A1C', eye: '#FFFFFF', blush: '#F2A0A8' };
        const low = s.pose === 'sit' || s.pose === 'sleep';
        const oy = low ? 1 : 0;
        P.r(5, 3 + oy, 6, 10 - oy, c.black);
        P.p(5, 3 + oy, null); P.p(10, 3 + oy, null);                 // rounded head
        P.r(8, 6 + oy, 3, 6 - oy, c.white);                          // belly
        P.r(11, 5 + oy, 2, 1, c.beak);
        P.p(9, 4 + oy, s.blink || s.pose === 'sleep' ? c.grey : c.eye);
        P.p(10, 6 + oy, c.blush);
        if (s.pose === 'walk' && s.frame) { P.r(6, 7, 1, 3, c.grey); P.p(5, 10, c.grey); }
        else P.r(6, 7 + oy, 1, 4, c.grey);                           // flipper
        if (s.pose === 'walk' && s.frame) { P.r(5, 13, 2, 1, c.feet); P.r(10, 13, 2, 1, c.feet); }
        else { P.r(6, 13, 2, 1, c.feet); P.r(9, 13, 2, 1, c.feet); }
      }
    },
    // ---------- added in 1.1.9 ----------
    fox: {
      name: 'Fennel', blurb: 'bushy-tailed fox', move: 'walk', speed: 44,
      draw(P, s) {
        const c = { fur: '#E0702C', shade: '#B4541C', white: '#F6EFE6', leg: '#3A2A22', dark: '#1B1B1B' };
        const step = s.pose === 'walk' && s.frame === 1, closed = s.blink || s.pose === 'sleep';
        if (s.pose === 'sleep') {
          P.r(2, 9, 11, 4, c.fur); P.r(2, 12, 11, 1, c.shade);
          P.r(0, 9, 4, 4, c.fur); P.r(0, 12, 2, 1, c.white); P.p(0, 11, c.white);      // tail wrapped round
          P.r(10, 9, 5, 4, c.fur); P.r(13, 11, 3, 2, c.white); P.p(15, 11, c.dark);
          P.r(10, 8, 1, 1, c.fur); P.p(13, 8, c.fur); P.r(12, 10, 2, 1, c.shade);
          return;
        }
        if (s.pose === 'sit') {
          P.r(0, 11, 5, 2, c.fur); P.r(0, 11, 2, 1, c.white);                          // tail on the floor
          P.r(4, 7, 7, 6, c.fur); P.r(4, 12, 7, 1, c.shade); P.r(8, 8, 3, 4, c.white);
          P.r(8, 12, 2, 2, c.leg); P.r(10, 12, 2, 2, c.leg);
          P.r(8, 2, 5, 5, c.fur); P.r(12, 5, 3, 2, c.white); P.p(14, 5, c.dark);
          P.r(8, 0, 2, 2, c.fur); P.p(8, 0, c.leg); P.r(11, 0, 2, 2, c.fur); P.p(12, 0, c.leg);
          P.p(11, 3, closed ? c.shade : c.dark);
          return;
        }
        P.r(0, 5 - s.frame, 3, 3, c.fur); P.p(0, 5 - s.frame, c.white); P.r(1, 7, 2, 2, c.fur);   // big bushy tail
        P.r(3, 7, 9, 4, c.fur); P.r(3, 10, 9, 1, c.shade); P.r(10, 8, 2, 3, c.white);
        P.r(step ? 4 : 3, 11, 2, 3, c.leg); P.r(step ? 9 : 10, 11, 2, 3, c.leg);
        P.r(10, 3, 5, 5, c.fur); P.r(13, 6, 3, 2, c.white); P.p(15, 6, c.dark); P.r(11, 6, 2, 2, c.white);
        P.r(10, 1, 2, 2, c.fur); P.p(10, 1, c.leg); P.r(13, 1, 2, 2, c.fur); P.p(14, 1, c.leg);
        P.p(13, 4, closed ? c.shade : c.dark);
      }
    },

    owl: {
      name: 'Hoot', blurb: 'round little owl who loves to nap', move: 'hop', speed: 26,
      draw(P, s) {
        const c = { body: '#8A6A4A', shade: '#6A4E34', belly: '#E8D6B4', spot: '#B89870', eye: '#F2C14E', beak: '#E7962F', dark: '#1B1B1B', foot: '#E7962F' };
        const o = s.pose === 'sit' || s.pose === 'sleep' ? 1 : 0;
        P.r(4, 3 + o, 9, 10 - o, c.body); P.r(5, 2 + o, 7, 1, c.body);
        P.p(4, 2 + o, c.shade); P.p(12, 2 + o, c.shade); P.p(4, 1 + o, c.shade); P.p(12, 1 + o, c.shade);   // ear tufts
        P.r(6, 8 + o, 5, 4 - o, c.belly); [[7, 9], [9, 10], [8, 11]].forEach(([x, y]) => P.p(x, y + o, c.spot));
        P.r(3, 6 + o, 2, 5, c.shade); P.r(12, 6 + o, 2, 5, c.shade);                   // wings
        if (s.pose === 'walk' && s.frame) { P.p(2, 7, c.shade); P.p(14, 7, c.shade); } // a little flap
        const shut = s.blink || s.pose === 'sleep';
        if (shut) { P.r(5, 5 + o, 2, 1, c.dark); P.r(10, 5 + o, 2, 1, c.dark); }
        else { P.r(5, 4 + o, 3, 3, c.eye); P.r(9, 4 + o, 3, 3, c.eye); P.p(6, 5 + o, c.dark); P.p(10, 5 + o, c.dark); }
        P.p(8, 6 + o, c.beak); P.p(8, 7 + o, c.beak);
        P.r(6, 13, 2, 1, c.foot); P.r(9, 13, 2, 1, c.foot);
      }
    },

    frog: {
      name: 'Ribbit', blurb: 'springy green frog', move: 'hop', speed: 40,
      draw(P, s) {
        const c = { skin: '#58B44A', shade: '#3E8A34', belly: '#C8E89A', eye: '#F4F4EC', dark: '#1B1B1B', mouth: '#2E6A28', cheek: '#F09AA0' };
        const crouch = s.pose !== 'walk' || s.frame === 0;
        P.r(2, crouch ? 9 : 8, 12, crouch ? 4 : 4, c.skin); P.r(3, crouch ? 12 : 11, 10, 1, c.belly);
        P.r(1, 12, 4, 1, c.shade); P.r(11, 12, 4, 1, c.shade);                         // back legs
        if (!crouch) { P.r(1, 12, 2, 2, c.shade); P.r(13, 12, 2, 2, c.shade); }
        P.r(5, 13, 2, 1, c.shade); P.r(9, 13, 2, 1, c.shade);
        const ey = crouch ? 7 : 6;
        P.r(4, ey, 3, 3, c.skin); P.r(9, ey, 3, 3, c.skin);                              // eye bumps
        if (s.blink || s.pose === 'sleep') { P.r(4, ey + 1, 3, 1, c.shade); P.r(9, ey + 1, 3, 1, c.shade); }
        else { P.p(5, ey + 1, c.eye); P.p(10, ey + 1, c.eye); P.p(6, ey + 1, c.dark); P.p(11, ey + 1, c.dark); }
        P.r(6, ey + 4, 4, 1, c.mouth); P.p(4, ey + 3, c.cheek); P.p(11, ey + 3, c.cheek);
      }
    },

    hedgehog: {
      name: 'Prickles', blurb: 'snuffly hedgehog', move: 'walk', speed: 22,
      draw(P, s) {
        const c = { spike: '#6E5A48', tip: '#A08A72', face: '#D8B88E', faceS: '#B89470', dark: '#1B1B1B', nose: '#3A2A22', foot: '#8A6A4A' };
        const step = s.pose === 'walk' && s.frame === 1;
        if (s.pose === 'sleep') {                                                       // curled into a spiky ball
          P.r(4, 7, 9, 7, c.spike); P.r(5, 6, 7, 1, c.spike); P.r(5, 13, 7, 1, c.spike);
          [[5, 7], [7, 6], [9, 6], [11, 7], [12, 9], [4, 10], [6, 12], [10, 13]].forEach(([x, y]) => P.p(x, y, c.tip));
          P.r(10, 10, 2, 2, c.face); P.p(11, 11, c.nose);
          return;
        }
        const y = s.pose === 'sit' ? 1 : 0;
        P.r(2, 6 + y, 10, 6, c.spike); P.r(3, 5 + y, 8, 1, c.spike); P.r(4, 4 + y, 5, 1, c.spike);
        [[3, 6], [5, 5], [7, 4], [9, 5], [11, 7], [4, 8], [6, 7], [8, 6], [10, 9], [3, 10], [7, 9]].forEach(([x, yy]) => P.p(x, yy + y, c.tip));
        P.r(10, 8 + y, 4, 4, c.face); P.r(13, 10 + y, 2, 1, c.face); P.p(15, 10 + y, c.nose); P.r(10, 11 + y, 4, 1, c.faceS);
        P.p(12, 9 + y, s.blink ? c.faceS : c.dark);
        if (s.pose !== 'sit') { P.r(step ? 4 : 3, 12, 2, 2, c.foot); P.r(step ? 10 : 11, 12, 2, 2, c.foot); }
        else P.r(10, 13, 3, 1, c.foot);
      }
    },

    squirrel: {
      name: 'Acorn', blurb: 'busy squirrel with a big curly tail', move: 'hop', speed: 42,
      draw(P, s) {
        const c = { fur: '#B8622E', shade: '#8E4520', belly: '#F0D6B0', dark: '#1B1B1B', nut: '#8A5A2E', cap: '#5E3C1C' };
        const low = s.pose === 'sit' || s.pose === 'sleep' ? 1 : 0;
        // big curly tail up the back
        P.r(1, 3, 3, 8, c.fur); P.r(2, 2, 3, 1, c.fur); P.r(4, 3, 1, 2, c.fur); P.r(1, 3, 1, 8, c.shade);
        P.r(4, 8 + low, 7, 5 - low, c.fur); P.r(7, 9 + low, 3, 3, c.belly);
        P.r(8, 4 + low, 5, 5, c.fur); P.r(12, 6 + low, 2, 2, c.fur); P.p(13, 6 + low, c.dark);
        P.p(8, 3 + low, c.fur); P.p(11, 3 + low, c.fur);                                 // ears
        P.p(11, 5 + low, s.blink || s.pose === 'sleep' ? c.shade : c.dark);
        if (s.pose === 'sit' || s.pose === 'idle') { P.r(11, 9 + low, 2, 2, c.nut); P.r(11, 8 + low, 2, 1, c.cap); }   // holding an acorn
        const step = s.pose === 'walk' && s.frame === 1;
        P.r(step ? 5 : 4, 13, 2, 1, c.shade); P.r(step ? 9 : 10, 13, 2, 1, c.shade);
      }
    },

    duck: {
      name: 'Puddle', blurb: 'fluffy yellow duckling', move: 'walk', speed: 30,
      draw(P, s) {
        const c = { fluff: '#F6D64A', shade: '#E2B42E', beak: '#F2903A', dark: '#1B1B1B', foot: '#F2903A', cheek: '#F6A0A0' };
        const step = s.pose === 'walk' && s.frame === 1, low = s.pose === 'sit' || s.pose === 'sleep' ? 1 : 0;
        P.r(3, 7 + low, 9, 5, c.fluff); P.r(4, 12 + low - 1, 7, 1, c.shade); P.p(2, 7 + low, c.fluff); P.p(2, 6 + low, c.fluff);  // body + tail tuft
        P.r(5, 9 + low, 4, 2, c.shade);                                                  // little wing
        P.r(9, 3 + low, 5, 5, c.fluff); P.p(11, 2 + low, c.fluff);                        // head + tuft
        P.r(14, 5 + low, 2, 1, c.beak); P.p(14, 6 + low, c.beak);
        P.p(12, 4 + low, s.blink || s.pose === 'sleep' ? c.shade : c.dark); P.p(12, 6 + low, c.cheek);
        if (!low) { P.r(step ? 5 : 6, 12, 1, 2, c.foot); P.r(step ? 9 : 8, 12, 1, 2, c.foot); P.p(step ? 6 : 7, 13, c.foot); P.p(step ? 10 : 9, 13, c.foot); }
      }
    },

    snail: {
      name: 'Shelly', blurb: 'slow and steady snail', move: 'walk', speed: 9,
      draw(P, s) {
        const c = { body: '#C9B48A', bodyS: '#A8956C', shell: '#C8743A', shellS: '#9A5428', swirl: '#E8A060', dark: '#1B1B1B' };
        const hide = s.pose === 'sleep';
        const stretch = s.pose === 'walk' && s.frame === 1 ? 1 : 0;
        P.r(2, 11, 12 + stretch, 2, c.body); P.r(2, 12, 12 + stretch, 1, c.bodyS);
        P.r(3, 4, 8, 7, c.shell); P.r(4, 3, 6, 1, c.shell); P.r(3, 10, 8, 1, c.shellS);  // shell
        P.r(5, 5, 4, 1, c.swirl); P.r(8, 6, 1, 3, c.swirl); P.r(5, 8, 3, 1, c.swirl); P.p(5, 7, c.swirl); P.p(6, 6, c.shellS);
        if (hide) return;                                                                // tucked in for the night
        P.r(11 + stretch, 7, 2, 4, c.body); P.r(13 + stretch, 9, 1, 2, c.body);
        P.p(11 + stretch, 5, c.body); P.p(11 + stretch, 6, c.body); P.p(13 + stretch, 5, c.body); P.p(13 + stretch, 6, c.body);   // eye stalks
        if (!s.blink) { P.p(11 + stretch, 4, c.dark); P.p(13 + stretch, 4, c.dark); }
      }
    }
  }
});
