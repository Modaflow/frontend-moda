-- Step 1: Find the actual constraint name
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'user_profiles' AND constraint_type = 'FOREIGN KEY';

-- Step 2: After running above, replace 'ACTUAL_NAME' with the real constraint name and run:
-- ALTER TABLE user_profiles DROP CONSTRAINT ACTUAL_NAME;

-- Step 3: Enable RLS and create policies (run this regardless)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create new policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view integrations" ON integrations;

CREATE POLICY "Anyone can view integrations" ON integrations
    FOR SELECT USING (true);