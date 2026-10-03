// ═══════════════════════════════════════════════
// CyberOS v2.1 — App Registry & Content Generators
// ═══════════════════════════════════════════════

const DEFAULT_APPS = [
  // Core
  {id:'browser',name:'Browser',type:'app',icon:'WEB',cat:'core'},
  {id:'terminal',name:'Terminal',type:'app',icon:'>_',cat:'core'},
  {id:'settings',name:'Settings',type:'app',icon:'CFG',cat:'core'},
  {id:'business',name:'Business Hub',type:'app',icon:'BIZ',cat:'core'},
  {id:'files',name:'File Manager',type:'app',icon:'FS',cat:'core'},
  {id:'dashboard',name:'System Dashboard',type:'app',icon:'SYS',cat:'core'},
  {id:'pages',name:'HTML Pages',type:'app',icon:'<>',cat:'core'},
  // Games
  {id:'snake',name:'Snake',type:'app',icon:'SNAK',cat:'games'},
  {id:'g2048',name:'2048',type:'app',icon:'2048',cat:'games'},
  {id:'tictactoe',name:'Tic-Tac-Toe',type:'app',icon:'TTT',cat:'games'},
  {id:'memory',name:'Memory Match',type:'app',icon:'MEM',cat:'games'},
  {id:'minesweeper',name:'Minesweeper',type:'app',icon:'MINE',cat:'games'},
  // Productivity
  {id:'calendar',name:'Calendar',type:'app',icon:'CAL',cat:'productivity'},
  {id:'tasks',name:'Task Manager',type:'app',icon:'TASK',cat:'productivity'},
  {id:'markdown',name:'Markdown Editor',type:'app',icon:'MD',cat:'productivity'},
  {id:'pomodoro',name:'Pomodoro',type:'app',icon:'POMO',cat:'productivity'},
  {id:'kanban',name:'Kanban Board',type:'app',icon:'KAN',cat:'productivity'},
  // Utilities
  {id:'password',name:'Password Gen',type:'app',icon:'PASS',cat:'utils'},
  {id:'colorpicker',name:'Color Picker',type:'app',icon:'COLR',cat:'utils'},
  {id:'converter',name:'Unit Converter',type:'app',icon:'CONV',cat:'utils'},
  {id:'stopwatch',name:'Stopwatch',type:'app',icon:'TIME',cat:'utils'},
  {id:'qrgen',name:'QR Generator',type:'app',icon:'QR',cat:'utils'},
  // Media
  {id:'music',name:'Music Player',type:'app',icon:'MUSC',cat:'media'},
  {id:'paint',name:'Paint Canvas',type:'app',icon:'PNT',cat:'media'},
  {id:'camera',name:'Camera',type:'app',icon:'CAM',cat:'media'},
  // Business
  {id:'contacts',name:'Contacts',type:'app',icon:'CTC',cat:'business'},
  {id:'analytics',name:'Analytics',type:'app',icon:'STAT',cat:'business'},
  {id:'invoice',name:'Invoice Gen',type:'app',icon:'INV',cat:'business'},
];

const THEMES = {
  cyber:{name:'Cyber Neon',cyan:'#00f6ff',pink:'#ff2bd6',lime:'#a6ff00',bg:'#02040a'},
  matrix:{name:'Matrix',cyan:'#00ff66',pink:'#00cc44',lime:'#b6ff00',bg:'#020b06'},
  violet:{name:'Violet Pulse',cyan:'#b36bff',pink:'#ff4fd8',lime:'#f0a6ff',bg:'#08020f'},
  sunset:{name:'Neon Sunset',cyan:'#ffb000',pink:'#ff3b7a',lime:'#ffe600',bg:'#0d0402'},
  ice:{name:'Ice Grid',cyan:'#75e6ff',pink:'#8fb8ff',lime:'#d9ffff',bg:'#020912'},
  blood:{name:'Blood Moon',cyan:'#ff3030',pink:'#ff6090',lime:'#ffaa00',bg:'#0a0202'},
  ocean:{name:'Deep Ocean',cyan:'#00b4ff',pink:'#0088ff',lime:'#00ffaa',bg:'#020a14'},
};

// Helper: server API fetch
async function apiFetch(path, options={}) {
  const base = state.serverUrl || location.origin;
  const res = await fetch(base + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
    credentials: 'include',
  });
  return res.json();
}

const APPS = {};

// ─── Browser ───
APPS.browser = {
  html(w) {
    return `<div class="field"><input id="urlbox" value="https://search.rohansweb.co.uk/" style="flex:1"><button class="cyberbtn" onclick="navBrowser()">GO</button></div>
    <div style="height:calc(100% - 82px);min-height:0;overflow:hidden;border:1px solid var(--line);border-radius:5px"><iframe id="browserframe" src="https://search.rohansweb.co.uk/" style="display:block;width:100%;height:100%;border:0;background:white"></iframe></div>`;
  }
};

// ─── Terminal ───
APPS.terminal = {
  html(w) {
    return `<div id="termout" style="font-family:ui-monospace,monospace;line-height:1.7;color:var(--lime);white-space:pre-wrap"></div>
    <div style="display:flex;margin-top:12px;gap:6px"><input id="term" style="flex:1;background:#020711;color:var(--lime);border:1px solid var(--line);padding:12px;border-radius:4px" autocomplete="off" placeholder="Type a command..."><button class="cyberbtn" onclick="runTerm()">RUN</button></div>`;
  },
  init(w) {
    const out = w.querySelector('#termout');
    out.innerHTML = 'CYBEROS TERMINAL v2.1<br>Type "help" for commands.<br>';
    window._termAppend = (text) => { out.innerHTML += text + '\n'; out.scrollTop = out.scrollHeight; };
    const input = w.querySelector('#term');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') runTerm(); });
  }
};

function runTerm() {
  const input = document.getElementById('term');
  const out = document.getElementById('termout');
  if (!input || !out) return;
  const cmd = input.value.trim();
  if (!cmd) return;
  const args = cmd.split(/\s+/);
  const command = args[0].toLowerCase();
  let r = '';
  const commands = {
    help: () => 'Commands: help, apps, mode, clear, echo, time, date, whoami, system, theme, calc, fortune, business, setup, about',
    apps: () => [...state.apps, ...state.websites].map(a => a.name).join(' | '),
    mode: () => state.business ? 'BUSINESS' : 'PERSONAL',
    clear: () => { out.innerHTML = ''; return ''; },
    echo: () => args.slice(1).join(' '),
    time: () => new Date().toLocaleTimeString(),
    date: () => new Date().toLocaleDateString(),
    whoami: () => state.name,
    system: () => `${navigator.platform} | ${navigator.hardwareConcurrency} threads | ${innerWidth}x${innerHeight}`,
    theme: () => 'Themes: ' + Object.keys(THEMES).join(', '),
    calc: () => { try { return String(Function('return ' + args.slice(1).join(' '))()); } catch { return 'Error'; } },
    fortune: () => ['The neon guides those who seek it.', 'In the grid, all paths connect.', 'Cyberspace is the new frontier.', 'Trust the terminal.'][Math.floor(Math.random()*4)],
    business: () => state.business ? 'Business mode active. Use the Business Hub.' : 'Personal mode. Switch in Settings.',
    setup: () => { openSetup(true); return 'Launching setup...'; },
    about: () => 'CyberOS v2.1 — Neural Desktop Environment',
  };
  r = commands[command] ? commands[command]() : `Command not found: ${command}. Type "help".`;
  out.innerHTML += '> ' + cmd + '\n' + r + '\n';
  out.scrollTop = out.scrollHeight;
  input.value = '';
}

function navBrowser() {
  let u = document.getElementById('urlbox').value.trim();
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  document.getElementById('browserframe').src = u;
}

// ─── Settings ───
APPS.settings = {
  html(w) {
    return `<div class="card">
      <div class="big neon">THEME CORE</div>
      <p class="muted">Choose a complete CyberOS neon theme.</p>
      <div class="themegrid">${Object.entries(THEMES).map(([k,t])=>`<button class="themebtn" onclick="applyTheme('${k}');openSettings()"><strong>${t.name}</strong><small>${t.cyan} / ${t.pink}</small></button>`).join('')}</div>
    </div>
    <div class="grid">
      <button class="cyberbtn" onclick="openSetup(true)">RUN SETUP</button>
      <button class="cyberbtn" onclick="openBusiness()">BUSINESS MODE</button>
      <button class="cyberbtn" onclick="toggleMobile()">MOBILE MODE</button>
    </div>
    <div class="card">
      <h3>Server Connection</h3>
      <p class="muted">Connect to your CyberOS Business Server on Render for cloud sync.</p>
      <div class="field"><label>Business server URL</label><input id="serverUrl" value="${esc(state.serverUrl||'')}" placeholder="https://your-app.onrender.com"></div>
      <button class="cyberbtn" onclick="saveServerUrl()">SAVE SERVER</button>
      <button class="cyberbtn" onclick="testServer()">TEST CONNECTION</button>
      <div id="serverTestResult" style="margin-top:10px"></div>
    </div>
    <div class="card">
      <h3>Account</h3>
      <p class="muted">Sign in or join the CyberOS Business Server.</p>
      <button class="cyberbtn" onclick="openAccount()">SIGN IN / JOIN</button>
    </div>`;
  }
};

async function testServer() {
  const el = document.getElementById('serverTestResult');
  el.innerHTML = '<span class="muted">Testing...</span>';
  try {
    const url = document.getElementById('serverUrl').value.trim().replace(/\/$/, '') || location.origin;
    const res = await fetch(url + '/api/health');
    const j = await res.json();
    el.innerHTML = j.ok ? `<span class="lime">✓ Connected — ${j.service} v${j.version||'2'}</span>` : '<span class="pink">✗ Server responded but unhealthy</span>';
  } catch (e) {
    el.innerHTML = '<span class="pink">✗ Cannot reach server. Check the URL.</span>';
  }
}

function saveServerUrl() {
  state.serverUrl = document.getElementById('serverUrl').value.trim().replace(/\/$/, '');
  save();
  alert('Business server saved.');
}

function openAccount() {
  openApp('browser');
  setTimeout(() => {
    const f = document.getElementById('browserframe');
    if (f) f.srcdoc = accountPage();
  }, 80);
}

function accountPage() {
  const url = state.serverUrl || location.origin;
  return `<style>body{font-family:system-ui;background:#050812;color:#eaffff;padding:28px}input,button{display:block;width:100%;max-width:420px;padding:12px;margin:8px 0;background:#07152a;color:white;border:1px solid #00f6ff;border-radius:5px;font:inherit}h1{color:#00f6ff}.msg{padding:10px;border:1px solid #ff2bd6;border-radius:5px;min-height:20px}</style>
  <h1>CyberOS Business Server</h1>
  <p>Sign in or join your business workspace.</p>
  <input id="email" placeholder="Email">
  <input id="password" type="password" placeholder="Password (min 8 chars)">
  <input id="name" placeholder="Name (for joining)">
  <button onclick="send('/api/login',false)">SIGN IN</button>
  <button onclick="send('/api/register',true)">JOIN BUSINESS</button>
  <div id="msg" class="msg"></div>
  <script>
  const BASE=${JSON.stringify(url)};
  async function send(path,join){
    const body={email:email.value,password:password.value};
    if(join)body.name=name.value;
    msg.textContent='Connecting...';
    try{
      const r=await fetch(BASE+path,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify(body)});
      const j=await r.json();
      msg.textContent=j.message||j.error||'Done';
      msg.style.color=r.ok?'#a6ff00':'#ff2bd6';
      if(r.ok&&j.user)msg.textContent+=' — Welcome '+j.user.name;
    }catch(e){msg.textContent='Server unavailable.';msg.style.color='#ff2bd6'}
  }
  <\/script>`;
}

// ─── Business Hub ───
APPS.business = {
  html(w) {
    return `<div class="business"><div class="big">BUSINESS CONTROL</div><p class="muted">Customise apps, websites, branding and workspace tools.</p></div>
    <div class="grid">
      <button class="cyberbtn" onclick="openSetup(true)">CUSTOMISE</button>
      <button class="cyberbtn" onclick="addWebsite()">ADD WEBSITE</button>
      <button class="cyberbtn" onclick="addApp()">ADD APP</button>
      <button class="cyberbtn" onclick="toggleBusiness()">TOGGLE MODE</button>
    </div>
    <div class="card"><h3>Installed (${[...state.apps,...state.websites].length})</h3><div class="list">${[...state.apps,...state.websites].map(a=>`<div class="listrow"><span>${esc(a.name)}</span><small class="muted">${esc(a.type)}</small><button onclick="removeItem('${esc(a.id)}')">REMOVE</button></div>`).join('')}</div></div>`;
  }
};

function addWebsite() {
  let name = prompt('Website name'); if (!name) return;
  let url = prompt('Website URL', 'https://'); if (!url) return;
  state.websites.push({id:'web-'+Date.now(),name,type:'website',icon:'WWW',url});
  save(); renderIcons(); openBusiness();
}
function addApp() {
  let name = prompt('App name'); if (!name) return;
  state.apps.push({id:'app-'+Date.now(),name,type:'app',icon:'APP'});
  save(); renderIcons(); openBusiness();
}
function removeItem(id) {
  if (['browser','terminal','settings','business','files'].includes(id)) { alert('Core apps cannot be removed.'); return; }
  state.apps = state.apps.filter(a => a.id !== id);
  state.websites = state.websites.filter(a => a.id !== id);
  save(); renderIcons(); openBusiness();
}
function toggleBusiness() { state.business = !state.business; save(); updateMode(); openBusiness(); }

// ─── File Manager ───
APPS.files = {
  html(w) {
    return `<div class="card"><div class="big neon">FILE MATRIX</div><p class="muted">Browser storage is available to this CyberOS workspace.</p></div>
    <div class="grid">
      <button class="cyberbtn" onclick="downloadState()">EXPORT OS CONFIG</button>
      <button class="cyberbtn" onclick="resetState()">FACTORY RESET</button>
    </div>
    <div class="card"><h3>Storage Info</h3><div class="list">
      <div class="listrow"><span>Apps installed</span><strong class="neon">${state.apps.length+state.websites.length}</strong></div>
      <div class="listrow"><span>Workspace</span><strong class="neon">${state.business?'BUSINESS':'PERSONAL'}</strong></div>
      <div class="listrow"><span>Storage</span><strong class="neon">localStorage</strong></div>
    </div></div>`;
  }
};

function downloadState() {
  let b = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
  let a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'cyberos-config.json'; a.click();
}
function resetState() {
  if (!confirm('Reset CyberOS to defaults? This erases all local data.')) return;
  localStorage.removeItem('cyberos-v2-state');
  location.reload();
}

// ─── System Dashboard ───
APPS.dashboard = {
  html(w) {
    const all = [...state.apps, ...state.websites];
    return `<div class="appdash">
      <div class="card"><div class="big neon">${navigator.hardwareConcurrency||'?'}</div><div class="stat">CPU THREADS</div></div>
      <div class="card"><div class="big neon">${innerWidth}×${innerHeight}</div><div class="stat">DISPLAY</div></div>
      <div class="card"><div class="big neon">${all.length}</div><div class="stat">INSTALLED APPS</div></div>
      <div class="card"><div class="big neon">${state.business?'BIZ':'HOME'}</div><div class="stat">WORKSPACE</div></div>
      <div class="card"><div class="big neon">${navigator.platform||'Web'}</div><div class="stat">PLATFORM</div></div>
      <div class="card"><div class="big neon">${Object.keys(THEMES).length}</div><div class="stat">THEMES</div></div>
    </div>`;
  }
};

// ─── HTML Pages ───
APPS.pages = {
  html(w) {
    const a = appById('pages'); if (!a.pages) a.pages = [];
    const options = a.pages.map((p,i)=>`<option value="${i}">${esc(p.name)}</option>`).join('');
    return `<div class="grid"><div class="card"><div class="big neon">HTML PAGE SYSTEM</div><p class="muted">Create multiple local HTML pages.</p><button class="cyberbtn" onclick="newPage()">NEW PAGE</button></div>
    <div class="card"><label>PAGE</label><select id="pageSelect" onchange="loadPage()">${options}</select><button class="cyberbtn" onclick="savePage()">SAVE</button><button class="cyberbtn" onclick="previewPage()">PREVIEW</button></div></div>
    <div class="field"><label>Page name</label><input id="pageName"></div>
    <div class="field"><label>HTML</label><textarea id="pageHtml" style="width:100%;height:280px;resize:vertical;background:#020711;color:var(--lime);border:1px solid var(--line);padding:12px;font-family:ui-monospace,monospace;border-radius:4px"></textarea></div>`;
  },
  init(w) { loadPage(); }
};

function loadPage() {
  let a = appById('pages'), i = Number(document.getElementById('pageSelect')?.value||0), p = a.pages[i];
  if (!p) return;
  document.getElementById('pageName').value = p.name;
  document.getElementById('pageHtml').value = p.html;
}
function savePage() {
  let a = appById('pages'), i = Number(document.getElementById('pageSelect').value);
  if (!a.pages[i]) return;
  a.pages[i].name = document.getElementById('pageName').value || 'Page';
  a.pages[i].html = document.getElementById('pageHtml').value;
  save(); openPages();
}
function newPage() {
  let a = appById('pages');
  a.pages.push({name:'New Page', html:'<h1>New Cyber Page</h1><p>Start writing HTML here.</p>'});
  save(); openPages();
}
function previewPage() {
  let html = document.getElementById('pageHtml').value;
  let name = document.getElementById('pageName').value || 'Page Preview';
  makeWindow('preview-'+Date.now(), name, `<div style="height:100%;overflow:auto;background:white;color:#111;padding:20px;border-radius:5px">${html}</div>`);
}

// ─── Calendar ───
APPS.calendar = {
  html(w) {
    return `<div class="game-info"><button class="cyberbtn" onclick="calNav(-1)">◄</button><div class="big neon" id="calMonth"></div><button class="cyberbtn" onclick="calNav(1)">►</button></div>
    <div id="calGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px"></div>`;
  },
  init(w) { window._calDate = new Date(); calRender(); }
};
function calNav(dir) { window._calDate.setMonth(window._calDate.getMonth()+dir); calRender(); }
function calRender() {
  const d = window._calDate;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calMonth').textContent = months[d.getMonth()] + ' ' + d.getFullYear();
  const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const days = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
  const today = new Date();
  let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="stat" style="text-align:center;padding:6px">${d}</div>`).join('');
  for (let i=0; i<first; i++) html += '<div></div>';
  for (let i=1; i<=days; i++) {
    const isToday = i===today.getDate() && d.getMonth()===today.getMonth() && d.getFullYear()===today.getFullYear();
    html += `<div class="cell" style="height:52px;${isToday?'border-color:var(--cyan);box-shadow:0 0 10px var(--cyan)':''}">${i}</div>`;
  }
  document.getElementById('calGrid').innerHTML = html;
}

// ─── Markdown Editor ───
APPS.markdown = {
  html(w) {
    return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;height:100%;min-height:300px">
      <textarea id="mdInput" style="width:100%;height:100%;background:#020711;color:var(--lime);border:1px solid var(--line);padding:14px;border-radius:5px;resize:none;font-family:ui-monospace,monospace" placeholder="# Type markdown here..." oninput="mdPreview()"># CyberOS Markdown

Type **bold**, *italic*, or \`code\`.

- List item 1
- List item 2

> A blockquote</textarea>
      <div id="mdOutput" style="overflow:auto;padding:14px;border:1px solid var(--line);border-radius:5px;background:#06111f"></div>
    </div>`;
  },
  init(w) { mdPreview(); }
};
function mdPreview() {
  const md = document.getElementById('mdInput')?.value || '';
  const out = document.getElementById('mdOutput');
  if (!out) return;
  let html = esc(md)
    .replace(/^### (.*)$/gm, '<h3 style="color:var(--cyan)">$1</h3>')
    .replace(/^## (.*)$/gm, '<h2 style="color:var(--cyan)">$1</h2>')
    .replace(/^# (.*)$/gm, '<h1 style="color:var(--cyan)">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#020711;padding:2px 6px;border-radius:3px;color:var(--lime)">$1</code>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/^> (.*)$/gm, '<blockquote style="border-left:3px solid var(--cyan);padding-left:12px;color:var(--muted)">$1</blockquote>')
    .replace(/\n/g, '<br>');
  out.innerHTML = html;
}

// ─── Pomodoro Timer ───
APPS.pomodoro = {
  html(w) {
    return `<div style="display:grid;place-items:center;height:100%">
      <div class="big neon" id="pomoDisplay" style="font-size:64px;font-family:ui-monospace,monospace">25:00</div>
      <div class="muted" id="pomoPhase">Focus Session</div>
      <div class="grid" style="max-width:400px;margin-top:20px;width:100%">
        <button class="cyberbtn" onclick="pomoToggle()">START / PAUSE</button>
        <button class="cyberbtn" onclick="pomoReset()">RESET</button>
        <button class="cyberbtn" onclick="pomoSwitch()">SWITCH MODE</button>
      </div>
    </div>`;
  },
  init(w) {
    window._pomo = { sec: 25*60, running: false, mode: 'focus', interval: null };
    pomoUpdate();
  }
};
function pomoToggle() {
  const p = window._pomo;
  if (p.running) { clearInterval(p.interval); p.running = false; }
  else {
    p.running = true;
    p.interval = setInterval(() => {
      p.sec--; pomoUpdate();
      if (p.sec <= 0) {
        clearInterval(p.interval); p.running = false;
        alert(p.mode === 'focus' ? 'Focus complete! Take a break.' : 'Break over! Back to focus.');
        pomoSwitch();
        pomoToggle();
      }
    }, 1000);
  }
}
function pomoReset() {
  const p = window._pomo;
  clearInterval(p.interval); p.running = false;
  p.sec = p.mode === 'focus' ? 25*60 : 5*60;
  pomoUpdate();
}
function pomoSwitch() {
  const p = window._pomo;
  clearInterval(p.interval); p.running = false;
  p.mode = p.mode === 'focus' ? 'break' : 'focus';
  p.sec = p.mode === 'focus' ? 25*60 : 5*60;
  pomoUpdate();
}
function pomoUpdate() {
  const p = window._pomo;
  const m = String(Math.floor(p.sec/60)).padStart(2,'0');
  const s = String(p.sec%60).padStart(2,'0');
  const el = document.getElementById('pomoDisplay');
  if (el) el.textContent = m+':'+s;
  const ph = document.getElementById('pomoPhase');
  if (ph) ph.textContent = p.mode === 'focus' ? 'Focus Session' : 'Break Time';
}

// ─── Kanban Board ───
APPS.kanban = {
  html(w) {
    return `<div class="grid" style="grid-template-columns:repeat(3,1fr);height:100%;align-items:start">
      <div class="card"><h3 class="neon">TODO</h3><div id="kan-todo" class="list"></div><input id="kan-todo-input" placeholder="+ Add task" onkeydown="if(event.key==='Enter')kanAdd('todo')" style="width:100%;padding:8px;margin-top:8px;background:#020711;border:1px solid var(--line);color:var(--text);border-radius:4px"></div>
      <div class="card"><h3 class="pink">DOING</h3><div id="kan-doing" class="list"></div><input id="kan-doing-input" placeholder="+ Add task" onkeydown="if(event.key==='Enter')kanAdd('doing')" style="width:100%;padding:8px;margin-top:8px;background:#020711;border:1px solid var(--line);color:var(--text);border-radius:4px"></div>
      <div class="card"><h3 class="lime">DONE</h3><div id="kan-done" class="list"></div><input id="kan-done-input" placeholder="+ Add task" onkeydown="if(event.key==='Enter')kanAdd('done')" style="width:100%;padding:8px;margin-top:8px;background:#020711;border:1px solid var(--line);color:var(--text);border-radius:4px"></div>
    </div>`;
  },
  init(w) {
    if (!state.kanban) state.kanban = { todo: [], doing: [], done: [] };
    kanRender();
  }
};
function kanAdd(col) {
  const input = document.getElementById('kan-'+col+'-input');
  const val = input.value.trim(); if (!val) return;
  state.kanban[col].push(val); save(); input.value = ''; kanRender();
}
function kanMove(text, from, to) {
  state.kanban[from] = state.kanban[from].filter(t => t !== text);
  state.kanban[to].push(text); save(); kanRender();
}
function kanDel(col, idx) { state.kanban[col].splice(idx,1); save(); kanRender(); }
function kanRender() {
  if (!state.kanban) state.kanban = { todo: [], doing: [], done: [] };
  ['todo','doing','done'].forEach(col => {
    const el = document.getElementById('kan-'+col); if (!el) return;
    el.innerHTML = state.kanban[col].map((t,i)=>{
      const cols = { todo: ['doing','▶'], doing: ['done','▶','todo','◀'], done: ['todo','↺'] };
      const btns = col === 'todo' ? `<button onclick="kanMove('${esc(t)}','todo','doing')">▶</button>`
        : col === 'doing' ? `<button onclick="kanMove('${esc(t)}','doing','done')">▶</button><button onclick="kanMove('${esc(t)}','doing','todo')">◀</button>`
        : `<button onclick="kanMove('${esc(t)}','done','todo')">↺</button>`;
      return `<div class="listrow"><span>${esc(t)}</span>${btns}<button onclick="kanDel('${col}',${i})">×</button></div>`;
    }).join('');
  });
}

// ─── Password Generator ───
APPS.password = {
  html(w) {
    return `<div class="card"><div class="big neon" id="pwdOut" style="font-family:ui-monospace,monospace;word-break:break-all">Click generate</div></div>
    <div class="field"><label>Length: <span id="pwdLenVal">16</span></label><input type="range" id="pwdLen" min="6" max="64" value="16" oninput="document.getElementById('pwdLenVal').textContent=this.value" style="width:100%"></div>
    <div class="grid">
      <label><input type="checkbox" id="pwdUpper" checked> Uppercase</label>
      <label><input type="checkbox" id="pwdLower" checked> Lowercase</label>
      <label><input type="checkbox" id="pwdNum" checked> Numbers</label>
      <label><input type="checkbox" id="pwdSym"> Symbols</label>
    </div>
    <button class="cyberbtn" style="width:100%;margin-top:12px" onclick="genPassword()">GENERATE PASSWORD</button>
    <button class="cyberbtn" style="width:100%;margin-top:6px" onclick="copyPassword()">COPY</button>`;
  }
};
function genPassword() {
  const len = +document.getElementById('pwdLen').value;
  let chars = '';
  if (document.getElementById('pwdUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (document.getElementById('pwdLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('pwdNum').checked) chars += '0123456789';
  if (document.getElementById('pwdSym').checked) chars += '!@#$%^&*()-_=+[]{}';
  if (!chars) { document.getElementById('pwdOut').textContent = 'Select at least one option'; return; }
  let pwd = '';
  for (let i = 0; i < len; i++) pwd += chars[Math.floor(Math.random()*chars.length)];
  document.getElementById('pwdOut').textContent = pwd;
}
function copyPassword() {
  const text = document.getElementById('pwdOut').textContent;
  navigator.clipboard?.writeText(text).then(() => alert('Password copied!'));
}

// ─── Color Picker ───
APPS.colorpicker = {
  html(w) {
    return `<div class="card"><input type="color" id="cpColor" value="#00f6ff" style="width:100%;height:120px;border:none;background:none;cursor:pointer" oninput="cpUpdate()"></div>
    <div class="grid">
      <div class="card"><div class="stat">HEX</div><div class="neon big" id="cpHex">#00F6FF</div></div>
      <div class="card"><div class="stat">RGB</div><div class="neon big" id="cpRgb">0,246,255</div></div>
      <div class="card"><div class="stat">HSL</div><div class="neon big" id="cpHsl">180,100,50</div></div>
    </div>
    <button class="cyberbtn" style="width:100%" onclick="cpApply()">APPLY AS ACCENT</button>`;
  },
  init(w) { cpUpdate(); }
};
function cpUpdate() {
  const hex = document.getElementById('cpColor').value;
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  document.getElementById('cpHex').textContent = hex.toUpperCase();
  document.getElementById('cpRgb').textContent = `${r},${g},${b}`;
  // HSL
  const rr=r/255, gg=g/255, bb=b/255;
  const max=Math.max(rr,gg,bb), min=Math.min(rr,gg,bb);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0}else{
    const d=max-min;
    s=l>0.5?d/(2-max-min):d/(max+min);
    switch(max){case rr:h=(gg-bb)/d+(gg<bb?6:0);break;case gg:h=(bb-rr)/d+2;break;case bb:h=(rr-gg)/d+4;break}
    h/=6;
  }
  document.getElementById('cpHsl').textContent = `${Math.round(h*360)},${Math.round(s*100)},${Math.round(l*100)}`;
}
function cpApply() {
  state.accent = document.getElementById('cpColor').value;
  document.documentElement.style.setProperty('--cyan', state.accent);
  save();
  alert('Accent color applied!');
}

// ─── Unit Converter ───
APPS.converter = {
  html(w) {
    return `<div class="card"><h3 class="neon">Length</h3>
      <div class="grid" style="grid-template-columns:1fr auto 1fr;align-items:end">
        <div><input id="convLen1" type="number" value="1" oninput="convLen()" style="width:100%"><select id="convLenU1" onchange="convLen()" style="margin-top:6px"><option>m</option><option>km</option><option>cm</option><option>ft</option><option>mi</option></select></div>
        <span class="big neon">→</span>
        <div><input id="convLen2" readonly style="width:100%"><select id="convLenU2" onchange="convLen()" style="margin-top:6px"><option>ft</option><option>m</option><option>km</option><option>cm</option><option>mi</option></select></div>
      </div></div>
    <div class="card"><h3 class="neon">Weight</h3>
      <div class="grid" style="grid-template-columns:1fr auto 1fr;align-items:end">
        <div><input id="convW1" type="number" value="1" oninput="convW()" style="width:100%"><select id="convWU1" onchange="convW()" style="margin-top:6px"><option>kg</option><option>g</option><option>lb</option><option>oz</option></select></div>
        <span class="big neon">→</span>
        <div><input id="convW2" readonly style="width:100%"><select id="convWU2" onchange="convW()" style="margin-top:6px"><option>lb</option><option>kg</option><option>g</option><option>oz</option></select></div>
      </div></div>
    <div class="card"><h3 class="neon">Temperature</h3>
      <div class="grid" style="grid-template-columns:1fr auto 1fr;align-items:end">
        <div><input id="convT1" type="number" value="20" oninput="convT()" style="width:100%"><select id="convTU1" onchange="convT()" style="margin-top:6px"><option>C</option><option>F</option><option>K</option></select></div>
        <span class="big neon">→</span>
        <div><input id="convT2" readonly style="width:100%"><select id="convTU2" onchange="convT()" style="margin-top:6px"><option>F</option><option>C</option><option>K</option></select></div>
      </div></div>`;
  },
  init(w) { convLen(); convW(); convT(); }
};
const LEN_FACTORS = { m:1, km:1000, cm:0.01, ft:0.3048, mi:1609.344 };
function convLen() {
  const v = +document.getElementById('convLen1')?.value || 0;
  const u1 = document.getElementById('convLenU1')?.value, u2 = document.getElementById('convLenU2')?.value;
  if (!u1||!u2) return;
  const result = v * LEN_FACTORS[u1] / LEN_FACTORS[u2];
  document.getElementById('convLen2').value = +result.toFixed(4);
}
const W_FACTORS = { kg:1, g:0.001, lb:0.453592, oz:0.0283495 };
function convW() {
  const v = +document.getElementById('convW1')?.value || 0;
  const u1 = document.getElementById('convWU1')?.value, u2 = document.getElementById('convWU2')?.value;
  if (!u1||!u2) return;
  const result = v * W_FACTORS[u1] / W_FACTORS[u2];
  document.getElementById('convW2').value = +result.toFixed(4);
}
function convT() {
  const v = +document.getElementById('convT1')?.value || 0;
  const u1 = document.getElementById('convTU1')?.value, u2 = document.getElementById('convTU2')?.value;
  if (!u1||!u2) return;
  let c = u1==='C'?v : u1==='F'?(v-32)*5/9 : v-273.15;
  const result = u2==='C'?c : u2==='F'?c*9/5+32 : c+273.15;
  document.getElementById('convT2').value = +result.toFixed(2);
}

// ─── Stopwatch ───
APPS.stopwatch = {
  html(w) {
    return `<div style="display:grid;place-items:center;height:100%">
      <div class="big neon" id="swDisplay" style="font-size:48px;font-family:ui-monospace,monospace">00:00.00</div>
      <div class="grid" style="max-width:400px;margin-top:20px;width:100%">
        <button class="cyberbtn" onclick="swToggle()">START/STOP</button>
        <button class="cyberbtn" onclick="swLap()">LAP</button>
        <button class="cyberbtn" onclick="swReset()">RESET</button>
      </div>
      <div id="swLaps" style="width:100%;max-width:400px;margin-top:12px"></div>
    </div>`;
  },
  init(w) { window._sw = { start:0, elapsed:0, running:false, interval:null, laps:[] }; swUpdate(); }
};
function swToggle() {
  const s = window._sw;
  if (s.running) { clearInterval(s.interval); s.running=false; s.elapsed += Date.now()-s.start; }
  else { s.start=Date.now(); s.running=true; s.interval=setInterval(swUpdate,10); }
}
function swUpdate() {
  const s = window._sw;
  const t = s.elapsed + (s.running ? Date.now()-s.start : 0);
  const m = Math.floor(t/60000), sec = Math.floor((t%60000)/1000), ms = Math.floor((t%1000)/10);
  const el = document.getElementById('swDisplay');
  if (el) el.textContent = String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(ms).padStart(2,'0');
}
function swLap() {
  const s = window._sw;
  const t = s.elapsed + (s.running ? Date.now()-s.start : 0);
  s.laps.unshift(t);
  const el = document.getElementById('swLaps');
  if (el) el.innerHTML = s.laps.map((l,i)=>{
    const m=Math.floor(l/60000),sec=Math.floor((l%60000)/1000),ms=Math.floor((l%1000)/10);
    return `<div class="listrow"><span>Lap ${s.laps.length-i}</span><strong class="neon">${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(ms).padStart(2,'0')}</strong></div>`;
  }).join('');
}
function swReset() {
  const s = window._sw;
  clearInterval(s.interval); s.running=false; s.elapsed=0; s.laps=[];
  swUpdate();
  const el = document.getElementById('swLaps'); if (el) el.innerHTML='';
}

// ─── QR Generator ───
APPS.qrgen = {
  html(w) {
    return `<div class="field"><label>Text or URL</label><input id="qrInput" placeholder="Enter text or URL..." value="https://cyberos.app" oninput="genQR()"></div>
    <div style="text-align:center;padding:20px"><img id="qrImg" style="max-width:220px;border:1px solid var(--line);border-radius:8px;background:white;padding:8px" alt="QR Code"></div>
    <button class="cyberbtn" style="width:100%" onclick="downloadQR()">DOWNLOAD QR</button>`;
  },
  init(w) { genQR(); }
};
function genQR() {
  const text = document.getElementById('qrInput')?.value || '';
  if (!text) return;
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  const img = document.getElementById('qrImg');
  if (img) img.src = url;
}
function downloadQR() {
  const img = document.getElementById('qrImg');
  if (img && img.src) { const a = document.createElement('a'); a.href = img.src; a.download = 'qrcode.png'; a.click(); }
}

// ─── Music Player ───
APPS.music = {
  html(w) {
    return `<div class="card" style="text-align:center">
      <div class="big neon" id="musicTitle">Select a track</div>
      <audio id="musicAudio" controls style="width:100%;margin:14px 0"></audio>
      <div class="grid" style="text-align:left;max-height:200px;overflow:auto">
        <div class="listrow" style="cursor:pointer" onclick="playTrack('Synthwave','https://cdn.pixabay.com/audio/2022/10/30/audio_347111e9a4.mp3')"><span>Synthwave Loop</span><small class="muted">Royalty-free</small></div>
        <div class="listrow" style="cursor:pointer" onclick="playTrack('Ambient Pad','https://cdn.pixabay.com/audio/2023/01/05/audio_d0d6a36b7e.mp3')"><span>Ambient Pad</span><small class="muted">Royalty-free</small></div>
        <div class="listrow" style="cursor:pointer" onclick="playTrack('Lo-fi Beat','https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3')"><span>Lo-fi Beat</span><small class="muted">Royalty-free</small></div>
      </div>
    </div>`;
  }
};
function playTrack(name, url) {
  document.getElementById('musicTitle').textContent = name;
  const audio = document.getElementById('musicAudio');
  audio.src = url; audio.play().catch(()=>{});
}

// ─── Paint Canvas ───
APPS.paint = {
  html(w) {
    return `<div class="grid" style="grid-template-columns:1fr 1fr 1fr;align-items:center;margin-bottom:10px">
      <input type="color" id="paintColor" value="#00f6ff" style="width:50px;height:40px;border:none;background:none;cursor:pointer">
      <input type="range" id="paintSize" min="1" max="30" value="4" style="width:100%">
      <button class="cyberbtn" onclick="paintClear()">CLEAR</button>
    </div>
    <canvas id="paintCanvas" style="width:100%;height:100%;border:1px solid var(--line);border-radius:5px;background:#020711;cursor:crosshair"></canvas>`;
  },
  init(w) {
    const canvas = w.querySelector('#paintCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    let drawing = false, lastX=0, lastY=0;
    canvas.addEventListener('pointerdown', e => { drawing=true; const r=canvas.getBoundingClientRect(); lastX=e.clientX-r.left; lastY=e.clientY-r.top; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      const r=canvas.getBoundingClientRect();
      const x=e.clientX-r.left, y=e.clientY-r.top;
      ctx.strokeStyle=document.getElementById('paintColor').value;
      ctx.lineWidth=+document.getElementById('paintSize').value;
      ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(x,y); ctx.stroke();
      lastX=x; lastY=y;
    });
    canvas.addEventListener('pointerup', ()=>drawing=false);
    canvas.addEventListener('pointercancel', ()=>drawing=false);
  }
};
function paintClear() {
  const canvas=document.getElementById('paintCanvas');
  if(canvas){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);}
}

// ─── Camera ───
APPS.camera = {
  html(w) {
    return `<div style="text-align:center">
      <video id="camVideo" autoplay playsinline style="max-width:100%;border:1px solid var(--line);border-radius:8px;background:#000"></video>
      <div class="grid" style="max-width:400px;margin:12px auto">
        <button class="cyberbtn" onclick="camStart()">START CAMERA</button>
        <button class="cyberbtn" onclick="camSnap()">TAKE PHOTO</button>
      </div>
      <canvas id="camCanvas" style="display:none"></canvas>
      <div id="camMsg" class="muted">Click Start to access your camera.</div>
    </div>`;
  }
};
let _camStream = null;
function camStart() {
  navigator.mediaDevices?.getUserMedia({video:true}).then(stream => {
    _camStream = stream;
    document.getElementById('camVideo').srcObject = stream;
    document.getElementById('camMsg').textContent = 'Camera active.';
  }).catch(() => {
    document.getElementById('camMsg').textContent = 'Camera access denied or unavailable.';
  });
}
function camSnap() {
  const video = document.getElementById('camVideo');
  if (!video.videoWidth) { document.getElementById('camMsg').textContent = 'Start the camera first.'; return; }
  const canvas = document.getElementById('camCanvas');
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cyberos-photo.png'; a.click();
  });
  document.getElementById('camMsg').textContent = 'Photo saved!';
}

// ─── Contacts (server-synced) ───
APPS.contacts = {
  html(w) {
    return `<div class="card"><h3 class="neon">Contacts</h3><div id="contactsList" class="list"></div></div>
    <div class="card"><h3>Add Contact</h3>
      <div class="field"><input id="ctName" placeholder="Name"></div>
      <div class="field"><input id="ctEmail" placeholder="Email"></div>
      <div class="field"><input id="ctPhone" placeholder="Phone"></div>
      <div class="field"><input id="ctCompany" placeholder="Company"></div>
      <button class="cyberbtn" style="width:100%" onclick="addContact()">ADD CONTACT</button>
    </div>`;
  },
  init(w) { loadContacts(); }
};
async function loadContacts() {
  const el = document.getElementById('contactsList');
  if (!el) return;
  el.innerHTML = '<div class="muted">Loading...</div>';
  try {
    const data = await apiFetch('/api/contacts');
    if (data.error) { el.innerHTML = `<div class="muted pink">${data.error}</div>`; return; }
    if (!data.contacts?.length) { el.innerHTML = '<div class="muted">No contacts yet.</div>'; return; }
    el.innerHTML = data.contacts.map(c=>`<div class="listrow"><span><strong>${esc(c.name)}</strong><br><small class="muted">${esc(c.email)} ${c.phone?'· '+esc(c.phone):''} ${c.company?'· '+esc(c.company):''}</small></span><button onclick="delContact('${esc(c.id)}')">×</button></div>`).join('');
  } catch (e) {
    // Fallback to local storage
    if (!state.localContacts) state.localContacts = [];
    el.innerHTML = state.localContacts.map((c,i)=>`<div class="listrow"><span><strong>${esc(c.name)}</strong><br><small class="muted">${esc(c.email)}</small></span><button onclick="delLocalContact(${i})">×</button></div>`).join('') || '<div class="muted">No contacts. Add one below.</div>';
  }
}
async function addContact() {
  const contact = {
    name: document.getElementById('ctName').value.trim(),
    email: document.getElementById('ctEmail').value.trim(),
    phone: document.getElementById('ctPhone').value.trim(),
    company: document.getElementById('ctCompany').value.trim(),
  };
  if (!contact.name) return;
  try {
    await apiFetch('/api/contacts', { method:'POST', body: JSON.stringify(contact) });
  } catch {
    if (!state.localContacts) state.localContacts = [];
    state.localContacts.push(contact); save();
  }
  ['ctName','ctEmail','ctPhone','ctCompany'].forEach(id => document.getElementById(id).value = '');
  loadContacts();
}
async function delContact(id) {
  try { await apiFetch('/api/contacts/'+id, { method:'DELETE' }); } catch {}
  loadContacts();
}
function delLocalContact(i) { state.localContacts.splice(i,1); save(); loadContacts(); }

// ─── Analytics (server-synced) ───
APPS.analytics = {
  html(w) {
    return `<div class="appdash" id="analyticsGrid"><div class="card muted">Loading analytics...</div></div>`;
  },
  init(w) { loadAnalytics(); }
};
async function loadAnalytics() {
  const el = document.getElementById('analyticsGrid');
  if (!el) return;
  try {
    const data = await apiFetch('/api/stats');
    if (data.error) { el.innerHTML = `<div class="card"><span class="pink">${data.error}</span><br><span class="muted">Connect your server in Settings.</span></div>`; return; }
    const s = data.stats;
    el.innerHTML = `
      <div class="card"><div class="big neon">${s.contacts}</div><div class="stat">CONTACTS</div></div>
      <div class="card"><div class="big lime">${s.tasksDone}</div><div class="stat">TASKS DONE</div></div>
      <div class="card"><div class="big pink">${s.tasksPending}</div><div class="stat">TASKS PENDING</div></div>
      <div class="card"><div class="big neon">${s.notes}</div><div class="stat">NOTES</div></div>
      <div class="card"><div class="big neon">${s.tasks}</div><div class="stat">TOTAL TASKS</div></div>
      <div class="card"><div class="big lime">${Math.round(s.tasksDone/(s.tasks||1)*100)}%</div><div class="stat">COMPLETION</div></div>`;
  } catch (e) {
    el.innerHTML = '<div class="card"><span class="muted">Cannot reach server. Set your server URL in Settings.</span></div>';
  }
}

// ─── Invoice Generator ───
APPS.invoice = {
  html(w) {
    return `<div class="card"><h3 class="neon">Invoice Details</h3>
      <div class="field"><input id="invFrom" placeholder="Your business name" value="${esc(state.company||'')}"></div>
      <div class="field"><input id="invTo" placeholder="Client name"></div>
      <div class="field"><input id="invEmail" placeholder="Client email"></div>
    </div>
    <div class="card"><h3 class="neon">Line Items</h3><div id="invItems"></div>
      <button class="cyberbtn" onclick="invAddItem()" style="margin-top:8px;width:100%">+ ADD ITEM</button>
    </div>
    <div class="field"><label>Tax Rate (%)</label><input id="invTax" type="number" value="20"></div>
    <button class="cyberbtn" style="width:100%" onclick="invGenerate()">GENERATE INVOICE</button>
    <div id="invOutput" style="margin-top:16px"></div>`;
  },
  init(w) {
    window._invItems = [];
    invAddItem();
  }
};
function invAddItem() {
  window._invItems.push({desc:'',qty:1,price:0});
  invRenderItems();
}
function invRenderItems() {
  const el = document.getElementById('invItems');
  if (!el) return;
  el.innerHTML = window._invItems.map((it,i)=>`<div class="listrow">
    <input id="invD${i}" placeholder="Description" value="${esc(it.desc)}" oninput="window._invItems[${i}].desc=this.value" style="flex:1">
    <input id="invQ${i}" type="number" value="${it.qty}" oninput="window._invItems[${i}].qty=+this.value" style="width:50px" style="width:50px">
    <input id="invP${i}" type="number" value="${it.price}" oninput="window._invItems[${i}].price=+this.value" style="width:80px">
    <button onclick="window._invItems.splice(${i},1);invRenderItems()">×</button>
  </div>`).join('');
}
function invGenerate() {
  const from = document.getElementById('invFrom').value;
  const to = document.getElementById('invTo').value;
  const email = document.getElementById('invEmail').value;
  const tax = +document.getElementById('invTax').value || 0;
  let subtotal = 0;
  const items = window._invItems.filter(i => i.desc).map(it => {
    const total = it.qty * it.price;
    subtotal += total;
    return `<tr><td style="padding:6px;border:1px solid #ddd">${esc(it.desc)}</td><td style="text-align:center;padding:6px;border:1px solid #ddd">${it.qty}</td><td style="text-align:right;padding:6px;border:1px solid #ddd">£${it.price.toFixed(2)}</td><td style="text-align:right;padding:6px;border:1px solid #ddd">£${total.toFixed(2)}</td></tr>`;
  }).join('');
  const taxAmt = subtotal * tax / 100;
  const grand = subtotal + taxAmt;
  const invNum = 'INV-' + Date.now().toString().slice(-6);
  document.getElementById('invOutput').innerHTML = `<div class="card" style="background:white;color:#111">
    <div style="display:flex;justify-content:space-between"><h2 style="color:#00f6ff">${esc(from||'')}</h2><div style="text-align:right"><strong>${invNum}</strong><br>${new Date().toLocaleDateString()}</div></div>
    <hr><p><strong>Bill To:</strong> ${esc(to)}<br>${esc(email)}</p>
    <table style="width:100%;border-collapse:collapse;margin:14px 0"><tr style="background:#f0f0f0"><th style="padding:6px;text-align:left;border:1px solid #ddd">Description</th><th style="padding:6px;border:1px solid #ddd">Qty</th><th style="padding:6px;text-align:right;border:1px solid #ddd">Price</th><th style="padding:6px;text-align:right;border:1px solid #ddd">Total</th></tr>${items}</table>
    <div style="text-align:right">Subtotal: £${subtotal.toFixed(2)}<br>Tax (${tax}%): £${taxAmt.toFixed(2)}<br><strong style="font-size:20px;color:#00f6ff">Total: £${grand.toFixed(2)}</strong></div>
  </div>`;
}

// ─── Tic-Tac-Toe ───
APPS.tictactoe = {
  html(w) {
    return `<div class="gamewrap"><div>
      <div class="game-info"><span class="badge" id="tttTurn">Your turn (X)</span><span class="badge" id="tttScore">You 0 — 0 CPU</span></div>
      <div id="tttBoard" style="display:grid;grid-template-columns:repeat(3,90px);gap:6px"></div>
      <button class="cyberbtn" style="margin-top:14px;width:100%" onclick="tttReset()">NEW GAME</button>
    </div></div>`;
  },
  init(w) { window._ttt = { board:Array(9).fill(''), turn:'X', over:false, you:0, cpu:0 }; tttRender(); }
};
function tttRender() {
  const g = window._ttt;
  const el = document.getElementById('tttBoard');
  if (!el) return;
  el.innerHTML = g.board.map((c,i)=>`<div class="cell" style="width:90px;height:90px;font-size:36px;color:${c==='X'?'var(--cyan)':'var(--pink)'}" onclick="tttPlay(${i})">${c}</div>`).join('');
  document.getElementById('tttTurn').textContent = g.over ? 'Game Over' : (g.turn==='X'?'Your turn (X)':"CPU's turn (O)");
  document.getElementById('tttScore').textContent = `You ${g.you} — ${g.cpu} CPU`;
}
function tttPlay(i) {
  const g = window._ttt;
  if (g.over || g.board[i] || g.turn !== 'X') return;
  g.board[i] = 'X'; g.turn = 'O';
  if (tttCheck('X')) { g.over=true; g.you++; tttRender(); setTimeout(()=>{alert('You win!');tttReset();},300); return; }
  if (!g.board.includes('')) { g.over=true; tttRender(); setTimeout(()=>{alert('Draw!');tttReset();},300); return; }
  tttRender(); setTimeout(tttCpu, 500);
}
function tttCpu() {
  const g = window._ttt;
  const empty = g.board.map((c,i)=>c?null:i).filter(i=>i!==null);
  if (!empty.length) return;
  const move = empty[Math.floor(Math.random()*empty.length)];
  g.board[move] = 'O'; g.turn = 'X';
  if (tttCheck('O')) { g.over=true; g.cpu++; tttRender(); setTimeout(()=>{alert('CPU wins!');tttReset();},300); return; }
  tttRender();
}
function tttCheck(p) {
  const g = window._ttt, b = g.board;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  return wins.some(w => w.every(i => b[i] === p));
}
function tttReset() { window._ttt = { board:Array(9).fill(''), turn:'X', over:false, you:window._ttt.you, cpu:window._ttt.cpu }; tttRender(); }

// ─── Memory Match ───
APPS.memory = {
  html(w) {
    return `<div class="gamewrap"><div>
      <div class="game-info"><span class="badge" id="memMoves">Moves: 0</span><span class="badge" id="memPairs">Pairs: 0/8</span></div>
      <div id="memBoard" style="display:grid;grid-template-columns:repeat(4,72px);gap:8px"></div>
      <button class="cyberbtn" style="margin-top:14px;width:100%" onclick="memReset()">NEW GAME</button>
    </div></div>`;
  },
  init(w) { memReset(); }
};
const MEM_EMOJIS = ['🎮','🚀','💎','⚡','🔥','🌟','🦾','👾'];
let _mem = null;
function memReset() {
  const cards = [...MEM_EMOJIS, ...MEM_EMOJIS].sort(()=>Math.random()-0.5);
  _mem = { cards, flipped:[], matched:[], moves:0, busy:false };
  const el = document.getElementById('memBoard'); if (!el) return;
  el.innerHTML = cards.map((c,i)=>`<div class="cell" data-idx="${i}" onclick="memFlip(${i})" style="width:72px;height:72px;font-size:32px;background:#05111f">${c}</div>`).join('');
  // Hide after 2 seconds
  setTimeout(() => {
    document.querySelectorAll('#memBoard .cell').forEach(el => { if (!_mem.matched.includes(+el.dataset.idx)) el.textContent = '?'; });
    _mem.hidden = true;
  }, 2000);
}
function memFlip(i) {
  if (!_mem || _mem.busy || _mem.flipped.includes(i) || _mem.matched.includes(i)) return;
  const card = document.querySelector(`#memBoard .cell[data-idx="${i}"]`);
  if (!card) return;
  card.textContent = _mem.cards[i];
  _mem.flipped.push(i);
  if (_mem.flipped.length === 2) {
    _mem.moves++;
    document.getElementById('memMoves').textContent = 'Moves: ' + _mem.moves;
    _mem.busy = true;
    const [a,b] = _mem.flipped;
    if (_mem.cards[a] === _mem.cards[b]) {
      _mem.matched.push(a,b);
      _mem.flotted = []; _mem.busy = false;
      document.getElementById('memPairs').textContent = `Pairs: ${_mem.matched.length/2}/8`;
      if (_mem.matched.length === 16) setTimeout(()=>alert('You won in '+_mem.moves+' moves!'),300);
    } else {
      setTimeout(() => {
        document.querySelector(`#memBoard .cell[data-idx="${a}"]`).textContent = '?';
        document.querySelector(`#memBoard .cell[data-idx="${b}"]`).textContent = '?';
        _mem.flipped = []; _mem.busy = false;
      }, 800);
    }
  }
}

// ─── Minesweeper ───
APPS.minesweeper = {
  html(w) {
    return `<div class="gamewrap"><div>
      <div class="game-info"><span class="badge" id="msFlags">Flags: 0/10</span><span class="badge" id="msStatus">Click to start</span></div>
      <div id="msBoard" style="display:grid;gap:2px"></div>
    </div></div>`;
  },
  init(w) { msReset(); }
};
let _ms = null;
function msReset() {
  _ms = { size:9, mines:10, grid:[], revealed:[], flags:0, over:false, won:false, started:false };
  _ms.grid = Array.from({length:9},()=>Array(9).fill(0));
  _ms.revealed = Array.from({length:9},()=>Array(9).fill(false));
  _ms.flagged = Array.from({length:9},()=>Array(9).fill(false));
  _ms.minePos = [];
  const el = document.getElementById('msBoard'); if (!el) return;
  el.style.gridTemplateColumns = `repeat(9,36px)`;
  el.innerHTML = Array.from({length:81}).map((_,i)=>`<div class="cell" data-r="${Math.floor(i/9)}" data-c="${i%9}" style="width:36px;height:36px;font-size:16px;background:#0a1830" onclick="msClick(${Math.floor(i/9)},${i%9})" oncontextmenu="event.preventDefault();msFlag(${Math.floor(i/9)},${i%9})"></div>`).join('');
  document.getElementById('msFlags').textContent = 'Flags: 0/10';
  document.getElementById('msStatus').textContent = 'Click to start';
}
function msInit(r,c) {
  let placed = 0;
  while (placed < _ms.mines) {
    const mr = Math.floor(Math.random()*9), mc = Math.floor(Math.random()*9);
    if (_ms.grid[mr][mc] === -1) continue;
    if (Math.abs(mr-r)<=1 && Math.abs(mc-c)<=1) continue;
    _ms.grid[mr][mc] = -1; _ms.minePos.push([mr,mc]); placed++;
  }
  for (let i=0;i<9;i++) for (let j=0;j<9;j++) {
    if (_ms.grid[i][j]===-1) continue;
    let count=0;
    for (let di=-1;di<=1;di++) for (let dj=-1;dj<=1;dj++) {
      const ni=i+di,nj=j+dj;
      if (ni>=0&&ni<9&&nj>=0&&nj<9&&_ms.grid[ni][nj]===-1) count++;
    }
    _ms.grid[i][j]=count;
  }
  _ms.started=true;
}
function msClick(r,c) {
  if (_ms.over) return;
  if (!_ms.started) msInit(r,c);
  if (_ms.flagged[r][c]) return;
  msReveal(r,c);
  msCheckWin();
}
function msReveal(r,c) {
  if (r<0||r>=9||c<0||c>=9||_ms.revealed[r][c]||_ms.flagged[r][c]) return;
  _ms.revealed[r][c]=true;
  const cell = document.querySelector(`#msBoard .cell[data-r="${r}"][data-c="${c}"]`);
  if (!cell) return;
  const v = _ms.grid[r][c];
  if (v===-1) {
    cell.textContent='💣'; cell.style.background='#ff3060'; cell.style.color='#fff';
    _ms.over=true; document.getElementById('msStatus').textContent='💥 BOOM!';
    _ms.minePos.forEach(([mr,mc])=>{ const el=document.querySelector(`#msBoard .cell[data-r="${mr}"][data-c="${mc}"]`); if(el){el.textContent='💣';el.style.background='#ff3060';}});
    return;
  }
  cell.style.background='#05111f';
  if (v>0) { cell.textContent=v; cell.style.color=['','#00f6ff','#a6ff00','#ff2bd6','#ffb000','#ff3030','#75e6ff','#fff','#888'][v]; }
  if (v===0) { for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) msReveal(r+dr,c+dc); }
}
function msFlag(r,c) {
  if (_ms.over||_ms.revealed[r][c]) return;
  _ms.flagged[r][c]=!_ms.flagged[r][c];
  _ms.flags+=_ms.flagged[r][c]?1:-1;
  const cell=document.querySelector(`#msBoard .cell[data-r="${r}"][data-c="${c}"]`);
  if(cell) cell.textContent=_ms.flagged[r][c]?'🚩':'';
  document.getElementById('msFlags').textContent=`Flags: ${_ms.flags}/10`;
  msCheckWin();
}
function msCheckWin() {
  if (_ms.over) return;
  let unrevealed=0;
  for (let i=0;i<9;i++) for (let j=0;j<9;j++) if (!_ms.revealed[i][j]) unrevealed++;
  if (unrevealed===_ms.mines) { _ms.over=true; _ms.won=true; document.getElementById('msStatus').textContent='🎉 YOU WIN!'; }
}

// ─── Snake ───
APPS.snake = {
  html(w) {
    return `<div class="gamewrap"><div>
      <div class="game-info"><span class="badge" id="snakeScore">Score: 0</span><span class="badge">Arrow keys to move</span></div>
      <canvas id="snakeCanvas" width="300" height="300" style="border:1px solid var(--line);border-radius:5px;background:#020711"></canvas>
    </div></div>`;
  },
  init(w) {
    const canvas = w.querySelector('#snakeCanvas');
    const ctx = canvas.getContext('2d');
    const G = 15; const cell = 20;
    let snake = [{x:7,y:7}], dir = {x:1,y:0}, food = {x:10,y:7}, score = 0, gameLoop = null, running = false;
    function draw() {
      ctx.fillStyle='#020711'; ctx.fillRect(0,0,300,300);
      ctx.fillStyle='var(--pink)'; ctx.fillStyle='#ff2bd6'; ctx.fillRect(food.x*cell,food.y*cell,cell-2,cell-2);
      snake.forEach((s,i)=>{ ctx.fillStyle=i===0?'#00f6ff':'rgba(0,246,255,'+(0.8-i*0.05)+')'; ctx.fillRect(s.x*cell,s.y*cell,cell-2,cell-2); });
    }
    function step() {
      const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};
      if (head.x<0||head.x>=G||head.y<0||head.y>=G||snake.some(s=>s.x===head.x&&s.y===head.y)) {
        clearInterval(gameLoop); running=false;
        document.getElementById('snakeScore').textContent='Score: '+score+' — Game Over!';
        return;
      }
      snake.unshift(head);
      if (head.x===food.x&&head.y===food.y) { score++; document.getElementById('snakeScore').textContent='Score: '+score;
        food={x:Math.floor(Math.random()*G),y:Math.floor(Math.random()*G)}; } else snake.pop();
      draw();
    }
    function start() { if (running) return; running=true; gameLoop=setInterval(step,120); }
    draw(); start();
    const handler = e => {
      if (e.key==='ArrowUp'&&dir.y===0) dir={x:0,y:-1};
      else if (e.key==='ArrowDown'&&dir.y===0) dir={x:0,y:1};
      else if (e.key==='ArrowLeft'&&dir.x===0) dir={x:-1,y:0};
      else if (e.key==='ArrowRight'&&dir.x===0) dir={x:1,y:0};
    };
    w.addEventListener('keydown', handler);
    w._snakeCleanup = () => { clearInterval(gameLoop); };
  }
};

// ─── 2048 ───
APPS.g2048 = {
  html(w) {
    return `<div class="gamewrap"><div>
      <div class="game-info"><span class="badge" id="g2048Score">Score: 0</span><span class="badge">Arrow keys</span></div>
      <div id="g2048Board" style="display:grid;grid-template-columns:repeat(4,70px);gap:6px;padding:8px;border:1px solid var(--line);border-radius:8px;background:#05111f"></div>
    </div></div>`;
  },
  init(w) { g2048Init(); }
};
let _g2048 = null;
const G2048_COLORS = {0:'#0a1830',2:'#0a2030',4:'#0a2840',8:'#004060',16:'#005075',32:'#006090',64:'#0070a5',128:'#0080bf',256:'#0090d0',512:'#00a0e0',1024:'#00b4ff',2048:'#00f6ff'};
function g2048Init() {
  _g2048 = { grid:Array.from({length:4},()=>Array(4).fill(0)), score:0 };
  g2048AddTile(); g2048AddTile(); g2048Render();
}
function g2048AddTile() {
  const empty=[];
  for (let r=0;r<4;r++) for (let c=0;c<4;c++) if (_g2048.grid[r][c]===0) empty.push([r,c]);
  if (!empty.length) return;
  const [r,c]=empty[Math.floor(Math.random()*empty.length)];
  _g2048.grid[r][c]=Math.random()<0.9?2:4;
}
function g2048Render() {
  const el=document.getElementById('g2048Board'); if(!el) return;
  el.innerHTML=_g2048.grid.flat().map(v=>{
    const color=G2048_COLORS[v]||'#00f6ff';
    return `<div class="cell" style="width:70px;height:70px;font-size:${v>999?20:24}px;background:${color};color:white;display:grid;place-items:center;border:none;border-radius:5px">${v||''}</div>`;
  }).join('');
  document.getElementById('g2048Score').textContent='Score: '+_g2048.score;
}
function g2048Move(dir) {
  const g=_g2048; let moved=false;
  const slide=(row)=>{
    const arr=row.filter(v=>v); let sc=0;
    for (let i=0;i<arr.length-1;i++) if(arr[i]===arr[i+1]){arr[i]*=2;sc+=arr[i];arr.splice(i+1,1);}
    while(arr.length<4) arr.push(0);
    g.score+=sc;
    return arr;
  };
  if(dir==='left'){g.grid=g.grid.map(slide);moved=true}
  else if(dir==='right'){g.grid=g.grid.map(r=>slide(r.reverse()).reverse());moved=true}
  else if(dir==='up'){for(let c=0;c<4;c++){let col=g.grid.map(r=>r[c]);col=slide(col);for(let r=0;r<4;r++)g.grid[r][c]=col[r];}moved=true}
  else if(dir==='down'){for(let c=0;c<4;c++){let col=g.grid.map(r=>r[c]);col=slide(col.reverse()).reverse();for(let r=0;r<4;r++)g.grid[r][c]=col[r];}moved=true}
  if(moved){g2048AddTile();g2048Render();
    if(!g.grid.some(r=>r.includes(0))&&!g.grid.some(r=>r.some((v,i)=>v===r[i+1]))){
      let canMove=false;
      for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(c<3&&g.grid[r][c]===g.grid[r][c+1])canMove=true;if(r<3&&g.grid[r][c]===g.grid[r+1][c])canMove=true;}
      if(!canMove)setTimeout(()=>alert('Game Over! Score: '+g.score),300);
    }
  }
}
