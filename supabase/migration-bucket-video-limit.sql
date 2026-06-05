-- Raise creator-media upload limit for videos (default Supabase is 50MB)
-- Run in Supabase SQL Editor. 200MB is a reasonable starting point.

update storage.buckets
set file_size_limit = 209715200
where id = 'creator-media';
