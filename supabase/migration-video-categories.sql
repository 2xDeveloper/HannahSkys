-- Premade video categories + creator applications no longer require an ID photo
-- Run in Supabase SQL Editor (safe to re-run)

alter table public.creator_content
  add column if not exists category text;

create index if not exists creator_content_category_idx
  on public.creator_content (category);

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
    and instagram_handle is not null;
end;
$$;
