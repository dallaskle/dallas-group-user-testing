import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ticketsApi } from '../api/tickets.api'
import type {
  TicketResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  ListTicketsRequest,
  TicketAuditLogEntry,
} from '../api/types'

interface TicketsState {
  tickets: TicketResponse[]
  selectedTicket: TicketResponse | null
  auditLogs: TicketAuditLogEntry[]
  isLoading: boolean
  error: Error | null
  total: number
  page: number
  limit: number
  filters: ListTicketsRequest
  currentAuditLogId?: string // Track current audit log request
}

interface TicketsActions {
  // Fetch actions
  fetchTickets: (request?: ListTicketsRequest) => Promise<void>
  fetchTicketById: (id: string) => Promise<void>
  
  // Audit log actions
  fetchAuditLog: (ticketId?: string) => Promise<void>
  
  // Mutation actions
  createTicket: (request: CreateTicketRequest) => Promise<void>
  updateTicket: (request: UpdateTicketRequest) => Promise<void>
  assignTicket: (id: string, assignedTo: string | null) => Promise<void>
  transitionTicket: (id: string, status: string) => Promise<void>
  
  // Local state actions
  setSelectedTicket: (ticket: TicketResponse | null) => void
  setFilters: (filters: Partial<ListTicketsRequest>) => void
  clearError: () => void
  clearAuditLog: () => void
}

export const useTicketsStore = create<TicketsState & TicketsActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      tickets: [],
      selectedTicket: null,
      auditLogs: [],
      isLoading: false,
      error: null,
      total: 0,
      page: 1,
      limit: 10,
      filters: {},
      currentAuditLogId: undefined,

      // Fetch actions
      fetchTickets: async (request) => {
        try {
          set({ isLoading: true, error: null })
          const response = await ticketsApi.list({ ...get().filters, ...request })
          set({
            tickets: response.tickets,
            total: response.total,
            page: response.page,
            limit: response.limit,
          })
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      fetchTicketById: async (id) => {
        try {
          set({ isLoading: true, error: null })
          const ticket = await ticketsApi.getById(id)
          set({ selectedTicket: ticket })
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      // Audit log actions
      fetchAuditLog: async (ticketId?: string) => {
        const currentState = get()
        
        // Prevent duplicate requests for the same ticket
        if (currentState.currentAuditLogId === ticketId && currentState.auditLogs.length > 0) {
          return
        }

        try {
          set({ isLoading: true, error: null, currentAuditLogId: ticketId })
          const response = await ticketsApi.getAuditLog(ticketId)
          set({ auditLogs: response.audit_logs })
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      clearAuditLog: () => set({ auditLogs: [], currentAuditLogId: undefined }),

      // Mutation actions
      createTicket: async (request) => {
        try {
          set({ isLoading: true, error: null })
          const ticket = await ticketsApi.create(request)
          set((state) => ({
            tickets: [ticket, ...state.tickets],
            total: state.total + 1,
          }))
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      updateTicket: async (request) => {
        try {
          set({ isLoading: true, error: null })
          const updatedTicket = await ticketsApi.update(request)
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id ? updatedTicket : t
            ),
            selectedTicket:
              state.selectedTicket?.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id
                ? updatedTicket
                : state.selectedTicket,
          }))
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      assignTicket: async (id, assignedTo) => {
        try {
          set({ isLoading: true, error: null })
          const updatedTicket = await ticketsApi.assign(id, assignedTo)
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id ? updatedTicket : t
            ),
            selectedTicket:
              state.selectedTicket?.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id
                ? updatedTicket
                : state.selectedTicket,
          }))
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      transitionTicket: async (id, status) => {
        try {
          set({ isLoading: true, error: null })
          const updatedTicket = await ticketsApi.transition(id, status)
          set((state) => ({
            tickets: state.tickets.map((t) =>
              t.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id ? updatedTicket : t
            ),
            selectedTicket:
              state.selectedTicket?.ticket_data.ticket.id === updatedTicket.ticket_data.ticket.id
                ? updatedTicket
                : state.selectedTicket,
          }))
        } catch (error) {
          set({ error: error as Error })
        } finally {
          set({ isLoading: false })
        }
      },

      // Local state actions
      setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),
      clearError: () => set({ error: null }),
    }),
    { name: 'tickets-store' }
  )
) 