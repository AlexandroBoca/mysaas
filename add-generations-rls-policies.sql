-- RLS Policies for Generations Table
-- Run these commands in your Supabase SQL Editor

-- 1. Enable RLS on the generations table (if not already enabled)
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow users to read their own generations
CREATE POLICY "Users can view own generations" ON generations
    FOR SELECT USING (user_id = auth.uid());

-- 3. Create policy to allow users to insert their own generations
CREATE POLICY "Users can insert own generations" ON generations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 4. Create policy to allow users to update their own generations
CREATE POLICY "Users can update own generations" ON generations
    FOR UPDATE USING (user_id = auth.uid());

-- 5. Create policy to allow users to delete their own generations
CREATE POLICY "Users can delete own generations" ON generations
    FOR DELETE USING (user_id = auth.uid());

-- 6. Alternative: If you want to allow all authenticated users to delete any generation
-- (Use this instead of #5 if you want less restrictive delete access)
-- CREATE POLICY "Authenticated users can delete generations" ON generations
--     FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Check existing policies (optional - for debugging)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'generations';

-- 8. If you need to replace existing policies, use these commands:
-- DROP POLICY IF EXISTS "Users can view own generations" ON generations;
-- DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
-- DROP POLICY IF EXISTS "Users can update own generations" ON generations;
-- DROP POLICY IF EXISTS "Users can delete own generations" ON generations;

-- 9. Grant necessary permissions to authenticated users
GRANT ALL ON generations TO authenticated;
