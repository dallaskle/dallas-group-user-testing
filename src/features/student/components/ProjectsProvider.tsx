import { useEffect } from 'react'
import { useProjectsStore } from '../store/projects.store'
import { projectsApi } from '../api/projects.api'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type ProjectPayload = RealtimePostgresChangesPayload<Project>
type FeaturePayload = RealtimePostgresChangesPayload<Feature>

interface ProjectsProviderProps {
  children: React.ReactNode
}

const isFeature = (record: unknown): record is Feature => {
  return record != null && 
    typeof record === 'object' && 
    'project_id' in record && 
    typeof (record as Feature).project_id === 'string'
}

export const ProjectsProvider = ({ children }: ProjectsProviderProps) => {
  const { user } = useAuthStore()
  const {
    projects,
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
          .subscribe((status) => {
            console.log('Project subscription status:', status)
          })

        // Subscribe to feature changes for all user's projects
        const featureSubscription = supabase
          .channel('features-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'features',
              filter: `project_id=in.(${projects.map(p => `'${p.id}'`).join(',')})`,
            },
            async (payload: FeaturePayload) => {
              if (!mounted) return

              const { eventType, new: newRecord, old: oldRecord } = payload
              console.log('Feature change detected:', { eventType, newRecord, oldRecord })

              // Since we're filtering by project_id, we can skip the ownership check
              switch (eventType) {
                case 'INSERT':
                  if (isFeature(newRecord)) {
                    console.log('Adding new feature to store:', newRecord)
                    addFeature(newRecord.project_id, newRecord)
                  }
                  break
                case 'UPDATE':
                  if (isFeature(oldRecord) && isFeature(newRecord) && oldRecord.id) {
                    console.log('Updating feature in store:', { old: oldRecord, new: newRecord })
                    updateFeature(newRecord.project_id, oldRecord.id, newRecord)
                  }
                  break
                case 'DELETE':
                  if (isFeature(oldRecord) && oldRecord.id) {
                    console.log('Removing feature from store:', oldRecord)
                    removeFeature(oldRecord.project_id, oldRecord.id)
                  }
                  break
              }
            }
          )
          .subscribe((status) => {
            console.log('Feature subscription status:', status)
          })

        // Log subscription states periodically until they're ready
        const checkSubscriptions = setInterval(() => {
          const status = {
            projectChannel: projectSubscription.state,
            featureChannel: featureSubscription.state
          }
          console.log('Subscription status:', status)
          
          // Check if both channels are in a connected state
          if (status.projectChannel === 'joined' && status.featureChannel === 'joined') {
            console.log('All subscriptions ready!')
            clearInterval(checkSubscriptions)
          }
        }, 1000)

        // Also check if we're already connected
        if (projectSubscription.state === 'joined' && featureSubscription.state === 'joined') {
          console.log('Subscriptions already ready!')
          clearInterval(checkSubscriptions)
        }

        return () => {
          mounted = false
          clearInterval(checkSubscriptions)
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
      const result = await projectsApi.createFeature(params)
      // Manually update the store since realtime events might be delayed
      store.addFeature(params.project_id, result)
      return result
    } catch (error) {
      store.setError(new Error(error instanceof Error ? error.message : 'Failed to create feature'))
      throw error
    }
  }

  return {
    ...store,
    createFeature,
  }
} 