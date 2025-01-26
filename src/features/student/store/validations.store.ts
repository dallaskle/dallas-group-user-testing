import { create } from 'zustand'
import { Database } from '@/database.types'
import { validationsApi } from '../api/validations.api'

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
      const data = await validationsApi.getProjectValidations(projectId, get().sortBy === 'oldest')
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
