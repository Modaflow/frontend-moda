import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connected successfully')
    return { success: true, data }
  } catch (err) {
    console.error('Connection test failed:', err)
    return { success: false, error: 'Connection failed' }
  }
}

export async function testAuth() {
  try {
    // Test auth service
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Auth test error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Auth service working')
    return { success: true, session: data.session }
  } catch (err) {
    console.error('Auth test failed:', err)
    return { success: false, error: 'Auth test failed' }
  }
}