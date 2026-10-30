# SHADOW SYSTEM — Native Android implementation plan

## Product decision

The Android app is local-first. It must work without an account, internet connection, or Windows PC. Cloud accounts and synchronization are optional and can be enabled later from Settings.

## Existing application baseline

The current v0.10 application is a browser/PWA frontend backed by a Node.js server and SQLite (node:sqlite). The frontend calls relative /api/* endpoints. The optional Supabase feature currently uploads and restores a whole-account JSON snapshot manually. This backend cannot be assumed to exist inside a standalone Android WebView.

## Target Android architecture

- Native Android package: Capacitor Android shell around the existing responsive SHADOW SYSTEM interface.
- Local persistence: SQLite database on the device, accessed through a Capacitor-compatible SQLite plugin/native bridge. Do not use the Windows Node server as the Android database.
- Data access: introduce a platform-neutral repository/API layer. Web/Windows continues to call the existing HTTP API; Android routes the same operations to the local SQLite adapter.
- Offline behavior: all core screens, workouts, exercise library, programmes, profile, settings, achievements, XP and backup/restore must work with airplane mode enabled.
- Media: store user-added photos/files in app-private device storage and keep durable local references in the database. Bundled exercise artwork remains packaged with the app.
- Reminders: use Android local notifications and appropriate scheduling. Request notification permission only when the user enables reminders.
- App identity: SHADOW SYSTEM name, existing dark Shadow Monarch visual identity, app icon, splash screen, Android back navigation, status/navigation bar styling, and keyboard-safe layouts.

## Local-first account behavior

1. First launch opens the app in local mode. No registration or login gate.
2. Generate a local installation/profile identifier and store it locally.
3. All training data is written to the device database immediately.
4. In Settings, offer optional cloud account registration/sign-in and a separate cloud-sync enable switch. Both are off by default.
5. When the user enables sync, preserve the local database and create a first-sync upload from a consistent local snapshot. Do not replace or clear local data.
6. Cloud account identity must be linked to the existing local profile; do not silently create an empty profile that hides the user's local progress.
7. When sync is disabled or the user signs out, retain all local records and continue in offline/local mode.
8. Provide explicit backup/export and restore/import, with confirmation and a pre-restore backup.
9. Never automatically overwrite local data with a cloud snapshot. First-sync and subsequent merge rules must be explicit and conflict-safe.

## Cloud sync requirements

The current v0.10 Supabase whole-snapshot upload/restore is not sufficient for safe automatic multi-device synchronization. Before enabling automatic sync:
- Add stable UUIDs to every synchronizable record and a schema version.
- Track per-record created_at, updated_at, and deleted_at (tombstones) where applicable.
- Add a durable local outbox/change log so offline edits queue until connectivity returns.
- Implement idempotent push/pull and server-side authorization/RLS scoped to the authenticated user.
- Resolve conflicts deterministically and visibly; do not silently discard either device's workout history.
- Encrypt transport with HTTPS; never ship Supabase service-role secrets in the app.
- Make first sync a merge/import operation, not a destructive restore.
- Add sync status, last successful sync, retry controls, and a manual Sync now action.

## Windows compatibility

Do not remove or break the current Windows Node.js + SQLite application. Keep its existing API and database behavior while extracting shared domain/data validation where practical. Android-specific persistence must be behind an adapter, not a replacement for Windows storage.

## Suggested implementation phases

### Phase 1 — Refactor and tests
- Inventory every frontend /api/* call and document request/response contracts.
- Extract domain validation and state serialization from HTTP handlers.
- Add a repository interface and retain the existing Node/SQLite adapter for Windows.
- Add regression tests for login/profile, programmes, exercises, workouts, XP, backup and restore.

### Phase 2 — Native Android local mode
- Add Capacitor configuration and Android project.
- Implement Android SQLite adapter and migration/versioning strategy.
- Route frontend data calls to Android adapter when running natively.
- Implement local media storage, notification scheduling, app lifecycle and Android navigation.
- Verify every core workflow in airplane mode and after force-close/relaunch.

### Phase 3 — Optional cloud identity and sync
- Add opt-in account creation/sign-in.
- Link cloud identity to the existing local profile without losing data.
- Implement first-sync merge, outbox, incremental synchronization, conflict handling and RLS.
- Verify offline edits on both devices, reconnection, duplicate prevention and conflict recovery.

### Phase 4 — Release automation
- Build a signed-ready debug APK in CI for testing.
- Produce a release APK/AAB only after package ID, versioning, signing-key custody and release process are configured.
- Keep signing secrets out of the repository; use GitHub Actions secrets.
- Publish Android APK as a separate release asset from the Windows ZIP.

## Acceptance criteria
- A fresh Android install launches directly into local mode without asking for an account.
- Core training features create, edit, and read data with internet disabled.
- Data survives app force-close, device restart, and app update.
- Existing local data remains available after cloud sign-in, sync enable/disable, sign-out, or network failure.
- Cloud sync is disabled by default and never starts uploading until the user opts in.
- A backup can be exported and restored without silently replacing data.
- The existing Windows build continues to pass its checks and retain its current database.
- CI produces a separately identifiable Android APK only after the Android acceptance checks pass.

## Current status

A first Capacitor Android wrapper and local-mode API adapter have now been added under `android-native/`. The prototype uses persistent IndexedDB inside the Android WebView to prove the local-first workflows and enable an initial debug APK build. This is not yet the planned native SQLite adapter. The Windows Node.js + SQLite implementation remains unchanged. Native SQLite migration, scheduled Android notifications, conflict-safe cloud sync, device-level backup/restore testing, and full Android QA remain outstanding before a production release.