export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'student' | 'tester'
}

export interface RegisterResponse {
  data?: {
    session: {
      access_token: string
      refresh_token: string
      expires_at: number
    }
    user: any
  }
  error?: string
}

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to register')
    }

    return { data: result.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to register' }
  }
}
