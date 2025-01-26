import { SupabaseClient } from '../_shared/deps.ts'
import type { Database } from '../_shared/database.types.ts'

type User = Database['public']['Tables']['users']['Row']

export class UserGetService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getUser(userId: string): Promise<User> {
    console.log('Getting user data for:', userId)

    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      throw error
    }

    console.log('User data retrieved:', data)
    return data as User
  }
} 