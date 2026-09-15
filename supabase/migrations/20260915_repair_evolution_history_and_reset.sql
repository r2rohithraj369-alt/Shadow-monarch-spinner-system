-- MONARCH SPINNER SYSTEM - PRODUCTION RESET REPAIR
--
-- The deployed reset RPC failed because the dedicated Evolution Chamber report
-- table was not present in the live database. This migration is intentionally
-- self-contained so it is safe when an earlier migration was skipped.
--
-- Skill Instance Evolution History remains embedded in player_profiles.profile_data.
-- This table is only the Evolution Chamber Battle Report store used by
-- src/utils/evolutionHistoryStore.ts.

create table if not exists public.evolution_history (
  id uuid primary key default gen_random_uuid(),
  record_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_id text,
  skill_name_snapshot text,
  trial_id text,
  trial_name_snapshot text,
  trial_difficulty text,
  source_scope text not null default 'EVOLUTION_CHAMBER_SESSION',
  completion_date timestamptz,
  skill_level_at_completion integer,
  player_level_at_completion integer,
  xp_reward integer not null default 0,
  mastery_reward integer not null default 0,
  result text not null default 'PASSED' check (result in ('PASSED', 'FAILED')),
  performance jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, record_id)
);

create index if not exists evolution_history_user_created_idx
  on public.evolution_history (user_id, created_at desc);
create index if not exists evolution_history_user_skill_idx
  on public.evolution_history (user_id, skill_id);

alter table public.evolution_history enable row level security;

drop policy if exists "users_select_own_evolution_history" on public.evolution_history;
drop policy if exists "users_insert_own_evolution_history" on public.evolution_history;

create policy "users_select_own_evolution_history" on public.evolution_history
  for select using (auth.uid() = user_id);

create policy "users_insert_own_evolution_history" on public.evolution_history
  for insert with check (auth.uid() = user_id);

grant select, insert on public.evolution_history to authenticated;

-- Recreate the RPC after the relation exists. The delete is account-scoped and
-- runs inside the same transaction as the profile and reset-counter updates.
create or replace function public.perform_full_game_reset(reset_profile jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_previous jsonb := '{}'::jsonb;
  v_reset_count integer := 0;
  v_next_profile jsonb;
begin
  if v_user_id is null then
    raise exception 'Authentication is required for a full game reset';
  end if;

  select profile_data into v_previous
  from public.player_profiles
  where id = v_user_id
  for update;
  v_previous := coalesce(v_previous, '{}'::jsonb);

  select reset_count into v_reset_count
  from public.game_resets
  where user_id = v_user_id
  for update;
  v_reset_count := coalesce(v_reset_count, 0);
  if v_reset_count >= 5 then
    raise exception 'Maximum resets reached (5/5)';
  end if;

  v_next_profile := coalesce(reset_profile, '{}'::jsonb) || jsonb_build_object(
    'questDatabase', coalesce(v_previous->'questDatabase', reset_profile->'questDatabase', '[]'::jsonb),
    'pressureScenarios', coalesce(v_previous->'pressureScenarios', reset_profile->'pressureScenarios', '[]'::jsonb),
    'evolutionHistory', '[]'::jsonb,
    'resetGeneration', coalesce((v_previous->>'resetGeneration')::integer, 0) + 1,
    'updated_at', floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );

  insert into public.player_profiles (id, profile_data, updated_at)
  values (v_user_id, v_next_profile, now())
  on conflict (id) do update
    set profile_data = excluded.profile_data, updated_at = excluded.updated_at;

  insert into public.game_resets (user_id, reset_count, updated_at)
  values (v_user_id, v_reset_count + 1, now())
  on conflict (user_id) do update
    set reset_count = excluded.reset_count, updated_at = excluded.updated_at;

  delete from public.evolution_history
  where user_id = v_user_id;

  return jsonb_build_object(
    'profile', v_next_profile,
    'reset_count', v_reset_count + 1
  );
end;
$$;

revoke all on function public.perform_full_game_reset(jsonb) from public;
grant execute on function public.perform_full_game_reset(jsonb) to authenticated;

-- Verification (run as an authenticated user after applying this migration):
-- select to_regclass('public.evolution_history');
-- select public.perform_full_game_reset('{}'::jsonb);
