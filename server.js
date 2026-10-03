const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB = path.join(DATA_DIR, 'business-users.json');
const sessions = new Map();

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(express.static(__dirname));

// ─── Storage helpers ───
function loadUsers() {
  try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return []; }
}
function saveUsers(users) {
  fs.writeFileSync(DB, JSON.stringify(users, null, 2));
}
function userFile(userId, name) {
  return path.join(DATA_DIR, userId + '-' + name + '.json');
}
function loadUserFile(userId, name) {
  try { return JSON.parse(fs.readFileSync(userFile(userId, name), 'utf8')); } catch { return []; }
}
function saveUserFile(userId, name, data) {
  try { fs.writeFileSync(userFile(userId, name), JSON.stringify(data, null, 2)); } catch (e) { console.error('save error', e); }
}

// ─── Auth helpers ───
function hash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return salt + ':' + crypto.scryptSync(password, salt, 64).toString('hex');
}
function verify(password, stored) {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(key));
}
function validEmail(v) { return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function sessionUser(req) {
  const id = req.cookies.cyberos_session;
  return id ? sessions.get(id) : null;
}

// ─── Health & info ───
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'CyberOS Business Server', version: '2.1', time: new Date().toISOString() }));
app.get('/api', (req, res) => res.json({
  service: 'CyberOS Business Server',
  version: '2.1',
  endpoints: ['/api/health', '/api/register', '/api/login', '/api/logout', '/api/me', '/api/profile', '/api/contacts', '/api/tasks', '/api/notes', '/api/stats', '/api/export']
}));

// ─── Auth ───
app.post('/api/register', (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const company = String(req.body.company || '').trim();
  if (name.length < 2) return res.status(400).json({ error: 'Enter your name.' });
  if (!validEmail(email)) return res.status(400).json({ error: 'Enter a valid email.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const users = loadUsers();
  if (users.some(u => u.email === email)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = { id: crypto.randomUUID(), name, email, company, passwordHash: hash(password), createdAt: new Date().toISOString() };
  users.push(user); saveUsers(users);
  const sid = crypto.randomUUID(); sessions.set(sid, user.id);
  res.cookie('cyberos_session', sid, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.json({ message: 'Business account created.', user: { id: user.id, name: user.name, email: user.email, company: user.company || '' } });
});

app.post('/api/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = loadUsers().find(u => u.email === email);
  if (!user || !verify(password, user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password.' });
  const sid = crypto.randomUUID(); sessions.set(sid, user.id);
  res.cookie('cyberos_session', sid, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 7 });
  res.json({ message: 'Signed in.', user: { id: user.id, name: user.name, email: user.email, company: user.company || '' } });
});

app.post('/api/logout', (req, res) => {
  const sid = req.cookies.cyberos_session; sessions.delete(sid);
  res.clearCookie('cyberos_session'); res.json({ message: 'Signed out.' });
});

app.get('/api/me', (req, res) => {
  const id = sessionUser(req);
  const user = id && loadUsers().find(u => u.id === id);
  if (!user) return res.status(401).json({ authenticated: false });
  res.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, company: user.company || '' } });
});

// ─── Business Profile ───
app.get('/api/profile', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const user = loadUsers().find(u => u.id === id);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ profile: { name: user.name, email: user.email, company: user.company || '', createdAt: user.createdAt } });
});

app.put('/api/profile', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  if (!user) return res.status(401).json({ error: 'Not authenticated.' });
  if (req.body.name) user.name = String(req.body.name).trim();
  if (req.body.company) user.company = String(req.body.company).trim();
  saveUsers(users);
  res.json({ message: 'Profile updated.', user: { id: user.id, name: user.name, email: user.email, company: user.company || '' } });
});

// ─── Contacts ───
app.get('/api/contacts', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ contacts: loadUserFile(id, 'contacts') });
});
app.post('/api/contacts', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const contacts = loadUserFile(id, 'contacts');
  const contact = { id: crypto.randomUUID(), name: String(req.body.name || ''), email: String(req.body.email || ''), phone: String(req.body.phone || ''), company: String(req.body.company || ''), note: String(req.body.note || ''), createdAt: new Date().toISOString() };
  contacts.push(contact); saveUserFile(id, 'contacts', contacts);
  res.json({ message: 'Contact added.', contact });
});
app.delete('/api/contacts/:cid', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const contacts = loadUserFile(id, 'contacts').filter(c => c.id !== req.params.cid);
  saveUserFile(id, 'contacts', contacts);
  res.json({ message: 'Contact removed.' });
});

// ─── Tasks ───
app.get('/api/tasks', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ tasks: loadUserFile(id, 'tasks') });
});
app.post('/api/tasks', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const tasks = loadUserFile(id, 'tasks');
  const task = { id: crypto.randomUUID(), title: String(req.body.title || ''), done: false, priority: String(req.body.priority || 'normal'), createdAt: new Date().toISOString() };
  tasks.push(task); saveUserFile(id, 'tasks', tasks);
  res.json({ message: 'Task created.', task });
});
app.put('/api/tasks/:tid', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const tasks = loadUserFile(id, 'tasks');
  const task = tasks.find(t => t.id === req.params.tid);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  if (typeof req.body.done === 'boolean') task.done = req.body.done;
  if (req.body.title) task.title = String(req.body.title);
  if (req.body.priority) task.priority = String(req.body.priority);
  saveUserFile(id, 'tasks', tasks);
  res.json({ message: 'Task updated.', task });
});
app.delete('/api/tasks/:tid', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const tasks = loadUserFile(id, 'tasks').filter(t => t.id !== req.params.tid);
  saveUserFile(id, 'tasks', tasks);
  res.json({ message: 'Task deleted.' });
});

// ─── Notes sync ───
app.get('/api/notes', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ notes: loadUserFile(id, 'notes') });
});
app.post('/api/notes', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const notes = loadUserFile(id, 'notes');
  const note = { id: crypto.randomUUID(), title: String(req.body.title || ''), text: String(req.body.text || ''), createdAt: new Date().toISOString() };
  notes.push(note); saveUserFile(id, 'notes', notes);
  res.json({ message: 'Note saved.', note });
});

// ─── Analytics ───
app.get('/api/stats', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  const contacts = loadUserFile(id, 'contacts');
  const tasks = loadUserFile(id, 'tasks');
  const notes = loadUserFile(id, 'notes');
  res.json({
    stats: {
      contacts: contacts.length,
      tasks: tasks.length,
      tasksDone: tasks.filter(t => t.done).length,
      tasksPending: tasks.filter(t => !t.done).length,
      notes: notes.length,
    }
  });
});

// ─── Export ───
app.get('/api/export', (req, res) => {
  const id = sessionUser(req);
  if (!id) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({
    profile: loadUsers().find(u => u.id === id),
    contacts: loadUserFile(id, 'contacts'),
    tasks: loadUserFile(id, 'tasks'),
    notes: loadUserFile(id, 'notes'),
  });
});

app.listen(PORT, () => console.log('CyberOS Business Server v2.1 listening on ' + PORT));
