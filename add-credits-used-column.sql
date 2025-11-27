-- Add credits_used column to profiles table
ALTER TABLE profiles 
ADD COLUMN credits_used INTEGER DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN profiles.credits_used IS 'Total credits consumed by the user for content generation';

-- Create a trigger to automatically increment credits_used when credits are deducted
CREATE OR REPLACE FUNCTION update_credits_used()
RETURNS TRIGGER AS $$
BEGIN
    -- When credits_remaining is decreased, increase credits_used by the same amount
    IF OLD.credits_remaining > NEW.credits_remaining THEN
        NEW.credits_used = OLD.credits_used + (OLD.credits_remaining - NEW.credits_remaining);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to automatically track credit usage
CREATE TRIGGER credits_usage_tracker
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.credits_remaining > NEW.credits_remaining)
    EXECUTE FUNCTION update_credits_used();

-- Update existing profiles to have correct credits_used based on their generation history
UPDATE profiles p
SET credits_used = COALESCE(
    (
        SELECT COUNT(g.id) 
        FROM generations g 
        WHERE g.user_id = p.id
    ), 0
);

-- Add a check constraint to ensure credits_used is never negative
ALTER TABLE profiles 
ADD CONSTRAINT check_credits_used_non_negative 
CHECK (credits_used >= 0);

-- Add index for better performance on credits queries
CREATE INDEX idx_profiles_credits_used ON profiles(credits_used);

-- Example query to get credit usage statistics
/*
SELECT 
    p.id,
    p.full_name,
    p.credits_remaining,
    p.credits_used,
    (p.credits_remaining + p.credits_used) as total_credits_allocated,
    ROUND((p.credits_used::float / NULLIF(p.credits_remaining + p.credits_used, 0)) * 100, 2) as usage_percentage
FROM profiles p
WHERE p.id = 'user_id_here';
*/
