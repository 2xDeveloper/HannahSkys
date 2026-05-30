-- Creator application: Instagram, ID photos, admin review
-- Safe to re-run. Run in Supabase SQL Editor.

-- Required columns
alter table public.profiles
  add column if not exists creator_status text not null default 'approved';

alter table public.profiles
  add column if not exists instagram_handle text;

alter table public.profiles
  add column if not exists id_document_path text;

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

-- Admin helper (needed for ID storage policy)
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

-- Private bucket for ID verification photos
insert into storage.buckets (id, name, public)
values ('id-documents', 'id-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Users upload own ID" on storage.objects;
create policy "Users upload own ID"
  on storage.objects for insert
  with check (
    bucket_id = 'id-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users update own ID" on storage.objects;
create policy "Users update own ID"
  on storage.objects for update
  using (
    bucket_id = 'id-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users and admins read ID" on storage.objects;
create policy "Users and admins read ID"
  on storage.objects for select
  using (
    bucket_id = 'id-documents'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- Signup trigger (creator + instagram)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'user');
  ig text := nullif(trim(both '@' from coalesce(new.raw_user_meta_data ->> 'instagram_handle', '')), '');
begin
  insert into public.profiles (id, display_name, role, creator_status, instagram_handle)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    case when account_type = 'creator' then 'creator' else 'user' end,
    case when account_type = 'creator' then 'pending' else 'approved' end,
    ig
  )
  on conflict (id) do update set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    instagram_handle = coalesce(excluded.instagram_handle, public.profiles.instagram_handle),
    role = case
      when coalesce(new.raw_user_meta_data ->> 'account_type', 'user') = 'creator'
        and public.profiles.role = 'user'
      then 'creator'
      else public.profiles.role
    end,
    creator_status = case
      when coalesce(new.raw_user_meta_data ->> 'account_type', 'user') = 'creator'
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

-- Creator sync on login (if missing from earlier migration)
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
          when creator_status = 'approved' then 'approved'
          else 'pending'
        end,
        updated_at = now()
    where id = auth.uid()
      and role = 'user';
  end if;
end;
$$;

grant execute on function public.sync_creator_application() to authenticated;
