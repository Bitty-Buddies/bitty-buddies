// Meet the team: a tree of who's who, like an organisation chart.
// Everyone writes their own title and "About" in the Admin Tool; the Bitty Admin server sends the
// tree here (names, Discord pictures and banners, who reports to whom). If the server can't be
// reached, the page still shows the team below with pixel pets for pictures.
(() => {
  const SERVER = 'https://bitty-admin.reece-feetenby.workers.dev';
  const PETS = ['critters/pup', 'critters/kit', 'critters/bun', 'critters/mossling', 'critters/ember', 'critters/pip'];
  const FOUNDER_ABOUT = [
    "Hi, I'm Wiggly, the founder of Bitty Buddies. By day I'm an IT engineer in the UK. By night I'm drawing tiny pets one pixel at a time and teaching them to wander, nap, climb your windows and cause a little mischief.",
    'Bitty Buddies began with one simple idea: what if your desktop had someone living on it? A few small pets pottering along the bottom of your screen, keeping you company without ever getting in the way. That idea grew into a whole world of critters, builds and adventurers, a Christmas advent calendar, and a community that helps decide what comes next.',
    "Every buddy is drawn and animated by hand, every line of code is written with care, and every suggestion from the Discord gets read. If you've got an idea for a new buddy, found a bug or just want to say hi, come and find me."
  ].join('\n\n');
  const FALLBACK = [
    { id: 'wiggly', founder: true, name: 'Wiggly', title: 'Founder and lead developer', about: FOUNDER_ABOUT, reportsTo: null, profile: 'https://discord.com/users/1459356618046312503', accent: '#5865F2' },
    { id: 'wz', name: 'Wz', title: 'Co-developer', reportsTo: 'wiggly', accent: '#3BA55C',
      about: "Wz is Bitty Buddies' co-developer and one of the core team behind the app. Wz helps build new features and packs, hunts down bugs before they reach your desktop, and makes sure every update is ready to ship.\n\nWz and Wiggly go way back: they've worked side by side in the same IT business for two years, fixing problems, building systems and keeping things running. That trust and teamwork now goes into every Bitty Buddies update, so new buddies arrive faster and the app keeps getting better. Got a question or an idea? You'll find Wz in the Discord too." }
  ];

  const org = document.getElementById('org');
  const dlg = document.getElementById('person');
  let people = [];
  const byId = id => people.find(p => p.id === id);
  const kids = id => people.filter(p => p.reportsTo === id).sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name));
  const slug = p => p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || p.id;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  function avatar(p, cls) {
    const box = el('span', 'member-avatar ' + (cls || ''));
    box.dataset.avatar = p.pet;
    box.setAttribute('aria-hidden', 'true');
    if (window.BB_drawAvatar) window.BB_drawAvatar(box);
    if (p.avatar) {
      const img = el('img'); img.alt = ''; img.hidden = true;
      img.onload = () => { img.hidden = false; box.classList.add('photo'); };
      img.src = p.avatar;
      box.appendChild(img);
    }
    return box;
  }

  function card(p) {
    const b = el('button', 'org-card' + (p.founder ? ' founder' : ''));
    b.type = 'button';
    b.style.setProperty('--accent', p.accent || '#5865F2');
    b.appendChild(avatar(p, 'small'));
    const t = el('span', 'org-text');
    t.appendChild(el('strong', 'org-name', p.name));
    if (p.title) t.appendChild(el('span', 'org-title', p.title));
    if (p.username) t.appendChild(el('span', 'org-handle', '@' + p.username));
    b.appendChild(t);
    const n = kids(p.id).length;
    if (n) { const c = el('span', 'org-count', '👥 ' + n); c.title = `${n} ${n === 1 ? 'person reports' : 'people report'} to ${p.name}`; b.appendChild(c); }
    b.setAttribute('aria-label', `${p.name}, ${p.title || 'team member'}. Open profile`);
    b.onclick = () => open(p);
    return b;
  }

  function branch(p) {
    const li = el('li');
    li.appendChild(card(p));
    const k = kids(p.id);
    if (k.length) { const ul = el('ul'); k.forEach(c => ul.appendChild(branch(c))); li.appendChild(ul); }
    return li;
  }

  function draw() {
    org.textContent = '';
    const roots = people.filter(p => !p.reportsTo || !byId(p.reportsTo));
    const ul = el('ul', 'org-tree');
    roots.forEach(r => ul.appendChild(branch(r)));
    org.appendChild(ul);
  }

  function chip(p) {
    const b = el('button', 'person-chip');
    b.type = 'button';
    b.appendChild(avatar(p, 'tiny'));
    b.appendChild(el('span', '', p.name));
    b.onclick = () => open(p);
    return b;
  }

  function open(p) {
    document.getElementById('pd-name').textContent = p.name;
    const h = document.getElementById('pd-handle');
    h.hidden = !p.username; h.textContent = p.username ? '@' + p.username : '';
    document.getElementById('pd-title').textContent = p.title || 'Team member';
    const banner = document.getElementById('pd-banner');
    banner.style.background = p.banner ? `center / cover no-repeat url("${p.banner}")` : (p.accent || '#5865F2');
    const old = document.getElementById('pd-avatar');
    const fresh = avatar(p); fresh.id = 'pd-avatar'; old.replaceWith(fresh);
    document.getElementById('pd-about-title').textContent = 'About ' + p.name;
    const about = document.getElementById('pd-about');
    about.textContent = '';
    const text = (p.about || '').trim() || `${p.name} hasn't written anything here yet.`;
    text.split(/\n\s*\n/).forEach(par => about.appendChild(el('p', '', par.trim())));
    const links = document.getElementById('pd-links');
    links.textContent = '';
    if (p.profile) { const a = el('a', 'btn discord', `${p.name} on Discord`); a.href = p.profile; a.rel = 'noopener'; links.appendChild(a); }
    const j = el('a', 'btn stone', 'Join the server'); j.href = 'https://discord.gg/aCHyjABJG7'; links.appendChild(j);
    // who they work with, like a work directory
    const rel = document.getElementById('pd-rel');
    rel.textContent = '';
    const boss = p.reportsTo && byId(p.reportsTo);
    const peers = p.reportsTo ? kids(p.reportsTo).filter(x => x.id !== p.id) : [];
    const team = kids(p.id);
    for (const [label, list] of [['Reports to', boss ? [boss] : []], ['Their team', team], ['Works with', peers]]) {
      if (!list.length) continue;
      const g = el('div', 'rel-group');
      g.appendChild(el('h3', '', label));
      const row = el('div', 'rel-row'); list.forEach(x => row.appendChild(chip(x)));
      g.appendChild(row);
      rel.appendChild(g);
    }
    history.replaceState(null, '', '#' + slug(p));
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }
  function close() { dlg.close(); }
  document.getElementById('pd-close').onclick = close;
  dlg.addEventListener('click', e => { if (e.target === dlg) close(); });   // click outside the box
  dlg.addEventListener('close', () => history.replaceState(null, '', location.pathname));

  function use(list) {
    people = list.map((p, i) => ({ ...p, pet: p.founder ? PETS[0] : PETS[1 + (i % (PETS.length - 1))] }));
    draw();
    const want = location.hash.slice(1);
    const hit = want && people.find(p => slug(p) === want);
    if (hit) open(hit);
  }

  use(FALLBACK);
  fetch(SERVER + '/team').then(r => r.ok ? r.json() : null).then(data => {
    const list = data && Array.isArray(data.members) ? data.members : [];
    if (!list.length) return;
    // the founder's story stays on the page until Wiggly writes his own in the Admin Tool
    const live = list.map(m => m.founder && !m.about ? { ...m, about: FOUNDER_ABOUT } : m);
    // until the rest of the team have ticked "Show me" in the Admin Tool, keep them on the page
    const founder = live.find(m => m.founder);
    if (live.length === 1 && founder) FALLBACK.filter(f => !f.founder).forEach(f => live.push({ ...f, reportsTo: founder.id }));
    use(live);
  }).catch(() => { /* keep the built-in team */ });
})();
