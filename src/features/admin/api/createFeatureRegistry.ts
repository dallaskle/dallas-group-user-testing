import { supabase } from '@/lib/supabase'

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
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session?.access_token) {
    throw new Error('Unauthorized')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-feature-registry`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`,
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
