import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

  useEffect(() => {
    // Initialize auth state
    authService.initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = authService.subscribeToAuthChanges(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          navigate('/dashboard')
        }

        if (event === 'SIGNED_OUT') {
          navigate('/login')
        }
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  return <>{children}</>
} 