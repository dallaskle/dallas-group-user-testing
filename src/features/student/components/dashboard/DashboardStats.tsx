import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface DashboardStatsProps {
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
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total_projects}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total_features} total features
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Validation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Math.round(stats.validation_completion)}%
          </div>
          <div className="mt-2">
            <Progress value={stats.validation_completion} className="h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.total_validations} of {stats.required_validations} validations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Features by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Not Started:</span>
              <span className="font-medium">{stats.projects_by_status.not_started}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">In Progress:</span>
              <span className="font-medium">{stats.projects_by_status.in_progress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Successful:</span>
              <span className="font-medium text-green-600">{stats.projects_by_status.successful}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Failed:</span>
              <span className="font-medium text-red-600">{stats.projects_by_status.failed}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.projects_by_status.successful > 0
              ? Math.round(
                  (stats.projects_by_status.successful /
                    (stats.projects_by_status.successful + stats.projects_by_status.failed)) *
                    100
                )
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.projects_by_status.successful} successful of{' '}
            {stats.projects_by_status.successful + stats.projects_by_status.failed} tested features
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 