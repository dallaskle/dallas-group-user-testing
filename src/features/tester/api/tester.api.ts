import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import { useAuthStore } from '@/features/auth/store/auth.store'

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
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-queue', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as EnhancedTicket[]
  },

  /**
   * Claim a test ticket
   */
  claimTest: async (ticketId: string) => {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

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
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

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
  getMetrics: async (timePeriod: '1d' | '7d' | '30d' | 'all' = 'all') => {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-metrics', {
      body: { timePeriod },
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
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')
    
    const { data, error } = await supabase.functions.invoke('tester-history', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as EnhancedTicket[]
  },

  /**
   * Upload video content (supports both File and Blob)
   */
  uploadVideo: async (content: File | Blob, options?: {
    ticketId?: string
    contentType?: string
  }) => {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    // Determine content type
    let contentType = options?.contentType
    if (!contentType) {
      if (content instanceof File) {
        if (!content.type.startsWith('video/')) {
          throw new Error('Please select a video file')
        }
        contentType = content.type
      } else {
        contentType = 'video/webm' // Default for Blob recordings
      }
    }

    // Create a unique filename
    const filename = options?.ticketId
      ? `${options.ticketId}-${Date.now()}.${contentType.split('/')[1]}`
      : `${crypto.randomUUID()}-${Date.now()}.${contentType.split('/')[1]}`

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('test-recordings')
      .upload(filename, content, {
        cacheControl: '3600',
        upsert: true,
        contentType
      })

    if (storageError) throw storageError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('test-recordings')
      .getPublicUrl(filename)

    return publicUrl
  },

  /**
   * Get all available testers
   */
  getTesters: async () => {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('tester-get', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as User[]
  }
} 