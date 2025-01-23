import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { studentDashboardApi } from '../api/studentDashboard.api'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { ProjectsList } from '../components/dashboard/ProjectsList'
import { RecentActivity } from '../components/dashboard/RecentActivity'

interface DashboardData {
  projects: Array<{
    id: string
    name: string
    registry: {
      name: string
    }
    feature_count: number
    validation_count: number
    required_validation_count: number
    features: Array<{
      id: string
      name: string
      status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test'
    }>
  }>
  stats: {
    total_projects: number
    total_features: number
    total_validations: number
    required_validations: number
    validation_completion: number
    projects_by_status: {
      not_started: number
      in_progress: number
      successful: number
      failed: number
    }
  }
  recentActivity: Array<{
    type: 'validation' | 'comment' | 'ticket'
    id: string
    created_at: string
    project_name: string
    feature_name: string
    details: {
      status?: string
      content?: string
      title?: string
    }
  }>
}

export const StudentDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        const data = await studentDashboardApi.getDashboardData(user.id)
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [user?.id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Failed to load dashboard</h1>
          <Button
            variant="ghost"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}!</h1>
          <p className="text-gray-500 mt-2">Here's an overview of your projects and recent activity.</p>
        </div>
        <Button onClick={() => navigate('/student/projects/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <DashboardStats stats={dashboardData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProjectsList projects={dashboardData.projects} />
        </div>
        <RecentActivity activities={dashboardData.recentActivity} />
      </div>
    </div>
  )
}

export default StudentDashboard 