-- SHADOW SYSTEM v0.10 cloud snapshot table (Supabase / PostgreSQL)
-- Apply once in the target Supabase project.
-- This schema is used by the v0.10 manual snapshot client integration.

create table if not exists public.hunter_cloud_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);

alter table public.hunter_cloud_state enable row level security;

create policy "hunter reads own cloud state"
  on public.hunter_cloud_state for select
  to authenticated
  using (auth.uid() = user_id);

create policy "hunter creates own cloud state"
  on public.hunter_cloud_state for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "hunter updates own cloud state"
  on public.hunter_cloud_state for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.hunter_cloud_state from anon;
grant select, insert, update on public.hunter_cloud_state to authenticated;

create index if not exists hunter_cloud_state_updated_at_idx
  on public.hunter_cloud_state (updated_at desc);
