import { Card, CardContent } from '@/components/ui/card'
import { useAdminDashboard } from '../../store/adminDashboard.store'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons'

interface MetricCardProps {
  title: string
  value: number
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
}

const MetricCard = ({ title, value, trend, isLoading }: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value}</span>
          {trend && (
            <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const GlobalMetricsRow = () => {
  const { metrics, isLoadingMetrics } = useAdminDashboard()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Total Projects"
        value={metrics?.totalProjects || 0}
        isLoading={isLoadingMetrics}
      />
      <MetricCard
        title="Total Features"
        value={metrics?.totalFeatures || 0}
        isLoading={isLoadingMetrics}
      />
      <MetricCard
        title="Pending Validations"
        value={metrics?.pendingValidations || 0}
        isLoading={isLoadingMetrics}
      />
      <MetricCard
        title="Total Testers"
        value={metrics?.totalTesters || 0}
        isLoading={isLoadingMetrics}
      />
      <MetricCard
        title="Active Testers"
        value={metrics?.activeTesters || 0}
        trend={{
          value: metrics ? Math.round((metrics.activeTesters / metrics.totalTesters) * 100) : 0,
          isPositive: true
        }}
        isLoading={isLoadingMetrics}
      />
    </div>
  )
} 