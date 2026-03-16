# filetrx

Tiny local network app for sending screenshots or links from your phone to your laptop.

## What it does

- Runs as a local web server on your laptop
- Shows local network URLs you can open from your phone
- Lets you upload a screenshot, paste a link, and add an optional note
- Updates the laptop inbox instantly with no account, no cloud, and no database
- Can be launched from Windows without using `npm start`

## Latest features ?

- `Inbox` + `Archived` tabs in Recent Drops
- `Archive` / `Unarchive` on each drop (items are kept, not deleted)
- `Get path` button to copy the full local screenshot path
- Smaller screenshot previews in the inbox so tall images do not dominate the page
- `Hide setup` / `Show setup` toggle for the Open On Your Phone card (state remembered in browser)
- Version footer so you can confirm what build is running
- More reliable launcher with startup logging (`launch-filetrx.log`)

## Easiest launch options ??

### Laptop

- Double-click `launch-filetrx.cmd` to start the server if needed and open the app.
- If you want it available after every Windows login, double-click `enable-filetrx-autostart.cmd` once.
- If launch fails, open `launch-filetrx.log` in the project root to see why.

### Phone

- Open the app from your phone browser using the laptop Wi-Fi URL.
- Add that page to your phone home screen from the browser menu for one-tap access later.
- The laptop still needs the filetrx server running, so laptop autostart is the easiest setup.

## Typical workflow ??

1. Send screenshots from your phone.
2. In `Recent Drops`, click `Get path` to copy the local file path.
3. Archive old drops when you are done, and unarchive if needed later.

## Run it manually

```bash
npm start
```

Then open the printed local URL on your laptop and one of the printed Wi-Fi URLs on your phone.

## Notes

- Both devices need to be on the same Wi-Fi network.
- Shared items are stored under `data/`, which is ignored by git.
- This version is intentionally local-only and has no authentication, so it is best used on a trusted network.