import { useAuthStore } from '../stores/auth.store'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const Dashboard = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      logout()
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name}!
            </h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>

          <div className="space-y-4">
            {user?.is_admin || user?.is_student || user?.is_tester && (
              <div>
                <h2 className="text-lg font-medium text-gray-900">Your Role</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {user?.is_admin && 'Administrator'}
                {user?.is_student && 'Student'}
                  {user?.is_tester && 'Tester'}
                </p>
              </div>
            )}

            <div>
              <h2 className="text-lg font-medium text-gray-900">Email</h2>
              <p className="mt-1 text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* Role-specific content */}
            {user?.is_admin && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h2 className="text-lg font-medium text-blue-900">Admin Dashboard</h2>
                <p className="mt-1 text-sm text-blue-700">
                  You have access to all administrative features.
                </p>
              </div>
            )}

            {user?.is_student && (
              <div className="bg-green-50 p-4 rounded-md">
                <h2 className="text-lg font-medium text-green-900">Student Dashboard</h2>
                <p className="mt-1 text-sm text-green-700">
                  You can manage your projects and submit features for testing.
                </p>
              </div>
            )}

            {user?.is_tester && (
              <div className="bg-purple-50 p-4 rounded-md">
                <h2 className="text-lg font-medium text-purple-900">Tester Dashboard</h2>
                <p className="mt-1 text-sm text-purple-700">
                  You can view and validate features assigned to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 