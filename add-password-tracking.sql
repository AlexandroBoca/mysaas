-- Add password tracking columns for enhanced security monitoring
-- This file adds columns to track password changes and security settings

-- Add password reset tracking to profiles table
ALTER TABLE profiles 
ADD COLUMN last_password_reset TIMESTAMP WITH TIME ZONE;

ALTER TABLE profiles 
ADD COLUMN password_reset_count INTEGER DEFAULT 0;

-- Add password strength tracking (optional - for analytics)
ALTER TABLE profiles 
ADD COLUMN password_strength VARCHAR(20) DEFAULT 'unknown';

-- Create a function to update password reset tracking
CREATE OR REPLACE FUNCTION public.track_password_reset()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the last password reset timestamp and increment counter
  UPDATE public.profiles 
  SET 
    last_password_reset = NOW(),
    password_reset_count = COALESCE(password_reset_count, 0) + 1,
    updated_at = NOW()
  WHERE id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track password changes
-- This trigger will fire when a user updates their password through Supabase Auth
-- Note: Supabase Auth doesn't directly expose password change events to database triggers
-- This function is meant to be called manually from your application logic

-- Create a function to be called from your application after successful password reset
CREATE OR REPLACE FUNCTION public.record_password_reset(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    last_password_reset = NOW(),
    password_reset_count = COALESCE(password_reset_count, 0) + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view to monitor password security metrics
CREATE OR REPLACE VIEW public.password_security_metrics AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.last_password_reset,
  p.password_reset_count,
  CASE 
    WHEN p.last_password_reset IS NULL THEN 'Never reset'
    WHEN p.last_password_reset > NOW() - INTERVAL '7 days' THEN 'Recently reset'
    WHEN p.last_password_reset > NOW() - INTERVAL '30 days' THEN 'Within 30 days'
    WHEN p.last_password_reset > NOW() - INTERVAL '90 days' THEN 'Within 90 days'
    ELSE 'Old password'
  END as password_status,
  u.created_at as account_created,
  u.last_sign_in_at as last_sign_in,
  EXTRACT(DAYS FROM NOW() - p.last_password_reset) as days_since_reset
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
ORDER BY p.last_password_reset DESC NULLS LAST;

-- Grant necessary permissions
GRANT SELECT ON public.password_security_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_password_reset(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_password_reset() TO authenticated;

-- Sample query to check password security metrics
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN last_password_reset IS NULL THEN 1 END) as never_reset,
  COUNT(CASE WHEN last_password_reset > NOW() - INTERVAL '30 days' THEN 1 END) as reset_within_30_days,
  AVG(password_reset_count) as avg_reset_count
FROM profiles;

-- Note: Supabase handles actual password storage and hashing automatically
-- in the auth.users table. The above columns are for tracking and analytics only.
-- The actual password hash is stored securely by Supabase and is not accessible.
