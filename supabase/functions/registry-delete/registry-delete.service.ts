import { SupabaseClient } from '../_shared/deps.ts'

export class RegistryDeleteService {
  constructor(private supabaseClient: SupabaseClient) {}

  async deleteProjectRegistry(id: string) {
    const { error } = await this.supabaseClient
      .from('project_registry')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    console.log('Project registry deleted:', id)
    return { success: true, id }
  }

  async deleteFeatureRegistry(id: string) {
    const { error } = await this.supabaseClient
      .from('feature_registry')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    console.log('Feature registry deleted:', id)
    return { success: true, id }
  }
} 