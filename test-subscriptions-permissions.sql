-- Test subscriptions table and permissions
SELECT 
  table_name, 
  table_schema 
FROM information_schema.tables 
WHERE table_name = 'subscriptions' AND table_schema = 'public';

-- Test if you can read from it (this will show if RLS is working)
SELECT COUNT(*) FROM subscriptions;
