create table exam_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  topic text,
  subject text,
  difficulty text,
  questions jsonb,
  created_at timestamp with time zone default now()
);

create table summary_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subject text,
  instructions text,
  summary text,
  created_at timestamp with time zone default now()
);

alter table exam_history enable row level security;
alter table summary_history enable row level security;

create policy "Users can manage their own exam history" on exam_history
  for all using (auth.uid() = user_id);

create policy "Users can manage their own summary history" on summary_history
  for all using (auth.uid() = user_id);
