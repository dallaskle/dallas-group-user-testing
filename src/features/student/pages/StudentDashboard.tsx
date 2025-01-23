import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { studentDashboardApi } from '../api/studentDashboard.api'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { ProjectsList } from '../components/dashboard/ProjectsList'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { OutstandingTestingTickets } from '../components/dashboard/OutstandingTestingTickets'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

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
        <Button 
          onClick={() => navigate('/student/projects/new')} 
          className="gap-2 bg-green-700 hover:bg-green-800"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      <DashboardStats stats={dashboardData.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <div className="space-y-4">
            {dashboardData.projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-muted/50 hover:border-primary/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/student/projects/${project.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{project.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on {project.registry.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Validation Progress</span>
                        <span className="font-medium">
                          {Math.round(
                            project.required_validation_count > 0
                              ? (project.validation_count / project.required_validation_count) * 100
                              : 0
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={
                          project.required_validation_count > 0
                            ? (project.validation_count / project.required_validation_count) * 100
                            : 0
                        } 
                        className="h-2 bg-secondary" 
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        {project.validation_count} of {project.required_validation_count} validations
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        project.features.reduce(
                          (acc, feature) => {
                            acc[feature.status]++
                            return acc
                          },
                          {
                            'Not Started': 0,
                            'In Progress': 0,
                            'Successful Test': 0,
                            'Failed Test': 0,
                          } as Record<string, number>
                        )
                      ).map(([status, count]) => (
                        count > 0 && (
                          <Badge
                            key={status}
                            variant={
                              status === 'Not Started' ? 'secondary' :
                              status === 'In Progress' ? 'default' :
                              status === 'Successful Test' ? 'success' :
                              'destructive'
                            }
                          >
                            {count} {status}
                          </Badge>
                        )
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <OutstandingTestingTickets />
        </div>

        <div className="lg:col-span-4">
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard 