import { SupabaseClient } from '../_shared/deps.ts'

export class FeatureTestersService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getFeatureTestingTickets(featureId: string) {
    const { data, error } = await this.supabaseClient
      .from('testing_tickets')
      .select(`
        *,
        tickets (
          assigned_to,
          title,
          status,
          assigned_to_user:users!tickets_assigned_to_fkey (
            name,
            email
          )
        )
      `)
      .eq('feature_id', featureId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    console.log('Feature testing tickets response:', data)
    return data || []
  }
} 