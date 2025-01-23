import { create } from 'zustand'
import { projectRegistryApi, type ProjectRegistryWithFeatures } from '../api/createProjectRegistry'

interface ProjectRegistryState {
  registries: ProjectRegistryWithFeatures[]
  isLoading: boolean
  error: string | null
  selectedRegistry: ProjectRegistryWithFeatures | null
  
  // Actions
  fetchRegistries: () => Promise<void>
  createRegistry: (data: { name: string; description: string }) => Promise<void>
  updateRegistry: (id: string, data: { name?: string; description?: string }) => Promise<void>
  deleteRegistry: (id: string) => Promise<void>
  addFeature: (registryId: string, data: { name: string; description: string; is_required: boolean }) => Promise<void>
  updateFeature: (id: string, data: { name?: string; description?: string; is_required?: boolean }) => Promise<void>
  deleteFeature: (id: string) => Promise<void>
  selectRegistry: (registry: ProjectRegistryWithFeatures | null) => void
}

export const useProjectRegistry = create<ProjectRegistryState>((set, get) => ({
  registries: [],
  isLoading: false,
  error: null,
  selectedRegistry: null,

  fetchRegistries: async () => {
    set({ isLoading: true, error: null })
    try {
      const registries = await projectRegistryApi.getProjectRegistries()
      set({ registries, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createRegistry: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.createProjectRegistry(data)
      await get().fetchRegistries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateRegistry: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.updateProjectRegistry(id, data)
      await get().fetchRegistries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteRegistry: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.deleteProjectRegistry(id)
      set(state => ({
        registries: state.registries.filter(r => r.id !== id),
        selectedRegistry: state.selectedRegistry?.id === id ? null : state.selectedRegistry,
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  addFeature: async (registryId, data) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.addFeatureToRegistry(registryId, data)
      await get().fetchRegistries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateFeature: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.updateFeature(id, data)
      await get().fetchRegistries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteFeature: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await projectRegistryApi.deleteFeature(id)
      await get().fetchRegistries()
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  selectRegistry: (registry) => {
    set({ selectedRegistry: registry })
  }
})) 