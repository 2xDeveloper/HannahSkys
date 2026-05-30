-- Run this in Supabase → SQL Editor (one paste, then Run)

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'creator', 'admin')),
  creator_status text not null default 'approved' check (creator_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

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

-- Auto-create profile on signup (account_type in user metadata: user | creator)
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

-- Messages (fan → creator)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users (id) on delete set null,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  sender_name text,
  sender_email text,
  body text not null check (char_length(body) <= 5000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.messages enable row level security;

create policy "Recipients can read their messages"
  on public.messages for select
  using (auth.uid() = recipient_id);

create policy "Senders can read messages they sent"
  on public.messages for select
  using (auth.uid() = sender_id);

create policy "Anyone can send a message"
  on public.messages for insert
  with check (true);

create policy "Recipients can mark messages read"
  on public.messages for update
  using (auth.uid() = recipient_id);

-- Storage: profile avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Make yourself admin after first signup (replace with your user id from Authentication → Users):
-- update public.profiles set role = 'admin', creator_status = 'approved' where id = 'YOUR-USER-UUID';
