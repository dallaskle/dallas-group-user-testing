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
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session?.access_token) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('feature_registry')
    .select('*')
    .eq('project_registry_id', projectRegistryId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
