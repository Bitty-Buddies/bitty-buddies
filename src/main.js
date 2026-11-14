const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, dialog, shell, powerMonitor, net, safeStorage, Notification } = require('electron');
const os = require('os');
const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const licence = require('./licence');
const windows = require('./windows');
const stats = require('./stats');

const IS_MAC = process.platform === 'darwin';
const MAX_THINGS = 40;

if (!app.requestSingleInstanceLock()) {
  app.quit();
  return;
}

// ---------- packs ----------
const PACK_FILES = require('./packs');
const PACKS = PACK_FILES.map(file => ({ file, ...require(path.join(__dirname, 'packs', file)) }));
const ITEMS = {};
for (const p of PACKS) {
  for (const [key, it] of Object.entries(p.items)) {
    ITEMS[`${p.id}/${key}`] = { id: `${p.id}/${key}`, pack: p, name: it.name, blurb: it.blurb || '', kind: it.kind || 'pet', day: it.day || 0 };
  }
}

// Packs with `licensed: true` need a valid licence key that covers them.
const packUnlocked = p => !p.licensed || licence.isUnlocked(p.id);
// Advent calendar packs (`advent: <year>`): each item's `day` opens on that day of December by this PC's
// clock and then stays open for good. Days missed while the app was closed all open together.
const opensAt = i => new Date(i.pack.advent, 11, i.day).getTime();
const dayOpen = i => !i.pack.advent || !i.day || Date.now() >= opensAt(i);
const itemUnlocked = id => !!ITEMS[id] && packUnlocked(ITEMS[id].pack) && dayOpen(ITEMS[id]);
const unlockedPackFiles = () => PACKS.filter(packUnlocked).map(p => p.file);

// ---------- settings ----------
const DEFAULTS = { things: [{ id: 'critters/pup' }, { id: 'critters/kit' }], scale: 4, hidden: false, mischief: true, shareStats: true, stats: {} };
let settings = { ...DEFAULTS };
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    const s = JSON.parse(fs.readFileSync(settingsFile(), 'utf8'));
    settings = { ...DEFAULTS, ...s };
    settings.things = (settings.things || []).filter(t => t && ITEMS[t.id]);
  } catch { settings = { ...DEFAULTS }; }
}
function saveSettings() {
  try { fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2)); } catch (e) { console.error(e); }
}

// ---------- overlay window ----------
let win = null;
let tray = null;

function fitToScreen() {
  if (!win) return;
  win.setBounds(screen.getPrimaryDisplay().workArea);
}

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();
  win = new BrowserWindow({
    ...workArea,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    acceptFirstMouse: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  if (IS_MAC) win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.on('did-finish-load', () => {
    send('init', {
      packFiles: unlockedPackFiles(),
      things: settings.things.filter(t => itemUnlocked(t.id)),
      scale: settings.scale,
      hidden: settings.hidden,
      mischief: settings.mischief,
      windowGrab: windows.supported()
    });
    win.showInactive();
  });
  win.on('closed', () => { win = null; });

  // Windows doesn't always forward mouse movement to a click-through window, which meant
  // the overlay never noticed the pointer over a pet and clicks went straight through.
  // So we also tell the overlay where the cursor is, and it switches clicks on over a pet.
  let lastCursor = '';
  setInterval(() => {
    if (!win || win.isDestroyed() || !win.isVisible()) return;
    const p = screen.getCursorScreenPoint();
    const b = win.getBounds();
    const key = `${p.x},${p.y}`;
    if (key === lastCursor) return;
    lastCursor = key;
    send('cursor', { x: p.x - b.x, y: p.y - b.y });
  }, 33);

  screen.on('display-metrics-changed', fitToScreen);
  screen.on('display-added', fitToScreen);
  screen.on('display-removed', fitToScreen);
}

function send(channel, data) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, data);
}

// ---------- IPC from the overlay ----------
ipcMain.on('set-ignore', (_e, ignore) => {
  if (!win) return;
  if (ignore) win.setIgnoreMouseEvents(true, { forward: true });
  else win.setIgnoreMouseEvents(false);
});

// Mischief: pets can grab the window you're using and tug it along a bit.
ipcMain.handle('grab-window', () => (win && settings.mischief ? windows.pickWindow(win.getBounds(), [process.pid]) : null));
ipcMain.handle('move-window', (_e, dx) => windows.moveWindow(Number(dx) || 0));
ipcMain.on('release-window', () => windows.release());

ipcMain.on('things-changed', (_e, things) => {
  if (!Array.isArray(things)) return;
  // The overlay only knows about unlocked packs, so keep any saved locked items as they were.
  const locked = settings.things.filter(t => ITEMS[t.id] && !itemUnlocked(t.id));
  const shown = things
    .filter(t => t && itemUnlocked(t.id))
    .map(t => (typeof t.x === 'number' ? { id: t.id, x: Math.max(0, Math.min(1, t.x)) } : { id: t.id }));
  settings.things = [...shown, ...locked].slice(0, MAX_THINGS);
  saveSettings();
});

// ---------- licence window ----------
let licenceWin = null;

function licenceStatus() {
  const s = licence.status();
  const nameOf = id => (PACKS.find(p => p.id === id) || {}).name || id;
  return { ...s, keys: s.keys.map(k => ({ ...k, packNames: k.packs.map(nameOf) })), configured: licence.configured() };
}

function openLicenceWindow() {
  if (licenceWin) { licenceWin.show(); licenceWin.focus(); return; }
  licenceWin = new BrowserWindow({
    width: 440, height: 420, resizable: false, minimizable: false, maximizable: false,
    fullscreenable: false, title: 'Bitty Buddies licence', alwaysOnTop: true, show: false,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'licence-window', 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  licenceWin.loadFile(path.join(__dirname, 'licence-window', 'licence.html'));
  licenceWin.once('ready-to-show', () => licenceWin.show());
  licenceWin.on('closed', () => { licenceWin = null; });
  if (IS_MAC) app.focus({ steal: true });
}

function refreshUnlocks() {
  buildTrayMenu();
  if (win && !win.isDestroyed()) win.reload(); // reloads with the newly unlocked (or locked) packs
}

ipcMain.handle('licence:status', () => licenceStatus());
ipcMain.handle('licence:activate', async (_e, key) => {
  try {
    const packs = await licence.activate(key);
    refreshUnlocks();
    const names = packs.map(id => (PACKS.find(p => p.id === id) || {}).name || id);
    return { ...licenceStatus(), unlocked: names.join(' and ') };
  }
  catch (e) { return { error: e.message }; }
});
ipcMain.handle('licence:remove', async (_e, id) => { await licence.remove(id); refreshUnlocks(); return licenceStatus(); });
ipcMain.on('licence:close', () => { if (licenceWin) licenceWin.close(); });

// ---------- report a problem ----------
const REPORT_URL = (pkg.bitty && pkg.bitty.reportUrl) || '';
const STATUS_PAGE = 'https://wigglecodes.github.io/bitty-buddies/status.html';
let reportWin = null;

function openReportWindow() {
  if (reportWin) { reportWin.show(); reportWin.focus(); return; }
  reportWin = new BrowserWindow({
    width: 500, height: 700, resizable: false, minimizable: false, maximizable: false,
    fullscreenable: false, title: 'Report a problem', alwaysOnTop: true, show: false,
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'report-window', 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  reportWin.loadFile(path.join(__dirname, 'report-window', 'report.html'));
  reportWin.once('ready-to-show', () => reportWin.show());
  reportWin.on('closed', () => { reportWin = null; });
  if (IS_MAC) app.focus({ steal: true });
}

// What gets sent with a report when "Include app details" is ticked. Nothing personal.
function reportDetails() {
  return {
    version: app.getVersion(),
    os: `${process.platform === 'win32' ? 'Windows' : process.platform} ${os.release()} (${process.arch})`,
    packs: PACKS.filter(p => !p.hidden && packUnlocked(p)).map(p => p.name || p.id).join(', '),
    size: `${settings.scale}x`,
    things: String(settings.things.length),
    settings: `hidden ${settings.hidden ? 'on' : 'off'}, mischief ${settings.mischief ? 'on' : 'off'}, screens ${screen.getAllDisplays().length}`
  };
}

ipcMain.handle('report:details', () => reportDetails());
// Asks the server whether reports (and the other online services) are working right now.
ipcMain.handle('report:status', async () => {
  if (!REPORT_URL) return { ok: false };
  try {
    const res = await net.fetch(REPORT_URL.replace(/\/report$/, '/status'), { cache: 'no-store' });
    return res.ok ? await res.json() : { ok: false };
  } catch { return { ok: false, offline: true }; }
});
ipcMain.handle('report:send', async (_e, data) => {
  const msg = String((data && data.message) || '').trim().slice(0, 2000);
  if (msg.length < 10) return { error: 'Describe the problem in a few more words.' };
  if (!REPORT_URL) return { error: 'Reporting isn’t set up in this version.' };
  try {
    const res = await net.fetch(REPORT_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: msg, contact: String((data && data.contact) || '').slice(0, 120), details: data && data.include ? reportDetails() : {} })
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) return { error: out.error || `The report server said no (${res.status}). Try again later.` };
    return { ok: true };
  } catch {
    return { error: "Couldn't reach the report server. Check you're online and try again." };
  }
});
ipcMain.on('report:close', () => { if (reportWin) reportWin.close(); });

// ---------- account: sign in with the website account ----------
// Signing in is optional: free pets work without it. Once signed in the app stays signed in (the session
// token is kept encrypted with Windows' own protection), and keys added to the account unlock by themselves:
// on start-up, every few hours, and from the tray's "Check for new packs".
const ACCOUNT_API = REPORT_URL ? new URL(REPORT_URL).origin : '';
const accountFile = () => path.join(app.getPath('userData'), 'account.json');
let account = null;            // { token, username }
let signInWin = null;

function loadAccount() {
  try {
    const raw = JSON.parse(fs.readFileSync(accountFile(), 'utf8'));
    const token = raw.enc && safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(Buffer.from(raw.enc, 'base64')) : raw.token;
    if (/^[0-9a-f]{64}$/.test(token || '')) account = { token, username: raw.username || '' };
  } catch { account = null; }
}
function saveAccount() {
  try {
    if (!account) { fs.rmSync(accountFile(), { force: true }); return; }
    const out = { username: account.username };
    if (safeStorage.isEncryptionAvailable()) out.enc = safeStorage.encryptString(account.token).toString('base64');
    else out.token = account.token;
    fs.writeFileSync(accountFile(), JSON.stringify(out));
  } catch { /* not fatal: they'd just sign in again next time */ }
}

function openSignInWindow() {
  if (!ACCOUNT_API) return;
  if (signInWin) { signInWin.show(); signInWin.focus(); return; }
  signInWin = new BrowserWindow({
    width: 480, height: 640, resizable: false, minimizable: false, maximizable: false, fullscreenable: false,
    title: 'Sign in to Bitty Buddies', alwaysOnTop: true, autoHideMenuBar: true, show: false,
    webPreferences: { partition: 'bitty-account', contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  let done = false;
  const check = url => {
    const m = String(url).match(/\/account\/signed-in#token=([0-9a-f]{64})/);
    if (!m || done) return;
    done = true;
    if (account && account.token !== m[1]) signOutRemote(account.token);
    account = { token: m[1], username: '' };
    syncAccount({ announce: true }).finally(() => setTimeout(() => signInWin && !signInWin.isDestroyed() && signInWin.close(), 400));
  };
  const wc = signInWin.webContents;
  wc.on('will-redirect', (_e, url) => check(url));
  wc.on('did-navigate', (_e, url) => check(url));
  wc.on('did-redirect-navigation', (_e, url) => check(url));
  wc.on('did-navigate-in-page', (_e, url) => check(url));
  wc.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  signInWin.loadURL(`${ACCOUNT_API}/account/app`);
  signInWin.once('ready-to-show', () => signInWin.show());
  signInWin.on('closed', () => { signInWin = null; });
}

const signOutRemote = token => net.fetch(`${ACCOUNT_API}/account/logout`, { method: 'POST', headers: { authorization: `Bearer ${token}` } }).catch(() => {});
function signOut() {
  if (!account) return;
  signOutRemote(account.token);
  account = null;
  saveAccount();
  buildTrayMenu();
  dialog.showMessageBox({ type: 'info', message: 'Signed out', detail: 'Packs you’ve already unlocked stay unlocked on this PC.' });
}

// Fetch the account's keys and unlock any this PC doesn't have yet.
// announce: show a message even when nothing changed (sign-in, or "Check for new packs").
let syncing = null;
function syncAccount({ announce = false } = {}) {
  if (!account || !ACCOUNT_API) return Promise.resolve();
  if (syncing) return syncing;
  syncing = (async () => {
    let data;
    try {
      const res = await net.fetch(`${ACCOUNT_API}/account/me`, { headers: { authorization: `Bearer ${account.token}` } });
      data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {          // signed out on the server, or account locked/deleted
        account = null; saveAccount(); buildTrayMenu();
        dialog.showMessageBox({ type: 'info', message: 'You’ve been signed out of Bitty Buddies', detail: (data.error || 'Your sign-in ran out.') + ' Your unlocked packs stay unlocked. Sign in from the tray to pick up new ones.' });
        return;
      }
      if (!res.ok) throw new Error(data.error || 'The account server said no.');
    } catch (e) {
      if (announce) dialog.showMessageBox({ type: 'error', message: 'Couldn’t reach your account', detail: (e.message || '') + ' Check you’re online and try again.' });
      return;                                                   // offline on a quiet check: try again later
    }
    account.username = data.user ? data.user.username : account.username;
    saveAccount();
    buildTrayMenu();
    const usable = (data.keys || []).filter(k => !k.revoked && k.key);
    const unlocked = new Set();
    let already = 0, failed = 0;
    for (const k of usable) {
      try { (await licence.activate(k.key)).forEach(id => unlocked.add((PACKS.find(p => p.id === id) || {}).name || id)); }
      catch (e) { if (/already active/.test(e.message)) already++; else failed++; }
    }
    if (unlocked.size) refreshUnlocks();
    const who = account.username || 'your account';
    if (unlocked.size) {
      dialog.showMessageBox({ type: 'info', message: `🎉 Unlocked ${[...unlocked].join(' and ')}`, detail: `From your account, ${who}. Find them in the tray under Spawn and Build.` });
    } else if (failed && announce) {
      dialog.showMessageBox({ type: 'warning', message: 'Some keys couldn’t be unlocked', detail: 'Ask on the Bitty Buddies Discord and we’ll sort it out.' });
    } else if (announce) {
      dialog.showMessageBox({ type: 'info', message: `Signed in as ${who}`, detail: usable.length
        ? 'Everything on your account is already unlocked on this PC. Packs you buy later unlock by themselves.'
        : 'There are no packs on your account yet. When you buy one, it unlocks here by itself.' });
    }
  })().finally(() => { syncing = null; });
  return syncing;
}

ipcMain.on('thing-menu', (_e, { uid, id }) => {
  const item = ITEMS[id];
  if (!item || !win) return;
  const tpl = [{ label: item.name, enabled: false }, { type: 'separator' }];
  if (item.kind === 'pet') {
    tpl.push({ label: 'Sit', click: () => send('thing-action', { uid, action: 'sit' }) });
    tpl.push({ label: 'Nap time', click: () => send('thing-action', { uid, action: 'sleep' }) });
    tpl.push({ label: 'Go for a walk', click: () => send('thing-action', { uid, action: 'walk' }) });
    tpl.push({ label: 'Chase the mouse', click: () => send('thing-action', { uid, action: 'chase' }) });
    tpl.push({ label: 'Climb the wall', click: () => send('thing-action', { uid, action: 'climb' }) });
    tpl.push({ label: 'Pick something up', click: () => send('thing-action', { uid, action: 'grab' }) });
    tpl.push({ label: 'Start a battle!', click: () => send('thing-action', { uid, action: 'battle' }) });
    tpl.push({ type: 'separator' });
  }
  tpl.push({ label: `Remove ${item.name}`, click: () => send('thing-action', { uid, action: 'remove' }) });
  Menu.buildFromTemplate(tpl).popup({ window: win });
});

// ---------- tray ----------
function spawnMenu(kind) {
  const packs = PACKS
    .map(p => ({ p, items: Object.values(ITEMS).filter(i => i.pack === p && i.kind === kind) }))
    .filter(g => g.items.length)
    .filter(g => !g.p.hidden || packUnlocked(g.p)); // private packs don't even show as locked
  const toEntry = i => ({ label: i.blurb ? `${i.name}  —  ${i.blurb}` : i.name, click: () => send('spawn', i.id) });
  const lockedEntries = g => [
    { label: `${g.items.map(i => i.name).join(', ')}`, enabled: false },
    { type: 'separator' },
    { label: 'Unlock with a licence key…', click: openLicenceWindow }
  ];
  const group = g => g.p.advent ? adventGroup(g, toEntry) : packUnlocked(g.p)
    ? { label: g.p.name, submenu: g.items.map(toEntry) }
    : { label: `🔒 ${g.p.name}`, submenu: lockedEntries(g) };
  if (packs.length === 1) return packUnlocked(packs[0].p) ? packs[0].items.map(toEntry) : lockedEntries(packs[0]);
  return packs.map(group);
}

// An advent pack's menu: the doors opened so far, in order, and when the next one opens.
function adventGroup(g, toEntry) {
  const all = Object.values(ITEMS).filter(i => i.pack === g.p && i.day).sort((a, b) => a.day - b.day);
  const open = all.filter(dayOpen);
  const next = all.find(i => !dayOpen(i));
  const mine = g.items.filter(dayOpen).sort((a, b) => a.day - b.day)
    .map(i => ({ ...toEntry(i), label: `${i.day}.  ${toEntry(i).label}` }));
  const info = [];
  if (next) {
    const when = new Date(opensAt(next));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((when - today) / 86400000);
    info.push({ label: !open.length ? `🎄 The first door opens ${days === 1 ? 'tomorrow' : `on ${next.day} December`}` : `🎁 Door ${next.day} opens ${days === 1 ? 'tomorrow' : `on ${next.day} December`}`, enabled: false });
  } else info.push({ label: '🎄 All 25 doors are open. Merry Christmas!', enabled: false });
  return { label: `🎄 ${g.p.name} (${open.length} of ${all.length})`, submenu: [...mine, ...(mine.length ? [{ type: 'separator' }] : []), ...info] };
}

// Tells the user when new advent doors open (on start-up, after sleep, and as midnight passes).
function checkAdvent() {
  if (!settings.advent || typeof settings.advent !== 'object') settings.advent = {};
  let changed = false;
  for (const p of PACKS.filter(x => x.advent && packUnlocked(x))) {
    const open = Object.values(ITEMS).filter(i => i.pack === p && i.day && dayOpen(i)).sort((a, b) => a.day - b.day);
    const fresh = open.filter(i => i.day > (settings.advent[p.id] || 0));
    if (!fresh.length) continue;
    settings.advent[p.id] = open[open.length - 1].day;
    changed = true;
    const last = fresh[fresh.length - 1];
    const title = fresh.length === 1 ? `🎄 Door ${last.day} is open: ${last.name}!` : `🎄 ${fresh.length} advent doors are open!`;
    const body = fresh.length === 1
      ? `${last.blurb.charAt(0).toUpperCase()}${last.blurb.slice(1)}. Click to bring ${last.kind === 'build' ? 'it' : 'them'} to your desktop.`
      : `${fresh.map(i => i.name).join(', ')}. Find them in the tray under Spawn and Build. Click to meet ${last.name}.`;
    if (Notification.isSupported()) {
      const n = new Notification({ title, body, icon: path.join(__dirname, '..', 'assets', 'tray.png') });
      n.on('click', () => send('spawn', last.id));
      n.show();
    }
  }
  if (changed) { saveSettings(); buildTrayMenu(); }
}

function buildTrayMenu() {
  const sizes = [['Small', 3], ['Medium', 4], ['Large', 6], ['Huge', 8]];
  const menu = Menu.buildFromTemplate([
    { label: `Bitty Buddies v${app.getVersion()}`, enabled: false },
    { type: 'separator' },
    { label: 'Spawn', submenu: spawnMenu('pet') },
    { label: 'Build', submenu: spawnMenu('build') },
    {
      label: 'Play', submenu: [
        { label: 'Start a battle!', click: () => send('play', 'battle') },
        { label: 'Throw a ball', click: () => send('play', 'ball') },
        { label: 'Drop some treats', click: () => send('play', 'treats') },
        { label: 'Dance party!', click: () => send('play', 'party') },
        { label: 'Conga line!', click: () => send('play', 'conga') },
        { label: 'Move things around!', click: () => send('play', 'tidy') },
        ...(windows.supported() ? [{ label: 'Grab a window!', click: () => send('play', 'window') }] : []),
        { type: 'separator' },
        {
          label: 'Mischief (chasing, climbing, window tugging)', type: 'checkbox', checked: settings.mischief,
          click: i => { settings.mischief = i.checked; saveSettings(); send('set-mischief', settings.mischief); }
        }
      ]
    },
    {
      label: 'Clear', submenu: [
        { label: 'Remove all pets', click: () => send('clear', 'pet') },
        { label: 'Remove all builds', click: () => send('clear', 'build') },
        { label: 'Remove everything', click: () => send('clear', 'all') }
      ]
    },
    { type: 'separator' },
    {
      label: 'Hide everything', type: 'checkbox', checked: settings.hidden,
      click: i => { settings.hidden = i.checked; saveSettings(); send('set-hidden', settings.hidden); }
    },
    {
      label: 'Size', submenu: sizes.map(([label, v]) => ({
        label, type: 'radio', checked: settings.scale === v,
        click: () => { settings.scale = v; saveSettings(); send('set-scale', v); }
      }))
    },
    {
      label: 'Start with computer', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin,
      click: i => app.setLoginItemSettings({ openAtLogin: i.checked })
    },
    {
      label: 'Count me in the user stats (anonymous)', type: 'checkbox', checked: settings.shareStats,
      click: i => { settings.shareStats = i.checked; saveSettings(); if (i.checked) statsCheckIn(); }
    },
    { type: 'separator' },
    { label: licence.status().active ? 'Licence keys…' : 'Enter licence key…', click: openLicenceWindow },
    ...(!ACCOUNT_API ? [] : account ? [{
      label: `Signed in as ${account.username || 'you'}`, submenu: [
        { label: 'Check for new packs', click: () => syncAccount({ announce: true }) },
        { label: 'Sign out', click: signOut }
      ]
    }] : [{ label: 'Sign in…', click: openSignInWindow }]),
    readyVersion
      ? { label: `🎉 Restart to update to v${readyVersion}`, click: () => setImmediate(() => autoUpdater.quitAndInstall()) }
      : { label: 'Check for updates…', click: () => checkForUpdates(true) },
    { label: 'Report a problem…', click: openReportWindow },
    { label: 'Service status', click: () => shell.openExternal(STATUS_PAGE) },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setContextMenu(menu);
}

function createTray() {
  const file = IS_MAC ? 'trayTemplate.png' : 'tray.png';
  const icon = nativeImage.createFromPath(path.join(__dirname, '..', 'assets', file));
  if (IS_MAC) icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Bitty Buddies');
  buildTrayMenu();
  if (!IS_MAC) tray.on('click', () => tray.popUpContextMenu());
}

// ---------- auto-update (GitHub Releases) ----------
const pub = (pkg.build && pkg.build.publish && pkg.build.publish[0]) || {};
const RELEASES_URL = 'https://wigglecodes.github.io/bitty-buddies/';   // the website's download button, not the GitHub page
let manualCheck = false;
let autoUpdater = null;
let readyVersion = null;   // an update that has downloaded and is waiting for a restart
let lastAutoCheck = 0;

function setupUpdates() {
  if (!app.isPackaged) return;
  autoUpdater = require('electron-updater').autoUpdater; // loaded lazily: only the installed app needs it
  // macOS can only install updates silently when the app is code-signed.
  // Unsigned Mac builds get a "download the new version" prompt instead.
  autoUpdater.autoDownload = !IS_MAC;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', async info => {
    manualCheck = false;
    if (!IS_MAC) return; // Windows downloads in the background
    const r = await dialog.showMessageBox({
      type: 'info', buttons: ['Download', 'Later'], defaultId: 0,
      message: `Bitty Buddies ${info.version} is out!`,
      detail: 'Open the download page to grab the new version.'
    });
    if (r.response === 0) shell.openExternal(RELEASES_URL);
  });
  autoUpdater.on('update-not-available', () => {
    if (manualCheck) dialog.showMessageBox({ type: 'info', message: "You're on the latest version.", detail: `v${app.getVersion()}` });
    manualCheck = false;
  });
  autoUpdater.on('update-downloaded', async info => {
    if (readyVersion === info.version) return; // already told them about this one
    readyVersion = info.version;
    buildTrayMenu();
    const r = await dialog.showMessageBox({
      type: 'info', buttons: ['Restart now', 'Later'], defaultId: 0,
      message: `Bitty Buddies ${info.version} is ready`,
      detail: 'Restart to finish updating (or it will install next time you quit).'
    });
    if (r.response === 0) setImmediate(() => autoUpdater.quitAndInstall());
  });
  autoUpdater.on('error', err => {
    if (manualCheck) dialog.showErrorBox('Update check failed', String((err && err.message) || err));
    manualCheck = false;
  });

  // Check at launch, every 30 minutes while the app is open, and when the PC wakes up
  // or is unlocked (sleeping laptops can miss the timer for hours).
  const autoCheck = () => {
    if (readyVersion || Date.now() - lastAutoCheck < 5 * 60 * 1000) return;
    lastAutoCheck = Date.now();
    checkForUpdates(false);
  };
  autoCheck();
  setInterval(autoCheck, 30 * 60 * 1000);
  powerMonitor.on('resume', () => setTimeout(autoCheck, 15000));
  powerMonitor.on('unlock-screen', () => setTimeout(autoCheck, 15000));
}

function checkForUpdates(manual) {
  if (!app.isPackaged || !autoUpdater) {
    if (manual) dialog.showMessageBox({ type: 'info', message: 'Updates only work in the installed app.' });
    return;
  }
  manualCheck = manual;
  autoUpdater.checkForUpdates().catch(() => {});
}

// ---------- anonymous user count ----------
function statsCheckIn() {
  if (!app.isPackaged || !settings.shareStats) return;
  if (!settings.stats || typeof settings.stats !== 'object') settings.stats = {};
  stats.checkIn(settings.stats, { version: app.getVersion(), licensed: licence.status().active })
    .then(changed => { if (changed) saveSettings(); })
    .catch(() => {});
}

// ---------- lifecycle ----------
app.whenReady().then(() => {
  if (IS_MAC && app.dock) app.dock.hide();
  loadSettings();
  licence.load();
  loadAccount();
  createWindow();
  createTray();
  setupUpdates();

  // Check the revoke list now and every 30 minutes; revoked packs lock and restored ones unlock again.
  const recheck = () => licence.revalidate().then(result => { if (result === 'changed') refreshUnlocks(); });
  recheck();
  setInterval(recheck, 30 * 60 * 1000);

  // Advent calendar doors: check now, every few minutes (so a door opens just after midnight) and after sleep.
  setTimeout(checkAdvent, 6000);
  setInterval(checkAdvent, 5 * 60 * 1000);
  powerMonitor.on('resume', () => setTimeout(checkAdvent, 10000));

  // Signed in? Pick up any new packs on the account now, every 3 hours, and after waking from sleep.
  setTimeout(() => syncAccount(), 8000);
  setInterval(() => syncAccount(), 3 * 60 * 60 * 1000);
  powerMonitor.on('resume', () => setTimeout(() => syncAccount(), 30000));

  // Count this PC once per day/week/month it's used (checked hourly so long sessions roll over).
  setTimeout(statsCheckIn, 20000);
  setInterval(statsCheckIn, 60 * 60 * 1000);
  powerMonitor.on('resume', () => setTimeout(statsCheckIn, 20000));
});

app.on('second-instance', () => {
  if (tray && !IS_MAC) tray.popUpContextMenu();
});

app.on('window-all-closed', () => app.quit());
