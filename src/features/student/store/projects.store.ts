import { create } from 'zustand'
import { Database } from '@/database.types'
import { projectsApi } from '../api/projects.api'
import { studentDashboardApi } from '../api/studentDashboard.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type Registry = Database['public']['Tables']['project_registry']['Row']
type FeatureRegistry = Database['public']['Tables']['feature_registry']['Row']


interface OutstandingTestingTicket {
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

type ProjectWithRegistry = Project & {
  registry: Registry
  features: Feature[]
  feature_count: number
  validation_count: number
}

interface ProjectsState {
  projects: ProjectWithRegistry[]
  outstandingTestingTickets: OutstandingTestingTicket[]
  isLoading: boolean
  isLoadingTickets: boolean
  error: Error | null
  registries: Registry[]
  features: FeatureRegistry[]
  
  // State setters
  setProjects: (projects: ProjectWithRegistry[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  
  // Project actions
  addProject: (project: Project & { registry: Registry }) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  fetchProjectById: (id: string) => Promise<ProjectWithRegistry>
  
  // Feature actions
  addFeature: (projectId: string, feature: Feature) => void
  updateFeature: (projectId: string, featureId: string, data: Partial<Feature>) => void
  removeFeature: (projectId: string, featureId: string) => void
  fetchFeatureById: (id: string) => Promise<Feature & { project: { id: string } }>
  
  // Testing tickets actions
  fetchOutstandingTestingTickets: () => Promise<void>
  
  // Async actions
  fetchProjects: () => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  
  // New methods
  fetchProjectRegistries: () => Promise<void>
  fetchFeaturesByRegistry: (registryId: string) => Promise<void>
  createProjectWithFeatures: (name: string, registryId: string, optionalFeatureIds: string[]) => Promise<Project>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  outstandingTestingTickets: [],
  isLoading: false,
  isLoadingTickets: false,
  error: null,
  registries: [],
  features: [],

  // State setters
  setProjects: (projects) => set({ projects }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Project actions
  addProject: (project) => 
    set((state) => ({
      projects: [...state.projects, {
        ...project,
        features: [],
        feature_count: 0,
        validation_count: 0
      } as ProjectWithRegistry]
    })),

  updateProject: (id, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      )
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id)
    })),

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // First check if we already have the project in the store
      const existingProject = get().projects.find(p => p.id === id)
      if (existingProject) {
        set({ isLoading: false })
        return existingProject
      }

      // If not in store, fetch from API
      const project = await projectsApi.getProjectById(id)
      // Update the project in the store
      set((state) => ({
        projects: [...state.projects, project],
        isLoading: false
      }))
      return project
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch project'),
        isLoading: false 
      })
      throw error
    }
  },

  // Feature actions
  addFeature: (projectId, feature) =>
    set((state) => {
      const updatedProjects = state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              features: [...(p.features || []), feature],
              feature_count: (p.feature_count || 0) + 1,
              validation_count: (p.validation_count || 0) + feature.required_validations
            }
          : p
      )
      return { projects: updatedProjects }
    }),

  fetchFeatureById: async (id: string) => {
    try {
      set({ isLoading: true, error: null })
      const feature = await projectsApi.getFeatureById(id)
      set({ isLoading: false })
      return feature
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch feature'),
        isLoading: false 
      })
      throw error
    }
  },

  updateFeature: (projectId, featureId, data) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              features: (p.features || []).map((f) =>
                f.id === featureId ? { ...f, ...data } : f
              )
            }
          : p
      )
    })),

  removeFeature: (projectId, featureId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              features: (p.features || []).filter((f) => f.id !== featureId),
              feature_count: Math.max(0, (p.feature_count || 0) - 1)
            }
          : p
      )
    })),

  // Testing tickets actions
  fetchOutstandingTestingTickets: async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      set({ error: new Error('No active user session') })
      return
    }

    set({ isLoadingTickets: true, error: null })
    try {
      const tickets = await studentDashboardApi.getOutstandingTestingTickets()
      set({ outstandingTestingTickets: tickets, isLoadingTickets: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch outstanding testing tickets'),
        isLoadingTickets: false 
      })
    }
  },

  // Async actions
  fetchProjects: async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      set({ error: new Error('No active user session') })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const projects = await projectsApi.getProjects()
      set({ projects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch projects'),
        isLoading: false 
      })
    }
  },

  createProject: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const project = await projectsApi.createProject(data)
      set((state) => ({
        projects: [...state.projects, project as ProjectWithRegistry],
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to create project'),
        isLoading: false 
      })
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await projectsApi.deleteProject(id)
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to delete project'),
        isLoading: false 
      })
    }
  },

  // Registry methods
  fetchProjectRegistries: async () => {
    set({ isLoading: true, error: null })
    try {
      const registries = await projectsApi.fetchProjectRegistries()
      set({ registries, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch project registries'),
        isLoading: false 
      })
    }
  },

  fetchFeaturesByRegistry: async (registryId: string) => {
    set({ isLoading: true, error: null })
    try {
      const features = await projectsApi.fetchFeaturesByRegistry(registryId)
      set({ features, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to fetch registry features'),
        isLoading: false 
      })
    }
  },

  createProjectWithFeatures: async (name: string, registryId: string, optionalFeatureIds: string[]) => {
    set({ isLoading: true, error: null })
    try {
      const project = await projectsApi.createProjectWithFeatures(name, registryId, optionalFeatureIds)
      
      // Ensure we have the correct registry data
      const registry = get().registries.find(r => r.id === registryId) || {
        id: registryId,
        name: '',
        description: '',
        created_at: new Date().toISOString(),
        created_by: '',
        updated_at: new Date().toISOString()
      }

      // Create a properly typed ProjectWithRegistry object
      const projectWithRegistry: ProjectWithRegistry = {
        ...project,
        registry,
        features: project.features || [],
        feature_count: project.features?.length || 0,
        validation_count: project.features?.reduce((sum, f) => sum + (f.required_validations || 0), 0) || 0
      }

      // Update the store with the new project
      set(state => ({
        projects: [...state.projects, projectWithRegistry],
        isLoading: false
      }))

      return project
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('Failed to create project with features'),
        isLoading: false 
      })
      throw error
    }
  }
})) 