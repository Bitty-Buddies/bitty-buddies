// Outbreak pack: original zombie-apocalypse buddies. Zombies (zombie: true) bite other buddies and turn
// them green; the Field Medic (curer: true) is the only one who can cure them. Medic, Hazmat and the army can't be bitten.
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const DARK = '#1B1B1B';
  const EYE = '#F2E86A';   // glowing zombie eyes

  // Same blocky person as the other packs, plus a zombie slouch and outstretched arms.
  function humanoid(P, s, o) {
    const low = s.pose === 'sit' || s.pose === 'sleep';
    const dy = (o.stout ? 1 : 0) + (low ? 2 : 0);
    const hy = 2 + dy + (o.slouch && !low ? 1 : 0), by = hy + 5;
    const bx = o.stout ? 5 : 6, bw = o.stout ? 7 : 5;
    const bottom = low ? 11 : 10;
    const stride = s.pose === 'walk' && s.frame === 0;

    if (low) { P.r(bx, 12, 7, 1, o.legs); P.r(bx + 6, 12, 2, 2, o.boots); }
    else if (stride) { P.r(5, 11, 2, 2, o.legs); P.r(9, 11, 2, 2, o.legs); P.r(4, 13, 3, 1, o.boots); P.r(9, 13, 3, 1, o.boots); }
    else { P.r(6, 11, 2, 2, o.legs); P.r(8, 11, 2, 2, o.legs); P.r(6, 13, 2, 1, o.boots); P.r(8, 13, 3, 1, o.boots); }

    P.r(bx, by, bw, bottom - by + 1, o.top);
    P.r(bx, by, 1, bottom - by + 1, o.topShade);
    if (o.belt) P.r(bx, bottom, bw, 1, o.belt);

    P.r(6, hy, 5, 5, o.hair);
    P.r(8, hy + 1, 3, 4, o.skin);
    const closed = s.blink || s.pose === 'sleep';
    P.p(9, hy + 2, closed ? o.skinShade : (o.eye || DARK));

    let ax = stride ? 9 : 8;
    if (o.reach && !low) {                       // zombie arms out in front, bobbing as it shuffles
      const ay = by + (s.frame ? 1 : 0);
      P.r(bx + bw, ay, 4, 1, o.topShade); P.p(bx + bw + 4, ay, o.skin);
      ax = bx + bw + 4;
    } else {
      P.r(ax, by, 1, 3, o.topShade); P.p(ax, by + 3, o.skin);
    }
    return { hy, by, bx, bw, low, ax, bottom };
  }

  return {
    id: 'outbreak',
    name: 'Outbreak',
    licensed: true,
    hidden: true,   // testing: Dev/Beta key holders only until it's published
    testing: true,
    items: {
      shambler: {
        name: 'Shambler', blurb: 'groaning classic who shuffles about with arms out', move: 'walk', speed: 12, zombie: true,
        draw(P, s) {
          const c = { skin: '#8DB87A', skinS: '#6A9258', hair: '#3E3A2E', shirt: '#7A8A9A', shirtS: '#5E6C7A', rip: '#4E5A66', jeans: '#3E4E6E', shoe: '#2A2A2A', blood: '#8E2A2A' };
          const L = humanoid(P, s, { slouch: true, reach: true, eye: EYE, skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.shirt, topShade: c.shirtS, legs: c.jeans, boots: c.shoe });
          P.p(L.bx + 2, L.by + 2, c.rip); P.p(L.bx + 3, L.by + 3, c.rip);   // torn shirt
          P.p(L.bx + 1, L.by + 1, c.blood);
          P.p(10, L.hy + 4, c.skinS);                                       // slack jaw
          P.p(7, L.hy - 1, c.hair);                                         // messy tuft
        }
      },

      officezombie: {
        name: 'Office Zombie', blurb: 'still turns up for work, still hates Mondays', move: 'walk', speed: 14, zombie: true,
        draw(P, s) {
          const c = { skin: '#A3C48E', skinS: '#7E9E6A', hair: '#5A4632', suit: '#3A3E4E', suitS: '#2A2D3A', shirt: '#E8E8E0', tie: '#B8322A', shoe: '#1E1E1E', card: '#4F8FD6' };
          const L = humanoid(P, s, { slouch: true, reach: true, eye: EYE, skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.suit, topShade: c.suitS, legs: c.suitS, boots: c.shoe });
          P.r(L.bx + 2, L.by, 2, 2, c.shirt); P.r(L.bx + 2, L.by + 1, 1, 3, c.tie);   // collar and wonky tie
          P.p(L.bx + 3, L.by + 3, c.card);                                             // lanyard badge
          P.p(6, L.hy + 1, c.skinS);                                                   // bald patch
        }
      },

      crawler: {
        name: 'Crawler', blurb: 'drags itself along the bottom of your screen', move: 'walk', speed: 8, zombie: true,
        draw(P, s) {
          const c = { skin: '#7FAE70', skinS: '#5E8A52', hair: '#2E2A24', shirt: '#9A6A4A', shirtS: '#7A4E34' };
          const f = s.frame ? 1 : 0;
          P.r(3, 11, 8, 3, c.shirt); P.r(3, 11, 8, 1, c.shirtS);          // body lying flat
          P.r(10, 9, 4, 4, c.hair); P.r(11, 10, 3, 3, c.skin);           // head up, looking ahead
          P.p(12, 11, s.blink || s.pose === 'sleep' ? c.skinS : EYE);
          P.r(13 + f, 13, 2, 1, c.skin);                                   // reaching hand
          P.r(12, 12, 2, 1, c.shirtS);
          P.r(1, 12, 2, 1, c.shirtS); P.p(0, 13 - f, c.shirtS);            // tattered trailing leg
        }
      },

      zombiedog: {
        name: 'Zombie Pup', blurb: 'a bit rotten, still a very good boy', move: 'walk', speed: 22, zombie: true,
        draw(P, s) {
          const c = { fur: '#8A8A6A', furS: '#6A6A4E', bone: '#E8E2D0', collar: '#C8392F', tag: '#E7B93C' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const f = s.pose === 'walk' && s.frame ? 1 : 0;
          if (s.pose === 'sleep') { P.r(3, 11, 10, 3, c.fur); P.r(10, 10, 4, 3, c.fur); P.p(12, 11, c.furS); P.p(5, 12, c.bone); return; }
          const y = low ? 9 : 8;
          P.r(3, y, 9, 3, c.fur); P.r(3, y, 9, 1, c.furS);                // body
          P.p(6, y + 1, c.bone); P.p(7, y + 2, c.bone);                    // ribs peeking through
          P.r(11, y - 3, 4, 4, c.fur); P.p(14, y - 1, DARK);               // head and nose
          P.p(12, y - 2, s.blink ? c.furS : EYE);
          P.p(11, y - 4, c.furS); P.p(12, y - 4, c.furS);                  // floppy ear
          P.r(11, y + 1, 2, 1, c.collar); P.p(11, y + 2, c.tag);
          P.p(2, y - 1 - f, c.furS); P.p(2, y, c.furS);                    // wagging tail
          if (low) { P.r(4, 12, 2, 2, c.fur); P.r(9, 12, 2, 2, c.fur); }
          else { P.r(4 - f, 11, 1, 3, c.fur); P.r(6 + f, 11, 1, 3, c.fur); P.r(9 - f, 11, 1, 3, c.fur); P.r(11 + f, 11, 1, 3, c.fur); }
        }
      },

      survivor: {
        name: 'Survivor', blurb: 'cap on, bat ready, snacks packed', move: 'walk', speed: 32,
        draw(P, s) {
          const c = { skin: '#E8C09A', skinS: '#B98E68', hair: '#4A3020', cap: '#2F7A5A', capS: '#225A42', jacket: '#B8862A', jacketS: '#8E661E', jeans: '#3E5A8A', boot: '#3A2A1C', wood: '#C8A06A', woodS: '#9A7A4A', pack: '#5A6A3A' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.jacket, topShade: c.jacketS, legs: c.jeans, boots: c.boot });
          P.r(6, L.hy - 1, 5, 2, c.cap); P.r(10, L.hy, 3, 1, c.capS);       // cap with peak
          P.r(4, L.by, 2, 4, c.pack);                                        // backpack
          P.r(L.ax + 1, L.by - 2, 1, 5, c.wood); P.p(L.ax + 1, L.by - 3, c.woodS);   // trusty bat
        }
      },

      hazmat: {
        name: 'Hazmat', blurb: 'sealed suit, clipboard, very worried', move: 'walk', speed: 26, immune: true,
        draw(P, s) {
          const c = { suit: '#E8D23A', suitS: '#C2AE22', visor: '#7FD8E8', visorS: '#4FA8BC', tank: '#5A6A7A', glove: '#2A2A2A', board: '#C8A06A', paper: '#F4F4EC' };
          const L = humanoid(P, s, { stout: true, skin: c.visor, skinShade: c.visorS, hair: c.suit, top: c.suit, topShade: c.suitS, legs: c.suitS, boots: c.glove });
          P.r(7, L.hy + 1, 4, 3, c.visor); P.p(8, L.hy + 1, '#C9F7FF');      // big visor
          P.p(9, L.hy + 2, s.blink || s.pose === 'sleep' ? c.visorS : DARK);
          P.r(3, L.by, 2, 4, c.tank); P.p(3, L.by - 1, c.tank);              // air tank
          P.r(L.ax + 1, L.by + 1, 3, 3, c.board); P.r(L.ax + 1, L.by + 1, 2, 2, c.paper);   // clipboard
          if (s.frame && !L.low) P.p(12, L.hy - 1, '#D6392F');              // worried warning blink
        }
      },

      medic: {
        name: 'Field Medic', blurb: 'patches everyone up, never asks how', move: 'walk', speed: 30, curer: true, immune: true,
        draw(P, s) {
          const c = { skin: '#C8906A', skinS: '#9A6A4A', hair: '#2A1E16', top: '#5E7A4E', topS: '#46603A', legs: '#4A5A3A', boot: '#2A2A1C', band: '#F4F4EC', cross: '#D6392F', bag: '#F4F4EC' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.top, topShade: c.topS, legs: c.legs, boots: c.boot, belt: '#3A2A1C' });
          P.r(6, L.hy, 5, 1, c.band); P.p(7, L.hy, c.cross);                 // headband
          P.r(L.bx, L.by + 1, 1, 2, c.band); P.p(L.bx, L.by + 1, c.cross);   // armband
          P.r(L.ax, L.by + 3, 3, 2, c.bag); P.p(L.ax + 1, L.by + 3, c.cross); // first-aid kit
        }
      },

      grandma: {
        name: 'Tough Gran', blurb: 'seen worse, frying pan in hand', move: 'walk', speed: 20,
        draw(P, s) {
          const c = { skin: '#F0C8A0', skinS: '#C99C74', hair: '#E4E4EC', cardi: '#B86A8E', cardiS: '#8E4E6C', skirt: '#5A4A6A', shoe: '#3A2A2A', pan: '#3A3A3E', panS: '#5A5A60', pearl: '#F4F4EC', glass: '#7AA8C8' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.cardi, topShade: c.cardiS, legs: c.skirt, boots: c.shoe });
          P.r(6, L.hy - 1, 3, 2, c.hair);                                     // hair bun
          P.r(9, L.hy + 2, 2, 1, c.glass); P.p(9, L.hy + 2, s.blink || s.pose === 'sleep' ? c.skinS : DARK);   // specs
          P.p(L.bx + 2, L.by, c.pearl); P.p(L.bx + 4, L.by, c.pearl);        // pearls
          P.r(L.ax + 1, L.by - 1, 3, 3, c.pan); P.p(L.ax + 2, L.by, c.panS); P.r(L.ax, L.by + 2, 1, 2, c.pan);   // frying pan
        }
      },

      // ---------- the army arrives ----------
      soldier: {
        name: 'Soldier', blurb: 'helmet on, keeps the zombies back', move: 'walk', speed: 32, immune: true, defender: true,
        draw(P, s) {
          const c = { skin: '#E0B48C', skinS: '#B08660', helm: '#4E5A2E', helmL: '#66753C', camo: '#5E6B3A', camoS: '#46512A', spot: '#7A8A4E', spot2: '#3A4224', boot: '#2A2418', gun: '#2E2E2A', gunL: '#4A4A44' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.helm, top: c.camo, topShade: c.camoS, legs: c.camoS, boots: c.boot, belt: c.spot2 });
          P.r(5, L.hy - 1, 7, 2, c.helm); P.r(6, L.hy - 2, 5, 1, c.helmL); P.r(10, L.hy + 1, 2, 1, c.helm);   // helmet
          P.p(L.bx + 1, L.by + 1, c.spot); P.p(L.bx + 3, L.by + 3, c.spot2); P.p(L.bx + 4, L.by + 1, c.spot); // camo spots
          P.r(L.ax - 1, L.by + 1, 6, 1, c.gun); P.p(L.ax + 4, L.by, c.gunL); P.p(L.ax, L.by + 2, c.gun);    // rifle held across
        }
      },

      commander: {
        name: 'Commander', blurb: 'beret, binoculars, very loud voice', move: 'walk', speed: 28, immune: true, defender: true,
        draw(P, s) {
          const c = { skin: '#C8906A', skinS: '#9A6A4A', hair: '#3A2A1E', beret: '#8E2A2A', beretL: '#B8403A', coat: '#4E5A3A', coatS: '#3A4428', medal: '#E7B93C', boot: '#1E1A14', bino: '#2A2A2A', stache: '#3A2A1E' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.coat, topShade: c.coatS, legs: c.coatS, boots: c.boot, belt: '#2A2418' });
          P.r(6, L.hy - 1, 5, 2, c.beret); P.r(9, L.hy - 2, 3, 1, c.beretL); P.p(6, L.hy + 1, c.medal);   // beret and badge
          P.r(9, L.hy + 3, 2, 1, c.stache);                                                                // moustache
          P.p(L.bx + 1, L.by + 1, c.medal); P.p(L.bx + 2, L.by + 1, '#D6392F');                           // medals
          if (s.pose === 'idle' && s.frame) { P.r(10, L.hy + 1, 3, 2, c.bino); }                           // peering through binoculars
          else P.r(L.bx + 2, L.by + 2, 2, 1, c.bino);
        }
      },

      radioop: {
        name: 'Radio Operator', blurb: 'big radio, calls in the helicopter', move: 'walk', speed: 30, immune: true,
        draw(P, s) {
          const c = { skin: '#F0C8A0', skinS: '#C99C74', hair: '#C8642A', cap: '#5E6B3A', camo: '#6A7444', camoS: '#4E5630', boot: '#2A2418', radio: '#3E4A2E', radioL: '#5A6A40', dial: '#7FE8A0', ant: '#2A2A2A', phone: '#2A2A2A' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.camo, topShade: c.camoS, legs: c.camoS, boots: c.boot });
          P.r(6, L.hy - 1, 5, 2, c.cap); P.r(10, L.hy, 2, 1, c.cap);                       // field cap
          P.r(3, L.by - 1, 3, 5, c.radio); P.r(3, L.by - 1, 3, 1, c.radioL); P.p(4, L.by + 1, s.frame ? c.dial : c.radioL);   // radio pack
          P.r(3, L.by - 6, 1, 5, c.ant); P.p(3, L.by - 7, s.frame ? '#D6392F' : c.ant);     // aerial with blinking tip
          P.r(10, L.hy + 1, 1, 3, c.phone);                                                  // handset to ear
        }
      },

      engineer: {
        name: 'Army Engineer', blurb: 'puts up the fences, fixes the trucks', move: 'walk', speed: 28, immune: true,
        draw(P, s) {
          const c = { skin: '#8E5E3E', skinS: '#6A4430', hair: '#1E1610', helm: '#C8A83A', helmL: '#E2C25A', over: '#5A5E3A', overS: '#42462A', boot: '#2A2418', belt: '#7A4E2A', tool: '#B8C0CC', toolS: '#8A93A3' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.over, topShade: c.overS, legs: c.overS, boots: c.boot, belt: c.belt });
          P.r(5, L.hy - 1, 7, 2, c.helm); P.r(6, L.hy - 2, 5, 1, c.helmL);                 // hard hat
          P.p(L.bx + 1, L.bottom, c.tool); P.p(L.bx + 3, L.bottom, '#D6392F');              // tool belt
          P.r(L.ax, L.by + 3, 1, 3, c.tool); P.r(L.ax - 1, L.by + 5, 3, 1, c.toolS);         // big spanner
        }
      },

      jeep: {
        name: 'Army Jeep', blurb: 'zooms about the bottom of your screen', move: 'walk', speed: 60, immune: true, vehicle: true,
        w: 24, h: 16, feet: 16,
        draw(P, s) {
          const c = { olive: '#5E6B3A', oliveS: '#46512A', oliveL: '#76854A', tyre: '#222220', hub: '#8A8A7A', glass: '#9FC8D8', helm: '#4E5A2E', skin: '#E0B48C', light: '#FFF4B0', lightOff: '#B8A860', white: '#E8E2D0' };
          const parked = s.pose === 'sleep';
          P.r(1, 7, 2, 4, c.tyre); P.p(1, 8, c.hub);                                         // spare wheel
          P.r(3, 8, 19, 4, c.olive); P.r(3, 8, 19, 1, c.oliveL); P.r(15, 7, 7, 1, c.olive);   // body and bonnet
          P.r(3, 11, 19, 1, c.oliveS);
          P.r(5, 4, 1, 4, c.oliveS); P.r(5, 4, 4, 1, c.oliveS);                              // roll bar
          P.r(13, 3, 1, 5, c.oliveS); P.r(14, 4, 1, 3, c.glass);                             // windscreen
          P.r(9, 3, 3, 2, c.helm); P.r(10, 5, 2, 2, c.skin); P.p(11, 5, parked ? c.skin : '#1B1B1B');   // driver
          P.r(6, 9, 3, 2, c.white);                                                           // door number panel
          P.p(22, 9, parked ? c.lightOff : c.light);
          for (const x of [4, 16]) {                                                         // wheels with turning hubs
            P.r(x, 12, 5, 4, c.tyre); P.r(x + 1, 13, 3, 2, c.hub);
            P.p(x + (s.pose === 'walk' && s.frame ? 3 : 1), 13, c.tyre);
          }
          if (s.pose === 'walk' && s.frame) P.p(0, 12, '#B8B8B0');                           // exhaust puff
        }
      },

      truck: {
        name: 'Army Truck', blurb: 'canvas-backed truck full of supplies', move: 'walk', speed: 40, immune: true, vehicle: true,
        w: 32, h: 20, feet: 20,
        draw(P, s) {
          const c = { olive: '#5E6B3A', oliveS: '#46512A', oliveL: '#76854A', canvas: '#7A7A4E', canvasS: '#5E5E3A', canvasL: '#8E8E60', tyre: '#222220', hub: '#8A8A7A', glass: '#9FC8D8', skin: '#C8906A', helm: '#4E5A2E', light: '#FFF4B0', lightOff: '#B8A860' };
          const parked = s.pose === 'sleep';
          P.r(2, 3, 19, 1, c.canvasL); P.r(1, 4, 21, 9, c.canvas);                           // canvas cover
          for (const x of [6, 12, 18]) P.r(x, 4, 1, 9, c.canvasS);
          P.r(1, 13, 21, 3, c.olive); P.r(1, 13, 21, 1, c.oliveL);                            // cargo bed
          P.r(22, 6, 7, 10, c.olive); P.r(22, 6, 7, 1, c.oliveL);                             // cab
          P.r(25, 7, 3, 4, c.glass); P.r(25, 8, 2, 1, c.helm); P.r(25, 9, 2, 2, c.skin); P.p(26, 9, parked ? c.skin : '#1B1B1B');
          P.r(29, 10, 3, 6, c.olive); P.r(31, 11, 1, 4, c.oliveS); P.p(31, 10, parked ? c.lightOff : c.light);   // bonnet and grille
          P.r(1, 16, 31, 1, c.oliveS);
          for (const x of [3, 9, 24]) {
            P.r(x, 16, 5, 4, c.tyre); P.r(x + 1, 17, 3, 2, c.hub);
            P.p(x + (s.pose === 'walk' && s.frame ? 3 : 1), 17, c.tyre);
          }
        }
      },

      tank: {
        name: 'Tank', blurb: 'slow, rumbly, and a very big friend', move: 'walk', speed: 18, immune: true, vehicle: true,
        w: 32, h: 18, feet: 18,
        draw(P, s) {
          const c = { olive: '#5E6B3A', oliveS: '#46512A', oliveL: '#76854A', track: '#3A3A30', trackL: '#55554A', link: '#22221C', wheel: '#7A7A6A', helm: '#4E5A2E', skin: '#E0B48C' };
          const parked = s.pose === 'sleep';
          P.r(1, 12, 30, 6, c.track); P.r(2, 13, 28, 4, c.trackL);                           // tracks
          for (const x of [4, 9, 14, 19, 24]) { P.r(x, 13, 3, 3, c.wheel); P.p(x + 1, 14, c.link); }
          const off = s.pose === 'walk' && s.frame ? 1 : 0;
          for (let i = 0; i < 15; i++) { P.p(1 + i * 2 + off, 12, c.link); P.p(1 + i * 2 + (1 - off), 17, c.link); }
          P.r(3, 8, 25, 4, c.olive); P.r(3, 8, 25, 1, c.oliveL); P.r(28, 9, 2, 3, c.oliveS);   // hull
          P.r(9, 4, 12, 4, c.olive); P.r(10, 3, 10, 1, c.oliveL); P.r(9, 7, 12, 1, c.oliveS);   // turret
          P.r(21, 5, 9, 2, c.oliveS); P.r(29, 4, 2, 4, c.oliveS);                              // barrel
          if (!parked) { P.r(12, 0, 4, 2, c.helm); P.r(13, 2, 3, 1, c.skin); P.p(15, 2, '#1B1B1B'); }   // commander peeking out
          else P.r(12, 2, 4, 1, c.oliveS);                                                      // hatch shut
        }
      },

      helicopter: {
        name: 'Helicopter', blurb: 'takes off, patrols the sky and drops supplies', move: 'walk', speed: 34, immune: true, vehicle: true, drops: true,
        flies: true, poses: ['fly'],
        w: 32, h: 16, feet: 15,
        draw(P, s) {
          const c = { olive: '#5E6B3A', oliveS: '#46512A', oliveL: '#76854A', glass: '#9FC8D8', glassL: '#D8F0F8', rotor: '#2A2A2A', blur: '#6A6A66', skid: '#2A2A2A', white: '#E8E2D0', helm: '#4E5A2E', light: '#D6392F' };
          const flying = s.pose === 'fly';
          P.r(1, 7, 10, 2, c.olive); P.r(0, 4, 2, 4, c.oliveS);                              // tail boom and fin
          P.r(10, 6, 14, 6, c.olive); P.r(10, 6, 14, 1, c.oliveL); P.r(10, 11, 14, 1, c.oliveS);   // body
          P.r(24, 7, 4, 4, c.olive); P.r(28, 8, 1, 2, c.oliveS);                              // nose
          P.r(22, 7, 5, 3, c.glass); P.p(25, 7, c.glassL); P.r(23, 8, 2, 1, c.helm);          // cockpit and pilot
          P.r(13, 8, 3, 2, c.white);                                                           // door number panel
          P.r(16, 4, 2, 2, c.rotor);                                                           // mast
          if (flying) {
            if (s.frame) { P.r(4, 3, 26, 1, c.blur); P.r(13, 3, 8, 1, c.rotor); P.r(0, 2, 1, 4, c.blur); }
            else { P.r(8, 3, 18, 1, c.rotor); P.p(5, 3, c.blur); P.p(29, 3, c.blur); P.r(0, 3, 1, 2, c.rotor); }
            P.p(1, 6, s.frame ? c.light : c.oliveS);                                          // tail light
          } else {
            P.r(5, 3, 24, 1, c.rotor); P.r(0, 3, 1, 2, c.rotor);                              // blades resting
          }
          P.p(13, 12, c.skid); P.p(21, 12, c.skid); P.r(11, 13, 14, 1, c.skid); P.p(25, 12, c.skid);   // skids
        }
      },

      // ---------- outpost builds ----------
      watchtower: {
        name: 'Watchtower', blurb: 'outpost lookout with a sweeping searchlight',
        kind: 'build', move: 'none', w: 24, h: 32, feet: 32,
        glow: { x: 20, y: 7, r: 12, rgb: '255,240,170' },
        draw(P, s) {
          const c = { wood: '#6B4E36', woodL: '#8A6A4A', woodD: '#4A3424', tin: '#7A8A8A', tinL: '#9AAAAA', tinD: '#5A6A6A', sand: '#C8B07A', sandS: '#A08A5A', lamp: '#3A3A3A', light: '#FFF4B0', lightD: '#E8D878' };
          P.r(4, 14, 2, 18, c.wood); P.r(18, 14, 2, 18, c.wood);                           // legs
          for (let i = 0; i < 12; i++) { P.p(6 + i, 16 + i, c.woodD); P.p(17 - i, 16 + i, c.woodD); }   // cross braces
          P.r(10, 14, 1, 18, c.woodL); P.r(13, 14, 1, 18, c.woodL);                        // ladder
          for (let y = 16; y < 32; y += 3) P.r(10, y, 4, 1, c.woodL);
          P.r(2, 12, 20, 2, c.woodD); P.r(2, 12, 20, 1, c.woodL);                          // platform
          P.r(3, 9, 18, 3, c.sand);                                                         // sandbag rim
          for (let x = 5; x < 21; x += 4) P.p(x, 10, c.sandS);
          P.r(3, 3, 1, 6, c.wood); P.r(20, 3, 1, 6, c.wood);                               // posts
          P.r(1, 1, 22, 2, c.tin); P.r(2, 0, 20, 1, c.tinL); P.r(1, 2, 22, 1, c.tinD);     // tin roof
          P.r(16, 5, 3, 3, c.lamp); P.p(19, 6, s.frame ? c.light : c.lightD);              // searchlight
          if (s.frame) { P.p(21, 5, c.light); P.p(22, 4, c.light); } else { P.p(21, 7, c.light); P.p(22, 8, c.light); }
        }
      },

      barbedwire: {
        name: 'Barbed Wire', blurb: 'zombies get tangled up and slow right down',
        kind: 'build', move: 'none', slows: true, w: 24, h: 12, feet: 12,
        draw(P, s) {
          const c = { post: '#6B4E36', postL: '#8A6A4A', wire: '#8A8A8A', wireL: '#C8C8C8', rust: '#9A5A2A' };
          for (const x of [2, 12, 21]) { P.r(x, 2, 2, 10, c.post); P.p(x, 2, c.postL); }
          for (let x = 0; x < 24; x++) {                                                    // two coiled strands
            P.p(x, 4 + ((x >> 1) % 2), c.wire);
            P.p(x, 8 + (((x + 1) >> 1) % 2), c.wire);
            if (x % 3 === 1) { P.p(x, 3, c.wireL); P.p(x, 7, c.wireL); }                    // barbs
          }
          P.p(7, 5, c.rust); P.p(17, 9, c.rust);
          if (s.frame) P.p(9, 3, '#FFFFFF');                                                // glint
        }
      },

      sandbags: {
        name: 'Sandbag Wall', blurb: 'stacked bags, good for hiding behind',
        kind: 'build', move: 'none', w: 24, h: 12, feet: 12,
        draw(P, s) {
          const c = { sand: '#C8B07A', sandL: '#DCC690', sandS: '#A08A5A', tie: '#6B4E36' };
          const bag = (x, y, w) => { P.r(x, y, w, 4, c.sand); P.r(x + 1, y, w - 2, 1, c.sandL); P.r(x, y + 3, w, 1, c.sandS); P.p(x + w - 1, y + 1, c.tie); };
          bag(0, 8, 8); bag(8, 8, 8); bag(16, 8, 8);
          bag(4, 4, 8); bag(12, 4, 8);
          bag(8, 0, 8);
        }
      },

      tent: {
        name: 'Army Tent', blurb: 'where the soldiers nap between patrols',
        kind: 'build', move: 'none', w: 24, h: 16, feet: 16,
        draw(P, s) {
          const c = { canvas: '#6A7444', canvasL: '#7E8A54', canvasS: '#4E5630', door: '#2E3420', rope: '#C8B890', peg: '#6B4E36' };
          for (let i = 0; i < 12; i++) {
            const w = 2 + i * 2;
            P.r(12 - 1 - i, 4 + i, w, 1, c.canvas);
            P.p(12 - 1 - i, 4 + i, c.canvasL);
            P.p(12 + i, 4 + i, c.canvasS);
          }
          P.r(11, 2, 2, 2, c.peg);                                                         // pole top
          for (let i = 0; i < 6; i++) P.r(12 - 1 - i, 10 + i, 1 + i * 2 > 0 ? 2 + i * 2 : 2, 1, c.door);   // door flap
          P.r(11, 10, 2, 6, c.door);
          P.p(0, 15, c.peg); P.p(23, 15, c.peg); P.p(1, 14, c.rope); P.p(22, 14, c.rope);
          if (s.frame) P.p(14, 13, c.canvasL);                                              // flap sways
        }
      },

      crates: {
        name: 'Supply Crates', blurb: 'tins, torches and emergency biscuits',
        kind: 'build', move: 'none', w: 16, h: 16, feet: 16,
        draw(P, s) {
          const c = { wood: '#A0703A', woodL: '#C08A4A', woodD: '#6B4423', green: '#5E6B3A', greenL: '#76854A', greenD: '#46512A', stencil: '#E8E2D0', can: '#B8322A', canL: '#D6392F' };
          P.r(0, 8, 8, 8, c.wood); P.r(0, 8, 8, 1, c.woodL); P.r(0, 8, 1, 8, c.woodD); P.r(7, 8, 1, 8, c.woodD);   // wooden crate
          P.p(1, 9, c.woodD); P.p(6, 14, c.woodD); for (let i = 1; i < 7; i++) P.p(i, 8 + i, c.woodD);
          P.r(8, 10, 8, 6, c.green); P.r(8, 10, 8, 1, c.greenL); P.r(8, 15, 8, 1, c.greenD);   // green supply box
          P.r(10, 12, 4, 1, c.stencil);
          P.r(2, 2, 6, 6, c.wood); P.r(2, 2, 6, 1, c.woodL); P.r(2, 7, 6, 1, c.woodD); P.r(4, 4, 2, 2, c.stencil);   // top crate
          P.r(10, 6, 3, 4, c.can); P.r(10, 6, 3, 1, c.canL); P.p(12, 5, c.can);             // jerry can
        }
      },

      barricade: {
        name: 'Barricade', blurb: 'striped roadblock with a blinking warning light',
        kind: 'build', move: 'none', w: 24, h: 16, feet: 16,
        glow: { x: 12, y: 2, r: 7, rgb: '255,170,40' },
        draw(P, s) {
          const c = { red: '#D6392F', white: '#F4F4EC', leg: '#6B4E36', legL: '#8A6A4A', lamp: '#FFB02E', lampOff: '#8A6A2A', base: '#3A3A3A' };
          for (let x = 1; x < 23; x++) { const col = ((x >> 1) % 2) ? c.red : c.white; P.r(x, 5, 1, 3, col); P.r(x, 10, 1, 2, col); }   // striped boards
          for (const x of [3, 19]) { P.r(x, 4, 2, 12, c.leg); P.p(x, 4, c.legL); P.r(x - 1, 15, 4, 1, c.leg); }
          P.r(11, 2, 2, 3, c.base); P.r(11, 0, 2, 2, s.frame ? c.lamp : c.lampOff);        // warning lamp
        }
      }
,
      // ---------- more of the undead ----------
      brute: {
        name: 'Brute', blurb: 'stocky, slow and impossible to stop', move: 'walk', speed: 9, zombie: true,
        draw(P, s) {
          const c = { skin: '#7FA86A', skinS: '#5E8450', hair: '#2E2A24', vest: '#6A5A4A', vestS: '#4E4236', jeans: '#2E3E5A', shoe: '#1E1E1E', scar: '#4E6A40' };
          const L = humanoid(P, s, { stout: true, slouch: true, reach: true, eye: EYE, skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.vest, topShade: c.vestS, legs: c.jeans, boots: c.shoe });
          P.r(4, L.by, 2, 3, c.skin); P.r(4, L.by + 2, 1, 1, c.skinS);                 // big bare shoulder
          P.p(L.bx + 3, L.by + 2, c.skin); P.p(L.bx + 4, L.by + 3, c.skin);           // ripped vest
          P.r(8, L.hy + 1, 1, 3, c.scar);
        }
      },

      toxic: {
        name: 'Toxic Zombie', blurb: 'glows in the dark, leaves green puddles', move: 'walk', speed: 13, zombie: true,
        draw(P, s) {
          const c = { skin: '#8EF06A', skinS: '#5EC040', hair: '#2E5A1E', suit: '#E8D23A', suitS: '#B8A422', boot: '#2A2A2A', goo: '#9CFF5A', gooD: '#5EC040' };
          const L = humanoid(P, s, { slouch: true, reach: true, eye: '#FFFFFF', skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.suit, topShade: c.suitS, legs: c.suitS, boots: c.boot });
          P.p(L.bx + 2, L.by + 2, c.gooD); P.p(L.bx + 3, L.by + 3, c.goo);             // ripped hazmat suit, goo showing
          P.p(9, L.hy + 5, c.goo); P.p(9, L.hy + 6 + (s.frame ? 1 : 0), c.goo);        // drip
          if (!L.low) P.p(5 + (s.frame ? 1 : 0), 13, c.gooD);                           // puddle by its feet
        }
      },

      chefzombie: {
        name: 'Zombie Chef', blurb: 'still cooking, nobody knows what', move: 'walk', speed: 13, zombie: true,
        draw(P, s) {
          const c = { skin: '#A3C48E', skinS: '#7E9E6A', hair: '#5A4632', white: '#F4F4EC', whiteS: '#C8C8C0', check: '#3A3A3A', shoe: '#1E1E1E', ladle: '#B8C0CC', stain: '#C8642A' };
          const L = humanoid(P, s, { slouch: true, reach: true, eye: EYE, skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.white, topShade: c.whiteS, legs: c.check, boots: c.shoe });
          P.r(6, L.hy - 3, 5, 3, c.white); P.r(7, L.hy - 4, 3, 1, c.white); P.r(6, L.hy - 1, 5, 1, c.whiteS);   // tall chef hat, wonky
          P.p(L.bx + 2, L.by + 2, c.stain); P.p(L.bx + 3, L.by + 4, c.stain);
          P.r(L.ax, L.by - 2, 1, 2, c.ladle); P.r(L.ax - 1, L.by - 3, 2, 1, c.ladle);   // ladle in hand
        }
      },

      clownzombie: {
        name: 'Zombie Clown', blurb: 'honk honk… groan', move: 'walk', speed: 15, zombie: true,
        draw(P, s) {
          const c = { skin: '#D8E8C8', skinS: '#A8C098', hair: '#3A8AE0', hair2: '#E2723A', suit: '#9B6BD6', suitS: '#7A4EB0', dot: '#FFE066', shoe: '#D6392F', nose: '#D6392F' };
          const L = humanoid(P, s, { slouch: true, reach: true, eye: EYE, skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.suit, topShade: c.suitS, legs: c.suitS, boots: c.shoe });
          P.p(5, L.hy + 1, c.hair2); P.p(5, L.hy + 3, c.hair); P.p(6, L.hy - 1, c.hair2); P.p(9, L.hy - 1, c.hair);   // frizzy hair
          P.p(11, L.hy + 3, c.nose);                                                    // red nose
          P.p(L.bx + 2, L.by + 1, c.dot); P.p(L.bx + 3, L.by + 3, c.dot);
          if (!L.low) { P.p(3, 13, c.shoe); P.p(12, 13, c.shoe); }                     // massive shoes
        }
      },

      crow: {
        name: 'Zombie Crow', blurb: 'flaps about, caws at everyone', move: 'hop', speed: 26, zombie: true,
        flies: true, poses: ['fly'],
        draw(P, s) {
          const c = { feather: '#2A2A34', featherL: '#4A4A5A', beak: '#C8A040', bone: '#E8E2D0', leg: '#C8A040' };
          const flying = s.pose === 'fly';
          const y = s.pose === 'sleep' ? 2 : 0;
          P.r(5, 7 + y, 6, 4, c.feather); P.r(10, 5 + y, 3, 3, c.feather);            // body and head
          P.p(13, 6 + y, c.beak); P.p(14, 6 + y, c.beak);
          P.p(11, 6 + y, s.blink || s.pose === 'sleep' ? c.featherL : EYE);
          P.r(3, 8 + y, 2, 2, c.feather);                                              // tail
          P.p(7, 9 + y, c.bone); P.p(8, 9 + y, c.bone);                                // bony patch
          if (flying) {
            if (s.frame) { P.r(5, 3, 4, 4, c.featherL); P.p(4, 2, c.featherL); }       // wings up
            else { P.r(5, 10, 4, 3, c.featherL); }                                     // wings down
          } else {
            P.r(6, 8 + y, 4, 2, c.featherL);
            if (s.pose !== 'sleep') { P.r(7, 11, 1, 3, c.leg); P.r(9, 11, 1, 3, c.leg); }
          }
        }
      },

      // ---------- more help ----------
      scientist: {
        name: 'Scientist', blurb: 'working on a cure, one test tube at a time', move: 'walk', speed: 26, curer: true, immune: true,
        draw(P, s) {
          const c = { skin: '#F0C8A0', skinS: '#C99C74', hair: '#6A6A6A', coat: '#F4F4EC', coatS: '#C8C8C0', legs: '#3E4E6E', shoe: '#2A2A2A', goggle: '#7FD8E8', tube: '#9CFF5A', glass: '#E8F8FF' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.hair, top: c.coat, topShade: c.coatS, legs: c.legs, boots: c.shoe });
          P.r(8, L.hy + 1, 3, 1, c.goggle);                                             // goggles on forehead
          P.p(6, L.hy - 1, c.hair); P.p(8, L.hy - 1, c.hair); P.p(10, L.hy - 1, c.hair);  // wild hair
          P.p(L.bx + 3, L.by + 1, '#4F8FD6');                                           // pen in pocket
          P.r(L.ax + 1, L.by, 1, 3, c.glass); P.p(L.ax + 1, L.by + 2, c.tube); P.p(L.ax + 1, L.by + 1, s.frame ? c.tube : c.glass);   // bubbling test tube
        }
      },

      pilot: {
        name: 'Pilot', blurb: 'flies the helicopters, loves a fly-by', move: 'walk', speed: 30, immune: true,
        draw(P, s) {
          const c = { skin: '#E0B48C', skinS: '#B08660', helm: '#5E6B3A', helmL: '#76854A', visor: '#2A2A2A', suit: '#6A6A4E', suitS: '#4E4E3A', boot: '#2A2418', patch: '#E7B93C', scarf: '#E8E2D0' };
          const L = humanoid(P, s, { skin: c.skin, skinShade: c.skinS, hair: c.helm, top: c.suit, topShade: c.suitS, legs: c.suitS, boots: c.boot });
          P.r(5, L.hy - 1, 7, 3, c.helm); P.r(6, L.hy - 2, 5, 1, c.helmL);             // flight helmet
          P.r(8, L.hy + 1, 4, 1, c.visor); P.p(11, L.hy + 1, '#5A5A5A');
          P.r(L.bx + 1, L.by, 3, 1, c.scarf); P.p(L.bx + 3, L.by + 2, c.patch);
        }
      },

      k9: {
        name: 'Army Dog', blurb: 'brave pup in a vest, barks at zombies', move: 'walk', speed: 40, immune: true, defender: true, barks: true,
        draw(P, s) {
          const c = { fur: '#B8863E', furD: '#3A2A1E', vest: '#5E6B3A', vestL: '#76854A', tongue: '#E87A8A' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const f = s.pose === 'walk' && s.frame ? 1 : 0;
          if (s.pose === 'sleep') { P.r(3, 11, 10, 3, c.fur); P.r(5, 11, 5, 2, c.vest); P.r(10, 10, 4, 3, c.fur); P.p(12, 11, c.furD); return; }
          const y = low ? 9 : 8;
          P.r(3, y, 9, 3, c.fur); P.r(3, y, 9, 1, c.furD);                            // body with dark saddle
          P.r(5, y, 5, 3, c.vest); P.r(5, y, 5, 1, c.vestL);                           // vest
          P.r(11, y - 3, 4, 4, c.fur); P.p(14, y - 1, c.furD); P.r(13, y - 1, 2, 1, c.furD);   // head and muzzle
          P.p(12, y - 2, s.blink ? c.fur : '#1B1B1B');
          P.p(11, y - 5, c.furD); P.p(12, y - 4, c.furD); P.p(11, y - 4, c.furD);      // pointy ears
          if (s.frame && !low) P.p(14, y, c.tongue);
          P.p(2, y - 1 + f, c.fur); P.p(2, y, c.fur);
          if (low) { P.r(4, 12, 2, 2, c.fur); P.r(9, 12, 2, 2, c.fur); }
          else { P.r(4 - f, 11, 1, 3, c.fur); P.r(6 + f, 11, 1, 3, c.fur); P.r(9 - f, 11, 1, 3, c.fur); P.r(11 + f, 11, 1, 3, c.fur); }
        }
      },

      ambulance: {
        name: 'Field Ambulance', blurb: 'drives over to cure bitten buddies', move: 'walk', speed: 46, immune: true, vehicle: true, curer: true,
        w: 28, h: 18, feet: 18,
        draw(P, s) {
          const c = { body: '#E8E8E0', bodyS: '#B8B8B0', olive: '#5E6B3A', cross: '#3AA84E', glass: '#9FC8D8', tyre: '#222220', hub: '#8A8A7A', light: s.frame ? '#4F8FD6' : '#D6392F', head: '#FFF4B0' };
          const parked = s.pose === 'sleep';
          P.r(1, 4, 19, 10, c.body); P.r(1, 4, 19, 1, '#FFFFFF'); P.r(1, 13, 19, 1, c.bodyS);   // box body
          P.r(8, 6, 4, 6, c.cross); P.r(6, 8, 8, 2, c.cross);                            // green cross
          P.r(20, 7, 6, 7, c.body); P.r(21, 8, 4, 3, c.glass); P.r(26, 10, 2, 4, c.body); // cab
          P.r(1, 12, 27, 1, c.olive);                                                    // stripe
          P.r(17, 3, 3, 1, parked ? c.bodyS : c.light);                                  // flashing roof light
          P.p(27, 11, parked ? '#B8A860' : c.head);
          for (const x of [3, 20]) { P.r(x, 14, 5, 4, c.tyre); P.r(x + 1, 15, 3, 2, c.hub); P.p(x + (s.pose === 'walk' && s.frame ? 3 : 1), 15, c.tyre); }
        }
      },

      chinook: {
        name: 'Chinook', blurb: 'twin-rotor heavy lifter that drops supplies', move: 'walk', speed: 28, immune: true, vehicle: true,
        flies: true, drops: true, poses: ['fly'],
        w: 40, h: 16, feet: 16,
        draw(P, s) {
          const c = { olive: '#5E6B3A', oliveS: '#46512A', oliveL: '#76854A', glass: '#9FC8D8', glassL: '#D8F0F8', rotor: '#2A2A2A', blur: '#6A6A66', wheel: '#222220', port: '#2E3420', helm: '#4E5A2E', light: '#D6392F' };
          const flying = s.pose === 'fly';
          P.r(1, 4, 7, 4, c.olive); P.r(1, 4, 7, 1, c.oliveL);                          // tall rear pylon
          P.r(3, 7, 32, 6, c.olive); P.r(3, 7, 32, 1, c.oliveL); P.r(3, 12, 32, 1, c.oliveS);   // long fuselage
          P.r(29, 5, 6, 2, c.olive); P.r(29, 5, 6, 1, c.oliveL);                        // front pylon
          P.r(35, 8, 3, 4, c.olive); P.r(38, 9, 1, 2, c.oliveS);                        // nose
          P.r(33, 8, 4, 2, c.glass); P.p(36, 8, c.glassL); P.p(34, 9, c.helm);          // cockpit
          for (const x of [11, 15, 19, 23]) P.p(x, 9, c.glass);                         // portholes
          P.r(27, 8, 2, 4, c.oliveS);                                                   // side door
          P.r(8, 11, 18, 1, c.oliveS);                                                  // fuel pods
          P.r(1, 9, 2, 4, c.oliveS);                                                    // rear ramp
          P.r(4, 3, 2, 1, c.rotor); P.r(31, 4, 2, 1, c.rotor);                          // rotor heads
          if (flying) {
            if (s.frame) { P.r(0, 2, 13, 1, c.blur); P.r(2, 2, 6, 1, c.rotor); P.r(25, 3, 15, 1, c.blur); P.r(29, 3, 6, 1, c.rotor); }
            else { P.r(0, 2, 10, 1, c.rotor); P.p(11, 2, c.blur); P.r(27, 3, 11, 1, c.rotor); P.p(26, 3, c.blur); P.p(39, 3, c.blur); }
            P.p(2, 4, s.frame ? c.light : c.oliveS);
          } else {
            P.r(0, 2, 12, 1, c.rotor); P.r(26, 3, 14, 1, c.rotor);                       // resting blades
          }
          for (const x of [6, 10, 30]) { P.r(x, 13, 3, 3, c.wheel); P.p(x + 1, 14, '#5A5A5A'); }
        }
      },

      // ---------- more of the outpost ----------
      helipad: {
        name: 'Helipad', blurb: 'landing spot with blinking edge lights',
        kind: 'build', move: 'none', w: 32, h: 6, feet: 6,
        draw(P, s) {
          const c = { pad: '#4A4E54', padL: '#5E636A', line: '#E8E2D0', lamp: '#FFE066', lampOff: '#8A7A3A' };
          P.r(0, 2, 32, 4, c.pad); P.r(0, 2, 32, 1, c.padL);
          P.r(12, 3, 1, 3, c.line); P.r(19, 3, 1, 3, c.line); P.r(12, 4, 8, 1, c.line);   // big H
          for (const x of [1, 8, 23, 30]) P.p(x, 1, (x < 16) === !!s.frame ? c.lamp : c.lampOff);
        }
      },

      floodlight: {
        name: 'Floodlight Tower', blurb: 'lights up the whole camp at night',
        kind: 'build', move: 'none', w: 16, h: 32, feet: 32,
        glow: { x: 8, y: 4, r: 18, rgb: '255,250,220' },
        draw(P, s) {
          const c = { steel: '#7D8590', steelL: '#A8B0BC', steelD: '#5A606A', lamp: '#3A3A3A', light: '#FFFBE0', base: '#5A5E64' };
          P.r(7, 8, 2, 22, c.steel); P.r(7, 8, 1, 22, c.steelL);
          for (let y = 10; y < 30; y += 4) { P.p(6, y, c.steelD); P.p(9, y + 2, c.steelD); }
          P.r(4, 30, 8, 2, c.base);
          P.r(2, 6, 12, 2, c.steelD);
          for (const x of [2, 6, 10]) { P.r(x, 2, 4, 4, c.lamp); P.r(x + 1, 3, 2, 2, c.light); }
          if (s.frame) P.p(4, 3, '#FFFFFF');
        }
      },

      barrel: {
        name: 'Burning Barrel', blurb: 'survivors gather round it to keep warm',
        kind: 'build', move: 'none', w: 12, h: 16, feet: 16,
        glow: { x: 6, y: 4, r: 11, rgb: '255,140,50' },
        draw(P, s) {
          const c = { metal: '#5A4A3E', metalL: '#7A6654', rust: '#9A5A2A', band: '#3A2E26', f1: '#FFE27A', f2: '#FF9A2E', f3: '#FF5A1F' };
          P.r(2, 7, 8, 9, c.metal); P.r(2, 7, 1, 9, c.metalL); P.r(2, 9, 8, 1, c.band); P.r(2, 13, 8, 1, c.band);
          P.p(7, 11, c.rust); P.p(4, 14, c.rust);
          if (s.frame) { P.r(3, 4, 6, 3, c.f3); P.r(4, 2, 3, 2, c.f2); P.p(5, 1, c.f1); P.r(5, 5, 2, 2, c.f1); }
          else { P.r(3, 4, 6, 3, c.f3); P.r(5, 2, 3, 2, c.f2); P.p(7, 0, c.f1); P.r(4, 5, 2, 2, c.f1); }
        }
      },

      fueldrums: {
        name: 'Fuel Drums', blurb: 'stacked drums for the trucks and choppers',
        kind: 'build', move: 'none', w: 16, h: 16, feet: 16,
        draw(P, s) {
          const c = { red: '#B8322A', redL: '#D6392F', redD: '#8E2620', blue: '#2F5DB8', blueL: '#4F7FD6', blueD: '#22448A', band: '#2A2A2A' };
          const drum = (x, y, a, l, d) => { P.r(x, y, 6, 8, a); P.r(x, y, 1, 8, l); P.r(x + 5, y, 1, 8, d); P.r(x, y + 2, 6, 1, c.band); P.r(x, y + 5, 6, 1, c.band); };
          drum(1, 8, c.red, c.redL, c.redD); drum(8, 8, c.blue, c.blueL, c.blueD); drum(4, 0, c.red, c.redL, c.redD);
          P.p(6, 0, c.band);
        }
      },

      checkpoint: {
        name: 'Checkpoint', blurb: 'guard hut and a boom barrier that lifts',
        kind: 'build', move: 'none', w: 32, h: 20, feet: 20,
        draw(P, s) {
          const c = { wall: '#C8C0A8', wallS: '#A09880', roof: '#5E6B3A', roofL: '#76854A', glass: '#9FC8D8', red: '#D6392F', white: '#F4F4EC', post: '#3A3A3A', lamp: '#FFB02E' };
          P.r(1, 6, 10, 14, c.wall); P.r(1, 6, 1, 14, c.wallS); P.r(0, 4, 12, 2, c.roof); P.r(0, 4, 12, 1, c.roofL);   // guard hut
          P.r(3, 8, 6, 4, c.glass); P.r(4, 13, 3, 7, c.wallS);
          P.p(5, 3, s.frame ? c.lamp : c.post);
          P.r(13, 11, 2, 9, c.post);                                                      // barrier post
          if (s.frame) for (let i = 0; i < 16; i++) P.p(15 + i, 11 - (i >> 1), ((i >> 1) % 2) ? c.red : c.white);   // barrier up
          else for (let x = 15; x < 32; x++) P.r(x, 11, 1, 2, ((x >> 1) % 2) ? c.red : c.white);                   // barrier down
        }
      },

      radiomast: {
        name: 'Radio Mast', blurb: 'tall aerial with a blinking red light',
        kind: 'build', move: 'none', w: 12, h: 32, feet: 32,
        glow: { x: 6, y: 1, r: 6, rgb: '255,60,60' },
        draw(P, s) {
          const c = { steel: '#A8B0BC', steelD: '#6A707A', base: '#5A5E64', red: '#FF3A3A', redOff: '#7A2A2A' };
          for (let y = 2; y < 30; y++) { const w = 1 + Math.floor((y - 2) / 7); P.p(6 - w, y, c.steel); P.p(5 + w, y, c.steel); if (y % 3 === 0) P.r(6 - w, y, w * 2, 1, c.steelD); }
          P.r(5, 0, 2, 2, s.frame ? c.red : c.redOff);
          P.r(1, 30, 10, 2, c.base);
          P.r(8, 12, 2, 3, '#E8E2D0');                                                    // dish
        }
      },

      bunker: {
        name: 'Bunker', blurb: 'concrete shelter, safest spot on the screen',
        kind: 'build', move: 'none', w: 32, h: 16, feet: 16,
        draw(P, s) {
          const c = { con: '#8A8C88', conL: '#A8AAA6', conD: '#6A6C68', slit: '#1E1E1E', door: '#4E5A3A', doorL: '#66753C', moss: '#5E8A3A', light: '#FFE066' };
          for (let y = 0; y < 16; y++) { const inset = Math.max(0, 6 - y); P.r(inset + 1, y + 2 > 15 ? 15 : y, 30 - inset * 2, 1, c.con); }
          P.r(4, 2, 24, 1, c.conL); P.r(1, 15, 30, 1, c.conD);
          P.r(8, 5, 16, 1, c.slit);                                                       // gun-slit window
          if (s.frame) P.p(15, 5, c.light);
          P.r(13, 9, 6, 7, c.door); P.r(13, 9, 6, 1, c.doorL); P.p(17, 12, c.conL);       // steel door
          P.p(3, 6, c.moss); P.p(27, 4, c.moss); P.p(28, 5, c.moss);
        }
      },

      wreck: {
        name: 'Wrecked Car', blurb: 'burnt-out car, still smoking a bit',
        kind: 'build', move: 'none', w: 24, h: 14, feet: 14,
        draw(P, s) {
          const c = { body: '#6A4A3A', bodyL: '#8A6650', rust: '#9A5A2A', dark: '#2A2420', glass: '#5A6A70', tyre: '#1E1E1E', smoke: '#8A8E96' };
          P.r(1, 6, 22, 5, c.body); P.r(1, 6, 22, 1, c.bodyL); P.r(5, 2, 12, 4, c.body); P.r(6, 3, 4, 3, c.dark); P.r(11, 3, 5, 3, c.glass);
          P.p(12, 4, c.dark); P.p(3, 8, c.rust); P.p(9, 9, c.rust); P.p(18, 7, c.rust); P.r(14, 8, 3, 1, c.dark);
          P.r(3, 11, 4, 3, c.tyre); P.r(17, 12, 4, 2, c.tyre);                            // one flat tyre
          if (s.frame) { P.p(19, 3, c.smoke); P.p(20, 1, c.smoke); } else { P.p(20, 4, c.smoke); P.p(19, 2, c.smoke); P.p(21, 0, c.smoke); }
        }
      },

      graveyard: {
        name: 'Graveyard', blurb: 'creaky graves… is that a hand?',
        kind: 'build', move: 'none', w: 24, h: 16, feet: 16,
        draw(P, s) {
          const c = { stone: '#8E8E96', stoneL: '#ABABB4', stoneD: '#66666E', dirt: '#5A4632', grass: '#4E7A3A', hand: '#8DB87A', handS: '#6A9258', wood: '#6B4E36' };
          P.r(0, 14, 24, 2, c.dirt); P.r(0, 14, 24, 1, c.grass);
          P.r(2, 6, 6, 8, c.stone); P.r(3, 5, 4, 1, c.stone); P.r(2, 6, 1, 8, c.stoneL); P.r(4, 8, 2, 1, c.stoneD);   // headstone
          P.r(15, 9, 5, 5, c.stone); P.r(15, 9, 1, 5, c.stoneL); P.p(17, 11, c.stoneD);                               // small stone
          P.r(21, 6, 1, 8, c.wood); P.r(20, 8, 3, 1, c.wood);                                                         // wooden cross
          P.r(9, 13, 5, 1, c.dirt);                                                                                     // fresh mound
          if (s.frame) { P.r(11, 9, 1, 4, c.hand); P.p(10, 9, c.hand); P.p(12, 8, c.hand); P.p(11, 8, c.handS); }       // a hand pokes out!
        }
      },

      fieldhospital: {
        name: 'Field Hospital', blurb: 'where the medics patch everyone up',
        kind: 'build', move: 'none', w: 28, h: 18, feet: 18,
        draw(P, s) {
          const c = { canvas: '#E8E8E0', canvasS: '#B8B8B0', canvasL: '#FFFFFF', cross: '#3AA84E', door: '#5A5E64', pole: '#6B4E36', light: '#FFE066' };
          P.r(2, 6, 24, 12, c.canvas); P.r(2, 6, 1, 12, c.canvasS); P.r(25, 6, 1, 12, c.canvasS);
          for (let i = 0; i < 5; i++) P.r(2 + i * 2, 5 - i, 24 - i * 4, 1, i % 2 ? c.canvasL : c.canvas);   // sloped roof
          P.r(12, 2, 4, 1, c.canvasS);
          P.r(5, 8, 4, 4, c.cross); P.r(4, 9, 6, 2, c.cross);                                // green cross
          P.r(16, 10, 6, 8, c.door); P.r(19, 10, 1, 8, c.canvasS);                         // open flaps
          P.p(18, 12, s.frame ? c.light : c.door);
          P.p(0, 17, c.pole); P.p(27, 17, c.pole);
        }
      }

    }
  };
})());
