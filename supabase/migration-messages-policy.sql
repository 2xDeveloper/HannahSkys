-- Optional: tighten who can receive messages (approved creators only)
-- Run in Supabase SQL Editor if messages fail to send

drop policy if exists "Anyone can send a message" on public.messages;

create policy "Send message to approved creators"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = recipient_id
        and role = 'creator'
        and creator_status = 'approved'
    )
    and (sender_id is null or sender_id <> recipient_id)
  );
