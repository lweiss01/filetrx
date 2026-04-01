# HOLISTIC

<!-- ═══════════════════════════════════════════════════════════════════════
     AGENT INSTRUCTIONS - READ THIS ENTIRE FILE BEFORE DOING ANYTHING ELSE
     ═══════════════════════════════════════════════════════════════════════

  1. Read this file top-to-bottom.
  2. Read AGENTS.md for the setup steps specific to your agent.
  3. Summarise to the user: what was last worked on, what's planned next.
  4. Ask: "What would you like to work on - continue recent work, or start something new?"
  5. Open the session with the repo-local Holistic helper for this repo.

  ⚠️  If you are about to edit a file listed under KNOWN FIXES, STOP and
     read that fix entry carefully before proceeding.
  ════════════════════════════════════════════════════════════════════════ -->

## Start Here

This repo uses Holistic for cross-agent handoffs. The source of truth is the repo itself: handoff docs, history, and regression memory should be committed and synced so any device can continue. Read this file first, then review the long-term history docs and zero-touch architecture note, then use the adapter doc for your app. The Holistic daemon is optional and only improves passive capture on devices where it is installed.

Use the repo-local Holistic helper in this repo: Windows `.\.holistic\system\holistic.cmd resume --agent <your-agent-name>`; macOS/Linux `./.holistic/system/holistic resume --agent <your-agent-name>`.

## Product North Star

Open repo, start working, Holistic quietly keeps continuity alive.

That is the intended end state for this project. Prefer changes that reduce ceremony, keep continuity durable, and make Holistic fade further into the background of normal work.

## Current Objective

**Continue recent repo work**

Continue work around .gitattributes

## Latest Work Status

Inferred a session from recent repo changes on main.

## What Was Tried

- Nothing recorded yet.

## What To Try Next

- Review .gitattributes

## Active Plan

- Review the most recently changed files
- Continue the current implementation thread

## Overall Impact So Far

- Nothing recorded yet.

## Regression Watch

- Review the regression watch document before changing related behavior.

## Key Assumptions

- None recorded.

## Blockers

- None.

## Changed Files In Current Session

- .beads/.gitignore
- .beads/.local_version
- .beads/README.md
- .beads/bd.sock
- .beads/beads.db
- .beads/beads.db-shm
- .beads/beads.db-wal
- .beads/config.yaml
- .beads/daemon.lock
- .beads/daemon.log
- .beads/daemon.pid
- .beads/interactions.jsonl
- .beads/issues.jsonl
- .beads/metadata.json
- .beads/test.md
- .cursorrules
- .gitattributes
- .github/copilot-instructions.md
- .gitignore
- .gsd/PROJECT.md
- .windsurfrules
- README.md
- ai-context.md
- data/items.json
- data/uploads/1773598666413-6a483405-55fd-422c-91c8-c0dbff30948b.png
- data/uploads/1773607527310-9c19f88a-709a-471c-a27e-845f81d98ee4.png
- data/uploads/1773607540934-5dc7828b-8068-4c32-8b1f-75b102aa2248.png
- data/uploads/1773610629661-81ec0edf-75c0-4887-b41c-e6b9a732f9b3.png
- data/uploads/1773611230996-55b142ad-f956-4a10-b581-d1deaa4762d0.png
- data/uploads/1773611618020-45a87e86-5ecc-4302-bab5-895ad08d34ab.png
- data/uploads/1773621129197-79cb1e27-eb1c-404d-901e-caa52cf183f1.png
- data/uploads/1773622917188-226805f7-9cb5-44f9-9a3c-6f41b4144d23.pdf
- data/uploads/The Wannabe Fascists - Federico Finchelstein v5.epub
- enable-filetrx-autostart.cmd
- launch-filetrx.cmd
- launch-filetrx.log
- package.json
- public/app.js
- public/index.html
- public/styles.css
- scripts/enable-filetrx-autostart.ps1
- scripts/launch-filetrx.ps1
- server.js

## Pending Work Queue

- None.

## Long-Term Memory

- Project history: [.holistic/context/project-history.md](.holistic/context/project-history.md)
- Regression watch: [.holistic/context/regression-watch.md](.holistic/context/regression-watch.md)
- Zero-touch architecture: [.holistic/context/zero-touch.md](.holistic/context/zero-touch.md)
- Portable sync model: handoffs are intended to be committed and synced so any device with repo access can continue.

## Supporting Documents

- State file: [.holistic/state.json](.holistic/state.json)
- Current plan: [.holistic/context/current-plan.md](.holistic/context/current-plan.md)
- Session protocol: [.holistic/context/session-protocol.md](.holistic/context/session-protocol.md)
- Session archive: [.holistic/sessions](.holistic/sessions)
- Adapter docs:
- codex: [.holistic/context/adapters/codex.md](.holistic/context/adapters/codex.md)
- claude: [.holistic/context/adapters/claude-cowork.md](.holistic/context/adapters/claude-cowork.md)
- antigravity: [.holistic/context/adapters/antigravity.md](.holistic/context/adapters/antigravity.md)
- gemini: [.holistic/context/adapters/gemini.md](.holistic/context/adapters/gemini.md)
- copilot: [.holistic/context/adapters/copilot.md](.holistic/context/adapters/copilot.md)
- cursor: [.holistic/context/adapters/cursor.md](.holistic/context/adapters/cursor.md)
- goose: [.holistic/context/adapters/goose.md](.holistic/context/adapters/goose.md)
- gsd: [.holistic/context/adapters/gsd.md](.holistic/context/adapters/gsd.md)
- gsd2: [.holistic/context/adapters/gsd2.md](.holistic/context/adapters/gsd2.md)

## Historical Memory

- Last updated: 2026-03-28T16:19:01.954Z
- Last handoff: None yet.
- Pending sessions remembered: 0
