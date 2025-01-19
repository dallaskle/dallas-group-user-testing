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
    console.log('🔵 Starting fetchProjects')
    set({ isLoading: true, error: null })
    
    // Create an abort controller for the timeout
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => abortController.abort(), 10000) // 10 second timeout
    
    try {
      console.log('📡 Making Supabase request to fetch projects')
      const result = await Promise.race([
        supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false })
          .abortSignal(abortController.signal),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        )
      ])

      clearTimeout(timeoutId)
      console.log('📥 Raw Supabase response received:', result)

      if (result.error) {
        console.error('❌ Supabase error:', result.error)
        throw new Error(`Failed to fetch projects: ${result.error.message}`)
      }
      
      if (!result.data) {
        console.warn('⚠️ No data returned from Supabase')
        set({ projects: [] }) // Set empty array instead of throwing error
        return
      }
      
      console.log('✅ Setting projects:', result.data.length, 'projects found')
      set({ projects: result.data })
    } catch (err) {
      console.error('❌ Error in fetchProjects:', err)
      const error = err as Error
      const errorMessage = error.message || 'Failed to fetch projects'
      
      if (error.name === 'AbortError' || errorMessage.includes('timeout')) {
        set({ error: 'Request timed out. Please try again.' })
      } else {
        set({ error: errorMessage })
      }
    } finally {
      clearTimeout(timeoutId)
      console.log('🏁 Finishing fetchProjects, setting isLoading to false')
      set({ isLoading: false })
    }
  },

  fetchProjectById: async (id: string) => {
    console.log('🔵 Starting fetchProjectById:', id)
    set({ isLoading: true, error: null })
    try {
      console.log('📡 Making Supabase request to fetch project:', id)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      console.log('📥 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      console.log('✅ Setting currentProject:', data)
      set({ currentProject: data })
    } catch (error) {
      console.error('❌ Error in fetchProjectById:', error)
      set({ error: 'Failed to fetch project' })
    } finally {
      console.log('🏁 Finishing fetchProjectById, setting isLoading to false')
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
    console.log('🔵 Starting createProject:', { title, description })
    set({ isLoading: true, error: null })
    try {
      console.log('📡 Getting current user')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ Error getting user:', userError)
        throw userError
      }
      
      if (!user) {
        console.error('❌ No user found')
        throw new Error('No user found')
      }

      console.log('📡 Making Supabase request to create project')
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          owner_id: user.id,
        })
        .select()
        .single()

      console.log('📥 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      const { projects } = get()
      console.log('✅ Adding new project to projects list')
      set({ projects: [data, ...projects] })
    } catch (error) {
      console.error('❌ Error in createProject:', error)
      set({ error: 'Failed to create project' })
    } finally {
      console.log('🏁 Finishing createProject, setting isLoading to false')
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