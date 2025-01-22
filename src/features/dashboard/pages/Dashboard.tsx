import { useAuthStore } from '../../auth/store/auth.store'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}!
          </h1>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {user?.is_admin && (
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-blue-900 mb-2">Admin Dashboard</h2>
                <p className="text-sm text-blue-700 mb-4">
                  Manage projects, users, and system settings.
                </p>
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Go to Admin Panel
                </button>
              </div>
            )}

            {user?.is_student && (
              <div className="bg-green-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-green-900 mb-2">Student Dashboard</h2>
                <p className="text-sm text-green-700 mb-4">
                  Manage your projects and submit features for testing.
                </p>
                <button
                  onClick={() => navigate('/student')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  View Your Projects
                </button>
              </div>
            )}

            {user?.is_tester && (
              <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-medium text-purple-900 mb-2">Testing Dashboard</h2>
                <p className="text-sm text-purple-700 mb-4">
                  Review and validate features assigned to you.
                </p>
                <button
                  onClick={() => navigate('/testing')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                >
                  Start Testing
                </button>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1 text-sm text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Roles</label>
                <p className="mt-1 text-sm text-gray-900">
                  {[
                    user?.is_admin && 'Administrator',
                    user?.is_student && 'Student',
                    user?.is_tester && 'Tester'
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 