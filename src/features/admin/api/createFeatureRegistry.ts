import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'

interface CreateFeatureRegistryParams {
  projectRegistryId: string
  name: string
  description: string
  isRequired: boolean
}

export const createFeatureRegistry = async ({
  projectRegistryId,
  name,
  description,
  isRequired,
}: CreateFeatureRegistryParams) => {
  const session = useAuthStore.getState().session
  
  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again.')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-feature-registry`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        projectRegistryId,
        name,
        description,
        isRequired,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create feature registry')
  }

  return response.json()
}

export const getFeatureRegistries = async (projectRegistryId: string) => {
  const session = useAuthStore.getState().session
  
  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again.')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/project-registry-list`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        registryId: projectRegistryId,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch feature registries')
  }

  const result = await response.json()
  return result.data
}
