import { Card, CardContent } from '@/components/ui/card'
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
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Projects</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">{stats.total_projects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_features} total features
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Validation Progress</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">
              {Math.round(stats.validation_completion)}%
            </div>
            <div className="mt-2">
              <Progress value={stats.validation_completion} className="h-2 bg-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.total_validations} of {stats.required_validations} validations
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Features by Status</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Not Started:</span>
              <span className="font-medium">{stats.projects_by_status.not_started}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">In Progress:</span>
              <span className="font-medium">{stats.projects_by_status.in_progress}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Successful:</span>
              <span className="font-medium text-green-600">{stats.projects_by_status.successful}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Failed:</span>
              <span className="font-medium text-red-600">{stats.projects_by_status.failed}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
          <div className="mt-2">
            <div className="text-3xl font-bold">
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 