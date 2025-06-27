import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have placeholder values (development mode)
const isPlaceholderUrl = !supabaseUrl || supabaseUrl.includes('your_supabase_project_url_here')
const isPlaceholderKey = !supabaseAnonKey || supabaseAnonKey.includes('your_supabase_anon_key_here')

let supabase

if (isPlaceholderUrl || isPlaceholderKey) {
  console.warn('⚠️  Supabase not configured - using placeholder values')
  console.warn('To connect to Supabase:')
  console.warn('1. Click "Connect to Supabase" button in the top right')
  console.warn('2. Or manually update your .env file with actual Supabase credentials')
  
  // Create a mock client for development
  supabase = createClient(
    'https://placeholder.supabase.co',
    'placeholder-anon-key'
  )
} else {
  // Validate URL format for real credentials
  const urlPattern = /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/
  if (!urlPattern.test(supabaseUrl)) {
    throw new Error(`Invalid VITE_SUPABASE_URL format. Expected format: https://your-project-id.supabase.co\nCurrent value: ${supabaseUrl}`)
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }