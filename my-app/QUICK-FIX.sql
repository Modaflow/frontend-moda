-- First, drop the old foreign key constraint
ALTER TABLE user_profiles DROP CONSTRAINT fk_user_profiles_user;

-- Add new foreign key pointing to auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT fk_user_profiles_auth_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable Row Level Security on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;


-- Allow public read access to integrations table (for displaying available integrations)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;


-- Optional: Drop the custom users table if you're not using it
-- DROP TABLE IF EXISTS users;