import { create } from 'zustand'
import { testerManagementApi, type TesterWithStats } from '../api/testerManagement'

interface TesterManagementState {
  testers: TesterWithStats[]
  isLoading: boolean
  error: string | null
  selectedTester: TesterWithStats | null

  // Actions
  fetchTesters: () => Promise<void>
  updateTesterStatus: (id: string, isActive: boolean) => Promise<void>
  assignTicket: (testerId: string, ticketId: string) => Promise<void>
  reassignTickets: (fromTesterId: string, toTesterId: string) => Promise<void>
  selectTester: (tester: TesterWithStats | null) => void
}

export const useTesterManagement = create<TesterManagementState>((set, get) => ({
  testers: [],
  isLoading: false,
  error: null,
  selectedTester: null,

  fetchTesters: async () => {
    set({ isLoading: true, error: null })
    try {
      const testers = await testerManagementApi.getTesters()
      set({ testers, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateTesterStatus: async (id, isActive) => {
    set({ isLoading: true, error: null })
    try {
      await testerManagementApi.updateTesterStatus(id, { is_tester: isActive })
      await get().fetchTesters()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  assignTicket: async (testerId, ticketId) => {
    set({ isLoading: true, error: null })
    try {
      await testerManagementApi.assignTicket(testerId, ticketId)
      await get().fetchTesters()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  reassignTickets: async (fromTesterId, toTesterId) => {
    set({ isLoading: true, error: null })
    try {
      await testerManagementApi.reassignTickets(fromTesterId, toTesterId)
      await get().fetchTesters()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  selectTester: (tester) => {
    set({ selectedTester: tester })
  }
})) 