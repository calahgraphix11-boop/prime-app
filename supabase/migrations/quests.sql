-- ── Daily/Weekly Quests (additive — touches no existing table, RPC, or policy) ──
-- Quest progress is derived from existing xp_events rows; nothing new is tracked
-- per-action. Rewards are recorded in user_quest_claims (one claim per user per
-- quest per period) and paid out by check_and_award_quests(), which mirrors
-- award_xp's bookkeeping without calling or altering it.

create table if not exists public.quest_definitions (
  quest_key text primary key,
  title text not null,
  description text,
  action_type text not null,
  target_count integer not null check (target_count > 0),
  period text not null check (period in ('daily', 'weekly')),
  xp_reward integer not null check (xp_reward > 0),
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.quest_definitions enable row level security;

create policy "quest definitions readable by authenticated users"
  on public.quest_definitions for select
  to authenticated
  using (true);

create table if not exists public.user_quest_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_key text not null references public.quest_definitions(quest_key) on delete cascade,
  period_start date not null,
  xp_awarded integer not null,
  claimed_at timestamptz not null default now(),
  unique (user_id, quest_key, period_start)
);

alter table public.user_quest_claims enable row level security;

create policy "Users can view own quest claims"
  on public.user_quest_claims for select
  using (auth.uid() = user_id);

insert into public.quest_definitions (quest_key, title, description, action_type, target_count, period, xp_reward, sort_order) values
  ('daily_exam_2',  'Sharpen up',      'Complete 2 Exam Coach sessions today', 'exam_coach_session', 2, 'daily',  20, 1),
  ('daily_note_1',  'Note it down',    'Summarize a note today',               'note_summarized',    1, 'daily',  10, 2),
  ('weekly_exam_5', 'Exam marathon',   'Complete 5 Exam Coach sessions this week', 'exam_coach_session', 5, 'weekly', 60, 3),
  ('weekly_note_3', 'Steady scribe',   'Summarize 3 notes this week',          'note_summarized',    3, 'weekly', 40, 4)
on conflict (quest_key) do nothing;

-- Period windows use the server clock (current_date / ISO week starting Monday),
-- consistent with award_xp's existing daily-cap window.
create or replace function public.quest_period_start(p_period text)
returns date
language sql
stable
as $$
  select case
    when p_period = 'weekly' then date_trunc('week', current_date)::date
    else current_date
  end;
$$;

create or replace function public.get_quest_progress()
returns table (
  quest_key text,
  title text,
  description text,
  period text,
  target_count integer,
  xp_reward integer,
  current_count integer,
  reward_claimed boolean
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    q.quest_key,
    q.title,
    q.description,
    q.period,
    q.target_count,
    q.xp_reward,
    least(
      q.target_count,
      coalesce((
        select count(*)::integer from public.xp_events e
        where e.user_id = v_user_id
          and e.action_type = q.action_type
          and e.created_at >= public.quest_period_start(q.period)
      ), 0)
    ) as current_count,
    exists (
      select 1 from public.user_quest_claims c
      where c.user_id = v_user_id
        and c.quest_key = q.quest_key
        and c.period_start = public.quest_period_start(q.period)
    ) as reward_claimed
  from public.quest_definitions q
  where q.active
  order by q.sort_order;
end;
$$;

-- Fire-and-forget companion to check_and_award_badges(): pays out any quest the
-- user has just completed this period. Idempotent via the unique claim row.
create or replace function public.check_and_award_quests()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user_id uuid := auth.uid();
  v_quest record;
  v_count integer;
  v_period_start date;
  v_old_level integer;
  v_new_level integer;
  v_new_total integer;
  v_completed jsonb := '[]'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  for v_quest in
    select * from public.quest_definitions where active order by sort_order
  loop
    v_period_start := public.quest_period_start(v_quest.period);

    select count(*) into v_count
    from public.xp_events e
    where e.user_id = v_user_id
      and e.action_type = v_quest.action_type
      and e.created_at >= v_period_start;

    if v_count < v_quest.target_count then
      continue;
    end if;

    insert into public.user_quest_claims (user_id, quest_key, period_start, xp_awarded)
    values (v_user_id, v_quest.quest_key, v_period_start, v_quest.xp_reward)
    on conflict (user_id, quest_key, period_start) do nothing;

    if not found then
      continue; -- already claimed this period
    end if;

    insert into public.user_xp (user_id)
    values (v_user_id)
    on conflict (user_id) do nothing;

    insert into public.xp_events (user_id, action_type, xp_awarded)
    values (v_user_id, 'quest_reward', v_quest.xp_reward);

    select current_level into v_old_level
    from public.user_xp where user_id = v_user_id;

    update public.user_xp
    set total_xp = total_xp + v_quest.xp_reward,
        updated_at = now()
    where user_id = v_user_id
    returning total_xp into v_new_total;

    v_new_level := public.calculate_level(v_new_total);

    if v_new_level > v_old_level then
      update public.user_xp
      set current_level = v_new_level
      where user_id = v_user_id;
    end if;

    v_completed := v_completed || jsonb_build_object(
      'quest_key', v_quest.quest_key,
      'title', v_quest.title,
      'xp_awarded', v_quest.xp_reward,
      'old_level', v_old_level,
      'new_level', v_new_level,
      'leveled_up', v_new_level > v_old_level
    );
  end loop;

  return jsonb_build_object('completed', v_completed);
end;
$$;
