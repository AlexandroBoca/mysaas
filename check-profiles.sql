-- Check what's actually in your profiles table
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Also check if any users exist
SELECT COUNT(*) as total_users FROM profiles;

-- Show first few users to see the structure
SELECT * FROM profiles LIMIT 3;
