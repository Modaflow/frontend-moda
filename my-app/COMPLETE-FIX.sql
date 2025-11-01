-- Step 1: Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Step 2: Drop the public.users table (we don't need it)
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 3: Add foreign key to auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_auth_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 4: Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create NEW policies with correct logic
-- Allow users to SELECT their own profile
CREATE POLICY "Users can view own profile" 
ON user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to INSERT their own profile
CREATE POLICY "Users can insert own profile" 
ON user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile" 
ON user_profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Step 6: Fix integrations table
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view integrations" ON integrations;

CREATE POLICY "Anyone can view integrations" 
ON integrations 
FOR SELECT 
TO authenticated
USING (true);

-- Step 7: Fix other tables that reference public.users
-- Drop foreign keys from other tables
ALTER TABLE phone_verifications DROP CONSTRAINT IF EXISTS fk_phone_verifications_user;
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS fk_sessions_user;
ALTER TABLE user_integrations DROP CONSTRAINT IF EXISTS fk_user_integrations_user;

-- Add new foreign keys to auth.users
ALTER TABLE phone_verifications 
ADD CONSTRAINT fk_phone_verifications_auth_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE sessions 
ADD CONSTRAINT fk_sessions_auth_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_integrations 
ADD CONSTRAINT fk_user_integrations_auth_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;