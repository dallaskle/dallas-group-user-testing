import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { testerApi } from '../api/tester.api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TesterMetricsData = {
  totalAssigned: number
  testsCompleted: number
  testsInProgress: number
  accuracyRate: number
  avgResponseTime: number
  validationRate: number
  upcomingDeadlines: number
}

type TimePeriod = '1d' | '7d' | '30d' | 'all'

export const TesterMetrics = () => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')
  const [metrics, setMetrics] = useState<TesterMetricsData | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await testerApi.getMetrics(timePeriod)
        setMetrics(data)
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      }
    }

    fetchMetrics()
  }, [timePeriod])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Testing Metrics</h2>
        <Select value={timePeriod} onValueChange={(value: TimePeriod) => setTimePeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Tests"
          value={metrics?.totalAssigned || 0}
          description="Total tests assigned"
        />
        <MetricCard
          title="Completed Tests"
          value={metrics?.testsCompleted || 0}
          description="Tests completed"
        />
        <MetricCard
          title="Tests In Progress"
          value={metrics?.testsInProgress || 0}
          description="Currently active tests"
        />
        <MetricCard
          title="Accuracy Rate"
          value={`${metrics?.accuracyRate?.toFixed(1) || '0.0'}%`}
          description="Tests marked as working"
        />
        <MetricCard
          title="Average Response Time"
          value={formatDuration(metrics?.avgResponseTime || 0)}
          description="Average time to complete"
        />
        <MetricCard
          title="Validation Rate"
          value={`${metrics?.validationRate?.toFixed(1) || '0.0'}%`}
          description="Required validations completed"
        />
        <MetricCard
          title="Upcoming Deadlines"
          value={metrics?.upcomingDeadlines || 0}
          description="Tests due in 24 hours"
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  description: string
}

const MetricCard = ({ title, value, description }: MetricCardProps) => (
  <Card className="p-4">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </Card>
)

const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
} 