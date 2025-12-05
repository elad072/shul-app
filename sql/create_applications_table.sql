-- Run this SQL in your Supabase project to create the applications table

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  address text,
  city text,
  home_phone text,
  applicant_first_name text not null,
  applicant_last_name text,
  applicant_email text not null,
  applicant_phone text,
  applicant_role text,
  applicant_gender text,
  birth_date date,
  additional_info jsonb,
  status text default 'pending',
  created_at timestamptz default now()
);

-- optional index for status
create index if not exists applications_status_idx on public.applications (status);
