import { useEffect } from 'react'
import { useRegistriesStore } from '../store/registries.store'
import { registryService } from '../services/registry.service'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase'

interface RegistryProviderProps {
  children: React.ReactNode
}

type ProjectRegistryPayload = RealtimePostgresChangesPayload<Tables<'project_registry'>>
type FeatureRegistryPayload = RealtimePostgresChangesPayload<Tables<'feature_registry'>>

export const RegistryProvider = ({ children }: RegistryProviderProps) => {
  const {
    setProjectRegistries,
    setFeatureRegistries,
    addProjectRegistry,
    updateProjectRegistry,
    removeProjectRegistry,
    addFeatureRegistry,
    updateFeatureRegistry,
    removeFeatureRegistry,
    setLoading,
    setError,
  } = useRegistriesStore()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setLoading(true)
        
        // Fetch initial data
        const [projectRegistries, featureRegistries] = await Promise.all([
          registryService.fetchProjectRegistries(),
          registryService.fetchFeatureRegistries(),
        ])

        if (!mounted) return

        setProjectRegistries(projectRegistries)
        setFeatureRegistries(featureRegistries)

        // Subscribe to project registry changes
        const projectSubscription = registryService.subscribeToProjectRegistries(
          (payload: ProjectRegistryPayload) => {
            if (!mounted) return

            const { eventType, new: newRecord, old: oldRecord } = payload

            switch (eventType) {
              case 'INSERT':
                if (newRecord) {
                  addProjectRegistry(newRecord)
                }
                break
              case 'UPDATE':
                if (oldRecord?.id && newRecord) {
                  updateProjectRegistry(oldRecord.id, newRecord)
                }
                break
              case 'DELETE':
                if (oldRecord?.id) {
                  removeProjectRegistry(oldRecord.id)
                }
                break
            }
          }
        )

        // Subscribe to feature registry changes
        const featureSubscription = registryService.subscribeToFeatureRegistries(
          (payload: FeatureRegistryPayload) => {
            if (!mounted) return

            const { eventType, new: newRecord, old: oldRecord } = payload

            switch (eventType) {
              case 'INSERT':
                if (newRecord) {
                  addFeatureRegistry(newRecord)
                }
                break
              case 'UPDATE':
                if (oldRecord?.id && newRecord) {
                  updateFeatureRegistry(oldRecord.id, newRecord)
                }
                break
              case 'DELETE':
                if (oldRecord?.id) {
                  removeFeatureRegistry(oldRecord.id)
                }
                break
            }
          }
        )

        return () => {
          mounted = false
          projectSubscription.unsubscribe()
          featureSubscription.unsubscribe()
        }
      } catch (error) {
        console.error('Registry initialization error:', error)
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to initialize registries')
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
  }, [])

  return <>{children}</>
}

export const useRegistry = () => {
  const store = useRegistriesStore()
  
  const createProjectRegistry = async (params: Parameters<typeof registryService.createProjectRegistry>[0]) => {
    try {
      store.setLoading(true)
      const result = await registryService.createProjectRegistry(params)
      return result
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create project registry')
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  const createFeatureRegistry = async (params: Parameters<typeof registryService.createFeatureRegistry>[0]) => {
    try {
      store.setLoading(true)
      const result = await registryService.createFeatureRegistry(params)
      return result
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create feature registry')
      throw error
    } finally {
      store.setLoading(false)
    }
  }

  return {
    ...store,
    createProjectRegistry,
    createFeatureRegistry,
  }
} 
