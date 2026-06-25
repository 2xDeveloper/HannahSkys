-- Raise creator-media upload limit for full-length videos (up to ~10 min from iPhone)
-- Run in Supabase SQL Editor after upgrading your Supabase storage plan.

update storage.buckets
set file_size_limit = 2147483648
where id = 'creator-media';
