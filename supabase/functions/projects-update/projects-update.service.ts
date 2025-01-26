import { SupabaseClient } from '../_shared/deps.ts'

interface UpdateProjectParams {
  id: string
  updates: {
    name?: string
    project_registry_id?: string
    student_id?: string
  }
}

interface UpdateFeatureParams {
  id: string
  updates: {
    name?: string
    description?: string
    status?: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
    required_validations?: number
    current_validations?: number
  }
}

export class ProjectsUpdateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async updateProject({ id, updates }: UpdateProjectParams) {
    const { data, error } = await this.supabaseClient
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('Project updated:', data)
    return data
  }

  async updateFeature({ id, updates }: UpdateFeatureParams) {
    const { data, error } = await this.supabaseClient
      .from('features')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('Feature updated:', data)
    return data
  }
} 