import { SupabaseClient } from '../_shared/deps.ts'
import type { Database } from '../../../src/database.types.ts'

type Tables = Database['public']['Tables']
type Ticket = Tables['tickets']['Row']
type TestingTicket = Tables['testing_tickets']['Row']
type Feature = Tables['features']['Row']
type Validation = Tables['validations']['Row']
type User = Tables['users']['Row']
type Project = Tables['projects']['Row']

export class TesterQueueService {
  constructor(private readonly supabaseClient: SupabaseClient) {}

  async getQueue(userId: string) {
    const { data: tickets, error } = await this.supabaseClient
      .from('tickets')
      .select(`
        *,
        created_by_user:users!tickets_created_by_fkey(*),
        testing_ticket:testing_tickets!inner(
          *,
          feature:features(
            *,
            project:projects(
              *,
              student:users(*)
            ),
            validations(
              *,
              validated_by:users(*)
            )
          ),
          validation:validations(
            *,
            validated_by:users(*)
          )
        )
      `)
      .eq('type', 'testing')
      .eq('assigned_to', userId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return tickets
  }
} 