export interface ResendVerificationRequest {
  email: string
}

export interface ResendVerificationResponse {
  data?: {
    message: string
  }
  error?: string
}

export const resendVerification = async (data: ResendVerificationRequest): Promise<ResendVerificationResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-resend-verification`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to resend verification email')
    }

    return { data: result.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to resend verification' }
  }
}

export interface VerifyEmailRequest {
  accessToken: string
  refreshToken: string
}

export interface VerifyEmailResponse {
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

export const verifyEmail = async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-verify-email`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to verify email')
    }

    return { data: result.data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to verify email' }
  }
} 