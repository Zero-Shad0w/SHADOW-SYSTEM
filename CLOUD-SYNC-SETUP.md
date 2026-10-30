# SHADOW SYSTEM — Cloud Sync Setup

## v0.10 status
SHADOW SYSTEM v0.10 includes optional Supabase email/password cloud authentication and manual snapshot upload/restore in **Settings → Cloud Synchronization**. This cloud identity is separate from the local Hunter login.

## Supabase setup
1. Open the Supabase project dashboard.
2. In **SQL Editor**, run the complete migration at `supabase/migrations/0001_cloud_sync.sql`.
3. In **Authentication → Providers**, ensure Email authentication is enabled.
4. If email confirmation is enabled, confirm the registration email before attempting cloud login.
5. Start SHADOW SYSTEM and open **Settings → Cloud Synchronization**.
6. Register a cloud account or log into an existing one.
7. On the device containing the data you want to keep, choose **Upload This Device**.
8. On another device, log into the same cloud account and choose **Restore From Cloud**.

## Data behavior and safety
- Row Level Security restricts each authenticated Supabase user to their own `hunter_cloud_state` row.
- Upload replaces that user's cloud snapshot.
- Restore replaces the current local app account after a confirmation prompt. Download a local backup first.
- Keep the local `data` folder when updating the application. It contains the SQLite database and is not part of the source release.
- Never put a Supabase service-role key, database password, or other secret in frontend code, GitHub, or browser storage. The project URL and publishable key are client-side values.
- Do not expose the local Node server directly to the public internet.

## Current limitations
- This is manual snapshot synchronization, not automatic bidirectional synchronization.
- There is no automatic background sync, offline write queue, merge engine, or conflict-safe simultaneous editing.
- Avoid uploading from two devices at the same time; choose one device as the source before uploading.
- Cloud sync has not been live-verified against the user's Supabase project from this repository workflow. A successful SQL migration is only the database setup step; verify registration, login, upload, and restore in the app.

## Troubleshooting
- **Table not found / relation missing:** confirm the migration ran successfully in the correct Supabase project.
- **Email confirmation required:** confirm the message from Supabase, then return and log in.
- **Unauthorized / invalid login:** verify the cloud email/password; this is not the local Hunter password.
- **Restore warning:** export a local backup before proceeding because restore replaces local app records.
