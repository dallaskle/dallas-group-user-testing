import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '../../../lib/supabase'
import { login } from '../api/login'
import type { LoginResponse } from '../api/login'
import { register } from '../api/register'
import type { RegisterResponse } from '../api/register'
import { resendVerification } from '../api/verify'
import type { ResendVerificationResponse } from '../api/verify'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'student' | 'tester'
}

class AuthService {
  private async setUserData(session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (userError) throw userError

      const store = useAuthStore.getState()
      store.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? null
      })
      
      store.setUser({
        ...session.user,
        ...userData
      } as User & Tables<'users'>)

      return true
    } catch (error) {
      const store = useAuthStore.getState()
      store.setError(error instanceof Error ? error.message : 'Failed to fetch user data')
      store.logout()
      return false
    }
  }

  async login(data: LoginData): Promise<{ data?: LoginResponse['data'], error?: string, isVerificationError?: boolean }> {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)

      const result = await login(data)

      if ('error' in result) {
        if (result.isVerificationError) {
          return { error: 'Please verify your email first', isVerificationError: true }
        }
        throw new Error(result.error)
      }

      if (!result.data?.session) {
        throw new Error('Invalid response from server')
      }

      // Set the session in Supabase client
      await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token
      })

      return { data: result.data }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to login')
      return { error: error instanceof Error ? error.message : 'Failed to login' }
    } finally {
      store.setLoading(false)
    }
  }

  async register(data: RegisterData): Promise<{ data?: RegisterResponse['data'], error?: string }> {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)

      const result = await register(data)

      if ('error' in result) {
        throw new Error(result.error)
      }

      if (!result.data?.session) {
        throw new Error('Invalid response from server')
      }

      // Set the session in Supabase client
      await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token
      })

      return { data: result.data }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to register')
      return { error: error instanceof Error ? error.message : 'Failed to register' }
    } finally {
      store.setLoading(false)
    }
  }

  async resendVerification(email: string): Promise<{ data?: ResendVerificationResponse['data'], error?: string }> {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)

      const result = await resendVerification({ email })

      if ('error' in result) {
        throw new Error(result.error)
      }

      return { data: result.data }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to resend verification')
      return { error: error instanceof Error ? error.message : 'Failed to resend verification' }
    } finally {
      store.setLoading(false)
    }
  }

  async verifyEmail(accessToken: string, refreshToken: string) {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)

      // Set the session in Supabase
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) {
        throw error
      }

      // Verify the session was set correctly
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!currentSession) {
        throw new Error('Failed to establish session after verification')
      }

      // Create user record if it doesn't exist
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', currentSession.user.id)
        .single()

      if (!existingUser) {
        const { error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: currentSession.user.id,
              email: currentSession.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              email_verified: true
            }
          ])

        if (createError) {
          throw new Error('Failed to create user record: ' + createError.message)
        }
      }

      return { data: currentSession }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to verify email')
      return { error: error instanceof Error ? error.message : 'Failed to verify email' }
    } finally {
      store.setLoading(false)
    }
  }

  async logout() {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)
      await supabase.auth.signOut()
      store.logout()
      return { success: true }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to logout')
      return { error: error instanceof Error ? error.message : 'Failed to logout' }
    } finally {
      store.setLoading(false)
    }
  }

  async initializeAuth() {
    const store = useAuthStore.getState()
    try {
      store.setLoading(true)
      
      // Check active session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        await this.setUserData(session)
      }
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to initialize auth')
      store.logout()
    } finally {
      store.setLoading(false)
      store.setInitialized(true)
    }
  }

  subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService() 