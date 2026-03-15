# filetrx

Tiny local network app for sending screenshots or links from your phone to your laptop.

## What it does

- Runs as a local web server on your laptop
- Shows local network URLs you can open from your phone
- Lets you upload a screenshot, paste a link, and add an optional note
- Updates the laptop inbox instantly with no account, no cloud, and no database
- Can be launched from Windows without using `npm start`

## Easiest launch options

### Laptop

- Double-click `launch-filetrx.cmd` to start the server if needed and open the app.
- If you want it available after every Windows login, double-click `enable-filetrx-autostart.cmd` once.

### Phone

- Open the app from your phone browser using the laptop Wi-Fi URL.
- Add that page to your phone home screen from the browser menu for one-tap access later.
- The laptop still needs the filetrx server running, so autostart on the laptop is the easiest setup.

## Run it manually

```bash
npm start
```

Then open the printed local URL on your laptop and one of the printed Wi-Fi URLs on your phone.

## Notes

- Both devices need to be on the same Wi-Fi network.
- Shared items are stored under `data/`, which is ignored by git.
- This version is intentionally local-only and has no authentication, so it is best used on a trusted network.