import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tables } from '@/lib/supabase'

interface ProjectRegistry extends Tables<'project_registry'> {}
interface FeatureRegistry extends Tables<'feature_registry'> {}

export interface CreateProjectRegistryParams {
  name: string
  description: string
}

export interface CreateFeatureRegistryParams {
  name: string
  description: string
  project_registry_id: string
  is_required?: boolean
}

interface RegistriesState {
  projectRegistries: ProjectRegistry[]
  featureRegistries: FeatureRegistry[]
  isLoading: boolean
  error: string | null
  
  // Project Registry Actions
  setProjectRegistries: (registries: ProjectRegistry[]) => void
  addProjectRegistry: (registry: ProjectRegistry) => void
  updateProjectRegistry: (id: string, updates: Partial<ProjectRegistry>) => void
  removeProjectRegistry: (id: string) => void
  
  // Feature Registry Actions
  setFeatureRegistries: (registries: FeatureRegistry[]) => void
  addFeatureRegistry: (registry: FeatureRegistry) => void
  updateFeatureRegistry: (id: string, updates: Partial<FeatureRegistry>) => void
  removeFeatureRegistry: (id: string) => void
  
  // Status Actions
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useRegistriesStore = create<RegistriesState>()(
  persist(
    (set) => ({
      projectRegistries: [],
      featureRegistries: [],
      isLoading: true,
      error: null,

      // Project Registry Actions
      setProjectRegistries: (registries) => set({ projectRegistries: registries }),
      addProjectRegistry: (registry) =>
        set((state) => ({
          projectRegistries: [...state.projectRegistries, registry],
        })),
      updateProjectRegistry: (id, updates) =>
        set((state) => ({
          projectRegistries: state.projectRegistries.map((registry) =>
            registry.id === id ? { ...registry, ...updates } : registry
          ),
        })),
      removeProjectRegistry: (id) =>
        set((state) => ({
          projectRegistries: state.projectRegistries.filter((registry) => registry.id !== id),
        })),

      // Feature Registry Actions
      setFeatureRegistries: (registries) => set({ featureRegistries: registries }),
      addFeatureRegistry: (registry) =>
        set((state) => ({
          featureRegistries: [...state.featureRegistries, registry],
        })),
      updateFeatureRegistry: (id, updates) =>
        set((state) => ({
          featureRegistries: state.featureRegistries.map((registry) =>
            registry.id === id ? { ...registry, ...updates } : registry
          ),
        })),
      removeFeatureRegistry: (id) =>
        set((state) => ({
          featureRegistries: state.featureRegistries.filter((registry) => registry.id !== id),
        })),

      // Status Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'registries-storage',
      partialize: (state) => ({
        projectRegistries: state.projectRegistries,
        featureRegistries: state.featureRegistries,
      }),
    }
  )
) 