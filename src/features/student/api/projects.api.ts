import { supabase } from '@/lib/supabase'
import { Database } from '@/database.types'
import { useAuthStore } from '@/features/auth/store/auth.store'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
type FeatureRegistry = Database['public']['Tables']['feature_registry']['Row']
type ProjectWithRegistry = Project & {
  registry: ProjectRegistry
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
  async getProjects(): Promise<ProjectWithRegistry[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-list', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as ProjectWithRegistry[]
  },

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-create-simple', {
      body: {
        name: project.name,
        project_registry_id: project.project_registry_id
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-update', {
      body: {
        id,
        type: 'project',
        updates
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async deleteProject(id: string): Promise<void> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { error } = await supabase.functions.invoke('projects-delete', {
      body: {
        id,
        type: 'project'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
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
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-update', {
      body: {
        id,
        type: 'feature',
        updates
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async deleteFeature(id: string): Promise<void> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { error } = await supabase.functions.invoke('projects-delete', {
      body: {
        id,
        type: 'feature'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
  },

  async fetchProjectRegistries(): Promise<ProjectRegistry[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('project-registry-list', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async fetchFeaturesByRegistry(registryId: string): Promise<FeatureRegistry[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('project-registry-list', {
      method: 'POST',
      body: {
        registryId
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async createProjectWithFeatures(
    name: string,
    registryId: string,
    optionalFeatureIds: string[]
  ) {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-create', {
      body: {
        name,
        registryId,
        optionalFeatureIds
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async getProjectById(id: string): Promise<ProjectWithRegistry> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-get', {
      body: {
        id,
        type: 'project'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as ProjectWithRegistry
  },

  async getFeatureById(id: string): Promise<Feature & { project: { id: string } }> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('projects-get', {
      body: {
        id,
        type: 'feature'
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data as Feature & { project: { id: string } }
  },
} 