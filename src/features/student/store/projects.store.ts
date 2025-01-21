import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'
import { projectsApi } from '../api/projects.api'
import { useAuthStore } from '@/features/auth/store/auth.store'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type Registry = Database['public']['Tables']['project_registry']['Row']
type ProjectWithRegistry = Project & {
  registry: Registry
  features: Feature[]
  feature_count: number
  validation_count: number
}

interface ProjectsState {
  projects: ProjectWithRegistry[]
  isLoading: boolean
  error: Error | null
  
  // State setters
  setProjects: (projects: ProjectWithRegistry[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: Error | null) => void
  
  // Project actions
  addProject: (project: Project & { registry: Registry }) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  
  // Feature actions
  addFeature: (projectId: string, feature: Feature) => void
  updateFeature: (projectId: string, featureId: string, data: Partial<Feature>) => void
  removeFeature: (projectId: string, featureId: string) => void
  
  // Async actions
  fetchProjects: () => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

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

  // Feature actions
  addFeature: (projectId, feature) =>
    set((state) => {
      console.log('Adding feature to store:', { projectId, feature })
      console.log('Current projects:', state.projects)
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
      console.log('Updated projects:', updatedProjects)
      return { projects: updatedProjects }
    }),

  updateFeature: (projectId, featureId, data) =>
    set((state) => {
      console.log('Updating feature in store:', { projectId, featureId, data })
      return {
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
      }
    }),

  removeFeature: (projectId, featureId) =>
    set((state) => {
      console.log('Removing feature from store:', { projectId, featureId })
      return {
        projects: state.projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                features: (p.features || []).filter((f) => f.id !== featureId),
                feature_count: Math.max(0, (p.feature_count || 0) - 1)
              }
            : p
        )
      }
    }),

  // Async actions
  fetchProjects: async () => {
    const user = useAuthStore.getState().user
    if (!user) {
      set({ error: new Error('No active user session') })
      return
    }

    set({ isLoading: true, error: null })
    try {
      const projects = await projectsApi.getProjects(user.id)
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
})) 