# ai-context.md — filetrx Project Summary

Generated for Mission Control initialization. No `roadmap.md` was found in the repo; this summary is derived from source code, README, and project history.

---

## Project Goal

**filetrx** is a lightweight, local-first web app for transferring files, links, and notes from a phone to a laptop/PC over the same Wi-Fi network — with no cloud, no account, and no database.

Current direction: one-way only (phone → laptop/PC). The reverse direction (laptop → phone) is planned but not yet implemented.

Design philosophy: fast, zero-ceremony, local-only. Runs as a plain Node.js HTTP server with no build step and no external dependencies.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (no build step, no bundler) |
| Server | Node.js built-in `http` module |
| Frontend | Vanilla HTML + CSS + JS (`public/`) |
| File storage | Local filesystem (`data/uploads/`) |
| State persistence | JSON file (`data/items.json`) |
| Real-time push | Server-Sent Events (`/events` endpoint) |
| Launch (Windows) | `.cmd` launcher + PowerShell autostart scripts |

**No npm dependencies** — the server uses only Node.js built-ins (`http`, `fs`, `path`, `crypto`, `stream`, `os`, `events`).

---

## API Surface

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/state` | Snapshot of all items + URLs + limits |
| POST | `/api/share` | Submit a file, link, or both (multipart/form-data) |
| POST | `/api/items/:id/archive` | Archive or unarchive a drop |
| GET | `/events` | SSE stream — pushes state on every change |
| GET | `/uploads/:filename` | Serve uploaded files |
| GET | `/*` | Serve static files from `public/` |

---

## Key Constraints & Limits

- Max upload: **25 MB** per file
- Max items retained: **200** (oldest dropped on overflow)
- Note max length: **300 characters**
- No authentication — intended for trusted local networks only
- Port: **8787** (overridable via `PORT` env var)

---

## Data Model (item)

```json
{
  "id": "<uuid>",
  "createdAt": "<ISO timestamp>",
  "type": "link | image | bundle",
  "url": "<normalized https URL>",
  "note": "<optional text>",
  "file": {
    "displayName": "<sanitized filename>",
    "mimeType": "<mime>",
    "size": 12345,
    "storedName": "<timestamp-uuid.ext>",
    "url": "/uploads/<storedName>",
    "absPath": "<absolute local path>"
  },
  "archivedAt": "<ISO timestamp | omitted if active>"
}
```

---

## File Layout

```
filetrx/
├── server.js               # Entire backend (single file, ~410 lines)
├── public/
│   ├── index.html          # UI shell
│   ├── app.js              # Frontend logic
│   └── styles.css          # Styles
├── scripts/
│   ├── launch-filetrx.ps1          # PowerShell launcher
│   └── enable-filetrx-autostart.ps1 # Windows autostart setup
├── launch-filetrx.cmd      # Double-click launcher (Windows)
├── enable-filetrx-autostart.cmd
├── data/                   # Runtime data (git-ignored)
│   ├── items.json
│   └── uploads/
└── package.json            # name: filetrx, version: 0.1.0, no deps
```

---

## Known State (as of 2026-03-27)

- Version: **0.1.0**
- Recent work: `.gitattributes` configuration
- No `roadmap.md` exists in the repo — future plans are informal
- Holistic cross-agent session tracking is active (`.holistic/`)
- Beads issue tracker is active (`.beads/`)
