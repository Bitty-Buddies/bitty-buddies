// Hats and outfits: shared by the overlay (src/renderer) and the Bitty Shop window.
// Each hat faces right; rows of letters, each letter a colour in cols ('.' = see-through).
(function (root, api) {
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BBOutfits = api;
})(typeof self !== 'undefined' ? self : this, (function () {
  const OUTFITS = {
    santa: {
      name: 'Santa hat',
      // facing right; the pompom flops backwards. W = white fur, R = red, r = red shade
      rows: ['W......', '.Rr....', '..RRr..', '.RRRRr.', 'WWWWWWW'],
      cols: { W: '#F6F6F2', R: '#D6392F', r: '#A82A22' }
    },
    // Bitty Shop hats (bought with Buddy Bucks), plus the Supporter Pack crown and the Forever friend heart.
    party: { rows: ['...W...', '...P...', '..PYP..', '..YPY..', '.PYPYP.'], cols: { W: '#FFFFFF', P: '#F06A8A', Y: '#FFD84A' } },
    beanie: { rows: ['...W...', '.BBBBB.', 'BBBBBBB', 'bbbbbbb'], cols: { W: '#F6F6F2', B: '#4C7BD6', b: '#335CA8' } },
    flowers: { rows: ['P.Y.B.P', 'GGGGGGG'], cols: { P: '#F06A8A', Y: '#FFD84A', B: '#5BA8E8', G: '#4E9A3C' } },
    crown: { rows: ['Y.Y.Y', 'YYYYY', 'YRYRY'], cols: { Y: '#F5C842', R: '#D6392F' } },
    pirate: { rows: ['..KKK..', '.KKWKK.', 'KKKKKKK'], cols: { K: '#1E1E24', W: '#F6F6F2' } },
    tophat: { rows: ['.KKKK.', '.KKKK.', '.RRRR.', 'KKKKKK'], cols: { K: '#1E1E24', R: '#D6392F' } },
    cowboy: { rows: ['..NNN..', '.nNNNn.', 'NNNNNNN'], cols: { N: '#A0703A', n: '#6B4423' } },
    wizard: { rows: ['...U...', '..UsU..', '..UUU..', '.UUUsU.', 'UUUUUUU'], cols: { U: '#6A4BC4', s: '#FFD84A' } },
    golden: { rows: ['Y.W.Y.Y', 'YYYYYYY', 'YBYRYBY'], cols: { Y: '#FFC93C', W: '#FFFFFF', B: '#5BA8E8', R: '#D6392F' } },
    heart: { rows: ['.R.R.', 'RRRRR', '.RRR.', '..R..'], cols: { R: '#FF4F7B' } }
  };
  function hatAnchor(grid) {
    for (let y = 0; y < grid.length; y++) {
      const row = grid[y];
      let a = -1, b = -1;
      for (let x = 0; x < row.length; x++) if (row[x]) { if (a < 0) a = x; b = x; }
      if (a >= 0) {
        // the head is the highest part; widen to the row just below so a 1-pixel ear tip doesn't count alone
        const next = grid[y + 1] || [];
        let a2 = a, b2 = b;
        for (let x = 0; x < next.length; x++) if (next[x]) { a2 = Math.min(a2, x); b2 = Math.max(b2, x); }
        const span = (b2 - a2 + 1) > 9 ? [a, b] : [a2, b2];
        return { y, cx: (span[0] + span[1]) / 2 };
      }
    }
    return null;
  }
  // The pixels of a hat on a sprite grid (grid = rows of colours, as PX.drawItem returns), for a pet facing dir.
  function hatPixels(grid, hat, dir = 1) {
    const o = OUTFITS[hat];
    if (!o) return [];
    const a = hatAnchor(grid);
    if (!a) return [];
    const rows = dir < 0 ? o.rows.map(r => [...r].reverse().join('')) : o.rows;
    const w = rows[0].length;
    const hx = Math.round(a.cx - (w - 1) / 2), hy = a.y - rows.length + 2;   // brim overlaps the top of the head a little
    const out = [];
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (o.cols[ch]) out.push({ x: hx + i, y: hy + j, col: o.cols[ch] }); }));
    return out;
  }
  return { OUTFITS, hatPixels };
})());
