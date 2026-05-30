-- Creator replies to fans + fan inbox support
-- Run in Supabase SQL Editor (safe to re-run)

drop policy if exists "Approved creators can reply to fans" on public.messages;
create policy "Approved creators can reply to fans"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
        and p.creator_status = 'approved'
    )
    and recipient_id <> auth.uid()
    and exists (
      select 1 from public.messages prior
      where prior.sender_id = recipient_id
        and prior.recipient_id = auth.uid()
    )
  );

-- Fans can read messages creators sent them
drop policy if exists "Recipients can read their messages" on public.messages;
create policy "Recipients can read their messages"
  on public.messages for select
  using (auth.uid() = recipient_id);
