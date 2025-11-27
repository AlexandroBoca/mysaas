-- Add phone_number, country, and language columns to profiles table
-- This allows storing profile data directly in the profiles table instead of just user metadata

-- Add phone_number column
ALTER TABLE profiles 
ADD COLUMN phone_number TEXT;

-- Add country column
ALTER TABLE profiles 
ADD COLUMN country TEXT;

-- Add language column  
ALTER TABLE profiles 
ADD COLUMN language TEXT DEFAULT 'English (US)';

-- Update existing records with data from user metadata
UPDATE profiles 
SET phone_number = auth.users.raw_user_meta_data->>'phone'
FROM auth.users 
WHERE auth.users.id = profiles.id 
AND auth.users.raw_user_meta_data->>'phone' IS NOT NULL
AND auth.users.raw_user_meta_data->>'phone' != '';

UPDATE profiles 
SET country = auth.users.raw_user_meta_data->>'country'
FROM auth.users 
WHERE auth.users.id = profiles.id 
AND auth.users.raw_user_meta_data->>'country' IS NOT NULL
AND auth.users.raw_user_meta_data->>'country' != '';

UPDATE profiles 
SET language = COALESCE(
  auth.users.raw_user_meta_data->>'language', 
  'English (US)'
)
FROM auth.users 
WHERE auth.users.id = profiles.id;

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with name, phone, and country from metadata or email username as fallback
  INSERT INTO public.profiles (id, full_name, phone_number, country, language, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country',
    COALESCE(
      NEW.raw_user_meta_data->>'language',
      'English (US)'
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the updates
SELECT 
  p.id,
  p.full_name,
  p.phone_number,
  p.country,
  p.language,
  u.email,
  u.raw_user_meta_data->>'phone' as metadata_phone,
  u.raw_user_meta_data->>'country' as metadata_country,
  u.raw_user_meta_data->>'language' as metadata_language
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
