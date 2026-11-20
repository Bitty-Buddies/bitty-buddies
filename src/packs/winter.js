// Jolly Winter pack: a free advent calendar of 25 original festive buddies and builds, one a day, 1 to 25 December.
// Sprites face RIGHT; state = { pose: 'walk'|'idle'|'sit'|'sleep', frame: 0|1, blink: bool }
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const DARK = '#1B1B1B';

  return {
    id: 'winter',
    name: 'Jolly Winter',
    advent: 2026,   // an advent calendar: each item's `day` opens on that day of December 2026, then stays forever
    items: {
      elf: {
        name: 'Jingle', blurb: 'workshop elf with a bell hat', move: 'walk', speed: 34, day: 1,
        draw(P, s) {
          const c = { tunic: '#2E9A4A', tunicS: '#22743A', skin: '#F2C9A2', skinS: '#C99C74', hat: '#D6392F', hatS: '#A82A22', fur: '#F6F6F2', bell: '#E7B93C', belt: '#3A2A1C', buckle: '#E7B93C', legs: '#D6392F', boots: '#2E5C2B', cheek: '#F09AA0' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const hy = low ? 5 : 3, by = hy + 5, step = s.pose === 'walk' && s.frame === 0;
          if (low) { P.r(6, 12, 6, 1, c.legs); P.r(11, 11, 2, 2, c.boots); P.p(13, 11, c.boots); }
          else if (step) { P.r(5, 11, 2, 2, c.legs); P.r(9, 11, 2, 2, c.legs); P.r(4, 13, 3, 1, c.boots); P.r(9, 13, 3, 1, c.boots); P.p(12, 12, c.boots); }
          else { P.r(6, 11, 2, 2, c.legs); P.r(8, 11, 2, 2, c.legs); P.r(6, 13, 2, 1, c.boots); P.r(8, 13, 3, 1, c.boots); P.p(11, 12, c.boots); }
          P.r(6, by, 5, (low ? 12 : 11) - by, c.tunic); P.r(6, by, 1, (low ? 12 : 11) - by, c.tunicS);
          P.r(5, by + 2, 7, 1, c.tunic);                               // flared tunic
          P.r(6, by + 1, 5, 1, c.belt); P.p(8, by + 1, c.buckle);
          P.r(7, hy, 4, 5, c.skin); P.p(7, hy + 1, c.skinS);
          P.p(11, hy + 2, c.skin); P.p(12, hy + 1, c.skin);            // pointy ear
          P.p(10, hy + 3, c.cheek);
          P.p(9, hy + 2, s.blink || s.pose === 'sleep' ? c.skinS : DARK);
          P.r(6, hy, 6, 1, c.fur);                                     // hat brim
          P.r(6, hy - 1, 5, 1, c.hat); P.r(5, hy - 2, 4, 1, c.hat); P.r(4, hy - 3, 2, 1, c.hatS);
          P.p(3, hy - 2 + (s.frame ? 1 : 0), c.bell);                  // swinging bell
          P.r(8, by, 1, 3, c.tunicS); P.p(8, by + 3, c.skin);
        }
      },

      reindeer: {
        name: 'Tinsel', blurb: 'reindeer with fairy-light antlers', move: 'walk', speed: 40, h: 17, day: 8,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 1, w, h, c), p: (x, y, c) => P0.p(x, y + 1, c) };
          const c = { fur: '#8B5A2B', furS: '#6B4423', belly: '#D9B48A', antler: '#C8A26A', nose: '#2A1A10', hoof: '#3A2A1C', collar: '#D6392F', bell: '#E7B93C', l1: '#FF5A5A', l2: '#5AD06A', l3: '#5AA8FF', l4: '#FFE066' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const by = low ? 9 : 7, hy = low ? 4 : 2, step = s.pose === 'walk' && s.frame === 1;
          P.p(1, by, c.belly); P.p(1, by + 1, c.fur);                  // tail
          P.r(2, by, 9, 4, c.fur); P.r(4, by + 3, 6, 1, c.belly); P.r(2, by, 9, 1, c.furS);
          if (low) { P.r(2, 13, 3, 1, c.hoof); P.r(8, 13, 3, 1, c.hoof); }
          else {
            P.r(step ? 3 : 2, 11, 1, 2, c.fur); P.r(step ? 5 : 4, 11, 1, 2, c.fur);
            P.r(step ? 8 : 9, 11, 1, 2, c.fur); P.r(10, 11, 1, 2, c.fur);
            [step ? 3 : 2, step ? 5 : 4, step ? 8 : 9, 10].forEach(x => P.p(x, 13, c.hoof));
          }
          P.r(10, hy + 2, 3, 4, c.fur);                               // neck
          P.r(11, hy + 1, 4, 4, c.fur); P.r(14, hy + 3, 2, 2, c.belly); P.p(15, hy + 3, c.nose);
          P.p(13, hy + 2, s.blink || s.pose === 'sleep' ? c.furS : DARK);
          P.p(11, hy + 1, c.furS);                                     // ear
          P.r(10, hy + 5, 3, 1, c.collar); P.p(12, hy + 6, c.bell);
          // antlers with twinkly lights
          P.r(12, hy - 2, 1, 3, c.antler); P.p(11, hy - 2, c.antler); P.p(13, hy - 3, c.antler);
          P.r(10, hy - 1, 1, 2, c.antler); P.p(9, hy - 2, c.antler);
          const on = s.frame ? [c.l1, c.l2, c.l3] : [c.l4, c.l1, c.l2];
          P.p(11, hy - 3, on[0]); P.p(14, hy - 3, on[1]); P.p(9, hy - 3, on[2]);
        }
      },

      snowman: {
        name: 'Flake', blurb: 'snowman who rebuilds himself', move: 'hop', speed: 18, h: 18, day: 12,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 2, w, h, c), p: (x, y, c) => P0.p(x, y + 2, c) };
          const c = { snow: '#F7FAFF', snowS: '#CAD6E8', coal: '#2A2A30', carrot: '#F08A1C', scarf: '#3C74E0', scarfS: '#2A55AC', hat: '#2A2A30', band: '#D6392F', stick: '#7A4E2A' };
          const melt = s.pose === 'sleep';                            // sleeps as a slumped heap
          if (melt) {
            P.r(2, 11, 12, 3, c.snow); P.r(3, 10, 10, 1, c.snow); P.r(2, 13, 12, 1, c.snowS);
            P.r(6, 8, 4, 2, c.snow); P.p(7, 9, c.coal); P.p(9, 9, c.coal); P.p(10, 9, c.carrot);
            P.r(5, 7, 5, 1, c.hat); P.r(6, 6, 3, 1, c.hat); P.r(1, 12, 3, 1, c.scarf);
            return;
          }
          const sq = s.pose === 'walk' && s.frame === 1 ? 1 : 0;
          P.r(3, 9 + sq, 10, 5 - sq, c.snow); P.r(4, 8 + sq, 8, 1, c.snow); P.r(3, 13, 10, 1, c.snowS);
          P.r(4, 5 + sq, 7, 4, c.snow); P.r(5, 4 + sq, 5, 1, c.snow); P.r(10, 6 + sq, 1, 3, c.snowS);
          P.r(5, 1 + sq, 5, 3, c.snow); P.r(9, 2 + sq, 1, 2, c.snowS);
          P.p(7, 9 + sq, c.coal); P.p(7, 11 + sq, c.coal); P.p(7, 6 + sq, c.coal);
          P.p(8, 2 + sq, s.blink ? c.snowS : c.coal); P.r(10, 3 + sq, 2, 1, c.carrot);
          P.r(4, 4 + sq, 7, 1, c.scarf); P.r(4, 5 + sq, 2, 3, c.scarfS);
          P.r(4, 0 + sq, 7, 1, c.hat); P.r(5, -2 + sq, 5, 2, c.hat); P.r(5, -1 + sq, 5, 1, c.band);
          P.r(11, 6 + sq - s.frame, 3, 1, c.stick); P.p(14, 5 + sq - s.frame, c.stick); // waving arm
        }
      },

      bear: {
        name: 'Nook', blurb: 'polar bear cub in a bobble hat', move: 'walk', speed: 30, day: 18,
        draw(P, s) {
          const c = { fur: '#F4F6F8', furS: '#D2DAE4', line: '#9AA6B8', nose: '#2A2A30', hat: '#3CA0C8', hatS: '#2A7A9C', bobble: '#F6F6F2', pad: '#7A8696' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const by = low ? 9 : 7, hy = low ? 5 : 3, step = s.pose === 'walk' && s.frame === 1;
          P.r(2, by - 1, 8, 1, c.line); P.r(1, by, 1, 4, c.line);                  // outline
          P.r(2, by, 9, 5, c.fur); P.r(2, by + 4, 9, 1, c.furS); P.r(2, by, 9, 1, '#FFFFFF');
          if (low) { P.r(2, 13, 4, 1, c.line); P.r(8, 13, 4, 1, c.line); }
          else { P.r(step ? 3 : 2, 12, 3, 2, c.fur); P.r(step ? 8 : 9, 12, 3, 2, c.fur); P.r(step ? 3 : 2, 13, 3, 1, c.line); P.r(step ? 8 : 9, 13, 3, 1, c.line); }
          P.r(9, hy, 6, 6, c.fur); P.r(13, hy + 3, 3, 2, c.fur); P.p(15, hy + 3, c.nose);
          P.r(9, hy + 5, 5, 1, c.furS); P.r(15, hy + 4, 1, 1, c.line); P.r(14, hy + 5, 1, 1, c.line);
          P.r(8, hy + 1, 1, 4, c.line);
          P.p(9, hy, c.furS);
          P.p(12, hy + 2, s.blink || s.pose === 'sleep' ? c.line : c.nose);
          P.r(9, hy - 1, 6, 2, c.hat); P.r(9, hy, 6, 1, c.hatS); P.p(11, hy - 2, c.hat);
          P.r(11, hy - 3, 2, 1, c.bobble); P.p(12, hy - 4 + (s.frame ? 1 : 0), c.bobble);
        }
      },

      ginger: {
        name: 'Snap', blurb: 'gingerbread pup with icing', move: 'hop', speed: 36, day: 5,
        draw(P, s) {
          const c = { dough: '#C27A3A', doughS: '#9A5A26', icing: '#FFFFFF', gum: '#E8394A', gum2: '#3CB04A', dark: '#3A1E0A' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const by = low ? 9 : 7, hy = low ? 4 : 2, step = s.pose === 'walk' && s.frame === 1;
          P.r(1, by - 1, 1, 2, c.dough);
          P.r(2, by, 9, 4, c.dough); P.r(2, by + 3, 9, 1, c.doughS);
          for (let x = 3; x < 10; x += 2) P.p(x, by + 1, c.icing);      // icing zigzag
          for (let x = 4; x < 10; x += 2) P.p(x, by + 2, c.icing);
          if (low) { P.r(2, 13, 3, 1, c.doughS); P.r(9, 13, 3, 1, c.doughS); }
          else { P.r(step ? 3 : 2, 11, 2, 3, c.dough); P.r(step ? 8 : 9, 11, 2, 3, c.dough); P.r(step ? 3 : 2, 13, 2, 1, c.icing); P.r(step ? 8 : 9, 13, 2, 1, c.icing); }
          P.r(9, hy, 6, 6, c.dough); P.r(9, hy + 5, 6, 1, c.doughS);
          P.r(9, hy, 2, 3, c.doughS);                                  // ear
          P.p(15, hy + 3, c.dark);
          P.p(12, hy + 2, s.blink || s.pose === 'sleep' ? c.doughS : c.dark);
          P.r(12, hy + 4, 3, 1, c.icing);                              // icing smile
          P.p(5, by + 1, c.gum); P.p(7, by + 2, c.gum2);              // gumdrop buttons
        }
      },

      robin: {
        name: 'Berry', blurb: 'robin with a bright red breast', move: 'hop', speed: 32, day: 2,
        draw(P, s) {
          const c = { brown: '#8A5A34', brownS: '#6A4226', breast: '#E2552E', breastL: '#F07A4A', belly: '#F2E6D0', beak: '#3A2A1C', leg: '#C08A5A' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const o = low ? 1 : (s.pose === 'walk' && s.frame === 1 ? -1 : 0);
          if (!low) { P.r(7, 12 + o, 1, 2 - o, c.leg); P.r(9, 12 + o, 1, 2 - o, c.leg); P.p(10, 13, c.leg); P.p(8, 13, c.leg); }
          P.r(1, 6 + o, 2, 1, c.brownS); P.r(2, 7 + o, 3, 1, c.brownS);              // tail
          P.r(4, 6 + o, 8, 6, c.brown); P.r(5, 5 + o, 6, 1, c.brown); P.r(5, 12 + o, 6, 1, c.brownS);
          P.r(9, 7 + o, 4, 4, c.breast); P.p(10, 8 + o, c.breastL); P.r(6, 10 + o, 5, 2, c.belly);
          P.r(9, 2 + o, 5, 5, c.brown); P.r(10, 1 + o, 3, 1, c.brown);
          P.r(12, 4 + o, 2, 3, c.breast); P.r(14, 4 + o, 2, 1, c.beak);
          P.p(12, 3 + o, s.blink || s.pose === 'sleep' ? c.brownS : DARK);
          if (s.pose === 'walk' && s.frame) P.r(4, 4 + o, 4, 2, c.brownS);           // flap
          else P.r(5, 7 + o, 4, 3, c.brownS);
        }
      },

      husky: {
        name: 'Blizzard', blurb: 'husky pup in a knitted scarf', move: 'walk', speed: 42, day: 10,
        draw(P, s) {
          const c = { fur: '#7E8896', furS: '#5E6672', white: '#F4F6F8', nose: '#1B1B1B', eye: '#5AA8FF', scarf: '#D6392F', scarfS: '#A82A22', stripe: '#F6F6F2' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const by = low ? 9 : 7, hy = low ? 4 : 2, step = s.pose === 'walk' && s.frame === 1;
          P.r(1, by - 2, 2, 1, c.fur); P.p(1, by - 1, c.fur); P.p(2, by - 3, c.white); // curly tail
          P.r(2, by, 9, 4, c.fur); P.r(3, by + 2, 7, 2, c.white); P.r(2, by, 9, 1, c.furS);
          if (low) { P.r(2, 13, 3, 1, c.white); P.r(9, 13, 3, 1, c.white); }
          else {
            P.r(step ? 3 : 2, 11, 2, 3, c.fur); P.r(step ? 8 : 9, 11, 2, 3, c.fur);
            P.r(step ? 3 : 2, 13, 2, 1, c.white); P.r(step ? 8 : 9, 13, 2, 1, c.white);
          }
          P.r(9, hy, 6, 6, c.fur); P.r(11, hy + 2, 4, 4, c.white); P.r(13, hy + 3, 3, 2, c.white); P.p(15, hy + 3, c.nose);
          P.r(9, hy - 2, 2, 2, c.fur); P.r(12, hy - 2, 2, 2, c.fur); P.p(10, hy - 1, c.white); P.p(13, hy - 1, c.white);
          P.p(12, hy + 1, c.fur); P.p(12, hy + 2, s.blink || s.pose === 'sleep' ? c.furS : c.eye);
          P.r(9, hy + 5, 5, 2, c.scarf); P.p(11, hy + 5, c.stripe);
          P.r(step ? 7 : 8, hy + 6, 2, 3, c.scarfS); P.p(step ? 7 : 8, hy + 8, c.stripe);
        }
      },

      nutcracker: {
        name: 'Cracker', blurb: 'nutcracker soldier who marches on the spot', move: 'walk', speed: 24, day: 24,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 1, w, h, c), p: (x, y, c) => P0.p(x, y + 1, c) };
          const c = { coat: '#C8322A', coatS: '#9A2620', trousers: '#2A3A8A', boots: '#1B1B1B', skin: '#F2C9A2', skinS: '#C99C74', hat: '#1B1B1B', gold: '#E7B93C', white: '#F6F6F2', cheek: '#F09AA0', plume: '#D6392F' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const d = low ? 2 : 0, step = s.pose === 'walk' && s.frame === 1;
          if (low) { P.r(6, 11, 5, 2, c.trousers); P.r(10, 11, 2, 2, c.boots); P.p(12, 12, c.boots); }
          else {
            P.r(6, 10, 2, 2, c.trousers); P.r(9, 10, 2, step ? 1 : 2, c.trousers);
            P.r(5, 12, 3, 1, c.boots); P.r(9, step ? 11 : 12, 3, 1, c.boots);
          }
          P.r(6, 6 + d, 5, 4 - (low ? 1 : 0), c.coat); P.r(6, 6 + d, 1, 4 - (low ? 1 : 0), c.coatS);
          P.r(6, 9 + d - (low ? 1 : 0), 5, 1, c.white); P.p(8, 9 + d - (low ? 1 : 0), c.gold);
          P.p(8, 7 + d, c.gold); P.p(8, 8 + d, c.gold);
          P.r(5, 6 + d, 1, 4, c.coatS); P.p(5, 6 + d, c.gold);
          P.r(11, 6 + d, 1, 3, c.coat); P.p(11, 6 + d, c.gold); P.p(11, 9 + d, c.skin);
          P.r(6, 2 + d, 5, 4, c.skin); P.p(6, 3 + d, c.skinS);
          P.p(9, 3 + d, s.blink || s.pose === 'sleep' ? c.skinS : DARK); P.p(10, 4 + d, c.cheek);
          P.r(8, 4 + d, 3, 1, c.white);                                  // moustache
          P.r(7, 5 + d, 4, 1, c.white); P.p(9, 5 + d, step ? DARK : c.white); // big nutcracker jaw
          P.r(6, -1 + d, 5, 3, c.hat); P.r(6, 1 + d, 5, 1, c.gold); P.p(8, -1 + d, c.gold);
          P.r(8, -2 + d, 1, 1, c.plume);
        }
      },

      pudding: {
        name: 'Figgy', blurb: 'Christmas pudding with a sprig of holly', move: 'hop', speed: 22, day: 14,
        draw(P, s) {
          const c = { pud: '#5A3420', pudS: '#3E2214', pudL: '#7A4A2C', cream: '#FFF6E8', creamS: '#E8DCC4', holly: '#2E8A3E', berry: '#E8394A', fruit: '#2A160C' };
          const sleep = s.pose === 'sleep', sq = s.pose === 'walk' && s.frame === 1 ? 1 : 0;
          P.r(3, 7 + sq, 10, 6 - sq, c.pud); P.r(2, 9 + sq, 12, 4 - sq, c.pud); P.r(4, 6 + sq, 8, 1, c.pud);
          P.r(3, 13, 10, 1, c.pudS);
          [[5, 11], [8, 12], [12, 11], [4, 10]].forEach(([x, y]) => P.p(x, y, c.fruit)); P.p(7, 11, c.pudL);
          P.r(4, 5 + sq, 8, 2, c.cream); P.r(4, 5 + sq, 8, 1, '#FFFFFF');
          P.r(3, 7 + sq, 2, 2, c.cream); P.p(6, 7 + sq, c.cream); P.r(8, 7 + sq, 1, 2, c.cream); P.p(12, 7 + sq, c.cream); P.p(13, 9 + sq, c.creamS);
          P.r(6, 3 + sq, 2, 2, c.holly); P.r(9, 3 + sq, 2, 2, c.holly); P.p(8, 3 + sq, c.berry); P.p(8, 2 + sq, c.berry); P.p(7, 2 + sq, c.berry);
          const eye = s.blink || sleep ? c.pudS : DARK;
          P.p(9, 9 + sq, eye); P.p(12, 9 + sq, eye); P.p(10, 10 + sq, c.berry); P.p(11, 10 + sq, c.berry);
        }
      },

      yeti: {
        name: 'Tundra', blurb: 'yeti cub with very warm fur', move: 'walk', speed: 26, day: 21,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 1, w, h, c), p: (x, y, c) => P0.p(x, y + 1, c) };
          const c = { fur: '#EEF3F8', furS: '#C6D2E0', face: '#7FB6D9', faceS: '#5A92B8', mouth: '#2A3A5A', tooth: '#FFFFFF' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const d = low ? 1 : 0, step = s.pose === 'walk' && s.frame === 1;
          if (low) P.r(4, 12, 9, 1, c.face);
          else {
            P.r(step ? 4 : 5, 10, 3, 2, c.fur); P.r(step ? 9 : 8, 10, 3, 2, c.fur);
            P.r(step ? 4 : 5, 12, 3, 1, c.face); P.r(step ? 9 : 8, 12, 3, 1, c.face);
          }
          P.r(4, 5 + d, 8, 6 - d, c.fur); P.r(3, 6 + d, 10, 4, c.fur); P.p(3, 6 + d, c.furS); P.p(12, 9 + d, c.furS);
          P.r(6, 7 + d, 4, 3, c.furS);
          P.r(2, 6 + d, 2, 4, c.fur); P.r(2, 10 + d, 2, 1, c.face);
          if (s.pose === 'walk' && s.frame === 0) { P.r(12, 3 + d, 2, 4, c.fur); P.r(12, 2 + d, 2, 1, c.face); }
          else { P.r(12, 6 + d, 2, 4, c.fur); P.r(12, 10 + d, 2, 1, c.face); }
          P.r(5, 0 + d, 7, 6, c.fur); P.r(6, -1 + d, 5, 1, c.fur); P.p(8, -2 + d, c.fur);
          P.r(7, 2 + d, 5, 3, c.face);
          const eye = s.blink || s.pose === 'sleep' ? c.faceS : DARK;
          P.p(9, 2 + d, eye); P.p(11, 2 + d, eye);
          P.r(9, 4 + d, 3, 1, c.mouth); P.p(10, 4 + d, c.tooth);
        }
      },

      train: {
        name: 'Choo', blurb: 'toy train that puffs steam', move: 'walk', speed: 46, day: 22,
        draw(P, s) {
          const c = { red: '#D6392F', redS: '#A82A22', black: '#2A2A30', gold: '#E7B93C', blue: '#3C74E0', blueL: '#6A9AF0', hub: '#C8C8C8', steam: '#F4F6F8', window: '#FFE066' };
          const f = s.frame, sleep = s.pose === 'sleep';
          P.r(1, 4, 7, 1, c.black); P.r(2, 5, 5, 6, c.red); P.r(2, 10, 5, 1, c.redS);
          P.r(3, 6, 3, 2, sleep ? c.redS : c.window);
          P.r(7, 7, 7, 4, c.blue); P.r(7, 7, 7, 1, c.blueL); P.r(9, 7, 1, 4, c.gold); P.r(12, 7, 1, 4, c.gold);
          P.r(11, 4, 2, 3, c.black); P.r(10, 3, 4, 1, c.black);
          P.r(14, 8, 1, 3, c.red); P.p(15, 11, c.gold); P.p(14, 11, c.gold);
          P.r(2, 11, 13, 1, c.black);
          [3, 7, 11].forEach(x => { P.r(x, 12, 3, 2, c.black); P.p(x + (f ? 2 : 0), 12 + (f ? 1 : 0), c.hub); });
          P.r(4, 12, 9, 1, c.gold);                                      // coupling rod
          if (!sleep) {
            if (f) { P.r(10, 1, 2, 1, c.steam); P.r(8, 0, 2, 1, c.steam); }
            else { P.r(12, 1, 2, 1, c.steam); P.r(13, 0, 2, 1, c.steam); }
          }
        }
      },

      seal: {
        name: 'Sleet', blurb: 'fluffy seal pup', move: 'hop', speed: 20, day: 16,
        draw(P, s) {
          const c = { fur: '#E8EEF4', furS: '#B8C4D2', nose: '#2A2A30', flip: '#9AA6B8', hi: '#FFFFFF' };
          const sleep = s.pose === 'sleep', sq = s.pose === 'walk' && s.frame === 1 ? 1 : 0;
          const hy = sleep ? 7 : 4 + sq;
          P.r(1, 11, 2, 2, c.flip); P.p(1, 10, c.flip); P.p(0, 13, c.flip);
          P.r(3, 9, 9, 5, c.fur); P.r(4, 8, 7, 1, c.fur); P.r(3, 13, 9, 1, c.furS);
          P.r(9, hy, 6, 6, c.fur); P.r(10, hy - 1, 4, 1, c.fur); P.r(13, hy + 3, 3, 2, c.fur); P.p(15, hy + 3, c.nose);
          if (s.blink || sleep) P.r(11, hy + 2, 2, 1, c.furS);
          else { P.r(11, hy + 1, 2, 2, DARK); P.p(11, hy + 1, c.hi); }
          P.p(14, hy + 5, c.furS); P.p(13, hy + 5, c.furS);
          P.r(8, sq ? 11 : 12, 3, 1, c.flip);
        }
      },

      mouse: {
        name: 'Mince', blurb: 'mouse who found a mince pie', move: 'walk', speed: 38, day: 6,
        draw(P, s) {
          const c = { fur: '#A89A8E', furS: '#857868', pink: '#F2A0A8', pie: '#D9A25A', pieS: '#B07A38', top: '#FFF6E8', tail: '#E8B4B8' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const o = low ? 1 : 0, step = s.pose === 'walk' && s.frame === 1;
          P.r(1, 10 + o, 3, 1, c.tail); P.p(1, 9 + o, c.tail); P.p(2, 8 + o, c.tail);
          P.r(4, 8 + o, 7, 5 - o, c.fur); P.r(5, 7 + o, 5, 1, c.fur); P.r(4, 12, 7, 1, c.furS);
          if (!low) { P.r(step ? 5 : 6, 13, 2, 1, c.pink); P.r(step ? 9 : 8, 13, 2, 1, c.pink); }
          P.r(9, 5 + o, 5, 5, c.fur); P.r(13, 7 + o, 2, 2, c.fur); P.p(15, 7 + o, c.pink);
          P.r(9, 3 + o, 3, 3, c.fur); P.p(10, 4 + o, c.pink);
          P.p(12, 6 + o, s.blink || s.pose === 'sleep' ? c.furS : DARK);
          if (s.pose !== 'sleep') { P.r(11, 10 + o, 4, 2, c.pie); P.r(11, 10 + o, 4, 1, c.pieS); P.p(12, 10 + o, c.top); P.r(10, 10 + o, 1, 2, c.furS); }
        }
      },

      stoat: {
        name: 'Ermine', blurb: 'stoat in its snow-white winter coat', move: 'walk', speed: 48, day: 13,
        draw(P, s) {
          const c = { fur: '#F6F6F2', furS: '#D6D6CE', tip: '#1B1B1B', nose: '#2A2A30', ear: '#E8C8C0' };
          const low = s.pose === 'sit' || s.pose === 'sleep', arch = s.pose === 'walk' && s.frame === 1;
          const o = low ? 1 : 0;
          if (arch) { P.r(3, 8, 8, 3, c.fur); P.r(5, 7, 5, 1, c.fur); P.r(3, 10, 8, 1, c.furS); P.r(4, 11, 2, 3, c.fur); P.r(8, 11, 2, 3, c.fur); }
          else {
            P.r(2, 9 + o, 10, 3, c.fur); P.r(2, 11 + o, 10, 1, c.furS);
            if (!low) { P.r(3, 12, 2, 2, c.fur); P.r(9, 12, 2, 2, c.fur); }
          }
          P.r(1, 9 + o, 2, 1, c.fur); P.p(1, 8 + o, c.fur); P.r(0, 6 + o, 2, 2, c.tip);
          P.r(11, 6 + o, 4, 4, c.fur); P.r(14, 8 + o, 2, 2, c.fur); P.p(15, 8 + o, c.nose);
          P.p(11, 5 + o, c.fur); P.p(12, 5 + o, c.ear); P.p(11, 9 + o, c.furS);
          P.p(13, 7 + o, s.blink || s.pose === 'sleep' ? c.furS : DARK);
        }
      },

      robot: {
        name: 'Clank', blurb: 'wind-up toy robot', move: 'walk', speed: 20, day: 17,
        draw(P, s) {
          const c = { tin: '#9AA6B8', tinL: '#C6D2E0', tinS: '#6E7A8C', red: '#D6392F', eye: '#FFE066', key: '#E7B93C', dark: '#2A2A30' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const d = low ? 2 : 0, step = s.pose === 'walk' && s.frame === 1;
          if (!low) {
            P.r(step ? 5 : 6, 11, 2, 2, c.tinS); P.r(step ? 9 : 8, 11, 2, 2, c.tinS);
            P.r(step ? 4 : 5, 13, 3, 1, c.dark); P.r(step ? 9 : 8, 13, 3, 1, c.dark);
          } else P.r(5, 13, 7, 1, c.dark);
          P.r(5, 6 + d, 6, 5, c.tin); P.r(5, 6 + d, 6, 1, c.tinL); P.r(5, 10 + d, 6, 1, c.tinS);
          P.r(7, 8 + d, 2, 2, c.red); P.p(9, 8 + d, s.frame ? c.eye : c.tinS);
          P.r(4, 7 + d, 1, 3, c.tinS); P.p(4, 10 + d, c.dark);
          if (s.pose === 'walk' && s.frame) { P.r(11, 5 + d, 1, 3, c.tinS); P.p(11, 4 + d, c.dark); }
          else { P.r(11, 7 + d, 1, 3, c.tinS); P.p(11, 10 + d, c.dark); }
          P.r(6, 2 + d, 5, 4, c.tin); P.r(6, 2 + d, 5, 1, c.tinL);
          P.r(8, 3 + d, 3, 1, s.blink || s.pose === 'sleep' ? c.tinS : c.eye); P.r(8, 5 + d, 2, 1, c.dark);
          P.p(8, 1 + d, c.tinS); P.p(8, 0 + d, s.frame ? c.red : c.eye);
          P.r(2, 8 + d, 3, 1, c.key);
          if (s.frame) P.r(1, 7 + d, 1, 3, c.key); else P.r(0, 8 + d, 3, 1, c.key);
        }
      },

      teddy: {
        name: 'Bramble', blurb: 'teddy bear with a red bow', move: 'walk', speed: 22, day: 20,
        draw(P, s) {
          const c = { fur: '#B07A48', furS: '#8A5A34', pad: '#E8C8A0', bow: '#D6392F', bowS: '#A82A22', nose: '#3A1E0A' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const d = low ? 2 : 0, step = s.pose === 'walk' && s.frame === 1;
          if (low) { P.r(4, 12, 3, 2, c.fur); P.r(10, 12, 3, 2, c.fur); P.p(4, 13, c.pad); P.p(12, 13, c.pad); }
          else {
            P.r(step ? 5 : 6, 11, 2, 3, c.fur); P.r(step ? 9 : 8, 11, 2, 3, c.fur);
            P.r(step ? 5 : 6, 13, 2, 1, c.furS); P.r(step ? 9 : 8, 13, 2, 1, c.furS);
          }
          P.r(5, 7 + d, 6, 4, c.fur); P.r(7, 8 + d, 3, 3, c.pad);
          P.r(4, 7 + d, 1, 3, c.fur);
          if (s.pose === 'walk' && s.frame) P.r(11, 5 + d, 1, 3, c.fur); else P.r(11, 7 + d, 1, 3, c.fur);
          P.r(5, 2 + d, 7, 5, c.fur); P.r(5, 1 + d, 2, 2, c.fur); P.r(10, 1 + d, 2, 2, c.fur);
          P.p(6, 2 + d, c.pad); P.p(10, 2 + d, c.pad);
          P.r(9, 4 + d, 3, 2, c.pad); P.p(11, 4 + d, c.nose);
          const eye = s.blink || s.pose === 'sleep' ? c.furS : DARK;
          P.p(8, 3 + d, eye); P.p(10, 3 + d, eye);
          P.p(7, 7 + d, c.bow); P.p(9, 7 + d, c.bow); P.p(8, 7 + d, c.bowS); P.p(7, 8 + d, c.bowS); P.p(9, 8 + d, c.bowS);
        }
      },

      jackbox: {
        name: 'Boing', blurb: 'jack-in-the-box who pops up to say hello', move: 'hop', speed: 18, day: 9, h: 18,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 2, w, h, c), p: (x, y, c) => P0.p(x, y + 2, c) };
          const c = { box: '#3C74E0', boxL: '#6A9AF0', boxS: '#2A55AC', star: '#FFE066', spring: '#C8C8C8', springS: '#8A8A8A', face: '#F6EEDC', hat: '#D6392F', hat2: '#3CB04A', nose: '#E8394A', ruff: '#FFFFFF' };
          const sleep = s.pose === 'sleep';
          P.r(3, 8, 10, 6, c.box); P.r(3, 8, 10, 1, c.boxL); P.r(3, 13, 10, 1, c.boxS); P.r(12, 8, 1, 6, c.boxS);
          P.p(5, 10, c.star); P.p(10, 11, c.star); P.p(7, 12, c.star);
          if (sleep) { P.r(2, 7, 12, 1, c.boxS); P.p(13, 9, c.star); return; }   // shut tight
          P.r(1, 3, 1, 5, c.boxS); P.r(2, 3, 1, 5, c.box);                      // lid flipped open
          const up = s.pose === 'walk' ? (s.frame ? 3 : 1) : 2;
          for (let i = 0; i < up; i++) P.r(7, 7 - i, 2, 1, i % 2 ? c.spring : c.springS);
          const hy = 7 - up - 5;
          P.r(5, hy + 4, 7, 1, c.ruff);
          P.r(6, hy, 5, 4, c.face);
          P.r(5, hy - 1, 3, 1, c.hat); P.r(8, hy - 1, 3, 1, c.hat2); P.p(4, hy - 2, c.hat); P.p(11, hy - 2, c.hat2);
          P.p(3, hy - 3, c.star); P.p(12, hy - 3, c.star);
          const eye = s.blink ? c.face : DARK;
          P.p(8, hy + 1, eye); P.p(10, hy + 1, eye); P.p(9, hy + 2, c.nose); P.r(8, hy + 3, 3, 1, c.nose);
        }
      },

      sprout: {
        name: 'Sprout', blurb: 'Brussels sprout nobody wants to eat', move: 'hop', speed: 24, day: 4,
        draw(P, s) {
          const c = { g1: '#5FA03A', g2: '#8ACB55', g3: '#3E7A26', stem: '#C8D8A0', cheek: '#F09AA0' };
          const sleep = s.pose === 'sleep', sq = s.pose === 'walk' && s.frame === 1 ? 1 : 0;
          P.r(4, 6 + sq, 8, 7 - sq, c.g1); P.r(3, 7 + sq, 10, 5 - sq, c.g1); P.r(5, 5 + sq, 6, 1, c.g1);
          P.r(4, 12, 8, 1, c.g3);
          P.r(5, 7 + sq, 1, 4, c.g3); P.r(10, 6 + sq, 1, 5, c.g3); P.r(6, 6 + sq, 3, 1, c.g2); P.p(4, 8 + sq, c.g2);
          P.r(7, 3 + sq, 2, 2, c.stem); P.p(9, 3 + sq, c.g2);
          P.r(5, 13, 2, 1, c.g3); P.r(9, 13, 2, 1, c.g3);
          const eye = s.blink || sleep ? c.g3 : DARK;
          P.p(9, 8 + sq, eye); P.p(11, 8 + sq, eye); P.p(12, 9 + sq, c.cheek);
          P.r(9, 10 + sq, 2, 1, c.g3);                                    // a bit grumpy
        }
      },

      santa: {
        name: 'Father Christmas', blurb: 'with his sack of presents', move: 'walk', speed: 26, day: 25, h: 17,
        draw(P0, s) {
          const P = { r: (x, y, w, h, c) => P0.r(x, y + 1, w, h, c), p: (x, y, c) => P0.p(x, y + 1, c) };
          const c = { coat: '#D6392F', coatS: '#A82A22', fur: '#F6F6F2', skin: '#F2C9A2', skinS: '#C99C74', beard: '#FFFFFF', belt: '#2A2A30', buckle: '#E7B93C', sack: '#8A5A34', sackS: '#6A4226', cheek: '#F09AA0', gift: '#3C74E0', gift2: '#3CB04A' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const d = low ? 2 : 0, step = s.pose === 'walk' && s.frame === 1;
          P.r(1, 5 + d, 4, 6, c.sack); P.r(1, 10 + d, 4, 1, c.sackS); P.r(2, 4 + d, 2, 1, c.sackS);
          P.p(2, 3 + d, c.gift); P.p(3, 3 + d, c.gift2);
          if (low) { P.r(5, 12, 7, 1, c.coatS); P.r(11, 11, 2, 2, c.belt); }
          else {
            P.r(step ? 5 : 6, 11, 2, 2, c.coat); P.r(9, 11, 2, 2, c.coat);
            P.r(step ? 4 : 5, 13, 3, 1, c.belt); P.r(9, 13, 3, 1, c.belt);
          }
          P.r(5, 6 + d, 7, 4 - (low ? 1 : 0), c.coat); P.r(4, 7 + d, 9, 3 - (low ? 1 : 0), c.coat);
          P.r(4, 9 + d - (low ? 1 : 0), 9, 1, c.belt); P.p(9, 9 + d - (low ? 1 : 0), c.buckle);
          if (!low) P.r(5, 10, 7, 1, c.fur);
          P.r(4, 6 + d, 1, 2, c.coatS);
          P.r(12, 7 + d, 1, 2, c.coat); P.p(12, 9 + d, c.belt);
          P.r(7, 2 + d, 5, 3, c.skin); P.p(7, 3 + d, c.skinS);
          P.r(7, 4 + d, 6, 2, c.beard); P.r(8, 6 + d, 4, 1, c.beard); P.r(10, 4 + d, 3, 1, c.fur);
          P.p(12, 3 + d, c.cheek);
          P.p(10, 3 + d, s.blink || s.pose === 'sleep' ? c.skinS : DARK);
          P.r(7, 1 + d, 6, 1, c.fur); P.r(7, 0 + d, 5, 1, c.coat); P.r(5, 0 + d, 2, 1, c.coat); P.p(4, 1 + d, c.fur);
        }
      },

      // ---------- builds ----------
      tree: {
        name: 'Twinkle Tree', blurb: 'decorated tree with a glowing star', day: 3,
        kind: 'build', move: 'none', w: 20, h: 28, feet: 28,
        glow: { x: 10, y: 3, r: 10, rgb: '255,220,120' },
        draw(P, s) {
          const c = { g1: '#2E8A3E', g2: '#3FAE4E', g3: '#226A30', trunk: '#7A4E2A', pot: '#B8322A', potL: '#D6392F', star: '#FFE066', starL: '#FFF6C0', snow: '#F7FAFF', lights: ['#FF5A5A', '#5AA8FF', '#FFE066', '#C77DFF', '#5AD06A'] };
          P.r(7, 24, 6, 4, c.pot); P.r(7, 24, 6, 1, c.potL); P.r(9, 22, 2, 2, c.trunk);
          const tiers = [[9, 3, 2], [8, 5, 4], [7, 7, 6], [6, 9, 8], [5, 11, 10], [6, 13, 8], [4, 14, 12], [3, 16, 14], [4, 18, 12], [2, 19, 16], [1, 21, 18]];
          tiers.forEach(([x, y, w]) => { P.r(x, y, w, 2, c.g1); P.r(x, y + 1, w, 1, c.g3); P.r(x + 1, y, Math.max(1, w / 3), 1, c.g2); });
          P.r(9, 1, 2, 2, c.star); P.p(8, 2, c.star); P.p(11, 2, c.star); P.p(9, 0, c.star); P.p(10, 1, c.starL);
          const spots = [[9, 6], [11, 8], [7, 10], [12, 12], [8, 14], [5, 17], [13, 16], [10, 18], [4, 20], [15, 20], [8, 21], [12, 21]];
          spots.forEach(([x, y], i) => P.p(x, y, c.lights[(i + (s.frame ? 2 : 0)) % c.lights.length]));
          P.r(5, 12, 3, 1, c.snow); P.r(13, 17, 3, 1, c.snow); P.r(2, 21, 3, 1, c.snow);
        }
      },

      gingerhouse: {
        name: 'Gingerbread House', blurb: 'sweet little cottage with a candy door', day: 15,
        kind: 'build', move: 'none', w: 24, h: 20, feet: 20,
        glow: { x: 12, y: 13, r: 9, rgb: '255,200,120' },
        draw(P, s) {
          const c = { dough: '#C27A3A', doughS: '#9A5A26', icing: '#FFFFFF', red: '#E8394A', green: '#3CB04A', door: '#6B3A1A', glass: '#FFD86B', glassL: '#FFF0A0', cane: '#FFFFFF' };
          P.r(3, 9, 18, 11, c.dough); P.r(3, 19, 18, 1, c.doughS); P.r(20, 9, 1, 11, c.doughS);
          for (let i = 0; i < 9; i++) { P.r(2 + i, 9 - i, 20 - i * 2, 1, c.icing); }
          for (let i = 0; i < 8; i++) P.r(3 + i, 9 - i, 18 - i * 2, 1, i % 2 ? c.dough : c.doughS);
          P.r(2, 9, 20, 1, c.icing);
          [[6, 7], [12, 4], [17, 7], [9, 6], [14, 6]].forEach(([x, y], i) => P.p(x, y, i % 2 ? c.green : c.red));
          P.r(10, 13, 4, 7, c.door); P.r(10, 13, 4, 1, c.icing); P.p(13, 16, c.glass);
          [4, 16].forEach(x => { P.r(x, 12, 4, 3, s.frame ? c.glassL : c.glass); P.r(x, 12, 4, 1, c.icing); P.r(x + 1, 12, 1, 3, c.icing); });
          P.r(1, 12, 1, 8, c.cane); [13, 15, 17, 19].forEach(y => P.p(1, y, c.red)); P.p(2, 12, c.red); P.p(2, 11, c.cane);
          P.r(22, 12, 1, 8, c.cane); [12, 14, 16, 18].forEach(y => P.p(22, y, c.red)); P.p(21, 12, c.red); P.p(21, 11, c.cane);
          P.r(4, 19, 2, 1, c.green); P.r(17, 19, 3, 1, c.red);
        }
      },

      presents: {
        name: 'Present Pile', blurb: 'a stack of wrapped gifts', day: 7,
        kind: 'build', move: 'none', w: 18, h: 14, feet: 14,
        draw(P, s) {
          const c = { green: '#3CB04A', greenS: '#2A8A3A', red: '#D6392F', redS: '#A82A22', blue: '#3C74E0', blueS: '#2A55AC', gold: '#FFE066', purple: '#C77DFF', purpleS: '#9A58D0', white: '#FFFFFF' };
          P.r(1, 5, 9, 9, c.green); P.r(1, 13, 9, 1, c.greenS); P.r(5, 5, 1, 9, c.red); P.r(1, 8, 9, 1, c.red);
          P.r(4, 3, 1, 2, c.red); P.r(6, 3, 1, 2, c.red); P.p(5, 4, c.redS); P.p(8, 6, c.white);
          P.r(10, 3, 5, 11, c.blue); P.r(10, 13, 5, 1, c.blueS); P.r(10, 6, 5, 1, c.gold); P.r(10, 10, 5, 1, c.gold);
          P.p(11, 2, c.gold); P.p(13, 2, c.gold); P.p(12, 2, c.white);
          P.r(13, 9, 5, 5, c.purple); P.r(13, 13, 5, 1, c.purpleS); P.r(15, 9, 1, 5, c.white); P.r(13, 11, 5, 1, c.white); P.p(15, 8, c.white);
          if (s.frame) { P.p(2, 1, c.white); P.p(16, 5, c.white); } else { P.p(9, 2, c.white); P.p(17, 7, c.white); }
        }
      },

      fireplace: {
        name: 'Cosy Fireplace', blurb: 'crackling fire with stockings hung up', day: 11,
        kind: 'build', move: 'none', w: 22, h: 22, feet: 22,
        glow: { x: 11, y: 16, r: 11, rgb: '255,160,80' },
        draw(P, s) {
          const c = { brick: '#A84A32', brickS: '#7A3424', mantel: '#6B3A1A', mantelL: '#8A5A34', hearth: '#24201E', f1: '#FFB43C', f2: '#FF6A2A', f3: '#FFE066', log: '#6B3A1A', cuff: '#F6F6F2', holly: '#2E8A3E', berry: '#E8394A', socks: ['#D6392F', '#3CB04A', '#3C74E0'] };
          P.r(3, 0, 16, 5, c.brick); P.r(3, 2, 16, 1, c.brickS);
          P.r(9, 0, 4, 4, c.holly); P.r(10, 1, 2, 2, c.brick); P.p(9, 3, c.berry); P.p(12, 3, c.berry);
          P.r(1, 7, 20, 15, c.brick);
          for (let y = 9; y < 22; y += 3) P.r(1, y, 20, 1, c.brickS);
          for (let y = 7; y < 22; y += 3) [4, 10, 16].forEach(x => P.p(x + (y % 2 ? 2 : 0), y + 1, c.brickS));
          P.r(0, 5, 22, 2, c.mantel); P.r(0, 5, 22, 1, c.mantelL);
          P.r(5, 11, 12, 11, c.hearth); P.r(6, 10, 10, 1, c.hearth);
          P.r(7, 19, 8, 2, c.log); P.p(8, 19, c.mantelL); P.p(13, 20, c.mantelL);
          if (s.frame) { P.r(8, 16, 6, 3, c.f2); P.r(9, 14, 4, 3, c.f1); P.r(10, 13, 2, 3, c.f3); P.p(9, 12, c.f1); }
          else { P.r(8, 15, 6, 4, c.f2); P.r(9, 13, 4, 4, c.f1); P.r(10, 12, 2, 3, c.f3); P.p(12, 11, c.f1); }
          [2, 10, 17].forEach((x, i) => { P.r(x, 7, 2, 4, c.socks[i]); P.r(x, 10, 3, 1, c.socks[i]); P.r(x, 7, 2, 1, c.cuff); });
          P.p(4, 4, c.holly); P.p(5, 4, c.berry); P.p(17, 4, c.holly); P.p(18, 4, c.berry);
        }
      },

      snowglobe: {
        name: 'Snow Globe', blurb: 'a tiny snowy village in a glass dome', day: 19,
        kind: 'build', move: 'none', w: 16, h: 18, feet: 18,
        glow: { x: 8, y: 8, r: 7, rgb: '190,230,255' },
        draw(P, s) {
          const c = { glass: '#BFE3F5', shine: '#FFFFFF', wood: '#8A5A34', woodD: '#6B4423', woodL: '#A8744A', gold: '#E7B93C', snow: '#F7FAFF', house: '#D6392F', win: '#FFE066', tree: '#2E8A3E', trunk: '#7A4E2A' };
          [[1, 6, 4], [2, 4, 8], [3, 3, 10], [4, 2, 12], [5, 2, 12], [6, 2, 12], [7, 2, 12], [8, 2, 12], [9, 2, 12], [10, 3, 10], [11, 3, 10], [12, 4, 8], [13, 5, 6]].forEach(([y, x, w]) => P.r(x, y, w, 1, c.glass));
          P.r(3, 11, 10, 2, c.snow); P.r(4, 13, 8, 1, c.snow);
          P.r(6, 8, 4, 3, c.house); P.r(5, 7, 6, 1, c.snow); P.r(6, 6, 4, 1, c.snow); P.p(8, 9, c.win);
          P.p(11, 7, c.tree); P.r(10, 8, 3, 1, c.tree); P.r(10, 9, 3, 1, c.tree); P.p(11, 10, c.trunk);
          P.r(4, 3, 1, 2, c.shine); P.p(3, 5, c.shine);
          const flakes = s.frame ? [[5, 5], [8, 3], [11, 6], [4, 8], [12, 4], [7, 5]] : [[4, 4], [9, 4], [12, 7], [5, 7], [11, 3], [7, 2]];
          flakes.forEach(([x, y]) => P.p(x, y, c.snow));
          P.r(3, 14, 10, 4, c.wood); P.r(2, 16, 12, 2, c.woodD); P.r(3, 14, 10, 1, c.woodL); P.r(6, 15, 4, 1, c.gold);
        }
      },

      sleigh: {
        name: 'Sleigh', blurb: 'red sleigh piled high with presents', day: 23,
        kind: 'build', move: 'none', w: 22, h: 14, feet: 14,
        draw(P, s) {
          const c = { red: '#D6392F', redS: '#A82A22', gold: '#E7B93C', runner: '#C8A26A', runnerS: '#8A6A3A', ribbon: '#FFFFFF', g: ['#3C74E0', '#3CB04A', '#C77DFF', '#FFE066'] };
          P.r(2, 13, 18, 1, c.runner); P.r(19, 12, 2, 1, c.runner); P.p(21, 11, c.runner); P.p(20, 10, c.runner);
          P.p(5, 12, c.runnerS); P.p(15, 12, c.runnerS);
          P.r(2, 4, 3, 8, c.red); P.r(2, 4, 3, 1, c.gold);
          P.r(3, 7, 15, 5, c.red); P.r(3, 7, 15, 1, c.gold); P.r(3, 11, 15, 1, c.redS);
          P.r(18, 5, 2, 7, c.red); P.r(19, 4, 2, 2, c.red); P.r(18, 5, 1, 6, c.gold); P.p(20, 6, c.gold);
          [9, 10, 11].forEach(x => P.p(x, 9, c.gold)); P.p(8, 10, c.gold); P.p(12, 10, c.gold);
          P.r(6, 3, 4, 4, c.g[0]); P.r(6, 4, 4, 1, c.ribbon); P.r(7, 3, 1, 4, c.ribbon);
          P.r(11, 1, 3, 6, c.g[1]); P.r(11, 3, 3, 1, c.ribbon);
          P.r(14, 4, 3, 3, c.g[2]); P.r(15, 4, 1, 3, c.ribbon);
          P.p(12, 0, s.frame ? c.ribbon : c.g[3]); P.p(7, 2, c.g[3]);
        }
      }
    }
  };
})());
