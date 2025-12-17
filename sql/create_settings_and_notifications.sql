-- Create App Settings / Dropdown Options Table
create table public.app_settings (
  id uuid default gen_random_uuid() primary key,
  category text not null, -- e.g., 'contact_subject'
  label text not null,
  value text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_settings enable row level security;

-- Policies
-- Everyone can view active settings
create policy "Everyone can view active settings"
  on public.app_settings for select
  using (is_active = true);

-- Gabbais can view ALL (including inactive) and EDIT/INSERT
create policy "Gabbais can view all settings"
  on public.app_settings for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

create policy "Gabbais can insert settings"
  on public.app_settings for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

create policy "Gabbais can update settings"
  on public.app_settings for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

create policy "Gabbais can delete settings"
  on public.app_settings for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

-- Seed Data
insert into public.app_settings (category, label, value) values
('contact_subject', 'בקשת עלייה לתורה', 'aliyah'),
('contact_subject', 'דיווח על אירוע', 'event'),
('contact_subject', 'בירור הלכתי', 'halacha'),
('contact_subject', 'משוב כללי', 'general');

-- Helper to count unread messages for a user
-- (User wants to know if GABBAI replied)
-- We count messages in requests owned by USER, where Sender IS NOT USER, and is_read = false
create or replace function public.get_unread_count(user_uuid uuid)
returns integer as $$
  select count(*)
  from public.contact_messages m
  join public.contact_requests r on m.request_id = r.id
  where r.user_id = user_uuid
  and m.sender_id != user_uuid
  and m.is_read = false;
$$ language sql security definer;
