import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/auth.store'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '../../lib/supabase'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate()
  const { setUser, setSession, setError, setLoading, setInitialized, logout } = useAuthStore()
  const isInitializing = useRef(true)

  // Helper function to set user data
  const setUserData = async (session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      console.log('User data fetch result:', { hasData: !!userData, hasError: !!userError })

      if (userError) throw userError

      setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at ?? null
      })
      
      setUser({
        ...session.user,
        ...userData
      } as User & Tables<'users'>)

      return true
    } catch (error) {
      console.error('Error setting user data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch user data')
      logout()
      return false
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        console.log('Initializing auth...')
        
        // Check active session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Session check result:', { hasSession: !!session })
        
        if (session) {
          await setUserData(session)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError(error instanceof Error ? error.message : 'Failed to initialize auth')
        logout()
      } finally {
        setLoading(false)
        setInitialized(true)
        isInitializing.current = false
        console.log('Auth initialization complete')
      }
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('Auth state change:', event, { isInitializing: isInitializing.current })
          
          // Skip state changes during initialization
          if (isInitializing.current) {
            console.log('Skipping auth state change during initialization')
            return
          }

          setLoading(true)
          
          if (event === 'SIGNED_IN' && session) {
            const success = await setUserData(session)
            if (success) {
              navigate('/dashboard')
            }
          }

          if (event === 'SIGNED_OUT') {
            logout()
            navigate('/login')
          }

          if (event === 'TOKEN_REFRESHED' && session) {
            setSession({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
              expires_at: session.expires_at ?? null
            })
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setError(error instanceof Error ? error.message : 'Failed to handle auth state change')
        } finally {
          setLoading(false)
        }
      }
    )

    initializeAuth()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setError, setLoading, setInitialized, logout, navigate])

  return <>{children}</>
} 