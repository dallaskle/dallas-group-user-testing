import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import type { User, Session } from '@supabase/supabase-js'
import type { Tables } from '../../../lib/supabase'
import { login } from '../api/login'
import type { LoginResponse } from '../api/login'
import { register } from '../api/register'
import type { RegisterResponse } from '../api/register'
import { resendVerification } from '../api/verify'
import type { ResendVerificationResponse } from '../api/verify'
import { getUser } from '../api/user'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  password: string
  name: string
}

class AuthService {
  async getUserData(userId: string) {
    const store = useAuthStore.getState()
    if (!store.session?.access_token) {
      throw new Error('No active session')
    }

    const response = await getUser(store.session.access_token)
    if (response.error) {
      throw new Error(response.error)
    }
    return { data: response.data, error: null }
  }

  // @ts-expect-error Method is used internally
  private async setUserData(session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) {
    try {
      const { data: userData, error: userError } = await this.getUserData(session.user.id)
      
      if (userError) {
        console.error('❌ Error fetching user data:', userError)
        throw userError
      }

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
      console.error('❌ Error in setUserData:', error)
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
        console.warn('⚠️ Login error:', result)
        if (result.isVerificationError) {
          return { error: 'Please verify your email first', isVerificationError: true }
        }
        throw new Error(result.error)
      }

      if (!result.data?.session) {
        throw new Error('No session in login response')
      }

      const session = result.data.session as Session

      // Set the session in Supabase client
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })

      // Fetch and set user data
      const { data: userData, error: userError } = await this.getUserData(session.user.id)

      if (userError) {
        throw new Error('Failed to fetch user data')
      }

      // Set complete user data in store
      store.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? null
      })

      store.setUser({
        ...session.user,
        ...userData
      } as User & Tables<'users'>)

      return { data: result.data }
    } catch (error) {
      console.error('❌ Login error:', error)
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
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) {
        throw error
      }

      // Verify the session was set correctly
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!currentSession) {
        console.error('❌ No session after verification')
        throw new Error('Failed to establish session after verification')
      }
      return { data: currentSession }
    } catch (error) {
      console.error('❌ Email verification error:', error)
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
      // Initialize Supabase auth and get session
      await supabase.auth.initialize()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError

      if (session) {
        // Set session in store first
        store.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at ?? null
        })

        // Then fetch and set user data
        const { data: userData, error: userError } = await this.getUserData(session.user.id)
        
        if (userError) {
          throw userError
        }

        if (userData) {
          store.setUser({
            ...session.user,
            ...userData
          } as User & Tables<'users'>)
        }
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to initialize auth')
      store.logout()
    }
  }

  subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  async getSession() {
    return await supabase.auth.getSession()
  }

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

export const authService = new AuthService() 