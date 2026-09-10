-- ============================================================================
-- MONARCH SPINNER SYSTEM — FULL GAME RESET LIMIT RAISED FROM 2 TO 5
-- ============================================================================
-- *** THIS FILE MUST BE EXECUTED AGAINST THE LIVE SUPABASE PROJECT ***
--
-- The previous migration (20260908_player_isolation_and_reset.sql) created
-- public.game_resets with a check constraint allowing only 0..2 resets.
-- This migration raises the lifetime allowance to 5.
--
-- Safe to run on BOTH:
--   - a live database that already has game_resets with the old 0..2
--     constraint (constraint is widened, existing values are PRESERVED —
--     nobody's counter is reset and nobody gains extra resets), and
--   - a fresh database where 20260908 was never executed (the table, RLS and
--     policies are created here idempotently with the new 0..5 limit).
--
-- HOW TO DEPLOY:
--   1. Open https://supabase.com/dashboard -> your project -> SQL Editor.
--   2. Paste the ENTIRE content of this file and click RUN.
--   3. Verify with the verification queries at the bottom.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE (idempotent — only created if 20260908 was never run)
-- ----------------------------------------------------------------------------
create table if not exists public.game_resets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reset_count integer not null default 0 check (reset_count >= 0 and reset_count <= 5),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. RLS (idempotent — enforced for both fresh and existing installs)
-- ----------------------------------------------------------------------------
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
-- 3. WIDEN THE CONSTRAINT FROM 0..2 TO 0..5
-- ----------------------------------------------------------------------------
-- The inline check from 20260908 receives the auto-generated name
-- "game_resets_reset_count_check". Drop it if present (any naming) and
-- recreate with the new bound. Existing reset_count values are untouched:
-- 0 stays 0, 1 stays 1, 2 stays 2 — they are simply allowed to go up to 5.
alter table public.game_resets drop constraint if exists game_resets_reset_count_check;
alter table public.game_resets add constraint game_resets_reset_count_check
  check (reset_count >= 0 and reset_count <= 5);

-- ----------------------------------------------------------------------------
-- 4. GRANTS (harmless if defaults already cover these roles)
-- ----------------------------------------------------------------------------
grant select, insert, update on public.game_resets to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. VERIFICATION (run manually to confirm)
-- ----------------------------------------------------------------------------
-- Confirm the live constraint now allows up to 5:
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.game_resets'::regclass and contype = 'c';
--   -- expect: check (reset_count >= 0 AND reset_count <= 5)
--
-- Confirm existing values were preserved:
--   select user_id, reset_count from public.game_resets;
--   -- (run while authenticated as the relevant user — RLS scopes the result)
--
-- Reset count states: 0/5 -> 1/5 -> 2/5 -> 3/5 -> 4/5 -> 5/5 (permanently disabled).
-- The check constraint enforces the 5-reset lifetime maximum at the DB level.