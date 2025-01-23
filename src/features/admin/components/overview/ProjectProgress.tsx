import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminDashboard } from '../../store/adminDashboard.store'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface ProgressBarProps {
  label: string
  value: number
  total: number
  color: string
  isLoading?: boolean
}

const ProgressBar = ({ label, value, total, color, isLoading }: ProgressBarProps) => {
  const percentage = Math.round((value / total) * 100)

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-2 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} / {total}</span>
      </div>
      <Progress value={percentage} className={color} />
    </div>
  )
}

export const ProjectProgress = () => {
  const { metrics, isLoadingMetrics } = useAdminDashboard()

  // This would ideally come from the API, but for now we'll calculate from metrics
  const projectStats = {
    inProgress: metrics?.totalProjects || 0,
    completed: 0,
    total: metrics?.totalProjects || 0
  }

  const featureStats = {
    notStarted: 0,
    inProgress: metrics?.totalFeatures || 0,
    successful: 0,
    failed: 0,
    total: metrics?.totalFeatures || 0
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Projects</h4>
          <ProgressBar
            label="In Progress"
            value={projectStats.inProgress}
            total={projectStats.total}
            color="bg-blue-500"
            isLoading={isLoadingMetrics}
          />
          <ProgressBar
            label="Completed"
            value={projectStats.completed}
            total={projectStats.total}
            color="bg-green-500"
            isLoading={isLoadingMetrics}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Features</h4>
          <ProgressBar
            label="Not Started"
            value={featureStats.notStarted}
            total={featureStats.total}
            color="bg-gray-500"
            isLoading={isLoadingMetrics}
          />
          <ProgressBar
            label="In Progress"
            value={featureStats.inProgress}
            total={featureStats.total}
            color="bg-yellow-500"
            isLoading={isLoadingMetrics}
          />
          <ProgressBar
            label="Successful"
            value={featureStats.successful}
            total={featureStats.total}
            color="bg-green-500"
            isLoading={isLoadingMetrics}
          />
          <ProgressBar
            label="Failed"
            value={featureStats.failed}
            total={featureStats.total}
            color="bg-red-500"
            isLoading={isLoadingMetrics}
          />
        </div>
      </CardContent>
    </Card>
  )
} 