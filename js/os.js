// ═══════════════════════════════════════════════
// CyberOS v3.0 — Linux Edition // Core OS Engine
// ═══════════════════════════════════════════════

const STORE = 'cyberos-v2-state';
const defaults = {
  setup: true, setupVersion: 5, business: false,
  name: 'Operator', username: 'operator', password: '',
  company: 'CYBER NETWORK', accent: '#00f6ff',
  theme: 'cyber', language: 'en', timezone: 'Europe/London',
  keyboard: 'us', desktop: 'gnome', privacy: 'balanced',
  serverUrl: '', apps: DEFAULT_APPS.map(a => ({...a})), websites: [],
};

let state;
try { state = JSON.parse(localStorage.getItem(STORE) || 'null') || structuredClone(defaults); } catch(e) { state = structuredClone(defaults); localStorage.removeItem(STORE); }
state = Object.assign(structuredClone(defaults), state);
state.apps = Array.isArray(state.apps) && state.apps.length ? state.apps : structuredClone(defaults.apps);
state.websites = Array.isArray(state.websites) ? state.websites : [];
const existingIds = state.apps.map(a => a.id);
DEFAULT_APPS.forEach(da => { if (!existingIds.includes(da.id)) state.apps.push({...da}); });

let z = 100, windows = new Map(), drag = null, setupStep = 0;
const $ = id => document.getElementById(id);

// ─── Utilities ───
function esc(s) { return String(s??'').replace(/[&<>"']/g, m => ({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[m])); }
function save() { localStorage.setItem(STORE, JSON.stringify(state)); }
function appById(id) { return state.apps.find(a => a.id === id) || state.websites.find(a => a.id === id); }

// ─── Clock ───
function clock() {
  let d = new Date();
  const t = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  const dt = d.toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'});
  $('topbarClock').innerHTML = `<span>${dt}</span><span>${t}</span>`;
}
setInterval(clock, 1000); clock();

// ─── Theme ───
function applyTheme(name) {
  const t = THEMES[name] || THEMES.cyber;
  state.theme = name; state.accent = t.cyan;
  document.documentElement.style.setProperty('--cyan', t.cyan);
  document.documentElement.style.setProperty('--pink', t.pink);
  document.documentElement.style.setProperty('--lime', t.lime);
  document.documentElement.style.setProperty('--theme-bg', t.bg);
  document.documentElement.style.setProperty('--accent', t.cyan);
  save();
}

// ─── Dock (Ubuntu-style left) ───
function renderDock() {
  const all = [...state.apps, ...state.websites];
  const openIds = [...windows.keys()];
  const html = all.slice(0, 28).map(a => {
    const running = openIds.includes(a.id);
    return `<button class="dock-btn ${running?'running':''}" data-open="${esc(a.id)}" title="${esc(a.name)}"><span class="ic">${esc(a.icon||'APP')}</span></button>`;
  }).join('');
  $('dockScroll').innerHTML = html;
  document.querySelectorAll('#dock [data-open]').forEach(b => b.onclick = () => {
    openApp(b.dataset.open);
    closeActivities();
  });
}

// ─── Desktop Icons ───
function renderIcons() {
  const all = [...state.apps, ...state.websites];
  $('icons').innerHTML = all.slice(0, 24).map(a =>
    `<button class="appicon" data-open="${esc(a.id)}"><span class="ico">${esc(a.icon||'APP')}</span><span>${esc(a.name)}</span></button>`
  ).join('');
  $('activitiesGrid').innerHTML = all.map(a =>
    `<button class="appicon" data-open="${esc(a.id)}"><span class="ico">${esc(a.icon||'APP')}</span><span>${esc(a.name)}</span></button>`
  ).join('');
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => {
    openApp(b.dataset.open);
    closeActivities();
  });
  renderDock();
}

// ─── Window Management ───
function focusWin(w) {
  z++; w.style.zIndex = z;
  document.querySelectorAll('.window').forEach(x => x.classList.remove('active'));
  w.classList.add('active');
  $('appName').textContent = w.dataset.title || 'Desktop';
}
function closeWin(id) {
  let w = windows.get(id); if (!w) return;
  if (w._snakeCleanup) w._snakeCleanup();
  w.remove(); windows.delete(id); renderTasks(); renderDock();
  if (!windows.size) $('appName').textContent = 'Desktop';
}
function minimizeWin(id) { let w = windows.get(id); if (w) { w.style.display = 'none'; renderDock(); } }
function toggleMax(id) {
  let w = windows.get(id); if (!w) return;
  if (w.dataset.max === '1') {
    w.dataset.max = '0';
    w.style.width = w.dataset.prevW || ''; w.style.height = w.dataset.prevH || '';
    w.style.left = w.dataset.prevL || ''; w.style.top = w.dataset.prevT || '';
  } else {
    w.dataset.max = '1';
    w.dataset.prevW = w.style.width; w.dataset.prevH = w.style.height;
    w.dataset.prevL = w.style.left; w.dataset.prevT = w.style.top;
    w.style.left = '80px'; w.style.top = '40px';
    w.style.width = 'calc(100vw - 88px)'; w.style.height = 'calc(100vh - 76px)';
  }
}
function restoreWin(id) { let w = windows.get(id); if (w) { w.style.display = 'flex'; focusWin(w); } }

function renderTasks() {
  // Tasks shown in dock via running indicator
  renderDock();
}

function makeWindow(id, title, body) {
  if (windows.has(id)) { restoreWin(id); return windows.get(id); }
  const w = document.createElement('section');
  w.className = 'window open active'; w.dataset.title = title; w.id = 'win-' + id;
  const x = 100 + (windows.size % 5) * 28, y = 58 + (windows.size % 4) * 26;
  w.style.left = Math.min(x, Math.max(80, innerWidth-320)) + 'px';
  w.style.top = Math.min(y, Math.max(42, innerHeight-280)) + 'px';
  w.innerHTML = `<div class="titlebar"><span class="title">${esc(title)}</span><div class="win-controls"><button class="winbtn" data-min title="Minimize">&#8211;</button><button class="winbtn" data-max title="Maximize">&#9633;</button><button class="winbtn close" data-close title="Close">&#10005;</button></div></div><div class="content">${body}</div>`;
  $('desktop').appendChild(w); windows.set(id, w); focusWin(w); renderTasks();
  w.querySelector('[data-close]').onclick = () => closeWin(id);
  w.querySelector('[data-min]').onclick = () => minimizeWin(id);
  w.querySelector('[data-max]').onclick = () => toggleMax(id);
  w.addEventListener('pointerdown', () => focusWin(w));
  // Dragging
  const bar = w.querySelector('.titlebar');
  bar.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    focusWin(w);
    const r = w.getBoundingClientRect();
    drag = { w, dx: e.clientX-r.left, dy: e.clientY-r.top };
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', e => {
    if (!drag || drag.w !== w) return;
    let nx = e.clientX - drag.dx, ny = e.clientY - drag.dy;
    nx = Math.max(72, Math.min(innerWidth-w.offsetWidth-4, nx));
    ny = Math.max(34, Math.min(innerHeight-80, ny));
    w.style.left = nx + 'px'; w.style.top = ny + 'px';
  });
  bar.addEventListener('pointerup', () => drag = null);
  bar.addEventListener('pointercancel', () => drag = null);
  return w;
}

// ─── App Opener ───
function openApp(id) {
  closeActivities();
  let a = appById(id); if (!a) return;
  if (a.type === 'website') {
    return makeWindow(id, a.name, `<div style="height:100%;min-height:0;overflow:hidden"><iframe title="${esc(a.name)}" src="${esc(a.url)}" style="display:block;width:100%;height:100%;min-height:0;border:0;background:white;overflow:hidden"></iframe></div>`);
  }
  const app = APPS[id];
  if (app) {
    const w = makeWindow(id, a.name, app.html ? app.html() : '');
    if (app.init) { try { app.init(w); } catch(e) { console.error('App init error:', id, e); } }
    w.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
    return w;
  }
  return makeWindow(id, a.name, `<div class="card"><div class="big neon">${esc(a.name)}</div><p class="muted">CyberOS application module.</p></div>`);
}

// ─── Activities Overview (GNOME-style) ───
function toggleActivities() {
  const ov = $('activities');
  if (ov.classList.contains('open')) closeActivities();
  else openActivities();
}
function openActivities() {
  $('activities').classList.add('open');
  $('appSearch').value = '';
  $('appSearch').focus();
  filterActivities('');
}
function closeActivities() { $('activities').classList.remove('open'); }
function filterActivities(q) {
  q = q.toLowerCase();
  document.querySelectorAll('#activitiesGrid [data-open]').forEach(b => {
    b.style.display = b.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ─── System Menu ───
function toggleSysMenu() {
  const m = $('sysmenu');
  if (m.classList.contains('open')) m.classList.remove('open');
  else { m.classList.add('open'); $('sysmUser').textContent = state.name; $('sysmMode').textContent = state.business ? 'Business Mode' : 'Personal Mode'; }
}

// ─── Settings helpers ───
function openSettings() { openApp('settings'); toggleSysMenuOff(); }
function openBusiness() { openApp('business'); toggleSysMenuOff(); }
function openPages() { openApp('pages'); toggleSysMenuOff(); }
function toggleMobile() { document.body.classList.toggle('mobile'); toggleSysMenuOff(); }
function toggleSysMenuOff() { $('sysmenu').classList.remove('open'); }
function updateMode() { /* mode shown in system menu */ }

// ─── Setup Overlay ───
function openSetup(force = false) {
  toggleSysMenuOff();
  if (!force && !state.setup) return;
  setupStep = 0; $('setupOverlay').style.display = 'grid'; renderSetup();
}
function renderSetup() {
  const stepsEl = $('setupSteps');
  if (stepsEl) stepsEl.innerHTML = Array.from({length:5}).map((_,i) => `<i class="step${i<setupStep?' done':i===setupStep?' on':''}"></i>`).join('');
  const b = $('setupBody');
  if (setupStep === 0) b.innerHTML = `<div class="big neon">QUICK SETUP</div><p class="muted">Reconfigure your CyberOS workspace.</p><div class="field"><label>Operator name</label><input id="sname" value="${esc(state.name)}"></div><button class="cyberbtn" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 1) b.innerHTML = `<div class="big neon">WORKSPACE MODE</div><p class="muted">Business mode adds contacts, tasks, analytics & invoicing.</p><div class="grid"><button class="cyberbtn" onclick="state.business=false;setupNext()">PERSONAL</button><button class="cyberbtn" onclick="state.business=true;setupNext()">BUSINESS</button></div>`;
  if (setupStep === 2) b.innerHTML = `<div class="big neon">COMPANY & BRANDING</div><div class="field"><label>Company / workspace</label><input id="scompany" value="${esc(state.company)}"></div><div class="field"><label>Accent</label><input id="saccent" type="color" value="${esc(state.accent)}"></div><button class="cyberbtn" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 3) b.innerHTML = `<div class="big neon">THEME SELECTION</div><p class="muted">Choose a complete CyberOS neon theme.</p><div class="themegrid">${Object.entries(THEMES).map(([k,t])=>`<button class="themebtn" onclick="applyTheme('${k}');renderSetup()"><strong>${t.name}</strong><small>${t.cyan} / ${t.pink}</small></button>`).join('')}</div><button class="cyberbtn" style="margin-top:14px;width:100%" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 4) b.innerHTML = `<div class="big neon">SERVER CONNECTION</div><p class="muted">Connect your CyberOS Business Server for cloud sync. You can add this later in Settings.</p><div class="field"><label>Business server URL</label><input id="sserver" value="${esc(state.serverUrl||'')}" placeholder="https://your-app.onrender.com"></div><div style="display:flex;gap:10px"><button class="cyberbtn" onclick="finishSetup(true)" style="flex:1">CONNECT & FINISH</button><button class="cyberbtn" onclick="finishSetup(false)" style="flex:1">SKIP</button></div>`;
}
function setupNext() {
  if (setupStep === 0) { state.name = $('sname')?.value || 'Operator'; }
  if (setupStep === 2) { state.company = $('scompany')?.value || state.company; state.accent = $('saccent')?.value || state.accent; }
  setupStep++; renderSetup();
}
function finishSetup(connect) {
  if (connect) { state.serverUrl = $('sserver')?.value?.trim().replace(/\/$/, '') || ''; }
  state.setup = false; state.setupVersion = 5;
  save();
  document.documentElement.style.setProperty('--cyan', state.accent);
  document.documentElement.style.setProperty('--accent', state.accent);
  $('setupOverlay').style.display = 'none';
  renderIcons();
}

// ─── Event Wiring ───
$('activitiesBtn').onclick = toggleActivities;
$('appSearch').oninput = e => filterActivities(e.target.value);
$('tbSys').onclick = e => { e.stopPropagation(); toggleSysMenu(); };
$('topbarClock').onclick = () => openApp('calendar');
$('tbNet').onclick = () => openApp('browser');
document.addEventListener('click', e => {
  if (!e.target.closest('#sysmenu') && !e.target.closest('#tbSys')) $('sysmenu').classList.remove('open');
  if (!e.target.closest('#activities') && !e.target.closest('#activitiesBtn')) closeActivities();
});

// ─── Keyboard ───
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeActivities(); $('sysmenu').classList.remove('open'); }
  if (e.key === 'F1') { e.preventDefault(); openSetup(true); }
  // Super key (Meta) opens Activities
  if (e.key === 'Meta') { e.preventDefault(); toggleActivities(); }
  const activeWin = document.querySelector('.window.active');
  if (activeWin) {
    const id = activeWin.id.replace('win-', '');
    if (id === 'snake' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); return; }
    if (id === 'g2048' && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const dirs = { ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down' };
      g2048Move(dirs[e.key]);
      return;
    }
  }
});

// ─── Boot Sequence ───
function runBoot() {
  const boot = $('boot');
  if (!boot) return;
  boot.style.display = 'grid';
  const log = $('bootlog');
  const lines = [
    '[  <span class="ok">OK</span> ] Reached target Basic System',
    '[  <span class="ok">OK</span> ] Started CyberOS Window Manager',
    '[  <span class="ok">OK</span> ] Mounted /home/' + esc(state.username || 'operator'),
    '[  <span class="ok">OK</span> ] Started Network Manager',
    '[  <span class="ok">OK</span> ] Started PulseAudio Sound Server',
    '[  <span class="ok">OK</span> ] Loaded ' + state.apps.length + ' application modules',
    '[  <span class="ok">OK</span> ] Applied theme: ' + (THEMES[state.theme]?.name || 'Cyber Neon'),
    '[  <span class="ok">OK</span> ] Started GNOME Shell v3.0',
    '[  <span class="ok">OK</span> ] Reached target Graphical Interface',
  ];
  let i = 0;
  const iv = setInterval(() => {
    if (i < lines.length) {
      log.innerHTML += lines[i++] + '<br>';
      log.scrollTop = log.scrollHeight;
    } else {
      clearInterval(iv);
      setTimeout(() => { boot.style.display = 'none'; }, 400);
    }
  }, 180);
}

// ─── Init ───
applyTheme(state.theme || 'cyber');
renderIcons();
updateMode();

if (state.setup !== false || state.setupVersion !== 5) {
  if (!location.pathname.endsWith('/setup.html')) {
    location.href = 'setup.html';
  }
}

runBoot();

// ─── Responsive ───
window.addEventListener('resize', () => { if (innerWidth < 650) document.body.classList.add('mobile'); });
if (innerWidth < 650) document.body.classList.add('mobile');
