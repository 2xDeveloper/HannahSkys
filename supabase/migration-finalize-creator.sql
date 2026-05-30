-- Ensures creator signups appear in admin pending list
-- Run in Supabase SQL Editor (safe to re-run)

create or replace function public.finalize_creator_signup(p_instagram text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  ig text := nullif(trim(both '@' from coalesce(p_instagram, '')), '');
  dname text;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(
    raw_user_meta_data ->> 'display_name',
    split_part(email, '@', 1)
  )
  into dname
  from auth.users
  where id = uid;

  insert into public.profiles (id, display_name, role, creator_status, instagram_handle)
  values (
    uid,
    dname,
    'creator',
    'pending',
    ig
  )
  on conflict (id) do update set
    role = 'creator',
    creator_status = case
      when public.profiles.creator_status = 'approved' then 'approved'
      when public.profiles.creator_status = 'rejected' then 'rejected'
      else 'pending'
    end,
    instagram_handle = coalesce(ig, public.profiles.instagram_handle),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();
end;
$$;

grant execute on function public.finalize_creator_signup(text) to authenticated;

-- Fix creator signups that were saved as regular users
update public.profiles p
set role = 'creator',
    creator_status = 'pending',
    updated_at = now()
from auth.users u
where p.id = u.id
  and p.role = 'user'
  and (
    coalesce(u.raw_user_meta_data ->> 'account_type', '') = 'creator'
    or p.instagram_handle is not null
    or p.id_document_path is not null
  );
