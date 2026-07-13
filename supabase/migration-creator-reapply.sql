-- Allow rejected creators to reapply and show in admin pending list
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
      else 'pending'
    end,
    instagram_handle = coalesce(ig, public.profiles.instagram_handle),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();
end;
$$;

create or replace function public.sync_creator_application()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  account_type text;
begin
  select coalesce(raw_user_meta_data ->> 'account_type', 'user')
  into account_type
  from auth.users
  where id = auth.uid();

  if account_type = 'creator' then
    update public.profiles
    set role = 'creator',
        creator_status = case
          when creator_status = 'approved' then 'approved'
          else 'pending'
        end,
        updated_at = now()
    where id = auth.uid()
      and role in ('user', 'creator')
      and creator_status != 'approved';
  end if;
end;
$$;

-- Re-submit for review without re-uploading photos (rejected accounts)
create or replace function public.reapply_creator_review()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set role = 'creator',
      creator_status = 'pending',
      updated_at = now()
  where id = auth.uid()
    and creator_status = 'rejected'
    and avatar_url is not null
    and id_document_path is not null
    and instagram_handle is not null;
end;
$$;

grant execute on function public.reapply_creator_review() to authenticated;
