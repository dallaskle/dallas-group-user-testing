import { useAuthStore } from '../../auth/store/auth.store'
import { Navigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuthStore()

  // Redirect based on role priority: Admin > Student > Tester
  if (user?.is_admin) {
    return <Navigate to="/admin" replace />
  }
  
  if (user?.is_student) {
    return <Navigate to="/student" replace />
  }
  
  if (user?.is_tester) {
    return <Navigate to="/testing" replace />
  }

  // Fallback to unauthorized if somehow no role (shouldn't happen due to AuthGuard)
  return <Navigate to="/unauthorized" replace />
}

export default Dashboard 