-- ============================================================================
-- MONARCH SPINNER SYSTEM — PLAYER ISOLATION & FULL GAME RESET SCHEMA
-- ============================================================================
-- Run this in the Supabase SQL editor (or as a migration).
--
-- Purpose:
--   1. `game_resets`  — cloud-authoritative per-user Full Game Reset counter
--                       (max 2 lifetime resets per account).
--   2. Row Level Security on player-owned tables so that a user can only ever
--      read/write their own records. auth.uid() is the ownership boundary.
--
-- The permanent Quest Database is NOT a separate table — it is stored inside
-- each player's `player_profiles.profile_data.questDatabase` (global library
-- payload synced across devices) and is preserved by the reset flow in
-- gameResetManager.ts.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. RESET COUNTER TABLE (cloud-authoritative, per account)
-- ----------------------------------------------------------------------------
create table if not exists public.game_resets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reset_count integer not null default 0 check (reset_count >= 0 and reset_count <= 2),
  updated_at timestamptz not null default now()
);

alter table public.game_resets enable row level security;

drop policy if exists "users_select_own_reset_count" on public.game_resets;
drop policy if exists "users_insert_own_reset_count" on public.game_resets;
drop policy if exists "users_update_own_reset_count" on public.game_resets;

create policy "users_select_own_reset_count" on public.game_resets
  for select using (auth.uid() = user_id);

create policy "users_insert_own_reset_count" on public.game_resets
  for insert with check (auth.uid() = user_id);

create policy "users_update_own_reset_count" on public.game_resets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. PLAYER PROFILES (single per-user row: id == auth.uid())
-- ----------------------------------------------------------------------------
alter table public.player_profiles enable row level security;

drop policy if exists "users_select_own_profile" on public.player_profiles;
drop policy if exists "users_insert_own_profile" on public.player_profiles;
drop policy if exists "users_update_own_profile" on public.player_profiles;

create policy "users_select_own_profile" on public.player_profiles
  for select using (auth.uid() = id);

create policy "users_insert_own_profile" on public.player_profiles
  for insert with check (auth.uid() = id);

create policy "users_update_own_profile" on public.player_profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 3. VERIFICATION QUERIES (run manually to confirm)
-- ----------------------------------------------------------------------------
-- As User A you must NOT see User B's rows:
--   select * from public.game_resets;      -- only your own row
--   select * from public.player_profiles;  -- only your own row
--
-- Reset count states: 0/2 (available) -> 1/2 -> 2/2 (permanently disabled).
-- The check constraint enforces the 2-reset lifetime maximum at the DB level.
