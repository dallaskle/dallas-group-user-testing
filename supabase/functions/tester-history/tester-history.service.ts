import { SupabaseClient } from '../_shared/deps.ts'
import { Database } from '../_shared/database.types.ts'

export const getTesterHistory = async (
  client: SupabaseClient<Database>,
  userId: string
) => {
  const { data: tickets, error } = await client
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
    .in('status', ['resolved', 'closed'])
    .order('updated_at', { ascending: false })

  if (error) throw error
  return tickets
} 