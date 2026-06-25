-- Remove ALL gallery posts (test content) before launch
-- Run in Supabase → SQL Editor
--
-- This deletes every row in creator_content.
-- Linked purchases for those posts are removed too (foreign key cascade).
-- Storage files in creator-media are NOT deleted by this — see step 2 below.

delete from public.creator_content;

-- Optional: verify empty
-- select count(*) from public.creator_content;
