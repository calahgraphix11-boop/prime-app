-- ============================================================
-- calah.ai / prime — Migration (run after schema.sql)
-- Paste into Supabase SQL Editor and Run
-- ============================================================

-- courses (per-user list that feeds the session dropdown)
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);
alter table public.courses enable row level security;
drop policy if exists "courses_self" on public.courses;
create policy "courses_self"
  on public.courses for all
  using (auth.uid() = user_id);

-- user_settings (weekly goal, etc.)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weekly_goal_minutes integer not null default 300,
  created_at timestamptz default now()
);
alter table public.user_settings enable row level security;
drop policy if exists "settings_self" on public.user_settings;
create policy "settings_self"
  on public.user_settings for all
  using (auth.uid() = user_id);

-- Add notes column to study_sessions
alter table public.study_sessions
  add column if not exists notes text;

-- Add full content column to reports
alter table public.reports
  add column if not exists content text;

-- profiles (full name, username, avatar)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  username text unique,
  avatar_url text,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self"
  on public.profiles for all
  using (auth.uid() = id);

-- daily_usage (beta rate limiting — resets per calendar day)
create table if not exists public.daily_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  chat_messages integer not null default 0,
  report_rewrites integer not null default 0,
  unique(user_id, date)
);
alter table public.daily_usage enable row level security;
drop policy if exists "usage_self" on public.daily_usage;
create policy "usage_self"
  on public.daily_usage for all
  using (auth.uid() = user_id);

-- Storage: avatars bucket policies
-- NOTE: First create the 'avatars' bucket in Supabase dashboard:
--   Storage → New bucket → name: avatars → toggle Public ON → Save
-- Then run these policies:
drop policy if exists "avatars_upload_self" on storage.objects;
create policy "avatars_upload_self"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_update_self" on storage.objects;
create policy "avatars_update_self"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_read_public" on storage.objects;
create policy "avatars_read_public"
  on storage.objects for select
  using (bucket_id = 'avatars');
