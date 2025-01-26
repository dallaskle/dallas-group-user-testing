import { SupabaseClient } from '../_shared/deps.ts'

export class ProjectsListService {
  constructor(private supabaseClient: SupabaseClient) {}

  async getProjects(studentId: string) {
    // First get projects with basic info and registry
    const { data: projects, error: projectsError } = await this.supabaseClient
      .from('projects')
      .select(`
        *,
        registry:project_registry(*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (projectsError) throw projectsError

    // Then get features for each project
    const projectIds = projects?.map(p => p.id) || []
    
    if (projectIds.length === 0) return []

    const { data: features, error: featuresError } = await this.supabaseClient
      .from('features')
      .select('*')
      .in('project_id', projectIds)

    if (featuresError) throw featuresError

    // Combine the data
    const projectsWithFeatures = projects?.map(project => {
      const projectFeatures = features?.filter(f => f.project_id === project.id) || []
      return {
        ...project,
        features: projectFeatures,
        feature_count: projectFeatures.length,
        validation_count: projectFeatures.reduce((sum, f) => sum + (f.current_validations || 0), 0)
      }
    })

    console.log('Projects fetched:', projectsWithFeatures)
    return projectsWithFeatures || []
  }
} 