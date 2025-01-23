import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTicketManagement } from '../../store/ticketManagement.store'
import { Skeleton } from '@/components/ui/skeleton'

const StatCard = ({ label, value }: { label: string; value: number | string }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-card rounded-lg border">
    <span className="text-2xl font-bold">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
)

const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col items-center justify-center p-4 bg-card rounded-lg border">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </div>
)

export const TicketStats = () => {
  const { stats, fetchStats } = useTicketManagement()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!stats) {
    return <LoadingSkeleton />
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Tickets"
            value={stats.total}
          />
          <StatCard
            label="Open"
            value={`${stats.open} (${((stats.open / stats.total) * 100).toFixed(0)}%)`}
          />
          <StatCard
            label="In Progress"
            value={`${stats.inProgress} (${((stats.inProgress / stats.total) * 100).toFixed(0)}%)`}
          />
          <StatCard
            label="High Priority"
            value={stats.highPriority}
          />
        </div>
      </CardContent>
    </Card>
  )
} 