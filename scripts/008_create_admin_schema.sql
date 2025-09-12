-- Create admin schema for administrative functionality
create schema if not exists admin;

-- Admin settings table
create table if not exists admin.settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin action logs for audit trail
create table if not exists admin.logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles(id) not null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Content management workflow table
create table if not exists admin.content_workflow (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('module', 'quiz', 'simulation')),
  content_id uuid not null,
  status text not null check (status in ('draft', 'review', 'approved', 'published', 'archived')),
  assigned_to uuid references public.profiles(id),
  notes text,
  created_by uuid references public.profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analytics aggregation table
create table if not exists admin.analytics_summary (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null,
  metric_value numeric not null,
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on admin tables
alter table admin.settings enable row level security;
alter table admin.logs enable row level security;
alter table admin.content_workflow enable row level security;
alter table admin.analytics_summary enable row level security;

-- Admin-only policies
create policy "admin_settings_admin_only"
  on admin.settings for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "admin_logs_admin_only"
  on admin.logs for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "admin_content_workflow_admin_only"
  on admin.content_workflow for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "admin_analytics_admin_only"
  on admin.analytics_summary for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create indexes for performance
create index if not exists idx_admin_logs_admin_id on admin.logs(admin_id);
create index if not exists idx_admin_logs_created_at on admin.logs(created_at desc);
create index if not exists idx_admin_content_workflow_content on admin.content_workflow(content_type, content_id);
create index if not exists idx_admin_analytics_metric_type on admin.analytics_summary(metric_type);
create index if not exists idx_admin_analytics_period on admin.analytics_summary(period_start, period_end);
