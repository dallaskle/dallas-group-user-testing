import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type Validation = Database['public']['Tables']['validations']['Row']
type User = Database['public']['Tables']['users']['Row']
type Project = Database['public']['Tables']['projects']['Row']

type EnhancedValidation = Validation & {
  validated_by: User
}

type EnhancedFeature = Feature & {
  project: Project & {
    student: User
  }
  validations: EnhancedValidation[]
}

type EnhancedTicket = Ticket & {
  created_by_user: User
  testing_ticket: TestingTicket & {
    feature: EnhancedFeature
    validation: EnhancedValidation | null
  }
}

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
      .eq('assigned_to', user.id)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })

    console.log('Queue response:', { tickets, error })
    if (error) throw error
    return tickets as EnhancedTicket[]
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
   * Upload a file attachment for validation
   */
  uploadAttachment: async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    // Create a unique filename using UUID v4
    const filename = `${crypto.randomUUID()}-${file.name}`

    // Upload to Supabase Storage
    const { error: storageError, data } = await supabase.storage
      .from('test-attachments')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (storageError) throw storageError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('test-attachments')
      .getPublicUrl(filename)

    return publicUrl
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
  },

  /**
   * Get tester's completed ticket history
   */
  getTicketHistory: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user logged in')

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        testing_ticket:testing_tickets!inner(
          *,
          feature:features(*),
          validation:validations(*)
        )
      `)
      .eq('type', 'testing')
      .eq('assigned_to', user.id)
      .in('status', ['resolved', 'closed'])
      .order('updated_at', { ascending: false })

    if (error) throw error
    return tickets as EnhancedTicket[]
  }
} 