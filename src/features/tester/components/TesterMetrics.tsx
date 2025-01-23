import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { useTesterStore } from '../store/tester.store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TimePeriod = '1d' | '7d' | '30d' | 'all'

export const TesterMetrics = () => {
  const { queue, ticketHistory } = useTesterStore()
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all')

  const metrics = useMemo(() => {
    const now = new Date()
    const filterDate = new Date(now)
    
    // Set filter date based on selected time period
    switch (timePeriod) {
      case '1d':
        filterDate.setDate(now.getDate() - 1)
        break
      case '7d':
        filterDate.setDate(now.getDate() - 7)
        break
      case '30d':
        filterDate.setDate(now.getDate() - 30)
        break
      case 'all':
        filterDate.setFullYear(2000) // Set to past date to include all
        break
    }

    // Filter tickets based on time period
    const filteredHistory = ticketHistory.filter(ticket => 
      new Date(ticket.updated_at) > filterDate
    )

    // Calculate metrics
    const totalAssigned = queue.length + filteredHistory.length
    const testsCompleted = filteredHistory.length
    const testsInProgress = queue.filter(t => t.status === 'in_progress').length
    
    // Calculate validation metrics
    const allValidations = filteredHistory.flatMap(ticket => 
      ticket.testing_ticket.feature.validations || []
    )
    const workingValidations = allValidations.filter(v => v.status === 'Working').length
    const accuracyRate = allValidations.length > 0 
      ? (workingValidations / allValidations.length) * 100 
      : 0

    // Calculate average response time
    const responseTimes = filteredHistory.map(ticket => 
      new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime()
    )
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0

    // Calculate validation rate
    const totalRequired = filteredHistory.reduce((sum, ticket) => 
      sum + ticket.testing_ticket.feature.required_validations, 0
    )
    const totalCompleted = filteredHistory.reduce((sum, ticket) => 
      sum + ticket.testing_ticket.feature.current_validations, 0
    )
    const validationRate = totalRequired > 0 
      ? (totalCompleted / totalRequired) * 100 
      : 0

    // Calculate upcoming deadlines (next 24 hours)
    const upcomingDeadlines = queue.filter(ticket => {
      const deadline = new Date(ticket.testing_ticket.deadline)
      const timeDiff = deadline.getTime() - now.getTime()
      return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0
    }).length

    return {
      totalAssigned,
      testsCompleted,
      testsInProgress,
      accuracyRate,
      avgResponseTime,
      validationRate,
      upcomingDeadlines
    }
  }, [queue, ticketHistory, timePeriod])

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
          value={metrics.totalAssigned}
          description="Total tests assigned"
        />
        <MetricCard
          title="Completed Tests"
          value={metrics.testsCompleted}
          description="Tests completed"
        />
        <MetricCard
          title="Tests In Progress"
          value={metrics.testsInProgress}
          description="Currently active tests"
        />
        <MetricCard
          title="Accuracy Rate"
          value={`${metrics.accuracyRate.toFixed(1)}%`}
          description="Tests marked as working"
        />
        <MetricCard
          title="Average Response Time"
          value={formatDuration(metrics.avgResponseTime)}
          description="Average time to complete"
        />
        <MetricCard
          title="Validation Rate"
          value={`${metrics.validationRate.toFixed(1)}%`}
          description="Required validations completed"
        />
        <MetricCard
          title="Upcoming Deadlines"
          value={metrics.upcomingDeadlines}
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