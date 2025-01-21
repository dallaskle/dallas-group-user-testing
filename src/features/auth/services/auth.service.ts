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
  async getUserData(userId: string) {
    console.log('🔍 Fetching user data for ID:', userId)
    const response = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    console.log('📦 User data response:', response)
    return response
  }

  private async setUserData(session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) {
    console.log('🔄 Setting user data for session:', session)
    try {
      const { data: userData, error: userError } = await this.getUserData(session.user.id)
      
      if (userError) {
        console.error('❌ Error fetching user data:', userError)
        throw userError
      }

      console.log('✅ User data fetched successfully:', userData)
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
    console.log('🔑 Login attempt for:', data.email)
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

      console.log('✅ Login successful:', result.data)

      if (!result.data?.session) {
        throw new Error('No session in login response')
      }

      // Set the session in Supabase client
      await supabase.auth.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token
      })

      // Fetch and set user data
      const { data: userData, error: userError } = await this.getUserData(result.data.session.user.id)
      console.log('📦 User data after login:', { userData, userError })

      if (userError) {
        throw new Error('Failed to fetch user data')
      }

      // Set complete user data in store
      store.setSession({
        access_token: result.data.session.access_token,
        refresh_token: result.data.session.refresh_token,
        expires_at: result.data.session.expires_at ?? null
      })

      store.setUser({
        ...result.data.session.user,
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
    console.log('📝 Registration attempt for:', data.email)
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
    console.log('✉️ Verifying email with tokens')
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
        console.error('❌ No session after verification')
        throw new Error('Failed to establish session after verification')
      }

      console.log('✅ Email verification complete')
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
    console.log('🚀 Initializing auth')
    const store = useAuthStore.getState()
    try {
      // Initialize Supabase auth and get session
      await supabase.auth.initialize()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('📦 Initial session:', session)
      
      if (sessionError) throw sessionError

      if (session) {
        console.log('✅ Session found, setting user data')
        // Set session in store first
        store.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at ?? null
        })

        // Then fetch and set user data
        const { data: userData, error: userError } = await this.getUserData(session.user.id)
        if (userError) throw userError

        if (userData) {
          store.setUser({
            ...session.user,
            ...userData
          } as User & Tables<'users'>)
        }
      } else {
        console.log('ℹ️ No session found, clearing store')
        // No session, clear store
        store.setSession(null)
        store.setUser(null)
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to initialize auth')
      store.setSession(null)
      store.setUser(null)
    } finally {
      store.setLoading(false)
      store.setInitialized(true)
    }
  }

  subscribeToAuthChanges(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  async getSession() {
    return supabase.auth.getSession()
  }

  async getUser() {
    return supabase.auth.getUser()
  }
}

export const authService = new AuthService() 