interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  data?: {
    session: {
      access_token: string
      refresh_token: string
      expires_at: number
    }
    user: any
  }
  error?: string
  isVerificationError?: boolean
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      if (response.status === 403 && result.isVerificationError) {
        return { error: 'Please verify your email first', isVerificationError: true }
      }
      throw new Error(result.error || 'Failed to login')
    }

    return { data: result.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to login' }
  }
}
