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
  status?: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
  current_validations?: number
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
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('id')
      .eq('project_id', id)

    if (featuresError) throw featuresError

    const featureIds = features.map(f => f.id)

    // Delete all validations for the features
    if (featureIds.length > 0) {
      const { error: validationsError } = await supabase
        .from('validations')
        .delete()
        .in('feature_id', featureIds)

      if (validationsError) throw validationsError
    }

    // Delete all comments for the features
    if (featureIds.length > 0) {
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .in('feature_id', featureIds)

      if (commentsError) throw commentsError
    }

    // Get and delete testing tickets
    if (featureIds.length > 0) {
      const { data: testingTickets, error: testingTicketsQueryError } = await supabase
        .from('testing_tickets')
        .select('id')
        .in('feature_id', featureIds)

      if (testingTicketsQueryError) throw testingTicketsQueryError

      const testingTicketIds = testingTickets.map(t => t.id)

      if (testingTicketIds.length > 0) {
        const { error: testingTicketsError } = await supabase
          .from('tickets')
          .delete()
          .in('id', testingTicketIds)

        if (testingTicketsError) throw testingTicketsError

        const { error: testingTicketsDeleteError } = await supabase
          .from('testing_tickets')
          .delete()
          .in('id', testingTicketIds)

        if (testingTicketsDeleteError) throw testingTicketsDeleteError
      }
    }

    // Get and delete support tickets
    const { data: supportTickets, error: supportTicketsQueryError } = await supabase
      .from('support_tickets')
      .select('id')
      .eq('project_id', id)
      .or(`feature_id.in.(${featureIds.join(',')})`)

    if (supportTicketsQueryError) throw supportTicketsQueryError

    const supportTicketIds = supportTickets.map(t => t.id)

    if (supportTicketIds.length > 0) {
      const { error: supportTicketsError } = await supabase
        .from('tickets')
        .delete()
        .in('id', supportTicketIds)

      if (supportTicketsError) throw supportTicketsError

      const { error: supportTicketsDeleteError } = await supabase
        .from('support_tickets')
        .delete()
        .in('id', supportTicketIds)

      if (supportTicketsDeleteError) throw supportTicketsDeleteError
    }

    // Delete all features
    const { error: featuresDeleteError } = await supabase
      .from('features')
      .delete()
      .eq('project_id', id)

    if (featuresDeleteError) throw featuresDeleteError

    // Finally delete the project
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (projectError) throw projectError
  },

  async createFeature(params: CreateFeatureParams): Promise<Feature> {
    console.log('Creating feature with API:', params)
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
      console.error('Feature creation failed:', error)
      throw new Error(error.error || 'Failed to create feature')
    }

    const result = await response.json()
    console.log('Feature created via API:', result)
    return result
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