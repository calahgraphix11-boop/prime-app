-- ── Streak milestone escalation: 14 / 30 / 100-day tiers (additive) ──
-- daily_checkin() already awards streak_3day / streak_7day internally and is
-- NOT modified. The new tiers are paid out by this separate RPC, called
-- fire-and-forget from the client right after the daily check-in resolves.
-- "Once per streak run" semantics mirror the ==3 / ==7 behavior: a milestone
-- event inside the current run's date window blocks a re-award; a broken and
-- rebuilt streak can earn the milestone again.

create or replace function public.claim_streak_milestones()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_streak integer;
  v_last_checkin date;
  v_run_start date;
  v_tier record;
  v_old_level integer;
  v_new_level integer;
  v_new_total integer;
  v_awarded jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- One claimer at a time per user: no unique constraint backs this table
  -- path, so serialize concurrent calls instead.
  perform pg_advisory_xact_lock(hashtext(v_user_id::text || ':streak_milestones'));

  select current_streak, last_checkin_date
  into v_streak, v_last_checkin
  from public.user_xp
  where user_id = v_user_id;

  if v_streak is null or v_last_checkin is null or v_streak < 14 then
    return jsonb_build_object('awarded', v_awarded);
  end if;

  -- First day of the current consecutive run.
  v_run_start := v_last_checkin - (v_streak - 1);

  for v_tier in
    select * from (values
      (14,  'streak_14day',  150),
      (30,  'streak_30day',  300),
      (100, 'streak_100day', 1000)
    ) as t(days, action_type, xp)
    order by days
  loop
    if v_streak < v_tier.days then
      exit;
    end if;

    if exists (
      select 1 from public.xp_events e
      where e.user_id = v_user_id
        and e.action_type = v_tier.action_type
        and e.created_at >= v_run_start
    ) then
      continue; -- already earned during this run
    end if;

    insert into public.xp_events (user_id, action_type, xp_awarded)
    values (v_user_id, v_tier.action_type, v_tier.xp);

    select current_level into v_old_level
    from public.user_xp where user_id = v_user_id;

    update public.user_xp
    set total_xp = total_xp + v_tier.xp,
        updated_at = now()
    where user_id = v_user_id
    returning total_xp into v_new_total;

    v_new_level := public.calculate_level(v_new_total);

    if v_new_level > v_old_level then
      update public.user_xp
      set current_level = v_new_level
      where user_id = v_user_id;
    end if;

    v_awarded := v_awarded || jsonb_build_object(
      'milestone_days', v_tier.days,
      'xp_awarded', v_tier.xp,
      'old_level', v_old_level,
      'new_level', v_new_level,
      'leveled_up', v_new_level > v_old_level
    );
  end loop;

  return jsonb_build_object('awarded', v_awarded);
end;
$$;
