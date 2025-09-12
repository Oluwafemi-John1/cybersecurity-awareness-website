-- Create quizzes table
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  questions jsonb not null, -- Store questions and answers as JSON
  difficulty_level text default 'beginner' check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  category text not null,
  time_limit integer, -- in minutes
  passing_score integer default 70, -- percentage
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.quizzes enable row level security;

-- Allow all users to view published quizzes
create policy "quizzes_select_published"
  on public.quizzes for select
  using (is_published = true);

-- Allow admins to manage all quizzes
create policy "quizzes_admin_all"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
