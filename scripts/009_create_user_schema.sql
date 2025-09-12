-- Enhance user schema tables with better structure and indexing

-- Add missing columns to existing tables
alter table public.modules add column if not exists created_by uuid references public.profiles(id);
alter table public.modules add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

alter table public.quizzes add column if not exists created_by uuid references public.profiles(id);
alter table public.quizzes add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

alter table public.simulations add column if not exists created_by uuid references public.profiles(id);
alter table public.simulations add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- Add time tracking to progress tables
alter table public.user_module_progress add column if not exists time_spent integer default 0;
alter table public.user_quiz_attempts add column if not exists time_taken integer;
alter table public.user_simulation_attempts add column if not exists time_taken integer;

-- User preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean default true,
  email_notifications boolean default true,
  difficulty_preference text default 'beginner' check (difficulty_preference in ('beginner', 'intermediate', 'advanced')),
  language text default 'en',
  timezone text default 'UTC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- User achievements table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  achievement_type text not null,
  achievement_data jsonb not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User sessions for analytics
create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_start timestamp with time zone default timezone('utc'::text, now()) not null,
  session_end timestamp with time zone,
  pages_visited integer default 0,
  actions_performed integer default 0,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.user_preferences enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_sessions enable row level security;

-- User preferences policies
create policy "user_preferences_own"
  on public.user_preferences for all
  using (auth.uid() = user_id);

-- User achievements policies
create policy "user_achievements_own"
  on public.user_achievements for select
  using (auth.uid() = user_id);

create policy "user_achievements_insert_system"
  on public.user_achievements for insert
  with check (true); -- Allow system to insert achievements

-- User sessions policies
create policy "user_sessions_own"
  on public.user_sessions for all
  using (auth.uid() = user_id);

-- Admin policies for new tables
create policy "user_preferences_admin_select"
  on public.user_preferences for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "user_achievements_admin_select"
  on public.user_achievements for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "user_sessions_admin_select"
  on public.user_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create performance indexes
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);
create index if not exists idx_user_achievements_type on public.user_achievements(achievement_type);
create index if not exists idx_user_sessions_user_id on public.user_sessions(user_id);
create index if not exists idx_user_sessions_start on public.user_sessions(session_start desc);

-- Update existing indexes for better performance
create index if not exists idx_modules_created_by on public.modules(created_by);
create index if not exists idx_modules_published on public.modules(is_published);
create index if not exists idx_quizzes_created_by on public.quizzes(created_by);
create index if not exists idx_quizzes_published on public.quizzes(is_published);
create index if not exists idx_simulations_created_by on public.simulations(created_by);
create index if not exists idx_simulations_published on public.simulations(is_published);
