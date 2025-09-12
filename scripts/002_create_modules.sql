-- Create learning modules table
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  content jsonb not null, -- Store rich content as JSON
  difficulty_level text default 'beginner' check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  estimated_duration integer, -- in minutes
  category text not null,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.modules enable row level security;

-- Allow all users to view published modules
create policy "modules_select_published"
  on public.modules for select
  using (is_published = true);

-- Allow admins to manage all modules
create policy "modules_admin_all"
  on public.modules for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
