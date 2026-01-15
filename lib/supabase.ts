import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for frontend usage (Row Level Security protected)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to check if we are configured
export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey
}
