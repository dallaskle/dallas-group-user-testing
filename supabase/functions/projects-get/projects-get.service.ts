import { SupabaseClient } from '../_shared/deps.ts'

interface Feature {
  id: string
  project_id: string
  name: string
  description: string
  status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
  required_validations: number
  current_validations: number
  created_at: string
  updated_at: string
}

export class ProjectsGetService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getProjectById(id: string) {
    const { data, error } = await this.supabaseClient
      .from('projects')
      .select(`
        *,
        registry:project_registry(*),
        features(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    const enhancedProject = {
      ...data,
      feature_count: data.features?.length || 0,
      validation_count: data.features?.reduce((sum: number, f: Feature) => 
        sum + (f.current_validations || 0), 0) || 0
    }

    console.log('Project fetched:', enhancedProject)
    return enhancedProject
  }

  async getFeatureById(id: string) {
    const { data, error } = await this.supabaseClient
      .from('features')
      .select(`
        *,
        project:projects!features_project_id_fkey (
          id
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    console.log('Feature fetched:', data)
    return data
  }
} 