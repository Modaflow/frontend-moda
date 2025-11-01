import { supabase } from './supabase'

export async function setupDatabase() {
  try {
    // First, let's check if user_profiles table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_profiles')

    if (tablesError) {
      console.error('Error checking tables:', tablesError)
      return { success: false, error: 'Could not check database tables' }
    }

    if (!tables || tables.length === 0) {
      return { 
        success: false, 
        error: 'user_profiles table does not exist. Please create it in your Supabase dashboard.' 
      }
    }

    // Test if we can query the table
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count', { count: 'exact', head: true })

    if (error) {
      return { 
        success: false, 
        error: `Table exists but cannot query: ${error.message}` 
      }
    }

    return { success: true, message: 'Database is ready!' }

  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function createUserProfilesTable() {
  // This would need to be run with service role key, not anon key
  // For now, we'll just return instructions
  return {
    success: false,
    error: 'Please create the user_profiles table manually in Supabase SQL editor',
    sql: `
CREATE TABLE user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone_number text NOT NULL DEFAULT '',
  phone_verified boolean DEFAULT false,
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
    `
  }
}