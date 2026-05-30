-- Run in Supabase SQL Editor (safe to re-run)
-- Fixes creator signups not showing in admin pending list

alter table public.profiles
  add column if not exists creator_status text not null default 'approved';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_creator_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_creator_status_check
      check (creator_status in ('pending', 'approved', 'rejected'));
  end if;
exception when duplicate_object then null;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'user');
begin
  insert into public.profiles (id, display_name, role, creator_status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    case when account_type = 'creator' then 'creator' else 'user' end,
    case when account_type = 'creator' then 'pending' else 'approved' end
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    role = case
      when coalesce(new.raw_user_meta_data ->> 'account_type', 'user') = 'creator'
        and public.profiles.role = 'user'
      then 'creator'
      else public.profiles.role
    end,
    creator_status = case
      when coalesce(new.raw_user_meta_data ->> 'account_type', 'user') = 'creator'
        and public.profiles.creator_status = 'approved'
        and public.profiles.role = 'user'
      then 'pending'
      else public.profiles.creator_status
    end,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Let logged-in users fix profile if they signed up as creator but got role=user
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
          when creator_status = 'rejected' then 'rejected'
          else 'pending'
        end,
        updated_at = now()
    where id = auth.uid()
      and role in ('user', 'creator')
      and creator_status != 'approved';
  end if;
end;
$$;

grant execute on function public.sync_creator_application() to authenticated;

-- Fix existing creator signups already in the database (metadata says creator, profile says user)
update public.profiles p
set role = 'creator',
    creator_status = 'pending',
    updated_at = now()
from auth.users u
where p.id = u.id
  and coalesce(u.raw_user_meta_data ->> 'account_type', '') = 'creator'
  and p.role = 'user';
