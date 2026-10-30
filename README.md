# SHADOW SYSTEM — Personal Calisthenics Training OS

Private source repository for SHADOW SYSTEM. The v0.10 release adds an optional Supabase cloud account and manual snapshot upload/restore to the existing local-first training app.

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

## Features
- Solo Leveling / Shadow Monarch inspired dark interface and bundled artwork.
- Local username/password accounts with salted scrypt password hashes and separate local training profiles.
- Weekly programmes, exercise library, workout logging, XP, calendar, statistics, achievements and JSON backup/restore.
- Responsive PWA interface for PC and Android browsers.
- Local SQLite persistence; existing data is retained when updating.
- v0.10 optional Supabase email/password cloud identity, manual upload of the current local account snapshot, and restore on another device.

## v0.10 cloud sync setup
1. Create/use a Supabase project and apply `supabase/migrations/0001_cloud_sync.sql` in its SQL Editor.
2. Enable Email authentication. If email confirmation is enabled, confirm the registration email before logging in.
3. Open **Settings → Cloud Synchronization** in SHADOW SYSTEM.
4. Create or log into a cloud account, then choose **Upload This Device**.
5. On another installation, log into the same cloud account and choose **Restore From Cloud**.

See [CLOUD-SYNC-SETUP.md](CLOUD-SYNC-SETUP.md) for the workflow and limitations.

## Important cloud-sync limitations
- v0.10 is **manual snapshot synchronization**, not automatic two-way sync.
- Upload replaces the cloud snapshot for that cloud user. Restore replaces the current local account after confirmation. Export a local backup before restoring.
- Avoid uploading from multiple devices at the same time. Conflict-safe merging, background sync, offline write queues and automatic retries are not included.
- The local Hunter login and Supabase cloud login are separate identities.
- The Supabase URL and publishable key are client-safe configuration. Never commit a service-role/secret key, database password, local SQLite database, or user backup.
- Do not expose the local Node server directly to the public internet.

## Data safety and updates
- The database is stored in `data/shadow-system.sqlite` and is intentionally excluded from release source packages.
- **Never delete or overwrite the `data` folder** when updating an existing installation.
- Stop the server, extract the new release over the app files, keep `data`, run `START-SHADOW-SYSTEM.bat`, then hard-refresh the browser with `Ctrl+Shift+R`.
- Use Settings → Download full backup before significant changes or cloud restores.

## Development checks
```bash
node --check server.js
node --check public/app.js
node --check public/service-worker.js
node server.js
```
The server defaults to port 4173; set `PORT` to change it.

## Release history
- **v0.9.0** — Shadow Monarch artwork and local multi-account login with per-account profiles and training history.
- **v0.10.0** — Optional Supabase cloud identity and manual account snapshot upload/restore; service-worker cache and app asset versions updated.

## Automated GitHub release builds

The repository includes a GitHub Actions workflow at `.github/workflows/release.yml`. Once the complete application source is committed to the repository root, each relevant push to `main` will:
- validate the app files and JavaScript syntax;
- package a clean ZIP without any personal SQLite database;
- publish a 30-day Actions artifact and update the rolling GitHub release named **latest**.

The direct download URL will be:
`https://github.com/Zero-Shad0w/SHADOW-SYSTEM/releases/download/latest/SHADOW-SYSTEM.zip`

**Repository setup status:** the documentation, Supabase migration, and release workflow are committed. The application source and bundled image assets still need to be added before the workflow can produce a release. The workflow intentionally fails its source-validation step rather than publishing an incomplete ZIP.
