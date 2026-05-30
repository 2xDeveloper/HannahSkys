-- Creator photos & videos for sale (or free)
-- Run in Supabase SQL Editor (safe to re-run)

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

create table if not exists public.creator_content (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 1),
  media_type text not null check (media_type in ('photo', 'video')),
  storage_path text not null,
  preview_storage_path text,
  price_cents integer check (price_cents is null or price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_content_creator_id_idx
  on public.creator_content (creator_id);

create index if not exists creator_content_created_at_idx
  on public.creator_content (created_at desc);

alter table public.creator_content enable row level security;

drop policy if exists "Anyone can view content from approved creators" on public.creator_content;
create policy "Anyone can view content from approved creators"
  on public.creator_content for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = creator_content.creator_id
        and p.role = 'creator'
        and p.creator_status = 'approved'
    )
    or creator_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "Approved creators insert own content" on public.creator_content;
create policy "Approved creators insert own content"
  on public.creator_content for insert
  with check (
    creator_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'creator'
        and p.creator_status = 'approved'
    )
  );

drop policy if exists "Creators update own content" on public.creator_content;
create policy "Creators update own content"
  on public.creator_content for update
  using (creator_id = auth.uid() or public.is_admin());

drop policy if exists "Creators delete own content" on public.creator_content;
create policy "Creators delete own content"
  on public.creator_content for delete
  using (creator_id = auth.uid() or public.is_admin());

-- Public bucket for creator gallery media
insert into storage.buckets (id, name, public)
values ('creator-media', 'creator-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Creator media public read" on storage.objects;
create policy "Creator media public read"
  on storage.objects for select
  using (bucket_id = 'creator-media');

drop policy if exists "Creators upload own media" on storage.objects;
create policy "Creators upload own media"
  on storage.objects for insert
  with check (
    bucket_id = 'creator-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators update own media" on storage.objects;
create policy "Creators update own media"
  on storage.objects for update
  using (
    bucket_id = 'creator-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Creators delete own media" on storage.objects;
create policy "Creators delete own media"
  on storage.objects for delete
  using (
    bucket_id = 'creator-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
