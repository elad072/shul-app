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

-- Add applicant_auth_id column if not exists (used to tie application to Supabase auth user)
alter table public.applications add column if not exists applicant_auth_id uuid;

-- Create a `profiles` table used for user onboarding and roles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  first_name text,
  last_name text,
  phone text,
  status text default 'pending',
  role text default 'member',
  is_gabbai boolean default false,
  created_at timestamptz default now()
);

create index if not exists profiles_status_idx on public.profiles (status);

