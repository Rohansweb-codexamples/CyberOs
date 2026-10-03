# CyberOS — Base44 Setup Notes

## What this is
A single-page "web OS" desktop environment (CyberOS v2.1) with an Express backend.
- **Frontend**: `index.html` + `js/apps.js` (28 apps) + `js/os.js` (window manager, theme, setup). Entry via `setup.html` on first visit.
- **Backend**: `server.js` — Express server serving static files + REST API (`/api/*`) for auth, contacts, tasks, notes, analytics. Data stored in `data/` directory as JSON files.
- **No database** — JSON file storage in `data/`, in-memory sessions.

## Running
```bash
docker compose -f docker-compose.base44.yml up -d
```
- Node 22 slim image, bind-mounted source, `npm install && node server.js`.
- Port 3000, healthcheck at `/api/health`.
- No external credentials needed. Server URL is configurable in-app Settings.

## Key files
- `js/apps.js` — all 28 app definitions (content generators + init functions) and `DEFAULT_APPS`/`THEMES` registries.
- `js/os.js` — core OS: window management, taskbar, start menu, setup overlay, boot, keyboard routing.
- `setup.html` — 5-step first-run setup wizard.
- `server.js` — Express server with auth + business API endpoints.

## Verifying
- `curl http://localhost:3000/api/health` → `{"ok":true,...}`
- Visit `/` → redirects to `setup.html` on first run → configure → enter desktop.
- Apps open in draggable windows; games respond to arrow keys when focused.
