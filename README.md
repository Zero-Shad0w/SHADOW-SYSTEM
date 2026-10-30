# SHADOW SYSTEM — Personal Calisthenics Training OS

Private source repository for SHADOW SYSTEM v0.9. A dark-themed, responsive calisthenics training PWA served by Node.js with a local SQLite database.

## Requirements
- Windows 10/11 and Node.js 22.5+
- Modern browser (Edge, Chrome, Firefox or Safari)
- No npm dependencies; uses Node built-ins including `node:sqlite`

## Run locally
1. Install Node.js 22.5+.
2. Extract the release into a writable folder.
3. Run `START-SHADOW-SYSTEM.bat`.
4. Open `http://localhost:4173`.
5. Keep the server terminal open while using the app.

## Features in v0.9
- Solo Leveling / Shadow Monarch inspired dashboard and local artwork.
- Local username/password accounts with salted scrypt password hashes.
- Separate local profiles, programmes, exercises, XP, workouts and settings per account.
- Weekly programmes, exercise library, workout logging, XP, calendar, statistics, achievements and JSON backup/restore.
- PWA shell and responsive PC/Android browser interface.

## Current limitations
- v0.9 accounts are local to the Node server. Cloud authentication and cross-device cloud sync are not implemented yet.
- Offline write queue is not implemented.
- Browser reminders require the page/browser to be active. Reliable push/background reminders are pending.
- Native Windows EXE and Android APK packaging are pending.
- Do not expose the local server directly to the public internet.

## Cloud sync foundation
`supabase/migrations/0001_cloud_sync.sql` is a starting PostgreSQL/RLS schema only. See `CLOUD-SYNC-SETUP.md`. It does not activate cloud sync by itself. Never commit service-role keys, `.env`, SQLite databases, backups, or personal exports.

## Development
```bash
npm run check
npm start
```

## Updating an existing installation
Close the app, extract the new release over the existing application files, keep the `data` folder/database, run `START-SHADOW-SYSTEM.bat`, then refresh with `Ctrl+Shift+R`.

## License
All rights reserved unless a separate license is added by the project owner.
