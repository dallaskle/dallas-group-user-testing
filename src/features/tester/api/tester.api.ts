import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type Feature = Database['public']['Tables']['features']['Row']

export const testerApi = {
  /**
   * Fetch the test queue for the current tester
   */
  getQueue: async () => {
    console.log('Fetching queue...')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        testing_ticket:testing_tickets!inner(
          *,
          feature:features(*)
        )
      `)
      .eq('type', 'testing')
      .eq('assigned_to', user.id)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })

    console.log('Queue response:', { tickets, error })
    if (error) throw error
    return tickets as (Ticket & { testing_ticket: TestingTicket & { feature: Feature } })[]
  },

  /**
   * Claim a test ticket
   */
  claimTest: async (ticketId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-claim', {
      body: { ticketId },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Submit a validation for a test
   */
  submitValidation: async (validation: {
    ticketId: string
    featureId: string
    status: 'Working' | 'Needs Fixing'
    videoUrl: string
    notes?: string
  }) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-submit', {
      body: validation,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  /**
   * Get tester metrics
   */
  getMetrics: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-metrics', {
      body: {},
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  }
} 