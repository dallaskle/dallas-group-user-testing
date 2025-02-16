import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useDashboardStore } from '../store/dashboard.store'
import { DashboardStats } from '../components/dashboard/DashboardStats'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { OutstandingTestingTickets } from '../components/dashboard/OutstandingTestingTickets'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CreateProjectModal } from '../components/projects/CreateProjectModal'

export const StudentDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isLoading, error, data, loadDashboardData } = useDashboardStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id, loadDashboardData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !data) {
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
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <DashboardStats stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold">My Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
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
          <RecentActivity activities={data.recentActivity} />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard 