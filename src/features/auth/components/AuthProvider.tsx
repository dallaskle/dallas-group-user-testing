import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/auth.store'

interface AuthProviderProps {
  children: React.ReactNode
}

export const useAuth = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

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

  const register = async (data: { email: string; password: string; name: string }) => {
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
  const location = useLocation()
  const { setSession, setUser, setLoading, setInitialized } = useAuthStore()

  useEffect(() => {
    let mounted = true
    let initialSessionChecked = false

    const init = async () => {
      try {
        setLoading(true)
        // Initialize auth
        await authService.initializeAuth()
        
        if (!mounted) return
        
        // Subscribe to auth changes
        const { data: { subscription } } = authService.subscribeToAuthChanges(
          async (event, session) => {
            console.log('Auth event:', event, 'Session:', session)
            
            if (!mounted) return

            if (event === 'SIGNED_IN' && session) {
              console.log('Auth state changed: SIGNED_IN')
              // Only navigate to dashboard on fresh sign-ins, not session refreshes
              if (!initialSessionChecked) {
                initialSessionChecked = true
                // On initial load, don't redirect
              } else {
                // Only redirect on actual new sign-ins
                if (['/login', '/register', '/'].includes(location.pathname)) {
                  navigate('/dashboard')
                }
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
  }, [navigate, location.pathname, setSession, setUser, setLoading, setInitialized])

  return <>{children}</>
} 