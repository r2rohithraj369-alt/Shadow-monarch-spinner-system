-- ============================================================================
-- MONARCH SPINNER SYSTEM — DEDICATED EVOLUTION HISTORY TABLE
-- ============================================================================
-- *** THIS FILE MUST BE EXECUTED AGAINST THE LIVE SUPABASE PROJECT ***
--
-- Purpose:
--   Evolution History becomes a PERMANENT historical record. Until now it
--   travelled only inside player_profiles.profile_data.evolutionHistory, which
--   was vulnerable to whole-profile conflict resolution ("the history arrays
--   replaced wholesale when a cloud/local profile 'wins'"). This migration
--   creates a dedicated, append-only, RLS-protected table that is the durable
--   source of truth.
--
-- Guarantees:
--   1. One row per completed Evolution session — idempotency is enforced by
--      `unique (user_id, record_id)` where record_id is the deterministic
--      session id (`session-<timestamp>`) created at completion time.
--   2. Account isolation at the DATABASE level: every policy enforces
--      `auth.uid() = user_id`. User A can never read/write User B's history.
--   3. Immutability: the game layer only ever INSERTs (ignore-duplicates).
--      There are intentionally NO update/delete policies — completed trial
--      records are permanent historical/audit records.
--   4. Historical name snapshot columns preserve labels even if a skill is
--      later renamed (skill_name_snapshot / trial_name_snapshot).
--
-- Safe to run on an existing database; uses IF NOT EXISTS / drop-if-exists for
-- every object so it is idempotent.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.evolution_history (
  id uuid primary key default gen_random_uuid(),
  -- Deterministic idempotency key created by the app at completion time.
  record_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,

  -- Snapshot identity (immutable historical labels).
  skill_id text,
  skill_name_snapshot text,
  trial_id text,
  trial_name_snapshot text,
  trial_difficulty text,
  source_scope text not null default 'EVOLUTION_CHAMBER_SESSION',

  -- Completion metadata.
  completion_date timestamptz,
  skill_level_at_completion integer,
  player_level_at_completion integer,
  xp_reward integer not null default 0,
  mastery_reward integer not null default 0,
  result text not null default 'PASSED' check (result in ('PASSED', 'FAILED')),

  -- Full immutable performance snapshot (counts, balls, questStatus, ...).
  performance jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One record per completed trial per user.
  unique (user_id, record_id)
);

-- Indexes for the hot read paths (history list per user, newest first).
create index if not exists evolution_history_user_created_idx
  on public.evolution_history (user_id, created_at desc);
create index if not exists evolution_history_user_skill_idx
  on public.evolution_history (user_id, skill_id);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY — account isolation
-- ----------------------------------------------------------------------------
alter table public.evolution_history enable row level security;

drop policy if exists "users_select_own_evolution_history" on public.evolution_history;
drop policy if exists "users_insert_own_evolution_history" on public.evolution_history;

create policy "users_select_own_evolution_history" on public.evolution_history
  for select using (auth.uid() = user_id);

create policy "users_insert_own_evolution_history" on public.evolution_history
  for insert with check (auth.uid() = user_id);

-- Intentionally NO update / delete policies: completed trial records are
-- permanent historical/audit records. The app uses insert-or-ignore only.

-- ----------------------------------------------------------------------------
-- 3. GRANTS (harmless if defaults already cover these roles)
-- ----------------------------------------------------------------------------
grant select, insert on public.evolution_history to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. VERIFICATION QUERIES (run manually to confirm)
-- ----------------------------------------------------------------------------
-- This migration has NOT modified any existing player data. Existing history
-- embedded inside player_profiles.profile_data.evolutionHistory remains fully
-- intact; the app performs a safe one-time, ownership-gated migration into
-- this table on next login (see utils/evolutionHistoryStore.ts).
--
-- Account isolation check (run while authenticated as User A):
--   select * from public.evolution_history;  -- only your own rows
--
-- Schema check:
--   select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--   where conrelid = 'public.evolution_history'::regclass;
--   -- expect: unique (user_id, record_id)