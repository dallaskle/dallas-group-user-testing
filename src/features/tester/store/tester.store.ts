import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Database } from '@/shared/types/database.types'
import { testerApi } from '../api/tester.api'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type Feature = Database['public']['Tables']['features']['Row']

type EnhancedTicket = Ticket & {
  testing_ticket: TestingTicket & {
    feature: Feature
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