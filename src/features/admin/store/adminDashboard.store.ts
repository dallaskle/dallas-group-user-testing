import { create } from 'zustand'
import * as api from '../api/adminDashboard.api'
import type { ActivityItem, ProjectDetails, ProjectRegistryDetails } from '../api/adminDashboard.api'

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
  testerPerformance: TesterStats[]
  activities: ActivityItem[]
  projects: ProjectDetails[]
  projectRegistries: ProjectRegistryDetails[]
  selectedTimeframe: number
  isLoading: boolean
  error: string | null
  fetchOverviewData: () => Promise<void>
  fetchActivities: (days?: number) => Promise<void>
  fetchProjects: () => Promise<void>
  fetchProjectRegistries: () => Promise<void>
  setSelectedTimeframe: (days: number) => void
}

export const useAdminDashboardStore = create<AdminDashboardState>((set, get) => ({
  projectRegistriesCount: 0,
  totalProjectsCount: 0,
  pendingValidationsCount: 0,
  pendingTestsCount: 0,
  totalTestersCount: 0,
  projectProgress: [],
  testerPerformance: [],
  activities: [],
  projects: [],
  projectRegistries: [],
  selectedTimeframe: 7,
  isLoading: false,
  error: null,

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

  setSelectedTimeframe: (days: number) => {
    set({ selectedTimeframe: days })
  }
}))
