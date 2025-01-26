import { SupabaseClient } from '../_shared/deps.ts'

export class TesterGetService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getTesters() {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select('*')
      .eq('is_tester', true)
      .order('name')

    if (error) throw error

    console.log('Testers:', data)
    return data
  }
} 