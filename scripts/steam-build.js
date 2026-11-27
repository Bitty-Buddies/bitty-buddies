// Turns this checkout into the Steam version before electron-builder runs (used by the
// "Steam build" workflow; never commit the changes it makes).
//  - marks the build as the Steam version (src/steam.js switches on),
//  - drops the GitHub auto-updater and test channel (Steam updates the app itself),
//  - builds a plain folder for SteamPipe instead of an installer.
// Steam app and DLC ids come from "bitty.steam" in package.json; until they're filled in,
// it builds with Valve's public test app (480, "Spacewar") so the build can be tried out.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.bitty = pkg.bitty || {};
pkg.bitty.store = 'steam';
delete pkg.bitty.channel;
pkg.bitty.steam = pkg.bitty.steam || {};
if (!Number(pkg.bitty.steam.appId)) pkg.bitty.steam.appId = 480;
delete pkg.dependencies['electron-updater'];
pkg.build.publish = null;
pkg.build.win.target = [{ target: 'dir', arch: ['x64'] }];
pkg.build.asarUnpack = [...(pkg.build.asarUnpack || []), 'node_modules/steamworks.js/**'];
pkg.build.files = [...pkg.build.files,
  '!node_modules/steamworks.js/dist/{linux,osx}*/**', '!node_modules/steamworks.js/dist/**/*.{so,dylib}'];
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Steam build of ${pkg.version}, Steam app ${pkg.bitty.steam.appId}, ${(pkg.bitty.steam.dlc || []).length} DLC set up.`);
