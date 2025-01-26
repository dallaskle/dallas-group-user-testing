import { SupabaseClient } from '../_shared/deps.ts'

interface CreateProjectParams {
  name: string
  project_registry_id: string
  student_id: string
}

export class ProjectsCreateSimpleService {
  constructor(private supabaseClient: SupabaseClient) {}

  async createProject(params: CreateProjectParams) {
    const { data, error } = await this.supabaseClient
      .from('projects')
      .insert([params])
      .select()
      .single()

    if (error) throw error

    console.log('Project created:', data)
    return data
  }
} 