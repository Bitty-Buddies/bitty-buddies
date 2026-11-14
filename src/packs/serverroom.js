// Server Room pack — IT engineers and the kit they look after.
// Sprites face RIGHT. Pets: state = { pose: 'walk'|'idle'|'sit'|'sleep'|'fix', frame, blink }.
// Kit (builds) also gets { power: 'off'|'boot'|'on'|'fault', step: 0-5 while booting, net: bool, seed, alert }.
// The app draws the cables: a UPS powers kit near it, the network cabinet links racks and storage,
// kit boots up when it's plugged in, now and then something breaks, and the engineers go and fix it.
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, (function () {
  const DARK = '#1B1B1B';
  const LED = { off: '#262A32', green: '#5AE06A', dim: '#2E7A3A', amber: '#FFB43C', red: '#FF4A4A', redDim: '#7A2626', blue: '#5AB4FF' };

  // One status light. i = which light, n = how many lights the box has (for the boot sweep).
  function led(s, i, n) {
    const pw = s.power || 'on', seed = s.seed || 0;
    if (pw === 'off') return LED.off;
    if (pw === 'boot') return i < Math.ceil(((s.step || 0) + 1) / 6 * n) ? (i % 3 === 0 ? LED.amber : LED.green) : LED.off;
    if (pw === 'fault') return (i + (s.frame || 0)) % 2 ? LED.red : LED.redDim;
    const busy = (i * 7 + seed * 3 + (s.frame || 0) * 5) % 4 === 0;            // a little activity flicker
    if (s.net === false) return busy ? LED.dim : LED.amber;
    return busy ? LED.dim : LED.green;
  }

  // A blocky engineer. o = colours; o.gear(P, L, s) adds their kit. Returns the layout.
  function person(P, s, o) {
    const low = s.pose === 'sit' || s.pose === 'sleep', fix = s.pose === 'fix';
    const d = low ? 2 : 0, hy = 2 + d, by = hy + 5;
    const stride = s.pose === 'walk' && s.frame === 0;
    if (low) { P.r(6, 12, 6, 1, o.legs); P.r(11, 12, 2, 2, o.shoes); }
    else if (stride) { P.r(5, 11, 2, 2, o.legs); P.r(9, 11, 2, 2, o.legs); P.r(4, 13, 3, 1, o.shoes); P.r(9, 13, 3, 1, o.shoes); }
    else if (fix) { P.r(5, 11, 2, 2, o.legs); P.r(9, 11, 2, 2, o.legs); P.r(5, 13, 3, 1, o.shoes); P.r(9, 13, 3, 1, o.shoes); }
    else { P.r(6, 11, 2, 2, o.legs); P.r(8, 11, 2, 2, o.legs); P.r(6, 13, 2, 1, o.shoes); P.r(8, 13, 3, 1, o.shoes); }
    const bottom = low ? 11 : 10;
    P.r(6, by, 5, bottom - by + 1, o.top); P.r(6, by, 1, bottom - by + 1, o.topS);
    P.r(6, hy, 5, 5, o.hair);
    P.r(8, hy + 1, 3, 4, o.skin);
    P.p(9, hy + 2, s.blink || s.pose === 'sleep' ? o.skinS : DARK);
    // arms: reaching forward to work on something when fixing
    if (fix) { P.r(11, by + 1, 2, 1, o.top); P.p(13, by + 1 - s.frame, o.skin); P.r(10, by + 2, 3, 1, o.topS); P.p(13, by + 2, o.skin); }
    else { const ax = stride ? 9 : 8; P.r(ax, by, 1, 3, o.topS); P.p(ax, by + 3, o.skin); }
    const L = { hy, by, low, fix, bottom };
    if (o.gear) o.gear(P, L, s);
    return L;
  }
  // The tool in a fixer's hand, out in front, with a glint as it works.
  function tool(P, L, s, col) {
    if (!L.fix) return;
    P.r(14, L.by - s.frame, 1, 2, col); P.p(15, L.by - 1 - s.frame, '#C8C8C8');
    if (s.frame) P.p(15, L.by - 3, '#FFE066');
  }

  return {
    id: 'serverroom',
    name: 'Server Room',
    licensed: true, // needs a licence key that covers 'serverroom'
    items: {
      sysadmin: {
        name: 'Sysadmin', blurb: 'has tried turning it off and on again', move: 'walk', speed: 34, fixer: true,
        draw(P, s) {
          person(P, s, {
            hair: '#3A2A1C', skin: '#F2C9A2', skinS: '#C99C74', top: '#2A3A6A', topS: '#1E2A4E', legs: '#3A5A8A', shoes: '#F4F4F4',
            gear(P, L, s) {
              P.r(6, L.hy - 1, 5, 1, '#1B1B1B'); P.p(6, L.hy, '#1B1B1B'); P.p(6, L.hy + 1, '#1B1B1B');   // headset
              P.p(7, L.hy + 3, '#1B1B1B'); P.p(8, L.hy + 4, '#1B1B1B');                                    // mic
              P.p(8, L.by, '#3C74E0'); P.p(8, L.by + 1, '#3C74E0'); P.p(8, L.by + 2, '#FFFFFF');           // lanyard + badge
              tool(P, L, s, '#E7B93C');
            }
          });
        }
      },

      neteng: {
        name: 'Network Engineer', blurb: "never met a cable they couldn't untangle", move: 'walk', speed: 36, fixer: true,
        draw(P, s) {
          person(P, s, {
            hair: '#8A5A2B', skin: '#C88A5A', skinS: '#9A6A44', top: '#6E7480', topS: '#545A66', legs: '#2A2E36', shoes: '#1B1B1B',
            gear(P, L, s) {
              P.r(6, L.by, 1, L.bottom - L.by + 1, '#FF8A1C'); P.r(10, L.by, 1, L.bottom - L.by + 1, '#FF8A1C');  // hi-vis vest
              P.r(6, L.by + 2, 5, 1, '#E8E8A0');
              if (!L.fix && !L.low) { P.r(4, L.by + 1, 2, 3, '#3C74E0'); P.p(3, L.by + 2, '#3C74E0'); P.p(4, L.by + 2, '#2A55AC'); } // coil of cable
              tool(P, L, s, '#3C74E0');
            }
          });
        }
      },

      dev: {
        name: 'Dev', blurb: 'runs on coffee, and it works on their machine', move: 'walk', speed: 30, fixer: true,
        draw(P, s) {
          person(P, s, {
            hair: '#2A1E14', skin: '#E8B48A', skinS: '#B88A64', top: '#3A7A5A', topS: '#2A5A42', legs: '#3A3A44', shoes: '#D6392F',
            gear(P, L, s) {
              P.r(6, L.hy - 1, 5, 1, '#3A7A5A'); P.r(5, L.hy, 1, 4, '#3A7A5A');                         // hood up
              P.r(9, L.hy + 2, 2, 1, '#1B1B1B'); P.p(11, L.hy + 2, '#1B1B1B');                            // glasses
              P.p(9, L.hy + 2, s.blink ? '#1B1B1B' : '#9AD4FF');
              if (!L.fix) { P.r(10, L.by + 2, 2, 2, '#FFFFFF'); P.p(12, L.by + 2, '#FFFFFF'); P.p(10, L.by + 2, '#7A4A2A');  // mug of coffee
                if (s.frame && s.pose !== 'sleep') P.p(11, L.by, '#E8E8F0'); }
              tool(P, L, s, '#8B5CF6');
            }
          });
        }
      },

      helpdesk: {
        name: 'Helpdesk Hero', blurb: 'answers every call with a smile', move: 'walk', speed: 32, fixer: true,
        draw(P, s) {
          person(P, s, {
            hair: '#D9A23A', skin: '#F2C9A2', skinS: '#C99C74', top: '#B8322A', topS: '#8A2620', legs: '#2A3A6A', shoes: '#1B1B1B',
            gear(P, L, s) {
              P.r(5, L.hy + 1, 1, 4, '#D9A23A'); P.p(5, L.hy + 5, '#D9A23A');                            // ponytail
              P.r(7, L.hy - 1, 4, 1, '#1B1B1B'); P.p(11, L.hy, '#1B1B1B'); P.p(11, L.hy + 1, '#1B1B1B');  // headset
              P.p(11, L.hy + 3, '#1B1B1B');
              if (!L.fix && !L.low) { P.r(9, L.by + 1, 3, 2, '#F6F6F2'); P.p(10, L.by + 1, '#3C74E0'); }  // ticket
              tool(P, L, s, '#3CB04A');
            }
          });
        }
      },

      duck: {
        name: 'Rubber Duck', blurb: 'listens to all your bugs', move: 'hop', speed: 24,
        draw(P, s) {
          const c = { y: '#FFD23A', yS: '#E0A81C', yL: '#FFE88A', beak: '#FF8A1C', beakS: '#D96A10' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const o = low ? 1 : 0;
          P.r(3, 9 + o, 9, 4 - o, c.y); P.r(4, 8 + o, 7, 1, c.y); P.r(2, 10 + o, 1, 2, c.y); P.r(3, 12, 9, 1, c.yS);
          P.r(4, 9 + o, 4, 2, c.yS); P.p(1, 9 + o, c.y);                                   // wing and tail flick
          P.r(8, 4 + o, 5, 5, c.y); P.r(9, 3 + o, 3, 1, c.y); P.p(9, 4 + o, c.yL);
          P.r(13, 6 + o, 2, 2, c.beak); P.p(14, 7 + o, c.beakS);
          P.p(11, 5 + o, s.blink || s.pose === 'sleep' ? c.yS : DARK);
        }
      },

      cat: {
        name: 'Server Cat', blurb: 'naps on the warm servers', move: 'walk', speed: 36,
        draw(P, s) {
          const c = { fur: '#24262E', furS: '#16181E', furL: '#3A3E4A', eye: '#7AF07A', nose: '#E890A0' };
          const low = s.pose === 'sit' || s.pose === 'sleep';
          const by = low ? 9 : 8, hy = low ? 5 : 4, step = s.pose === 'walk' && s.frame === 1;
          if (s.pose === 'sleep') {                                                         // curled into a loaf
            P.r(3, 9, 10, 4, c.fur); P.r(4, 8, 8, 1, c.fur); P.r(3, 12, 10, 1, c.furS); P.r(2, 11, 3, 1, c.furL);
            P.r(9, 7, 4, 3, c.fur); P.p(9, 6, c.fur); P.p(12, 6, c.fur); P.r(10, 8, 2, 1, c.furS);
            return;
          }
          P.p(1, by - 3, c.fur); P.p(1, by - 2, c.fur); P.p(2, by - 1, c.fur);              // tail up
          P.r(2, by, 9, 4, c.fur); P.r(2, by, 9, 1, c.furL);
          if (low) { P.r(3, 13, 3, 1, c.furS); P.r(8, 13, 3, 1, c.furS); }
          else { P.r(step ? 3 : 2, 12, 2, 2, c.fur); P.r(step ? 8 : 9, 12, 2, 2, c.fur); }
          P.r(9, hy, 5, 5, c.fur); P.p(9, hy - 1, c.fur); P.p(13, hy - 1, c.fur); P.p(10, hy - 1, c.furL);
          P.r(14, hy + 2, 1, 2, c.fur); P.p(14, hy + 3, c.nose);
          const eye = s.blink ? c.furS : c.eye;
          P.p(11, hy + 2, eye); P.p(13, hy + 2, eye);
        }
      },

      // ---------- kit ----------
      rack: {
        name: 'Server Rack', blurb: 'blinky lights and a lot of fans', kind: 'build', move: 'none', w: 14, h: 30, feet: 30,
        power: 'device', network: 'device', port: 4, lan: 10,
        draw(P, s) {
          const c = { frame: '#1E2128', body: '#2E323C', unit: '#4A505E', unitL: '#5C6272', vent: '#3A3F4A', bay: '#363A44', foot: '#15171C', badge: '#5AB4FF' };
          P.r(0, 0, 14, 30, c.frame); P.r(1, 1, 12, 28, c.body); P.r(1, 1, 12, 1, c.vent);
          P.r(1, 29, 2, 1, c.foot); P.r(11, 29, 2, 1, c.foot);
          for (let i = 0; i < 8; i++) {
            const y = 3 + i * 3, unit = 7 - i;                                              // units boot from the bottom up
            P.r(2, y, 10, 2, c.unit); P.r(2, y, 10, 1, c.unitL);
            P.p(3, y + 1, led(s, unit * 2, 16)); P.p(4, y + 1, led(s, unit * 2 + 1, 16));
            for (let x = 6; x < 11; x += 2) P.p(x, y + 1, c.bay);
          }
          P.p(11, 2, s.power === 'fault' ? LED.red : s.power === 'off' ? LED.off : LED.blue);
          P.r(12, 27, 1, 2, c.badge);
        }
      },

      ups: {
        name: 'UPS', blurb: 'powers any kit near it, so drag them close', kind: 'build', move: 'none', w: 12, h: 14, feet: 14,
        power: 'source', port: 11,
        draw(P, s) {
          const c = { case: '#23262E', panel: '#3A3F4A', lcd: '#2A4A3A', lcdOn: '#7AF09A', bar: '#5AE06A', barOff: '#2E3A30', vent: '#2E323C', plug: '#1B1B1B' };
          P.r(0, 1, 12, 13, c.case); P.r(1, 0, 10, 1, c.case);
          P.r(1, 2, 10, 5, c.panel); P.r(2, 3, 6, 3, c.lcd);
          P.r(3, 4, 4, 1, c.lcdOn); if (s.frame) P.p(3, 5, c.lcdOn);
          P.p(9, 3, LED.green); P.p(9, 5, s.frame ? LED.amber : LED.dim);
          for (let i = 0; i < 4; i++) P.r(2 + i * 2, 9, 1, 3, i < 3 || s.frame ? c.bar : c.barOff);   // battery bars
          P.r(1, 12, 10, 1, c.vent); P.r(10, 9, 2, 2, c.plug);
        }
      },

      netcab: {
        name: 'Network Cabinet', blurb: 'patch panels and a very busy switch', kind: 'build', move: 'none', w: 14, h: 22, feet: 22,
        power: 'device', network: 'source', port: 3, lan: 11,
        draw(P, s) {
          const c = { frame: '#1E2128', body: '#2A2E36', glass: '#3A4A5E', panel: '#4A505E', panelL: '#5C6272', foot: '#15171C', cables: ['#3C74E0', '#FFD23A', '#3CB04A', '#E8394A', '#FFFFFF'] };
          P.r(0, 0, 14, 22, c.frame); P.r(1, 1, 12, 20, c.glass); P.r(1, 1, 1, 20, '#4A5A70');
          P.r(1, 21, 2, 1, c.foot); P.r(11, 21, 2, 1, c.foot);
          for (let r = 0; r < 3; r++) {                                                     // patch panels with cables
            const y = 3 + r * 5;
            P.r(2, y, 10, 3, c.panel); P.r(2, y, 10, 1, c.panelL);
            for (let k = 0; k < 5; k++) {
              P.p(3 + k * 2, y + 1, led(s, r * 5 + k, 15));
              P.p(3 + k * 2, y + 2, c.cables[(k + r * 2) % 5]); P.p(3 + k * 2, y + 3, c.cables[(k + r * 2) % 5]);
            }
          }
          P.r(2, 18, 10, 2, c.body); P.p(11, 19, s.power === 'off' ? LED.off : LED.blue);
        }
      },

      storage: {
        name: 'Storage Array', blurb: 'rows of busy little drives', kind: 'build', move: 'none', w: 14, h: 18, feet: 18,
        power: 'device', network: 'device', port: 3, lan: 10,
        draw(P, s) {
          const c = { frame: '#1E2128', body: '#C8CCD4', bodyS: '#9AA0AC', drive: '#4A505E', driveL: '#6A7080', foot: '#15171C', logo: '#3C74E0' };
          P.r(0, 0, 14, 18, c.frame); P.r(1, 1, 12, 16, c.body); P.r(1, 16, 12, 1, c.bodyS);
          P.r(1, 17, 2, 1, c.foot); P.r(11, 17, 2, 1, c.foot);
          P.r(2, 2, 6, 1, c.logo);
          for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) {                        // 12 drive bays
            const x = 2 + k * 4, y = 4 + r * 3;
            P.r(x, y, 3, 2, c.drive); P.r(x, y, 3, 1, c.driveL);
            P.p(x + 2, y + 1, led(s, (3 - r) * 3 + k, 12));
          }
        }
      },

      desk: {
        name: "Engineer's Desk", blurb: 'two screens of graphs that go red when something breaks', kind: 'build', move: 'none', w: 26, h: 18, feet: 18,
        glow: { x: 13, y: 5, r: 9, rgb: '120,200,255' },
        draw(P, s) {
          const c = { top: '#8A5A34', topL: '#A8744A', leg: '#5A3A22', frame: '#1E2128', screen: '#1A2A3A', ok: '#5AE06A', bad: '#FF4A4A', grid: '#2A3E52', key: '#3A3F4A', mug: '#FFFFFF', coffee: '#7A4A2A', stand: '#3A3F4A' };
          const line = s.alert ? c.bad : c.ok;
          [[3, 0], [14, 0]].forEach(([x], m) => {
            P.r(x, 1, 10, 8, c.frame); P.r(x + 1, 2, 8, 6, c.screen); P.r(x + 1, 5, 8, 1, c.grid);
            const pts = m ? [6, 5, 5, 3, 4, 5, 3, 4] : [5, 4, 6, 4, 3, 4, 5, 2];
            pts.forEach((y, i) => P.p(x + 1 + i, (s.frame && !s.alert ? y : pts[(i + 3) % 8]) + (s.alert ? 1 : 0), line));
            if (s.alert && s.frame) P.r(x + 1, 2, 8, 1, c.bad);
            P.r(x + 4, 9, 2, 2, c.stand);
          });
          P.r(0, 11, 26, 2, c.top); P.r(0, 11, 26, 1, c.topL);
          P.r(1, 13, 2, 5, c.leg); P.r(23, 13, 2, 5, c.leg);
          P.r(8, 10, 9, 1, c.key);
          P.r(20, 8, 2, 3, c.mug); P.p(22, 9, c.mug); P.p(20, 8, c.coffee);
          if (s.frame) P.p(21, 6, '#E8E8F0'); else P.p(20, 7, '#E8E8F0');
        }
      },

      cooling: {
        name: 'Cooling Unit', blurb: 'keeps the whole room nice and chilly', kind: 'build', move: 'none', w: 14, h: 26, feet: 26,
        draw(P, s) {
          const c = { body: '#E8ECF2', bodyS: '#C2C8D2', grille: '#9AA0AC', fan: '#4A505E', hub: '#2E323C', frost: '#BFE3FF', panel: '#3A3F4A' };
          P.r(0, 0, 14, 26, c.body); P.r(13, 0, 1, 26, c.bodyS); P.r(0, 25, 14, 1, c.bodyS);
          for (let x = 1; x < 13; x += 2) P.r(x, 1, 1, 4, c.grille);                         // top vent
          P.r(1, 5, 12, 1, c.frost); if (s.frame) { P.p(3, 6, c.frost); P.p(9, 6, c.frost); } else { P.p(6, 6, c.frost); P.p(11, 6, c.frost); }
          P.r(2, 9, 10, 10, c.grille); P.r(3, 10, 8, 8, c.bodyS);                          // spinning fan
          if (s.frame) { P.r(4, 13, 6, 2, c.fan); P.r(6, 11, 2, 6, c.fan); }
          else { [[4, 11], [5, 12], [9, 11], [8, 12], [4, 16], [5, 15], [9, 16], [8, 15]].forEach(([x, y]) => P.p(x, y, c.fan)); }
          P.r(6, 13, 2, 2, c.hub);
          P.r(3, 21, 8, 2, c.panel); P.p(4, 22, LED.blue); P.p(6, 22, LED.green);
        }
      }
    }
  };
})());
