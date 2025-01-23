import { create } from 'zustand'
import { ticketManagementApi, type TicketWithDetails, type TicketStats } from '../api/ticketManagement'

interface TicketFilters {
  status?: string[]
  priority?: string[]
  type?: string[]
  assignedTo?: string
}

interface TicketManagementState {
  tickets: TicketWithDetails[]
  stats: TicketStats | null
  selectedTickets: string[]
  filters: TicketFilters
  isLoading: boolean
  error: string | null

  // Actions
  fetchTickets: () => Promise<void>
  fetchStats: () => Promise<void>
  updateTicket: (id: string, data: Parameters<typeof ticketManagementApi.updateTicket>[1]) => Promise<void>
  deleteTicket: (id: string) => Promise<void>
  bulkUpdateTickets: (data: Parameters<typeof ticketManagementApi.bulkUpdateTickets>[1]) => Promise<void>
  setFilters: (filters: Partial<TicketFilters>) => void
  toggleTicketSelection: (id: string) => void
  clearSelectedTickets: () => void
}

export const useTicketManagement = create<TicketManagementState>((set, get) => ({
  tickets: [],
  stats: null,
  selectedTickets: [],
  filters: {},
  isLoading: false,
  error: null,

  fetchTickets: async () => {
    set({ isLoading: true, error: null })
    try {
      const tickets = await ticketManagementApi.getTickets(get().filters)
      set({ tickets, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchStats: async () => {
    try {
      const stats = await ticketManagementApi.getTicketStats()
      set({ stats })
    } catch (error) {
      console.error('Error fetching ticket stats:', error)
    }
  },

  updateTicket: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await ticketManagementApi.updateTicket(id, data)
      await get().fetchTickets()
      await get().fetchStats()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteTicket: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await ticketManagementApi.deleteTicket(id)
      await get().fetchTickets()
      await get().fetchStats()
      set(state => ({
        selectedTickets: state.selectedTickets.filter(ticketId => ticketId !== id)
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  bulkUpdateTickets: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await ticketManagementApi.bulkUpdateTickets(get().selectedTickets, data)
      await get().fetchTickets()
      await get().fetchStats()
      set({ selectedTickets: [] })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  setFilters: (filters) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }))
    get().fetchTickets()
  },

  toggleTicketSelection: (id) => {
    set(state => ({
      selectedTickets: state.selectedTickets.includes(id)
        ? state.selectedTickets.filter(ticketId => ticketId !== id)
        : [...state.selectedTickets, id]
    }))
  },

  clearSelectedTickets: () => {
    set({ selectedTickets: [] })
  }
})) 