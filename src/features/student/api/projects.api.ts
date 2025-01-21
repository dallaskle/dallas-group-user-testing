import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectWithRegistry = Project & {
  registry: Database['public']['Tables']['project_registry']['Row']
  feature_count: number
  validation_count: number
}

export const projectsApi = {
  async getProjects(studentId: string): Promise<ProjectWithRegistry[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        registry:project_registry(*),
        feature_count:features(count),
        validation_count:features(validations(count))
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
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
  }
} 