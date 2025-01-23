import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminDashboard } from '../../store/adminDashboard.store'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'

const ActivityIcon = ({ type }: { type: string }) => {
  const iconClass = {
    'project_created': 'bg-blue-500',
    'validation_submitted': 'bg-green-500',
    'ticket_created': 'bg-yellow-500',
    'feature_created': 'bg-purple-500'
  }[type] || 'bg-gray-500'

  return (
    <div className={`w-2 h-2 rounded-full ${iconClass}`} />
  )
}

const ActivityItem = ({ 
  type, 
  title, 
  description, 
  timestamp 
}: { 
  type: string
  title: string
  description: string
  timestamp: string 
}) => (
  <div className="flex items-start gap-4 py-3">
    <ActivityIcon type={type} />
    <div className="flex-1 space-y-1">
      <p className="text-sm font-medium leading-none">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <time className="text-xs text-muted-foreground">
      {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
    </time>
  </div>
)

const LoadingItem = () => (
  <div className="flex items-start gap-4 py-3">
    <Skeleton className="w-2 h-2 rounded-full" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-3 w-16" />
  </div>
)

export const RecentActivity = () => {
  const { recentActivity, isLoadingActivity } = useAdminDashboard()

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoadingActivity ? (
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingItem key={i} />
            ))
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  timestamp={activity.timestamp}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 