# SHADOW SYSTEM — Cloud Sync Foundation

## Status
Cloud synchronization is not active in v0.9. This repository contains a starter Supabase schema only. A Supabase project, client/server authentication integration, migration flow, revision-safe synchronization, and cross-device tests are still required.

## Target architecture
- Supabase Auth for cloud identity and sessions.
- PostgreSQL stores one state document per authenticated user.
- Row Level Security (RLS) restricts each user to their own row.
- Revision-based compare-and-swap writes prevent silent last-write-wins data loss.
- Local SQLite remains a working cache; queued local writes retry when connectivity returns.
- UI exposes last sync, pending changes, conflicts, and retry status.

## Setup
1. Create a Supabase project.
2. Apply `supabase/migrations/0001_cloud_sync.sql` in the SQL Editor or using the Supabase CLI.
3. Enable email/password authentication and decide whether email confirmation is required.
4. Configure project URL and anon/publishable key as client-safe settings.
5. Keep any service-role key exclusively on a trusted server. Never place it in frontend code, a desktop app, APK, Git, or logs.

## Required implementation before enabling sync
- Link local profiles to Supabase Auth identities without uploading local password hashes/plaintext passwords.
- Provide an explicit first-import flow for existing local Hunter data; never silently overwrite an existing cloud save.
- Validate payload shape, schema version and size.
- Implement revision compare-and-swap and conflict recovery; preserve both versions on mismatch.
- Sync profile, settings, exercises, programmes, workouts, XP, achievements and related metadata.
- Handle expired sessions, sign-out, offline retries, duplicate requests and account deletion.
- Test two separate users and prove neither can access the other's records.
- Use HTTPS, rate limiting and secure deployment before public release.

## Data safety
Do not commit `data/`, SQLite/WAL/SHM files, JSON backups, `.env`, signing keys, service-role keys or real user exports. The current local account system is not a substitute for cloud identity or internet-facing security.
