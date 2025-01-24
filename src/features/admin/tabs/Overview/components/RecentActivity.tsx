import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import { MessageSquare, CheckCircle2, AlertCircle, Ticket, UserPlus, FolderPlus, FileText, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const ACTIVITY_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Projects', value: 'project' },
  { label: 'Features', value: 'feature' },
  { label: 'Validations', value: 'validation' },
  { label: 'Comments', value: 'comment' },
  { label: 'Tickets', value: 'ticket' },
  { label: 'Users', value: 'user' },
  { label: 'Project Registry', value: 'project_registry' },
  { label: 'Feature Registry', value: 'feature_registry' }
] as const

export const RecentActivity = () => {
  const navigate = useNavigate()
  const { activities, selectedTimeframe, setSelectedTimeframe } = useAdminDashboardStore()
  const [selectedFilter, setSelectedFilter] = useState<typeof ACTIVITY_FILTERS[number]['value'] | 'all'>('all')

  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(Number(value))
  }

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case 'project_registry':
        return <FolderPlus className="h-4 w-4 text-purple-500" />
      case 'feature_registry':
        return <FileText className="h-4 w-4 text-indigo-500" />
      case 'project':
        return <FolderPlus className="h-4 w-4 text-green-500" />
      case 'feature':
        return <GitBranch className="h-4 w-4 text-yellow-500" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case 'validation':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'ticket':
        return <Ticket className="h-4 w-4 text-purple-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getActivityContent = (activity: typeof activities[number]) => {
    const { type, actor, data } = activity

    switch (type) {
      case 'user':
        return `${actor.name} just signed up`
      case 'project_registry':
        return `${actor.name} created a new project template: ${data.name}`
      case 'feature_registry':
        return `${actor.name} added a new feature template: ${data.name} to ${data.project_name}`
      case 'project':
        return `${actor.name} created a new project: ${data.name}`
      case 'feature':
        return `${actor.name} added feature ${data.name} to ${data.project_name}`
      case 'comment':
        return `${actor.name} commented on ${data.feature_name} in ${data.project_name}: ${data.content}`
      case 'validation':
        return `${actor.name} marked ${data.feature_name} in ${data.project_name} as ${data.status}`
      case 'ticket':
        return `${actor.name} created a new ${data.ticket_type} ticket${data.assigned_to ? ` assigned to ${data.assigned_to.name}` : ''}: ${data.title}`
      default:
        return 'Unknown activity'
    }
  }

  const getActivityLink = (activity: typeof activities[number]) => {
    switch (activity.type) {
      case 'ticket':
        return `/tickets/${activity.id.replace('ticket-', '')}`
      case 'project':
        return `/projects/${activity.id.replace('project-', '')}`
      case 'feature':
        return `/features/${activity.id.replace('feature-', '')}`
      default:
        return '#'
    }
  }

  const filteredActivities = selectedFilter === 'all'
    ? activities
    : activities.filter(activity => activity.type === selectedFilter)

  return (
    <Card className="bg-muted/50">
      <CardHeader className="space-y-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
          <Select
            value={String(selectedTimeframe)}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Past 24 hours</SelectItem>
              <SelectItem value="2">Past 2 days</SelectItem>
              <SelectItem value="7">Past week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={cn(
                "px-3 py-1 text-sm rounded-full transition-colors",
                "hover:bg-primary/10",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                selectedFilter === filter.value
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                  getActivityLink(activity) !== '#' && "cursor-pointer"
                )}
                onClick={() => {
                  const link = getActivityLink(activity)
                  if (link !== '#') {
                    navigate(link)
                  }
                }}
              >
                <div className="mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm">
                      {getActivityContent(activity)}
                    </p>
                    <time className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(activity.created_at)}
                    </time>
                  </div>
                </div>
              </div>
            ))}
            {filteredActivities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 