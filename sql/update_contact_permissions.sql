-- Allow users to DELETE their own requests
create policy "Users can delete own requests"
  on public.contact_requests for delete
  using (auth.uid() = user_id);

-- Allow users to UPDATE their own requests (e.g. to close them or edit subject)
create policy "Users can update own requests"
  on public.contact_requests for update
  using (auth.uid() = user_id);
