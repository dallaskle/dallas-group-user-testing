import { create } from 'zustand'
import { Database } from '@/database.types'
import { validationsApi } from '../api/validations.api'
import { useProjectsStore } from './projects.store'

type Validation = Database['public']['Tables']['validations']['Row'] & {
  validator: {
    name: string
  }
  feature: {
    name: string
  }
}

interface ValidationsState {
  validationsByProject: Record<string, Validation[]>
  isLoading: boolean
  sortBy: 'newest' | 'oldest'
  setSortBy: (sort: 'newest' | 'oldest') => void
  loadValidations: (projectId: string) => Promise<void>
}

export const useValidationsStore = create<ValidationsState>((set, get) => ({
  validationsByProject: {},
  isLoading: false,
  sortBy: 'newest',
  setSortBy: (sort) => set({ sortBy: sort }),
  loadValidations: async (projectId: string) => {
    try {
      set({ isLoading: true })
      
      // Get project features from projects store
      const project = useProjectsStore.getState().projects.find(p => p.id === projectId)
      console.log(project)
      if (!project?.features) return

      // Create a map of feature IDs to names
      const featureNames = Object.fromEntries(
        project.features.map(f => [f.id, f.name])
      )

      console.log(featureNames)

      const data = await validationsApi.getValidationsByFeatureIds(
        project.features.map(f => f.id),
        featureNames,
        get().sortBy === 'oldest'
      )

      set((state) => ({
        validationsByProject: {
          ...state.validationsByProject,
          [projectId]: data
        }
      }))
    } catch (error) {
      console.error('Failed to load validations:', error)
    } finally {
      set({ isLoading: false })
    }
  }
}))
