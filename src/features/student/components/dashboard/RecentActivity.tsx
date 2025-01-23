import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, CheckCircle2, AlertCircle, Ticket } from 'lucide-react'

interface Activity {
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
}

interface RecentActivityProps {
  activities: Activity[]
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const renderActivityIcon = (type: Activity['type'], status?: string) => {
    switch (type) {
      case 'validation':
        return status === 'Working' ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'ticket':
        return <Ticket className="h-4 w-4 text-purple-500" />
    }
  }

  const renderActivityContent = (activity: Activity) => {
    switch (activity.type) {
      case 'validation':
        return (
          <div className="flex items-center gap-2">
            <Badge variant={activity.details.status === 'Working' ? 'success' : 'destructive'}>
              {activity.details.status}
            </Badge>
            <span>validation on</span>
          </div>
        )
      case 'comment':
        return (
          <div className="flex items-center gap-2">
            <span>commented:</span>
            <span className="text-muted-foreground line-clamp-1">
              {activity.details.content}
            </span>
          </div>
        )
      case 'ticket':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline">{activity.details.status}</Badge>
            <span className="text-muted-foreground line-clamp-1">
              {activity.details.title}
            </span>
          </div>
        )
    }
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate based on activity type
                  switch (activity.type) {
                    case 'ticket':
                      navigate(`/tickets/${activity.id}`)
                      break
                    case 'validation':
                    case 'comment':
                      // Find the feature in the project and navigate to it
                      navigate(`/student/features/${activity.id}`)
                      break
                  }
                }}
              >
                <div className="mt-1">
                  {renderActivityIcon(activity.type, activity.details.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      {renderActivityContent(activity)}
                    </div>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </time>
                  </div>
                  <div className="mt-1 text-sm">
                    <span className="font-medium">{activity.feature_name}</span>
                    <span className="text-muted-foreground"> in </span>
                    <span className="font-medium">{activity.project_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 