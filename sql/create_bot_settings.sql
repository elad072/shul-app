-- Create bot_settings table
create table if not exists public.bot_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- Insert default welcome message
insert into public.bot_settings (key, value)
values ('welcome_message', 'ברוך הבא לבית הכנסת "מעון קודשך"! 🕍\n\nמה תרצה לדעת?\nאפשר לשאול על:\n📅 *זמנים של שישי*\n🕯 *זמנים של שבת*\n🗓 *זמנים של יום חול*')
on conflict (key) do nothing;

-- Add RLS (optional but good practice)
alter table public.bot_settings enable row level security;

create policy "Anyone can read bot settings"
on public.bot_settings for select
to authenticated
using (true);

create policy "Gabbais can update bot settings"
on public.bot_settings for update
to authenticated
using (
  (select is_gabbai from public.profiles where id = auth.uid()) = true
);
