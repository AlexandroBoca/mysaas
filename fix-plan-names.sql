-- ADD PLAN_NAME COLUMN AND UPDATE IT
-- First add the plan_name column if it doesn't exist
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_name text;

-- Update plan_name based on price_id
UPDATE subscriptions 
SET plan_name = CASE 
    WHEN price_id = 'price_1SWZtk0IXvOI6chr8EHUTZ9R' THEN 'Starter'
    WHEN price_id = 'price_1SWZv10IXvOI6chr51Sdn99w' THEN 'Pro'
    WHEN price_id = 'price_1SWZvz0IXvOI6chrEHdJzkxv' THEN 'Enterprise'
    WHEN price_id = 'free' THEN 'Free'
    WHEN price_id LIKE '%starter%' THEN 'Starter'
    WHEN price_id LIKE '%pro%' THEN 'Pro'
    WHEN price_id LIKE '%enterprise%' THEN 'Enterprise'
    ELSE 'Unknown'
END;

-- Verify the updates
SELECT 
    id,
    user_id,
    price_id,
    plan_name,
    status,
    created_at
FROM subscriptions 
ORDER BY created_at DESC;
