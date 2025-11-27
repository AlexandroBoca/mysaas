-- Add password column to profiles table
-- This will store hashed passwords for additional security and backup purposes

ALTER TABLE profiles 
ADD COLUMN password_hash TEXT;

-- Add index for faster password lookups if needed
CREATE INDEX idx_profiles_password_hash ON profiles(password_hash) WHERE password_hash IS NOT NULL;

-- Add comment to document the purpose
COMMENT ON COLUMN profiles.password_hash IS 'Hashed password for additional security and backup purposes. Stored alongside Supabase auth for redundancy.';
