-- Script to populate full_name in profiles table from user metadata
-- and create a trigger for future signups

-- First, update existing users who have names in user_metadata but not in profiles
UPDATE profiles 
SET full_name = (
  SELECT raw_user_meta_data->>'name' 
  FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND raw_user_meta_data->>'name' IS NOT NULL 
  AND raw_user_meta_data->>'name' != ''
)
WHERE EXISTS (
  SELECT 1 
  FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND raw_user_meta_data->>'name' IS NOT NULL 
  AND raw_user_meta_data->>'name' != ''
)
AND (profiles.full_name IS NULL OR profiles.full_name = '');

-- For users without names in metadata, use email username as fallback
UPDATE profiles 
SET full_name = (
  SELECT split_part(auth.users.email, '@', 1)
  FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND (raw_user_meta_data->>'name' IS NULL OR raw_user_meta_data->>'name' = '')
)
WHERE EXISTS (
  SELECT 1 
  FROM auth.users 
  WHERE auth.users.id = profiles.id 
  AND (raw_user_meta_data->>'name' IS NULL OR raw_user_meta_data->>'name' = '')
)
AND (profiles.full_name IS NULL OR profiles.full_name = '');

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with name from metadata or email username
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile when user metadata changes
CREATE OR REPLACE FUNCTION public.update_user_name()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile name if it exists in metadata
  IF NEW.raw_user_meta_data->>'name' IS NOT NULL AND NEW.raw_user_meta_data->>'name' != '' THEN
    UPDATE public.profiles 
    SET full_name = NEW.raw_user_meta_data->>'name'
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update profile when user metadata changes
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.update_user_name();

-- Verify the updates
SELECT 
  p.id,
  p.full_name,
  u.email,
  u.raw_user_meta_data->>'name' as metadata_name
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.full_name IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;
