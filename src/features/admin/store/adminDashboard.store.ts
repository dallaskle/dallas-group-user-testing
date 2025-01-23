import { create } from 'zustand'
import { adminDashboardApi } from '../api/adminDashboard.api'

interface AdminDashboardState {
  // Global Metrics
  metrics: {
    totalProjects: number
    totalFeatures: number
    pendingValidations: number
    totalTesters: number
    activeTesters: number
  } | null
  isLoadingMetrics: boolean
  
  // Recent Activity
  recentActivity: {
    id: string
    type: 'project_created' | 'validation_submitted' | 'ticket_created' | 'feature_created'
    title: string
    description: string
    timestamp: string
    entityId: string
    entityType: string
  }[]
  isLoadingActivity: boolean

  // Tester Metrics
  testerMetrics: {
    id: string
    name: string
    email: string
    validationsCompleted: number
    ticketsAssigned: number
    qaScore: number
    averageResolutionTime: number
  }[]
  isLoadingTesterMetrics: boolean

  // Project Registry Stats
  registryStats: {
    id: string
    name: string
    totalFeatures: number
    projectsCreated: number
    lastUsed: string
  }[]
  isLoadingRegistryStats: boolean

  // Actions
  fetchGlobalMetrics: () => Promise<void>
  fetchRecentActivity: (limit?: number) => Promise<void>
  fetchTesterMetrics: () => Promise<void>
  fetchRegistryStats: () => Promise<void>
  fetchAllData: () => Promise<void>
}

export const useAdminDashboard = create<AdminDashboardState>((set, get) => ({
  // Initial State
  metrics: null,
  isLoadingMetrics: false,
  recentActivity: [],
  isLoadingActivity: false,
  testerMetrics: [],
  isLoadingTesterMetrics: false,
  registryStats: [],
  isLoadingRegistryStats: false,

  // Actions
  fetchGlobalMetrics: async () => {
    set({ isLoadingMetrics: true })
    try {
      const metrics = await adminDashboardApi.getGlobalMetrics()
      set({ metrics, isLoadingMetrics: false })
    } catch (error) {
      console.error('Error fetching global metrics:', error)
      set({ isLoadingMetrics: false })
    }
  },

  fetchRecentActivity: async (limit = 10) => {
    set({ isLoadingActivity: true })
    try {
      const activity = await adminDashboardApi.getRecentActivity(limit)
      set({ recentActivity: activity, isLoadingActivity: false })
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      set({ isLoadingActivity: false })
    }
  },

  fetchTesterMetrics: async () => {
    set({ isLoadingTesterMetrics: true })
    try {
      const metrics = await adminDashboardApi.getTesterMetrics()
      set({ testerMetrics: metrics, isLoadingTesterMetrics: false })
    } catch (error) {
      console.error('Error fetching tester metrics:', error)
      set({ isLoadingTesterMetrics: false })
    }
  },

  fetchRegistryStats: async () => {
    set({ isLoadingRegistryStats: true })
    try {
      const stats = await adminDashboardApi.getProjectRegistryStats()
      set({ registryStats: stats, isLoadingRegistryStats: false })
    } catch (error) {
      console.error('Error fetching registry stats:', error)
      set({ isLoadingRegistryStats: false })
    }
  },

  fetchAllData: async () => {
    const { fetchGlobalMetrics, fetchRecentActivity, fetchTesterMetrics, fetchRegistryStats } = get()
    await Promise.all([
      fetchGlobalMetrics(),
      fetchRecentActivity(),
      fetchTesterMetrics(),
      fetchRegistryStats()
    ])
  }
})) 