import { SupabaseClient } from '../_shared/deps.ts'

export class ProjectRegistryListService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getProjectRegistries() {
    const { data, error } = await this.supabaseClient
      .from('project_registry')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching project registries:', error)
      throw new Error(`Failed to fetch project registries: ${error.message}`)
    }

    console.log('Project registries fetched:', data)
    return data || []
  }

  async getFeaturesByRegistry(registryId: string) {
    const { data, error } = await this.supabaseClient
      .from('feature_registry')
      .select('*')
      .eq('project_registry_id', registryId)
      .order('is_required', { ascending: false })
      .order('name')

    if (error) {
      console.error('Error fetching features for registry:', error)
      throw new Error(`Failed to fetch features for registry: ${error.message}`)
    }

    console.log('Features for registry fetched:', data)
    return data || []
  }
} 