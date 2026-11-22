// Dev/Beta key — Unlocks "Get test versions" in the tray, so testers get new versions before everyone else.
// No buddies of its own: the licence key is what matters (the app checks it's unlocked).
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, {
  id: 'tester',
  name: 'Dev/Beta key',
  licensed: true,
  hidden: true,
  items: {}
});
