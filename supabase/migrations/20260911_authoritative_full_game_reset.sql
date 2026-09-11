-- Atomic, account-scoped full reset. Run after the existing player isolation,
-- reset-limit and evolution-history migrations.
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
  from public.player_profiles where id = v_user_id for update;
  v_previous := coalesce(v_previous, '{}'::jsonb);

  select reset_count into v_reset_count
  from public.game_resets where user_id = v_user_id for update;
  v_reset_count := coalesce(v_reset_count, 0);
  if v_reset_count >= 5 then
    raise exception 'Maximum resets reached (5/5)';
  end if;

  -- The server preserves only permanent libraries from the previous profile.
  -- All progression arrives from the reset template and cannot retain old data.
  v_next_profile := coalesce(reset_profile, '{}'::jsonb) || jsonb_build_object(
    'questDatabase', coalesce(v_previous->'questDatabase', reset_profile->'questDatabase', '[]'::jsonb),
    'pressureScenarios', coalesce(v_previous->'pressureScenarios', reset_profile->'pressureScenarios', '[]'::jsonb),
    'evolutionHistory', '[]'::jsonb,
    'resetGeneration', coalesce((v_previous->>'resetGeneration')::integer, 0) + 1,
    'updated_at', floor(extract(epoch from clock_timestamp()) * 1000)::bigint
  );

  insert into public.player_profiles (id, profile_data, updated_at)
  values (v_user_id, v_next_profile, now())
  on conflict (id) do update set profile_data = excluded.profile_data, updated_at = excluded.updated_at;

  insert into public.game_resets (user_id, reset_count, updated_at)
  values (v_user_id, v_reset_count + 1, now())
  on conflict (user_id) do update set reset_count = excluded.reset_count, updated_at = excluded.updated_at;

  delete from public.evolution_history where user_id = v_user_id;
  return jsonb_build_object('profile', v_next_profile, 'reset_count', v_reset_count + 1);
end;
$$;

revoke all on function public.perform_full_game_reset(jsonb) from public;
grant execute on function public.perform_full_game_reset(jsonb) to authenticated;
