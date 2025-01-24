import { create } from 'zustand'
import * as api from '../api/adminDashboard.api'
import type { 
  ActivityItem, 
  ProjectDetails, 
  ProjectRegistryDetails,
  TesterPerformanceData,
  TestHistoryItem,
  TicketResponse,
  ListTicketsRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketAuditLogEntry,
  TicketStatus,
  TesterUser
} from '../api/adminDashboard.api'

export interface TesterStats {
  name: string
  testsPending: number
  testsCompleted: number
  lastTestCompleted: string | null
}

export interface ProjectProgress {
  status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
  project: {
    name: string
  } | null
}

interface AdminDashboardState {
  projectRegistriesCount: number
  totalProjectsCount: number
  pendingValidationsCount: number
  pendingTestsCount: number
  totalTestersCount: number
  projectProgress: ProjectProgress[]
  testerPerformance: TesterPerformanceData[]
  testHistory: TestHistoryItem[]
  activities: ActivityItem[]
  projects: ProjectDetails[]
  projectRegistries: ProjectRegistryDetails[]
  selectedTimeframe: number
  isLoading: boolean
  isAuditLogLoading: boolean
  error: string | null
  fetchOverviewData: () => Promise<void>
  fetchActivities: (days?: number) => Promise<void>
  fetchProjects: () => Promise<void>
  fetchProjectRegistries: () => Promise<void>
  fetchTesterPerformance: () => Promise<void>
  fetchTestHistory: () => Promise<void>
  setSelectedTimeframe: (days: number) => void
  tickets: TicketResponse[]
  selectedTicket: TicketResponse | null
  ticketAuditLogs: TicketAuditLogEntry[]
  ticketFilters: ListTicketsRequest
  ticketsTotal: number
  ticketsPage: number
  ticketsLimit: number
  currentTicketAuditLogId?: string
  testers: TesterUser[]
}

interface AdminDashboardActions {
  fetchTickets: (request?: ListTicketsRequest) => Promise<void>
  fetchTicketById: (id: string) => Promise<void>
  fetchTicketAuditLog: (ticketId?: string) => Promise<void>
  createTicket: (request: CreateTicketRequest) => Promise<void>
  updateTicket: (request: UpdateTicketRequest) => Promise<void>
  assignTicket: (id: string, assignedTo: string | null) => Promise<void>
  transitionTicket: (id: string, status: TicketStatus) => Promise<void>
  deleteTicket: (id: string) => Promise<void>
  setSelectedTicket: (ticket: TicketResponse | null) => void
  setTicketFilters: (filters: Partial<ListTicketsRequest>) => void
  clearTicketAuditLog: () => void
  fetchTesters: () => Promise<void>
}

export const useAdminDashboardStore = create<AdminDashboardState & AdminDashboardActions>((set, get) => ({
  projectRegistriesCount: 0,
  totalProjectsCount: 0,
  pendingValidationsCount: 0,
  pendingTestsCount: 0,
  totalTestersCount: 0,
  projectProgress: [],
  testerPerformance: [],
  testHistory: [],
  activities: [],
  projects: [],
  projectRegistries: [],
  selectedTimeframe: 7,
  isLoading: false,
  isAuditLogLoading: false,
  error: null,
  tickets: [],
  selectedTicket: null,
  ticketAuditLogs: [],
  ticketFilters: {},
  ticketsTotal: 0,
  ticketsPage: 1,
  ticketsLimit: 10,
  currentTicketAuditLogId: undefined,
  testers: [],

  fetchOverviewData: async () => {
    set({ isLoading: true, error: null })
    try {
      const [
        projectRegistriesCount,
        totalProjectsCount,
        pendingValidationsCount,
        pendingTestsCount,
        totalTestersCount,
        projectProgress,
        testerPerformance
      ] = await Promise.all([
        api.getProjectRegistriesCount(),
        api.getTotalProjectsCount(),
        api.getPendingValidationsCount(),
        api.getPendingTestsCount(),
        api.getTotalTestersCount(),
        api.getProjectProgress(),
        api.getTesterPerformance()
      ])

      set({
        projectRegistriesCount,
        totalProjectsCount,
        pendingValidationsCount,
        pendingTestsCount,
        totalTestersCount,
        projectProgress,
        testerPerformance,
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
        isLoading: false 
      })
    }
  },

  fetchActivities: async (days?: number) => {
    set({ isLoading: true, error: null })
    try {
      const timeframe = days ?? get().selectedTimeframe
      const activities = await api.getRecentActivity(timeframe)
      set({ activities, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch activities',
        isLoading: false
      })
    }
  },

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await api.getProjectsWithDetails()
      set({ projects, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false
      })
    }
  },

  fetchProjectRegistries: async () => {
    set({ isLoading: true, error: null })
    try {
      const projectRegistries = await api.getProjectRegistriesWithDetails()
      set({ projectRegistries, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch project registries',
        isLoading: false
      })
    }
  },

  fetchTesterPerformance: async () => {
    set({ isLoading: true, error: null })
    try {
      const testerPerformance = await api.getTesterPerformance()
      set({ testerPerformance, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tester performance',
        isLoading: false
      })
    }
  },

  fetchTestHistory: async () => {
    set({ isLoading: true, error: null })
    try {
      const testHistory = await api.getTestHistory()
      set({ testHistory, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch test history',
        isLoading: false
      })
    }
  },

  setSelectedTimeframe: (days: number) => {
    set({ selectedTimeframe: days })
  },

  fetchTickets: async (request?: ListTicketsRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.getTickets({ ...get().ticketFilters, ...request })
      set({
        tickets: response.tickets,
        ticketsTotal: response.total,
        ticketsPage: response.page,
        ticketsLimit: response.limit,
      })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch tickets' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTicketById: async (id) => {
    const currentState = get()
    if (currentState.selectedTicket?.ticket_data.ticket.id === id) {
      return
    }

    set({ isLoading: true, error: null })
    try {
      const ticket = await api.getTicketById(id)
      set({ selectedTicket: ticket })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch ticket' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTicketAuditLog: async (ticketId?: string) => {
    const currentState = get()
    
    if (!ticketId || 
        currentState.isAuditLogLoading || 
        (currentState.currentTicketAuditLogId === ticketId && currentState.ticketAuditLogs.length > 0)) {
      return
    }

    set({ isAuditLogLoading: true, error: null })
    try {
      const response = await api.getTicketAuditLog(ticketId)
      set({ 
        ticketAuditLogs: response.audit_logs, 
        isAuditLogLoading: false,
        currentTicketAuditLogId: ticketId,
        error: null
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch audit log',
        isAuditLogLoading: false,
        ticketAuditLogs: [],
        currentTicketAuditLogId: undefined
      })
    }
  },

  createTicket: async (request) => {
    set({ isLoading: true, error: null })
    try {
      const ticket = await api.createTicket(request)
      set((state) => ({
        tickets: [ticket, ...state.tickets],
        ticketsTotal: state.ticketsTotal + 1,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create ticket' })
    } finally {
      set({ isLoading: false })
    }
  },

  updateTicket: async (request) => {
    try {
      const updatedTicket = await api.updateTicket(request)
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
      set({ error: error instanceof Error ? error.message : 'Failed to update ticket' })
    }
  },

  assignTicket: async (id, assignedTo) => {
    set({ isLoading: true, error: null })
    try {
      await api.assignTicket(id, assignedTo)
      const updatedTicket = await api.getTicketById(id)
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
      set({ error: error instanceof Error ? error.message : 'Failed to assign ticket' })
    } finally {
      set({ isLoading: false })
    }
  },

  transitionTicket: async (id, status) => {
    set({ isLoading: true, error: null })
    try {
      const updatedTicket = await api.transitionTicket(id, status)
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
      set({ error: error instanceof Error ? error.message : 'Failed to transition ticket' })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteTicket: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.deleteTicket(id)
      set((state) => ({
        tickets: state.tickets.filter((t) => t.ticket_data.ticket.id !== id),
        selectedTicket:
          state.selectedTicket?.ticket_data.ticket.id === id
            ? null
            : state.selectedTicket,
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete ticket' })
    } finally {
      set({ isLoading: false })
    }
  },

  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  
  setTicketFilters: (filters) =>
    set((state) => ({ ticketFilters: { ...state.ticketFilters, ...filters } })),
  
  clearTicketAuditLog: () => 
    set({ 
      ticketAuditLogs: [], 
      currentTicketAuditLogId: undefined,
      error: null 
    }),

  fetchTesters: async () => {
    set({ isLoading: true, error: null })
    try {
      const testers = await api.getTesters()
      set({ testers, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch testers',
        isLoading: false
      })
    }
  },
}))
