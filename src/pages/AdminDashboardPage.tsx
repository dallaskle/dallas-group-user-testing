import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']
type FeatureStatus = Database['public']['Tables']['feature_statuses']['Row']
type User = Database['public']['Tables']['users']['Row']

interface ProjectStats {
  project: Project
  features: number
  completedFeatures: number
  totalValidations: number
  workingValidations: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([])
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (projectsError) throw projectsError

      // Fetch all features
      const { data: features, error: featuresError } = await supabase
        .from('features')
        .select('*')

      if (featuresError) throw featuresError

      // Fetch all feature statuses
      const { data: statuses, error: statusesError } = await supabase
        .from('feature_statuses')
        .select('*')

      if (statusesError) throw statusesError

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('full_name', { ascending: true })

      if (usersError) throw usersError
      setUsers(usersData)

      // Calculate stats for each project
      const stats = projects.map((project) => {
        const projectFeatures = features.filter(
          (f) => f.project_id === project.id
        )
        const projectStatuses = statuses.filter((s) =>
          projectFeatures.some((f) => f.id === s.feature_id)
        )

        const completedFeatures = projectFeatures.filter((feature) => {
          const featureStatuses = statuses.filter(
            (s) => s.feature_id === feature.id && s.status === 'working'
          )
          return featureStatuses.length >= 3 // A feature is complete when it has 3 or more "working" validations
        }).length

        return {
          project,
          features: projectFeatures.length,
          completedFeatures,
          totalValidations: projectStatuses.length,
          workingValidations: projectStatuses.filter(
            (s) => s.status === 'working'
          ).length,
        }
      })

      setProjectStats(stats)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center">Loading dashboard data...</div>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Projects
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {projectStats.length}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Features
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {projectStats.reduce((acc, curr) => acc + curr.features, 0)}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Completed Features
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {projectStats.reduce(
                      (acc, curr) => acc + curr.completedFeatures,
                      0
                    )}
                  </dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {users.length}
                  </dd>
                </div>
              </div>
            </div>

            {/* Project List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Project Status
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Features
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Completed
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projectStats.map(({ project, features, completedFeatures }) => (
                        <tr
                          key={project.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => navigate(`/project/${project.id}`)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {project.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {features}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {completedFeatures}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-end">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 w-44">
                                <div
                                  className="bg-green-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      features > 0
                                        ? (completedFeatures / features) * 100
                                        : 0
                                    }%`,
                                  }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-500">
                                {features > 0
                                  ? Math.round(
                                      (completedFeatures / features) * 100
                                    )
                                  : 0}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Users
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.full_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 