-- UPDATE PLAN NAMES IN SUBSCRIPTIONS TABLE
-- This script updates the plan_name field based on price_id and joins with profiles for subscription_tier

-- First, let's see what we have in the subscriptions table
SELECT 
    s.id,
    s.user_id,
    s.price_id,
    s.plan_name,
    s.status,
    s.created_at,
    p.subscription_tier
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC;

-- Update plan_name based on subscription_tier from profiles table
UPDATE subscriptions s
SET plan_name = CASE 
    WHEN p.subscription_tier = 'free' THEN 'Free'
    WHEN p.subscription_tier = 'starter' THEN 'Starter'
    WHEN p.subscription_tier = 'pro' THEN 'Pro'
    WHEN p.subscription_tier = 'enterprise' THEN 'Enterprise'
    WHEN p.subscription_tier IS NOT NULL THEN CONCAT(UPPER(SUBSTRING(p.subscription_tier, 1, 1)), SUBSTRING(p.subscription_tier, 2))
END
FROM profiles p
WHERE s.user_id = p.id 
AND s.plan_name IS NULL 
AND p.subscription_tier IS NOT NULL;

-- Update plan_name based on price_id (fallback)
UPDATE subscriptions 
SET plan_name = CASE 
    WHEN price_id = 'free' THEN 'Free'
    WHEN price_id = 'price_1SWZtk0IXvOI6chr8EHUTZ9R' THEN 'Starter'
    WHEN price_id = 'price_1SWZv10IXvOI6chr51Sdn99w' THEN 'Pro'
    WHEN price_id = 'price_1SWZvz0IXvOI6chrEHdJzkxv' THEN 'Enterprise'
    WHEN price_id LIKE '%starter%' THEN 'Starter'
    WHEN price_id LIKE '%pro%' THEN 'Pro'
    WHEN price_id LIKE '%enterprise%' THEN 'Enterprise'
END
WHERE plan_name IS NULL AND price_id IS NOT NULL;

-- Verify the updates
SELECT 
    s.id,
    s.user_id,
    s.price_id,
    s.plan_name,
    s.status,
    s.created_at,
    p.subscription_tier
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC;
