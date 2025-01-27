import { SupabaseClient } from '../_shared/deps.ts'

export class RegistryUpdateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async updateProjectRegistry(id: string, updates: {
    name?: string
    description?: string
    status?: string
    [key: string]: any
  }) {
    const { data, error } = await this.supabaseClient
      .from('project_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log('Project registry updated:', data)
    return data
  }

  async updateFeatureRegistry(id: string, updates: {
    name?: string
    description?: string
    status?: string
    project_registry_id?: string
    [key: string]: any
  }) {
    const { data, error } = await this.supabaseClient
      .from('feature_registry')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    console.log('Feature registry updated:', data)
    return data
  }
} 