import { supabase } from '@/lib/supabase'
import type { Database } from '@/shared/types/database.types'

type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
type Feature = Database['public']['Tables']['feature_registry']['Row']

export interface ProjectRegistryWithFeatures extends ProjectRegistry {
  features: Feature[]
  projectCount: number
}

export const projectRegistryApi = {
  async getProjectRegistries(): Promise<ProjectRegistryWithFeatures[]> {
    const { data: registries, error } = await supabase
      .from('project_registry')
      .select(`
        *,
        features:feature_registry(*),
        projects:projects(count)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching project registries:', error)
      throw error
    }

    return registries.map(registry => ({
      ...registry,
      features: registry.features || [],
      projectCount: (registry.projects as any)?.count || 0
    }))
  },

  async createProjectRegistry(data: {
    name: string
    description: string
  }): Promise<ProjectRegistry> {
    const { data: registry, error } = await supabase
      .from('project_registry')
      .insert({
        name: data.name,
        description: data.description,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project registry:', error)
      throw error
    }

    return registry
  },

  async updateProjectRegistry(id: string, data: {
    name?: string
    description?: string
  }): Promise<ProjectRegistry> {
    const { data: registry, error } = await supabase
      .from('project_registry')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project registry:', error)
      throw error
    }

    return registry
  },

  async deleteProjectRegistry(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_registry')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project registry:', error)
      throw error
    }
  },

  async addFeatureToRegistry(registryId: string, data: {
    name: string
    description: string
    is_required: boolean
  }): Promise<Feature> {
    const { data: feature, error } = await supabase
      .from('feature_registry')
      .insert({
        project_registry_id: registryId,
        name: data.name,
        description: data.description,
        is_required: data.is_required
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding feature to registry:', error)
      throw error
    }

    return feature
  },

  async updateFeature(id: string, data: {
    name?: string
    description?: string
    is_required?: boolean
  }): Promise<Feature> {
    const { data: feature, error } = await supabase
      .from('feature_registry')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating feature:', error)
      throw error
    }

    return feature
  },

  async deleteFeature(id: string): Promise<void> {
    const { error } = await supabase
      .from('feature_registry')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting feature:', error)
      throw error
    }
  }
} 
