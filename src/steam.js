// Steam version support. Only switched on in the Steam build: scripts/steam-build.js sets
// package.json "bitty.store" to "steam". In every other build this file does nothing.
//
// On Steam, packs are DLC instead of licence keys. "bitty.steam" in package.json says which
// Steam app is ours and which DLC unlocks which packs:
//   "steam": { "appId": 1234560, "dlc": [ { "appId": 1234561, "shop": "fantasy", "packs": ["fantasy"] }, ... ] }
// steamworks.js (the Steam API) is only installed by the Steam build workflow.
const pkg = require('../package.json');

const cfg = (pkg.bitty && pkg.bitty.steam) || {};
const on = !!(pkg.bitty && pkg.bitty.store === 'steam');
const dlcs = (cfg.dlc || []).filter(d => Number(d.appId) > 0);
let sw = null;
let client = null;

// Call before the app is ready, so the Steam overlay can hook in.
function init() {
  if (!on) return false;
  try {
    sw = require('steamworks.js');
    client = sw.init(Number(cfg.appId) || undefined);
    sw.electronEnableSteamOverlay();
    return true;
  } catch (e) {
    console.error('Steam could not start:', e && e.message);   // e.g. Steam isn't running
    client = null;
    return false;
  }
}

const owned = d => { try { return !!client && client.apps.isDlcInstalled(Number(d.appId)); } catch { return false; } };
// Does a DLC the player owns unlock this pack (e.g. 'fantasy', 'supporter')?
const ownsPack = id => dlcs.some(d => (d.packs || []).includes(id) && owned(d));
// The DLC to sell for a Bitty Shop pack button ('builds', 'fantasy', 'bundle', ...), if there is one.
const dlcFor = shopId => dlcs.find(d => d.shop === shopId) || null;

// Opens the DLC's store page in the Steam overlay, or in the Steam client if the overlay can't open.
function openStore(shell, shopId) {
  const d = dlcFor(shopId);
  if (!d) return false;
  try { if (client) { client.overlay.activateToStore(Number(d.appId), 0); return true; } } catch {}
  shell.openExternal(`steam://store/${Number(d.appId)}`);
  return true;
}

module.exports = { on, init, ownsPack, dlcFor, openStore, running: () => !!client };
