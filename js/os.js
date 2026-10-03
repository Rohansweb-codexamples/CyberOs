// ═══════════════════════════════════════════════
// CyberOS v2.1 — Core OS Engine
// ═══════════════════════════════════════════════

const STORE = 'cyberos-v2-state';
const defaults = {
  setup: true, setupVersion: 3, business: false,
  name: 'Operator', company: 'CYBER NETWORK', accent: '#00f6ff',
  theme: 'cyber', serverUrl: '',
  apps: DEFAULT_APPS.map(a => ({...a})),
  websites: [],
};

let state;
try { state = JSON.parse(localStorage.getItem(STORE) || 'null') || structuredClone(defaults); } catch(e) { state = structuredClone(defaults); localStorage.removeItem(STORE); }
state = Object.assign(structuredClone(defaults), state);
state.apps = Array.isArray(state.apps) && state.apps.length ? state.apps : structuredClone(defaults.apps);
state.websites = Array.isArray(state.websites) ? state.websites : [];
// Ensure all default apps exist
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
  $('clock').textContent = d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) + '  ' + d.toLocaleDateString([], {day:'2-digit',month:'short'});
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
  save();
}

// ─── Desktop Icons ───
function renderIcons() {
  const all = [...state.apps, ...state.websites];
  $('icons').innerHTML = all.slice(0, 24).map(a =>
    `<button class="appicon" data-open="${esc(a.id)}"><span class="ico">${esc(a.icon||'APP')}</span><span>${esc(a.name)}</span></button>`
  ).join('');
  $('menuapps').innerHTML = all.map(a =>
    `<button class="appicon" data-open="${esc(a.id)}"><span class="ico">${esc(a.icon||'APP')}</span><span>${esc(a.name)}</span></button>`
  ).join('');
  document.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openApp(b.dataset.open));
}

// ─── Window Management ───
function focusWin(w) {
  z++; w.style.zIndex = z;
  document.querySelectorAll('.window').forEach(x => x.classList.remove('active'));
  w.classList.add('active');
}
function closeWin(id) {
  let w = windows.get(id); if (!w) return;
  if (w._snakeCleanup) w._snakeCleanup();
  w.remove(); windows.delete(id); renderTasks();
}
function minimizeWin(id) { let w = windows.get(id); if (w) w.style.display = 'none'; }
function restoreWin(id) { let w = windows.get(id); if (w) { w.style.display = 'flex'; focusWin(w); } }

function renderTasks() {
  $('tasks').innerHTML = [...windows].map(([id,w]) =>
    `<button class="task" data-task="${esc(id)}">${esc(w.dataset.title||id)}</button>`
  ).join('');
  document.querySelectorAll('[data-task]').forEach(b => b.onclick = () => {
    let w = windows.get(b.dataset.task);
    if (w?.style.display === 'none') restoreWin(b.dataset.task);
    else focusWin(w);
  });
}

function makeWindow(id, title, body) {
  if (windows.has(id)) { restoreWin(id); return windows.get(id); }
  const w = document.createElement('section');
  w.className = 'window open active'; w.dataset.title = title; w.id = 'win-' + id;
  const x = 40 + (windows.size % 5) * 28, y = 75 + (windows.size % 4) * 26;
  w.style.left = Math.min(x, Math.max(8, innerWidth-300)) + 'px';
  w.style.top = Math.min(y, Math.max(58, innerHeight-260)) + 'px';
  w.innerHTML = `<div class="titlebar"><span class="title">${esc(title)}</span><button class="winbtn" data-min>_</button><button class="winbtn close" data-close>X</button></div><div class="content">${body}</div>`;
  $('desktop').appendChild(w); windows.set(id, w); focusWin(w); renderTasks();
  w.querySelector('[data-close]').onclick = () => closeWin(id);
  w.querySelector('[data-min]').onclick = () => minimizeWin(id);
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
    nx = Math.max(0, Math.min(innerWidth-w.offsetWidth, nx));
    ny = Math.max(54, Math.min(innerHeight-80, ny));
    w.style.left = nx + 'px'; w.style.top = ny + 'px';
  });
  bar.addEventListener('pointerup', () => drag = null);
  bar.addEventListener('pointercancel', () => drag = null);
  return w;
}

// ─── App Opener ───
function openApp(id) {
  $('startmenu').style.display = 'none';
  let a = appById(id); if (!a) return;

  // Website type opens in iframe
  if (a.type === 'website') {
    return makeWindow(id, a.name, `<div style="height:100%;min-height:0;overflow:hidden"><iframe title="${esc(a.name)}" src="${esc(a.url)}" style="display:block;width:100%;height:100%;min-height:0;border:0;background:white;overflow:hidden"></iframe></div>`);
  }

  // Look up app content generator
  const app = APPS[id];
  if (app) {
    const w = makeWindow(id, a.name, app.html ? app.html(w) : '');
    // Execute init if present
    if (app.init) {
      try { app.init(w); } catch(e) { console.error('App init error:', id, e); }
    }
    // Execute any inline scripts in the content
    w.querySelectorAll('script').forEach(oldScript => {
      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
    return w;
  }

  // Fallback for custom apps without a generator
  return makeWindow(id, a.name, `<div class="card"><div class="big neon">${esc(a.name)}</div><p class="muted">CyberOS application module.</p></div>`);
}

// ─── Settings helpers ───
function openSettings() { openApp('settings'); }
function openBusiness() { openApp('business'); }
function openPages() { openApp('pages'); }
function toggleMobile() { document.body.classList.toggle('mobile'); }
function updateMode() { $('modeChip').textContent = state.business ? 'BUSINESS' : 'PERSONAL'; }

// ─── Setup Overlay ───
function openSetup(force = false) {
  if (!force && !state.setup) return;
  setupStep = 0; $('setupOverlay').style.display = 'grid'; renderSetup();
}
function renderSetup() {
  const stepsEl = $('setupSteps');
  if (stepsEl) stepsEl.innerHTML = Array.from({length:5}).map((_,i) => `<i class="step${i<=setupStep?' on':''}"></i>`).join('');
  const b = $('setupBody');
  if (setupStep === 0) b.innerHTML = `<div class="big neon">WELCOME TO CYBEROS V2.1</div><p class="muted">${DEFAULT_APPS.length} apps ready. Configure your workspace.</p><div class="field"><label>Operator name</label><input id="sname" value="${esc(state.name)}"></div><button class="cyberbtn" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 1) b.innerHTML = `<div class="big neon">WORKSPACE MODE</div><p class="muted">Business mode adds contacts, tasks, analytics & invoicing.</p><div class="grid"><button class="cyberbtn" onclick="state.business=false;setupNext()">PERSONAL</button><button class="cyberbtn" onclick="state.business=true;setupNext()">BUSINESS</button></div>`;
  if (setupStep === 2) b.innerHTML = `<div class="big neon">COMPANY & BRANDING</div><div class="field"><label>Company / workspace</label><input id="scompany" value="${esc(state.company)}"></div><div class="field"><label>Accent</label><input id="saccent" type="color" value="${esc(state.accent)}"></div><button class="cyberbtn" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 3) b.innerHTML = `<div class="big neon">THEME SELECTION</div><p class="muted">Choose a complete CyberOS neon theme.</p><div class="themegrid">${Object.entries(THEMES).map(([k,t])=>`<button class="themebtn" onclick="applyTheme('${k}');renderSetup()"><strong>${t.name}</strong><small>${t.cyan} / ${t.pink}</small></button>`).join('')}</div><button class="cyberbtn" style="margin-top:14px;width:100%" onclick="setupNext()">NEXT</button>`;
  if (setupStep === 4) b.innerHTML = `<div class="big neon">SERVER CONNECTION</div><p class="muted">Connect your CyberOS Business Server (Render) for cloud sync. You can add this later in Settings.</p><div class="field"><label>Business server URL</label><input id="sserver" value="${esc(state.serverUrl||'')}" placeholder="https://your-app.onrender.com"></div><div style="display:flex;gap:10px"><button class="cyberbtn" onclick="finishSetup(true)" style="flex:1">CONNECT & FINISH</button><button class="cyberbtn" onclick="finishSetup(false)" style="flex:1">SKIP</button></div>`;
}
function setupNext() {
  if (setupStep === 0) { state.name = $('sname')?.value || 'Operator'; }
  if (setupStep === 2) { state.company = $('scompany')?.value || state.company; state.accent = $('saccent')?.value || state.accent; }
  setupStep++; renderSetup();
}
function finishSetup(connect) {
  if (connect) { state.serverUrl = $('sserver')?.value?.trim().replace(/\/$/, '') || ''; }
  state.setup = false; state.setupVersion = 3;
  save();
  document.documentElement.style.setProperty('--cyan', state.accent);
  $('setupOverlay').style.display = 'none';
  updateMode(); renderIcons();
}

// ─── Start Menu ───
$('start').onclick = () => { $('startmenu').style.display = $('startmenu').style.display === 'block' ? 'none' : 'block'; };
$('appSearch').oninput = e => document.querySelectorAll('#menuapps [data-open]').forEach(b => {
  b.parentElement.style.display = b.innerText.toLowerCase().includes(e.target.value.toLowerCase()) ? '' : 'none';
});

// ─── Keyboard ───
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $('startmenu').style.display = 'none';
  if (e.key === 'F1') { e.preventDefault(); openSetup(true); }
  // Game controls — only when a game window is focused
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

// ─── Boot & Init ───
$('boot').style.display = 'none';
applyTheme(state.theme || 'cyber');
renderIcons();
updateMode();

// Redirect to setup if first visit
if (state.setup !== false || state.setupVersion !== 3) {
  if (!location.pathname.endsWith('/setup.html')) {
    location.href = 'setup.html';
  }
}

// ─── Responsive ───
window.addEventListener('resize', () => { if (innerWidth < 650) document.body.classList.add('mobile'); });
if (innerWidth < 650) document.body.classList.add('mobile');
