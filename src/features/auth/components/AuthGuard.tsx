import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'student' | 'tester')[]
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const location = useLocation()
  const { user, isInitialized, isLoading } = useAuthStore()

  // Show loading state while auth is initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role access if roles are specified
  if (allowedRoles) {
    const hasRequiredRole = allowedRoles.some(role => {
      switch (role) {
        case 'admin':
          return user.is_admin
        case 'student':
          return user.is_student
        case 'tester':
          return user.is_tester
        default:
          return false
      }
    })

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
} 