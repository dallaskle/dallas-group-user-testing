import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type FeatureStatus = Database['public']['Tables']['feature_statuses']['Row']

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  features: Feature[]
  featureStatuses: FeatureStatus[]
  isLoading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  fetchFeatures: (projectId: string) => Promise<void>
  fetchFeatureStatuses: (featureId: string) => Promise<void>
  createProject: (title: string, description?: string) => Promise<void>
  createFeature: (projectId: string, title: string, description?: string) => Promise<void>
  createFeatureStatus: (
    featureId: string,
    userId: string,
    videoUrl: string,
    status: 'working' | 'not_working',
    notes?: string
  ) => Promise<void>
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  projects: [],
  currentProject: null,
  features: [],
  featureStatuses: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ projects: data || [] })
    } catch (error) {
      set({ error: 'Failed to fetch projects' })
      console.error('Error fetching projects:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchProjectById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      set({ currentProject: data })
    } catch (error) {
      set({ error: 'Failed to fetch project' })
      console.error('Error fetching project:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchFeatures: async (projectId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) throw error
      set({ features: data || [] })
    } catch (error) {
      set({ error: 'Failed to fetch features' })
      console.error('Error fetching features:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchFeatureStatuses: async (featureId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('feature_statuses')
        .select('*')
        .eq('feature_id', featureId)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ featureStatuses: data || [] })
    } catch (error) {
      set({ error: 'Failed to fetch feature statuses' })
      console.error('Error fetching feature statuses:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createProject: async (title: string, description?: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          owner_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      const { projects } = get()
      set({ projects: [data, ...projects] })
    } catch (error) {
      set({ error: 'Failed to create project' })
      console.error('Error creating project:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createFeature: async (projectId: string, title: string, description?: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('features')
        .insert({
          project_id: projectId,
          title,
          description,
        })
        .select()
        .single()

      if (error) throw error

      const { features } = get()
      set({ features: [...features, data] })
    } catch (error) {
      set({ error: 'Failed to create feature' })
      console.error('Error creating feature:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  createFeatureStatus: async (
    featureId: string,
    userId: string,
    videoUrl: string,
    status: 'working' | 'not_working',
    notes?: string
  ) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('feature_statuses')
        .insert({
          feature_id: featureId,
          user_id: userId,
          video_url: videoUrl,
          status,
          notes,
        })
        .select()
        .single()

      if (error) throw error

      const { featureStatuses } = get()
      set({ featureStatuses: [data, ...featureStatuses] })
    } catch (error) {
      set({ error: 'Failed to create feature status' })
      console.error('Error creating feature status:', error)
    } finally {
      set({ isLoading: false })
    }
  },
})) 