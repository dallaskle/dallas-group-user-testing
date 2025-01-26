import { useAuthStore } from '@/features/auth/store/auth.store'

interface CreateProjectRegistryParams {
  name: string
  description: string
}

export const createProjectRegistry = async ({
  name,
  description,
}: CreateProjectRegistryParams) => {
  const session = useAuthStore.getState().session
  
  if (!session?.access_token) {
    throw new Error('No active session found. Please log in again.')
  }

  console.log('session', session)

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-project-registry`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name,
        description,
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create project registry')
  }

  return response.json()
}

export const getProjectRegistries = async () => {
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
      body: JSON.stringify({}),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch project registries')
  }

  const result = await response.json()
  return result.data
} 
