-- ============================================================
-- calah.ai / prime — Leaderboard migration
-- Run in Supabase SQL Editor after schema.sql + migration.sql
-- ============================================================

-- leaderboard_scores: per-user weekly study totals
create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start date not null,
  study_minutes integer not null default 0,
  sessions_completed integer not null default 0,
  streak integer not null default 0,
  updated_at timestamptz default now(),
  unique(user_id, week_start)
);
alter table public.leaderboard_scores enable row level security;

-- Anyone authenticated can read all scores (leaderboard is public to users)
drop policy if exists "leaderboard_read" on public.leaderboard_scores;
create policy "leaderboard_read"
  on public.leaderboard_scores for select
  using (auth.role() = 'authenticated');

drop policy if exists "leaderboard_insert_self" on public.leaderboard_scores;
create policy "leaderboard_insert_self"
  on public.leaderboard_scores for insert
  with check (auth.uid() = user_id);

drop policy if exists "leaderboard_update_self" on public.leaderboard_scores;
create policy "leaderboard_update_self"
  on public.leaderboard_scores for update
  using (auth.uid() = user_id);

-- Allow authenticated users to read all profiles (required for leaderboard + friends features)
drop policy if exists "profiles_read_authenticated" on public.profiles;
create policy "profiles_read_authenticated"
  on public.profiles for select
  using (auth.role() = 'authenticated');
