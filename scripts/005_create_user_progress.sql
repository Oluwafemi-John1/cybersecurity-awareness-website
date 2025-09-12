-- Create user progress tracking tables
create table if not exists public.user_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  module_id uuid references public.modules(id) on delete cascade,
  completed boolean default false,
  progress_percentage integer default 0,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, module_id)
);

create table if not exists public.user_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  quiz_id uuid references public.quizzes(id) on delete cascade,
  score integer not null,
  answers jsonb not null, -- Store user answers
  passed boolean not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_simulation_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  simulation_id uuid references public.simulations(id) on delete cascade,
  score integer,
  decisions jsonb not null, -- Store user decisions during simulation
  completed boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for all progress tables
alter table public.user_module_progress enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.user_simulation_attempts enable row level security;

-- Policies for user_module_progress
create policy "user_module_progress_own"
  on public.user_module_progress for all
  using (auth.uid() = user_id);

create policy "user_module_progress_admin"
  on public.user_module_progress for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policies for user_quiz_attempts
create policy "user_quiz_attempts_own"
  on public.user_quiz_attempts for all
  using (auth.uid() = user_id);

create policy "user_quiz_attempts_admin"
  on public.user_quiz_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policies for user_simulation_attempts
create policy "user_simulation_attempts_own"
  on public.user_simulation_attempts for all
  using (auth.uid() = user_id);

create policy "user_simulation_attempts_admin"
  on public.user_simulation_attempts for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
