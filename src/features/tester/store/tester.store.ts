import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Database } from '@/shared/types/database.types'
import { testerApi } from '../api/tester.api'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row']
type Feature = Database['public']['Tables']['features']['Row']

interface TesterState {
  queue: (Ticket & { testing_ticket: TestingTicket; feature: Feature })[]
  currentTest: (Ticket & { testing_ticket: TestingTicket; feature: Feature }) | null
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
  claimTest: (ticketId: string) => Promise<void>
  submitValidation: (validation: {
    ticketId: string
    featureId: string
    status: 'Working' | 'Needs Fixing'
    videoUrl: string
    notes?: string
  }) => Promise<void>
  
  // Local state management
  setCurrentTest: (test: TesterState['currentTest']) => void
  clearError: () => void
}

export const useTesterStore = create<TesterState & TesterActions>()(
  devtools(
    (set) => ({
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

      claimTest: async (ticketId: string) => {
        try {
          set({ isLoading: true, error: null })
          // TODO: Implement API call to claim test
          console.log('Claiming test:', ticketId)
          // This will be implemented when we create the edge function
          set({ isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      submitValidation: async (validation) => {
        try {
          set({ isLoading: true, error: null })
          // TODO: Implement API call to submit validation
          console.log('Submitting validation:', validation)
          // This will be implemented when we create the edge function
          set({ isLoading: false })
        } catch (error) {
          set({ error: error as Error, isLoading: false })
        }
      },

      // Local state management
      setCurrentTest: (test) => set({ currentTest: test }),
      clearError: () => set({ error: null })
    }),
    { name: 'tester-store' }
  )
) 