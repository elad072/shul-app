-- Create Ticket System Tables

-- 1. Contact Requests (The "Ticket" / "Thread")
create table public.contact_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  subject text not null, -- 'Aliyah', 'Event', 'General', etc.
  status text default 'open' check (status in ('open', 'in_progress', 'closed')),
  last_activity_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Contact Messages (The "Chats" inside a ticket)
create table public.contact_messages (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.contact_requests(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null, -- Who sent this specific message?
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table public.contact_requests enable row level security;
alter table public.contact_messages enable row level security;

-- Policies for contact_requests
-- Users can see their own requests
create policy "Users can view own requests"
  on public.contact_requests for select
  using (auth.uid() = user_id);

-- Users can insert their own requests
create policy "Users can create requests"
  on public.contact_requests for insert
  with check (auth.uid() = user_id);

-- Gabbais can see ALL requests
create policy "Gabbais can view all requests"
  on public.contact_requests for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

-- Gabbais can update requests (e.g. change status)
create policy "Gabbais can update requests"
  on public.contact_requests for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );


-- Policies for contact_messages
-- Users can see messages belonging to their OWN requests
create policy "Users can view messages of own requests"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.contact_requests
      where contact_requests.id = contact_messages.request_id
      and contact_requests.user_id = auth.uid()
    )
  );

-- Users can insert messages to their OWN requests (replying)
create policy "Users can reply to own requests"
  on public.contact_messages for insert
  with check (
    exists (
      select 1 from public.contact_requests
      where contact_requests.id = request_id
      and contact_requests.user_id = auth.uid()
    )
  );

-- Gabbais can see ALL messages
create policy "Gabbais can view all messages"
  on public.contact_messages for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );

-- Gabbais can insert messages (reply to anyone)
create policy "Gabbais can reply to any request"
  on public.contact_messages for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_gabbai = true
    )
  );
