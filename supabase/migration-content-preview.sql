-- Paid content: separate preview image vs full file buyers unlock
-- Run in Supabase SQL Editor (safe to re-run)

alter table public.creator_content
  add column if not exists preview_storage_path text;

comment on column public.creator_content.preview_storage_path is
  'Public teaser image for paid items. Full file is in storage_path.';

comment on column public.creator_content.storage_path is
  'Full media file. For paid items, only shown after purchase (not on gallery).';
