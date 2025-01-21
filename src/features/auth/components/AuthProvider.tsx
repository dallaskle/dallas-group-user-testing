import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '@/lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const useAuth = () => {
  const navigate = useNavigate()
  const { user, setSession } = useAuthStore()

  const isAuthenticated = !!user

  const login = async (data: { email: string; password: string }) => {
    const result = await authService.login(data)
    if (result.error) {
      if (result.isVerificationError) {
        navigate('/verify-email', { state: { email: data.email } })
      }
      return result
    }
    return result
  }

  const register = async (data: { email: string; password: string; name: string; role: 'student' | 'tester' }) => {
    const result = await authService.register(data)
    return result
  }

  const logout = async () => {
    const result = await authService.logout()
    if (result.success) {
      navigate('/login')
    }
    return result
  }

  return {
    login,
    register,
    logout,
    isAuthenticated
  }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const { setSession, setUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        setLoading(true)
        // Initialize auth
        await authService.initializeAuth()
        
        if (!mounted) return
        
        // Subscribe to auth changes
        const { data: { subscription } } = authService.subscribeToAuthChanges(
          async (event, session) => {
            if (!mounted) return

            if (event === 'SIGNED_IN' && session) {
              setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
                expires_at: session.expires_at ?? null
              })

              // Fetch user data from the database
              const { data: userData, error: userError } = await authService.getUserData(session.user.id)
              if (!userError && userData) {
                setUser({
                  ...session.user,
                  ...userData
                } as User & Tables<'users'>)
                navigate('/dashboard')
              }
            }

            if (event === 'SIGNED_OUT') {
              setSession(null)
              setUser(null)
              navigate('/login')
            }
          }
        )

        if (!mounted) {
          subscription.unsubscribe()
          return
        }

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [navigate, setSession, setUser, setLoading, setInitialized])

  return <>{children}</>
} 