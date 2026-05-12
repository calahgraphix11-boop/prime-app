-- ============================================================
-- calah.ai / prime — Supabase schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- profiles (mirrors auth.users, stores display name)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self"
  on public.profiles for all
  using (auth.uid() = id);

-- study_sessions
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  subject text not null,
  duration integer not null,
  date timestamptz not null default now(),
  status text not null default 'completed',
  created_at timestamptz default now()
);
alter table public.study_sessions enable row level security;
drop policy if exists "sessions_self" on public.study_sessions;
create policy "sessions_self"
  on public.study_sessions for all
  using (auth.uid() = user_id);

-- reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  tone text not null,
  preview text,
  date timestamptz not null default now(),
  created_at timestamptz default now()
);
alter table public.reports enable row level security;
drop policy if exists "reports_self" on public.reports;
create policy "reports_self"
  on public.reports for all
  using (auth.uid() = user_id);

-- chat_sessions (messages stored as JSONB array)
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null default 'New Chat',
  messages jsonb not null default '[]'::jsonb,
  date timestamptz not null default now(),
  created_at timestamptz default now()
);
alter table public.chat_sessions enable row level security;
drop policy if exists "chats_self" on public.chat_sessions;
create policy "chats_self"
  on public.chat_sessions for all
  using (auth.uid() = user_id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
