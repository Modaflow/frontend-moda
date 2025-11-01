import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  phone_number: string
  phone_verified: boolean
  avatar_url?: string
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}