-- Check what tables actually exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check if auth.users exists (Supabase auth table)
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%user%' 
AND table_schema = 'public'
ORDER BY table_name;
