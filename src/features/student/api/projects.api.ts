import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type ProjectWithRegistry = Project & {
  registry: Database['public']['Tables']['project_registry']['Row']
  features: Feature[]
  feature_count: number
  validation_count: number
}

interface CreateFeatureParams {
  project_id: string
  name: string
  description: string
  required_validations?: number
}

export const projectsApi = {
  async getProjects(studentId: string): Promise<ProjectWithRegistry[]> {
    // First get projects with basic info and registry
    const { data: projects, error: projectsError } = await supabase
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

    const { data: features, error: featuresError } = await supabase
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

    return projectsWithFeatures || []
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async createFeature(params: CreateFeatureParams): Promise<Feature> {
    const session = await supabase.auth.getSession()
    if (!session.data.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-create-feature`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session.access_token}`,
        },
        body: JSON.stringify(params),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create feature')
    }

    return response.json()
  },

  async updateFeature(id: string, updates: Partial<Feature>): Promise<Feature> {
    const { data, error } = await supabase
      .from('features')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteFeature(id: string): Promise<void> {
    const { error } = await supabase
      .from('features')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 