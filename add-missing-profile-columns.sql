-- Add missing country column to profiles table (phone_number and language already exist)
-- This script safely adds only the columns that don't exist yet

-- Add country column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='profiles' 
        AND column_name='country'
        AND table_schema='public'
    ) THEN
        ALTER TABLE profiles ADD COLUMN country TEXT;
        RAISE NOTICE 'Added country column to profiles table';
    ELSE
        RAISE NOTICE 'Country column already exists in profiles table';
    END IF;
END $$;

-- Update existing records with country data from user metadata
UPDATE profiles 
SET country = auth.users.raw_user_meta_data->>'country'
FROM auth.users 
WHERE auth.users.id = profiles.id 
AND auth.users.raw_user_meta_data->>'country' IS NOT NULL
AND auth.users.raw_user_meta_data->>'country' != '';

-- Update existing records with phone_number data from user metadata (in case it wasn't migrated before)
UPDATE profiles 
SET phone_number = auth.users.raw_user_meta_data->>'phone'
FROM auth.users 
WHERE auth.users.id = profiles.id 
AND auth.users.raw_user_meta_data->>'phone' IS NOT NULL
AND auth.users.raw_user_meta_data->>'phone' != ''
AND profiles.phone_number IS NULL;

-- Update existing records with language data from user metadata (in case it wasn't migrated before)
UPDATE profiles 
SET language = COALESCE(
  auth.users.raw_user_meta_data->>'language', 
  'English (US)'
)
FROM auth.users 
WHERE auth.users.id = profiles.id
AND profiles.language IS NULL;

-- Create or replace the trigger function to handle new user signups with country
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with name, phone, country, and language from metadata or email username as fallback
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
