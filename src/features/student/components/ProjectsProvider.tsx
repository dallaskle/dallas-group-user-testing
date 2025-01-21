import { useEffect } from 'react'
import { useProjectsStore } from '../store/projects.store'
import { projectsApi } from '../api/projects.api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

type ProjectPayload = RealtimePostgresChangesPayload<Database['public']['Tables']['projects']['Row']>
type FeaturePayload = RealtimePostgresChangesPayload<Database['public']['Tables']['features']['Row']>

interface ProjectsProviderProps {
  children: React.ReactNode
}

export const ProjectsProvider = ({ children }: ProjectsProviderProps) => {
  const { user } = useAuthStore()
  const {
    setProjects,
    addProject,
    updateProject,
    removeProject,
    addFeature,
    updateFeature,
    removeFeature,
    setLoading,
    setError,
  } = useProjectsStore()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Fetch initial data
        const projects = await projectsApi.getProjects(user.id)

        if (!mounted) return

        setProjects(projects)

        // Subscribe to project changes
        const projectSubscription = supabase
          .channel('projects-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'projects',
              filter: `student_id=eq.${user.id}`,
            },
            (payload: ProjectPayload) => {
              if (!mounted) return

              const { eventType, new: newRecord, old: oldRecord } = payload

              switch (eventType) {
                case 'INSERT':
                  if (newRecord) {
                    addProject(newRecord)
                  }
                  break
                case 'UPDATE':
                  if (oldRecord?.id && newRecord) {
                    updateProject(oldRecord.id, newRecord)
                  }
                  break
                case 'DELETE':
                  if (oldRecord?.id) {
                    removeProject(oldRecord.id)
                  }
                  break
              }
            }
          )
          .subscribe()

        // Subscribe to feature changes
        const featureSubscription = supabase
          .channel('features-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'features',
              filter: `project_id=in.(${projects.map(p => p.id).join(',')})`,
            },
            (payload: FeaturePayload) => {
              if (!mounted) return

              const { eventType, new: newRecord, old: oldRecord } = payload

              switch (eventType) {
                case 'INSERT':
                  if (newRecord) {
                    addFeature(newRecord.project_id, newRecord)
                  }
                  break
                case 'UPDATE':
                  if (oldRecord?.id && newRecord) {
                    updateFeature(newRecord.project_id, oldRecord.id, newRecord)
                  }
                  break
                case 'DELETE':
                  if (oldRecord?.id && oldRecord.project_id) {
                    removeFeature(oldRecord.project_id, oldRecord.id)
                  }
                  break
              }
            }
          )
          .subscribe()

        return () => {
          mounted = false
          projectSubscription.unsubscribe()
          featureSubscription.unsubscribe()
        }
      } catch (error) {
        console.error('Projects initialization error:', error)
        if (mounted) {
          setError(new Error(error instanceof Error ? error.message : 'Failed to initialize projects'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [user])

  return <>{children}</>
}

export const useProjects = () => {
  const store = useProjectsStore()
  
  const createFeature = async (params: Parameters<typeof projectsApi.createFeature>[0]) => {
    try {
      store.setLoading(true)
      const result = await projectsApi.createFeature(params)
      return result
    } catch (error) {
      store.setError(new Error(error instanceof Error ? error.message : 'Failed to create feature'))
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  return {
    ...store,
    createFeature,
  }
} 