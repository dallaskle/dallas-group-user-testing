import { useEffect } from 'react'
import { ProjectsWidget } from '../components/dashboard/ProjectsWidget'
import { useProjectsStore } from '../store/projects.store'
import { useAuthStore } from '@/features/auth/store/auth.store'

export const StudentDashboard = () => {
  const { user } = useAuthStore()
  const { fetchProjects } = useProjectsStore()

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user, fetchProjects])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome back!</h1>
        <p className="text-gray-500">Here's an overview of your projects and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectsWidget />
        {/* FeaturesWidget and ValidationsWidget will be added here */}
      </div>
    </div>
  )
}

export default StudentDashboard 