import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { CreateProjectRegistryParams, CreateFeatureRegistryParams } from '../store/registries.store'
import { getProjectRegistries as fetchProjectRegistriesList } from '../api/createProjectRegistry'
import { getFeatureRegistries as fetchFeatureRegistriesList } from '../api/createFeatureRegistry'

export const registryService = {
  // Project Registry Methods
  async fetchProjectRegistries() {
    return fetchProjectRegistriesList()
  },

  async createProjectRegistry(params: CreateProjectRegistryParams) {
    const session = useAuthStore.getState().session
    
    if (!session?.access_token) {
      throw new Error('No active session found. Please log in again.')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-project-registry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create project registry')
    }

    return response.json()
  },

  async updateProjectRegistry(id: string, updates: Partial<CreateProjectRegistryParams>) {
    const { data, error } = await supabase
      .from('project_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async deleteProjectRegistry(id: string) {
    const { error } = await supabase
      .from('project_registry')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  },

  // Feature Registry Methods
  async fetchFeatureRegistries(projectRegistryId: string) {
    return fetchFeatureRegistriesList(projectRegistryId)
  },

  async createFeatureRegistry(params: CreateFeatureRegistryParams) {
    const session = useAuthStore.getState().session
    
    if (!session?.access_token) {
      throw new Error('No active session found. Please log in again.')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-feature-registry`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create feature registry')
    }

    return response.json()
  },

  async updateFeatureRegistry(id: string, updates: Partial<CreateFeatureRegistryParams>) {
    const { data, error } = await supabase
      .from('feature_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async deleteFeatureRegistry(id: string) {
    const { error } = await supabase
      .from('feature_registry')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  },

  // Subscription Methods
  subscribeToProjectRegistries(callback: (payload: any) => void) {
    return supabase
      .channel('project_registry_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_registry'
        },
        callback
      )
      .subscribe()
  },

  subscribeToFeatureRegistries(callback: (payload: any) => void) {
    return supabase
      .channel('feature_registry_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feature_registry'
        },
        callback
      )
      .subscribe()
  }
} 