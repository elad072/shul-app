 create or replace function get_gabbai_unread_count()
 returns integer
 language plpgsql
 security definer
 set search_path = public
 as $$
 declare
   total_count integer;
 begin
   -- Check if user is gabbai
   if not exists (select 1 from profiles where id = auth.uid() and is_gabbai = true) then
     return 0;
   end if;
 
   -- Count distinct requests that:
   -- 1. Are NOT closed
   -- 2. Have at least one unread message from someone else
   select count(distinct r.id)
   into total_count
   from contact_requests r
   join contact_messages m on r.id = m.request_id
   where
     r.status != 'closed'
     and m.is_read = false 
     and m.sender_id != auth.uid();
   
   return total_count;
 end;
 $$;
