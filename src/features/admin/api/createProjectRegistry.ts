import { supabase } from '@/lib/supabase'

interface CreateProjectRegistryParams {
  name: string
  description: string
}

export const createProjectRegistry = async ({
  name,
  description,
}: CreateProjectRegistryParams) => {
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session?.access_token) {
    throw new Error('Unauthorized')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-project-registry`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`,
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
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (!sessionData.session?.access_token) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('project_registry')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
} 
