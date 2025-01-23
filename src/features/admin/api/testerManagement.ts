import { supabase } from '@/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type User = Database['public']['Tables']['users']['Row']

export interface TesterWithStats extends User {
  validationCount: number
  successRate: number
  averageResponseTime: number
  activeTickets: number
  completedTickets: number
}

export const testerManagementApi = {
  async getTesters(): Promise<TesterWithStats[]> {
    // First, get all users who are testers
    const { data: testers, error } = await supabase
      .from('users')
      .select(`
        *,
        validations:validations(count),
        assigned_tickets:tickets!tickets_assigned_to_fkey(count)
      `)
      .eq('is_tester', true)
      .order('name')

    if (error) {
      console.error('Error fetching testers:', error)
      throw error
    }

    // Get validation success rates
    const validationStats = await Promise.all(
      testers.map(async (tester) => {
        const { count: successCount } = await supabase
          .from('validations')
          .select('*', { count: 'exact', head: true })
          .eq('validated_by', tester.id)
          .eq('status', 'Working')

        const { count: totalCount } = await supabase
          .from('validations')
          .select('*', { count: 'exact', head: true })
          .eq('validated_by', tester.id)

        return {
          id: tester.id,
          successRate: totalCount ? (successCount || 0) / totalCount * 100 : 0
        }
      })
    )

    // Get ticket stats
    const ticketStats = await Promise.all(
      testers.map(async (tester) => {
        const { count: activeCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', tester.id)
          .in('status', ['open', 'in_progress'])

        const { count: completedCount } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', tester.id)
          .in('status', ['resolved', 'closed'])

        return {
          id: tester.id,
          activeTickets: activeCount || 0,
          completedTickets: completedCount || 0
        }
      })
    )

    return testers.map(tester => {
      const validationStat = validationStats.find(stat => stat.id === tester.id)
      const ticketStat = ticketStats.find(stat => stat.id === tester.id)

      return {
        ...tester,
        validationCount: (tester.validations as any)?.count || 0,
        successRate: validationStat?.successRate || 0,
        averageResponseTime: 0, // TODO: Calculate from ticket response times
        activeTickets: ticketStat?.activeTickets || 0,
        completedTickets: ticketStat?.completedTickets || 0
      }
    })
  },

  async updateTesterStatus(id: string, data: {
    is_tester: boolean
  }): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role: data.is_tester ? 'tester' : 'user' })
      .eq('id', id)

    if (error) {
      console.error('Error updating tester status:', error)
      throw error
    }
  },

  async assignTicket(testerId: string, ticketId: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: testerId })
      .eq('id', ticketId)

    if (error) {
      console.error('Error assigning ticket:', error)
      throw error
    }
  },

  async reassignTickets(fromTesterId: string, toTesterId: string): Promise<void> {
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: toTesterId })
      .eq('assigned_to', fromTesterId)
      .in('status', ['open', 'in_progress'])

    if (error) {
      console.error('Error reassigning tickets:', error)
      throw error
    }
  }
} 