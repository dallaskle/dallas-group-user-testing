import { createClient } from '@supabase/supabase-js'
import type { Database } from '../shared/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Initializing Supabase client with:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
})

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Table types
export type User = Tables<'users'>
export type ProjectRegistry = Tables<'project_registry'>
export type FeatureRegistry = Tables<'feature_registry'>
export type Project = Tables<'projects'>
export type Feature = Tables<'features'>
export type Validation = Tables<'validations'>
export type Comment = Tables<'comments'> 