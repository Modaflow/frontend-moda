-- Enable Row Level Security on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on user_integrations table
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own integrations
CREATE POLICY "Users can view own integrations" ON user_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON user_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON user_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON user_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Enable RLS on phone_verifications table
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own phone verifications
CREATE POLICY "Users can view own phone verifications" ON phone_verifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own phone verifications" ON phone_verifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own phone verifications" ON phone_verifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Enable RLS on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see and manage their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Allow public read access to integrations table (for displaying available integrations)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view integrations" ON integrations
    FOR SELECT USING (true);

-- Note: You'll need to run this SQL in your Supabase SQL editor
-- Also, you may need to drop your existing 'users' table since Supabase Auth 
-- manages users in the auth.users table automatically