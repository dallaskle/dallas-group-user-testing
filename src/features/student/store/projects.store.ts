import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectWithRegistry = Project & {
  registry: Database['public']['Tables']['project_registry']['Row']
  feature_count: number
  validation_count: number
}

interface ProjectsState {
  projects: ProjectWithRegistry[]
  isLoading: boolean
  error: Error | null
  
  // Actions
  fetchProjects: () => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement fetch from Supabase
      // Will include joins with project_registry and counts
      set({ isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement create in Supabase
      set({ isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  updateProject: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement update in Supabase
      set({ isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // TODO: Implement delete in Supabase
      set({ isLoading: false })
    } catch (error) {
      set({ error: error as Error, isLoading: false })
    }
  },
})) 