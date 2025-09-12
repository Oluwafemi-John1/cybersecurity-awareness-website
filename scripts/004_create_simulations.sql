-- Create simulations table
create table if not exists public.simulations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  scenario_data jsonb not null, -- Store simulation scenario as JSON
  difficulty_level text default 'beginner' check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  category text not null,
  estimated_duration integer, -- in minutes
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.simulations enable row level security;

-- Allow all users to view published simulations
create policy "simulations_select_published"
  on public.simulations for select
  using (is_published = true);

-- Allow admins to manage all simulations
create policy "simulations_admin_all"
  on public.simulations for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
