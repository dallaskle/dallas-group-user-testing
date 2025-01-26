import { SupabaseClient } from '../_shared/deps.ts'

interface CreateProjectParams {
  name: string
  registryId: string
  optionalFeatureIds: string[]
}

export class ProjectsCreateService {
  constructor(private supabaseClient: SupabaseClient) {}

  async createProject(userId: string, params: CreateProjectParams) {
    const { name, registryId, optionalFeatureIds } = params

    // Create the project
    const { data: project, error: projectError } = await this.supabaseClient
      .from('projects')
      .insert([{ 
        name, 
        project_registry_id: registryId,
        student_id: userId
      }])
      .select()
      .single()

    if (projectError) throw projectError

    // Get all required features for this registry
    const { data: requiredFeatures, error: requiredFeaturesError } = await this.supabaseClient
      .from('feature_registry')
      .select('*')
      .eq('project_registry_id', registryId)
      .eq('is_required', true)
      .order('name')

    if (requiredFeaturesError) throw requiredFeaturesError

    // Get selected optional features
    const { data: optionalFeatures, error: optionalFeaturesError } = await this.supabaseClient
      .from('feature_registry')
      .select('*')
      .eq('project_registry_id', registryId)
      .eq('is_required', false)
      .in('id', optionalFeatureIds)
      .order('name')

    if (optionalFeaturesError) throw optionalFeaturesError

    // Combine required and optional features
    const allFeatures = [...(requiredFeatures || []), ...(optionalFeatures || [])]

    // Create features for the project
    if (allFeatures.length > 0) {
      const { error: featuresError } = await this.supabaseClient
        .from('features')
        .insert(
          allFeatures.map(f => ({
            project_id: project.id,
            name: f.name,
            description: f.description,
            status: 'Not Started' as const,
            required_validations: 2, // Default to 2 validations required
            current_validations: 0
          }))
        )

      if (featuresError) throw featuresError
    }

    console.log('Project created:', project)
    return project
  }
} 