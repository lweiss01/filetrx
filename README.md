# filetrx

filetrx is shorthand for file transfer.

Fast phone-to-laptop transfer for files, links, and quick notes over Wi-Fi.

A lightweight, local-first web app for transferring files, links, and notes from your phone to your laptop on the same Wi-Fi, with archive/unarchive and one-click path copy.

**Important:** filetrx currently supports one-way transfer only: **phone -> laptop/PC**. Sending files from laptop/PC to phone is not implemented yet.

## What it does

- Runs as a local web server on your laptop/desktop
- Shows local network URLs you can open from your phone
- Lets you upload a file, paste a link, and add an optional note
- Updates the laptop inbox instantly with no account, no cloud, and no database
- Can be launched from Windows without using `npm start`

## Latest features

- `Inbox` + `Archived` tabs in Recent Drops
- `Archive` / `Unarchive` on each drop (items are kept, not deleted)
- `Get path` button to copy the full local path for uploaded files
- Mixed file rendering: image preview for images, file placeholder card for non-images
- Cleaner card headers without the old top type label
- `Hide setup` / `Show setup` toggle for the Open On Your Phone card (state remembered in browser)
- Version footer so you can confirm what build is running
- More reliable launcher with startup logging (`launch-filetrx.log`)

## Easiest launch options

### Windows

- Double-click `launch-filetrx.cmd` to start the server if needed and open the app.
- If you want it available after every Windows login, double-click `enable-filetrx-autostart.cmd` once.
- If launch fails, open `launch-filetrx.log` in the project root to see why.

### Phone

- Open the app from your phone browser using the laptop Wi-Fi URL.
- Add that page to your phone home screen from the browser menu for one-tap access later.
- The laptop still needs the filetrx server running, so laptop autostart is the easiest setup.

## Typical workflow

1. Send files, links, or notes from your phone.
2. In `Recent Drops`, open image previews or file placeholders as needed.
3. Click `Get path` to copy the local file path.
4. Archive older drops and unarchive later when needed.

## Run it manually

```bash
npm start
```

Then open the printed local URL on your laptop and one of the printed Wi-Fi URLs on your phone.

## Notes

- Both devices need to be on the same Wi-Fi network.
- Shared items are stored under `data/`, which is ignored by git.
- This version is intentionally local-only and has no authentication, so it is best used on a trusted network.