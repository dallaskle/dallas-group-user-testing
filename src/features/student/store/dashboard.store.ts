import { create } from 'zustand'
import { studentDashboardApi } from '../api/studentDashboard.api'
import { Database } from '@/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']

export interface DashboardProject extends Project {
  registry: {
    name: string
  }
  features: Feature[]
  feature_count: number
  validation_count: number
  required_validation_count: number
}

export interface DashboardStats {
  total_projects: number
  total_features: number
  total_validations: number
  required_validations: number
  validation_completion: number
  projects_by_status: {
    not_started: number
    in_progress: number
    successful: number
    failed: number
  }
}

export interface RecentActivity {
  type: 'validation' | 'comment' | 'ticket'
  id: string
  created_at: string
  project_name: string
  feature_name: string
  details: {
    status?: string
    content?: string
    title?: string
  }
}

export interface OutstandingTestingTicket {
  id: string
  deadline: string
  feature: {
    name: string
    project: {
      name: string
    }
    current_validations: number
    required_validations: number
  }
  ticket: {
    title: string
    status: string
    priority: string
    assignedTo?: {
      name: string
    }
  }
  validation?: {
    status: string
    notes?: string
  }
}

interface DashboardState {
  isLoading: boolean
  error: Error | null
  data: {
    projects: DashboardProject[]
    stats: DashboardStats
    recentActivity: RecentActivity[]
  } | null
  outstandingTickets: OutstandingTestingTicket[]
  loadDashboardData: () => Promise<void>
  loadOutstandingTickets: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: false,
  error: null,
  data: null,
  outstandingTickets: [],

  loadDashboardData: async () => {
    try {
      set({ isLoading: true, error: null })
      const data = await studentDashboardApi.getDashboardData()
      set({ data, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  loadOutstandingTickets: async () => {
    try {
      set({ isLoading: true, error: null })
      const tickets = await studentDashboardApi.getOutstandingTestingTickets()
      set({ outstandingTickets: tickets, isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  }
}))
