import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nkxnkcsvtqbbczhnpokt.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reG5rY3N2dHFiYmN6aG5wb2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDA0OTQsImV4cCI6MjA4MDE3NjQ5NH0.2H5afg7qU880mzy1fvfG26fDMQV05lOGs7zPQAu_EtM'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side client (uses anon key if service role not available)
export function createServerClient() {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  )
}
