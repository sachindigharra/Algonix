-- Problems table
create table problems (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  platform text check (platform in ('leetcode','codeforces','codechef','geeksforgeeks','hackerrank','other')) not null,
  difficulty text check (difficulty in ('easy','medium','hard')) not null,
  status text check (status in ('solved','attempted','todo','revisit')) default 'todo',
  tags text[] default '{}',
  companies text[] default '{}',
  notes text,
  approach text,
  time_complexity text,
  space_complexity text,
  url text,
  sheet text check (sheet in ('blind75','striver_sde','neetcode150','grind75','none')) default 'none',
  solved_date date,
  revision_dates text[] default '{}',
  created_at timestamptz default now()
);

-- Contests table
create table contests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  platform text check (platform in ('leetcode','codeforces','codechef','atcoder','other')) not null,
  start_time timestamptz,
  duration_minutes integer,
  url text,
  participated boolean default false,
  rank integer,
  problems_solved integer,
  rating_change integer,
  notes text,
  created_at timestamptz default now()
);

-- Learning logs table
create table learning_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  date date not null,
  content text not null,
  topics text[] default '{}',
  revision_status text check (revision_status in ('pending','revised','skipped')) default 'pending',
  next_revision_date date,
  created_at timestamptz default now()
);

-- Platform profiles table
create table platform_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  platform text check (platform in ('leetcode','codeforces','codechef','github','geeksforgeeks','hackerrank')) not null,
  username text not null,
  profile_url text,
  problems_solved integer default 0,
  rating integer,
  max_rating integer,
  contributions integer default 0,
  streak integer default 0,
  created_at timestamptz default now(),
  unique(user_id, platform)
);

-- Row Level Security
alter table problems enable row level security;
alter table contests enable row level security;
alter table learning_logs enable row level security;
alter table platform_profiles enable row level security;

-- RLS Policies (users can only access their own data)
create policy "users can manage their problems" on problems for all using (auth.uid() = user_id);
create policy "users can manage their contests" on contests for all using (auth.uid() = user_id);
create policy "users can manage their learning logs" on learning_logs for all using (auth.uid() = user_id);
create policy "users can manage their platform profiles" on platform_profiles for all using (auth.uid() = user_id);
