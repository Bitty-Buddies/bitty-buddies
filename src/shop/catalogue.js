// The Bitty Shop: everything you can buy with Buddy Bucks. Prices are in Buddy Bucks, never money.
// kind 'hat'   → a hat any pet can wear (drawn by the overlay's OUTFITS, same id)
// kind 'decor' → a decoration you place like a build (an item in the shop pack)
// kind 'buddy' → a pet only found in the shop (an item in the shop pack)
// Loaded by the app (require) and by the shop window (as a script).
(function (root, list) {
  if (typeof module === 'object' && module.exports) module.exports = list;
  else root.BBShop = list;
})(typeof self !== 'undefined' ? self : this, [
  { id: 'party', kind: 'hat', name: 'Party hat', price: 100, blurb: 'stripy cone with a pompom' },
  { id: 'beanie', kind: 'hat', name: 'Beanie', price: 120, blurb: 'cosy knitted hat' },
  { id: 'flowers', kind: 'hat', name: 'Flower crown', price: 150, blurb: 'a ring of little flowers' },
  { id: 'crown', kind: 'hat', name: 'Tiny crown', price: 150, blurb: 'for the royal buddy' },
  { id: 'pirate', kind: 'hat', name: 'Pirate hat', price: 250, blurb: 'arr, with a tiny skull' },
  { id: 'tophat', kind: 'hat', name: 'Top hat', price: 250, blurb: 'very fancy indeed' },
  { id: 'cowboy', kind: 'hat', name: 'Cowboy hat', price: 300, blurb: 'yee-haw' },
  { id: 'wizard', kind: 'hat', name: 'Wizard hat', price: 400, blurb: 'starry hat for anyone' },
  { id: 'flowerbed', kind: 'decor', item: 'shop/flowerbed', name: 'Flower patch', price: 150, blurb: 'bright flowers by the taskbar' },
  { id: 'fence', kind: 'decor', item: 'shop/fence', name: 'Picket fence', price: 200, blurb: 'a little white fence' },
  { id: 'mailbox', kind: 'decor', item: 'shop/mailbox', name: 'Mailbox', price: 300, blurb: 'with the flag up' },
  { id: 'pond', kind: 'decor', item: 'shop/pond', name: 'Lily pond', price: 450, blurb: 'a tiny pond with a lily pad' },
  { id: 'goblin', kind: 'buddy', item: 'shop/goblin', name: 'Goblin', price: 800, blurb: 'cheeky little troublemaker' },
  { id: 'bruno', kind: 'buddy', item: 'shop/bruno', name: 'Bruno', price: 1000, blurb: 'big friendly brown bear' },
  { id: 'frost', kind: 'buddy', item: 'shop/frost', name: 'Frost', price: 1200, blurb: 'fluffy polar bear' },
  { id: 'sparkle', kind: 'buddy', item: 'shop/sparkle', name: 'Sparkle', price: 1500, blurb: 'a magical unicorn' }
]);
