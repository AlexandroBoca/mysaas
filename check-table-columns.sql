-- CHECK WHAT COLUMNS ACTUALLY EXIST
-- Let's see the structure of both tables

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check subscriptions table structure  
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data from profiles
SELECT * FROM profiles LIMIT 3;

-- Show sample data from subscriptions
SELECT * FROM subscriptions LIMIT 3;
