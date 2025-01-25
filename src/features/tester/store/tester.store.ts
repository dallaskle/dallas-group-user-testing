import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Database } from '@/database.types'
import { testerApi } from '../api/tester.api'

type User = Database['public']['Tables']['users']['Row']
type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type Validation = Database['public']['Tables']['validations']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']

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

interface TesterState {
  queue: EnhancedTicket[]
  currentTest: EnhancedTicket | null
  isLoading: boolean
  error: Error | null
  metrics: {
    testsCompleted: number
    accuracyRate: number
    avgResponseTime: number
    validationRate: number
  }
  ticketHistory: EnhancedTicket[]
}

interface TesterActions {
  // Queue management
  fetchQueue: () => Promise<void>
  submitValidation: (validation: {
    ticketId: string
    featureId: string
    status: 'Working' | 'Needs Fixing'
    videoUrl: string
    notes?: string
  }) => Promise<void>
  
  // Ticket history
  fetchTicketHistory: () => Promise<void>
  
  // Local state management
  setCurrentTest: (test: TesterState['currentTest']) => void
  setCurrentTestById: (id: string) => void
  clearError: () => void
}

export const useTesterStore = create<TesterState & TesterActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      queue: [],
      currentTest: null,
      isLoading: false,
      error: null,
      metrics: {
        testsCompleted: 0,
        accuracyRate: 0,
        avgResponseTime: 0,
        validationRate: 0
      },
      ticketHistory: [],

      // Queue management
      fetchQueue: async () => {
        try {
          set({ isLoading: true, error: null })
          const tickets = await testerApi.getQueue()
          set({ queue: tickets, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      submitValidation: async (validation) => {
        try {
          set({ isLoading: true, error: null })
          await testerApi.submitValidation(validation)
          set({ 
            currentTest: null,
            isLoading: false
          })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
          throw error
        }
      },

      // Ticket history
      fetchTicketHistory: async () => {
        try {
          set({ isLoading: true, error: null })
          const tickets = await testerApi.getTicketHistory()
          set({ ticketHistory: tickets, isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      // Local state management
      setCurrentTest: (test) => set({ currentTest: test }),
      setCurrentTestById: (id) => {
        const test = get().queue.find(t => t.id === id)
        if (test) {
          set({ currentTest: test })
        }
      },
      clearError: () => set({ error: null })
    }),
    { name: 'tester-store' }
  )
) 