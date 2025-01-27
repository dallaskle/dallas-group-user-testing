import { SupabaseClient } from '../_shared/deps.ts'

export class AdminProjectsService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getProjectsWithDetails() {
    // First get all projects with their basic info
    const { data: projects, error } = await this.supabaseClient
      .from('projects')
      .select(`
        id,
        name,
        registry:project_registry (
          id,
          name,
          created_by,
          creator:users!project_registry_created_by_fkey (
            id,
            name
          )
        ),
        student:users!projects_student_id_fkey (
          id,
          name
        )
      `)

    if (error) throw error
    if (!projects) return []

    // Then get all features for these projects
    const { data: projectFeatures, error: featuresError } = await this.supabaseClient
      .from('features')
      .select(`
        id,
        name,
        status,
        project_id,
        required_validations,
        current_validations,
        project:projects (
          id,
          student:users!projects_student_id_fkey (
            id,
            name
          )
        )
      `)
      .in('project_id', projects.map(p => p.id))

    if (featuresError) throw featuresError

    // Map the data together
    const response = projects.map(project => {
      const projectFeatureList = projectFeatures?.filter(f => f.project_id === project.id) || []
      
      return {
        id: project.id,
        name: project.name,
        registry: {
          id: project.registry?.[0]?.id,
          name: project.registry?.[0]?.name
        },
        user: {
          id: project.student?.id,
          name: project.student?.name
        },
        features: projectFeatureList,
        features_count: projectFeatureList.length,
        validations: {
          completed: projectFeatureList.reduce((sum: number, f) => sum + (f.current_validations || 0), 0),
          required: projectFeatureList.reduce((sum: number, f) => sum + (f.required_validations || 0), 0)
        },
        status_counts: {
          not_started: projectFeatureList.filter(f => f.status === 'Not Started').length,
          in_progress: projectFeatureList.filter(f => f.status === 'In Progress').length,
          successful_test: projectFeatureList.filter(f => f.status === 'Successful Test').length,
          failed_test: projectFeatureList.filter(f => f.status === 'Failed Test').length
        }
      }
    })

    console.log('Projects with details response:', response)
    return response
  }

  async getProjectRegistriesWithDetails() {
    const { data, error } = await this.supabaseClient
      .from('project_registry')
      .select(`
        id,
        name,
        description,
        created_at,
        creator:users!project_registry_created_by_fkey (
          id,
          name
        ),
        features:feature_registry (
          id,
          name,
          description,
          is_required
        ),
        projects (
          id,
          student:users!projects_student_id_fkey (
            id,
            name
          )
        )
      `)

    if (error) throw error
    if (!data) return []

    const response = data.map(registry => ({
      id: registry.id,
      name: registry.name,
      description: registry.description,
      created_at: registry.created_at,
      created_by: {
        id: registry.creator?.id,
        name: registry.creator?.name
      },
      feature_count: registry.features?.length || 0,
      projects_count: registry.projects?.length || 0,
      features: registry.features || []
    }))

    console.log('Project registries with details response:', response)
    return response
  }
} 