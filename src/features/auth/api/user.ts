import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/supabase'

export type UserResponse = {
  data?: Tables<'users'>
  error?: string
}

export const getUser = async (token: string): Promise<UserResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('user-get', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (error) throw error
    return { data }
  } catch (error) {
    console.error('Error getting user:', error)
    return { error: error instanceof Error ? error.message : 'Failed to get user data' }
  }
}
