-- Run this in Supabase → SQL Editor if you already ran schema.sql before.
-- Safe to run once on an existing project.

alter table public.profiles
  add column if not exists creator_status text not null default 'approved'
  check (creator_status in ('pending', 'approved', 'rejected'));

-- Buyers should stay approved; existing creators without status get approved
update public.profiles
set creator_status = 'approved'
where role in ('user', 'admin') or creator_status is null;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.is_admin() then
    new.role := old.role;
    new.creator_status := old.creator_status;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
