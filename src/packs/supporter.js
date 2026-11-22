// Supporter Pack — Thank-you pack: a golden crown for every buddy and a supporter badge. It never gives Buddy Bucks.
// No buddies of its own: the licence key is what matters (the app checks it's unlocked).
(function (root, pack) {
  if (typeof module === 'object' && module.exports) module.exports = pack;
  else (root.BBPacks = root.BBPacks || []).push(pack);
})(typeof self !== 'undefined' ? self : this, {
  id: 'supporter',
  name: 'Supporter Pack',
  licensed: true,
  hidden: true,
  items: {}
});
