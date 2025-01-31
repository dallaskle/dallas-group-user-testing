import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface Test {
  deadline: string
  feature: {
    id: string
    name: string
  }
  ticket: {
    id: string
    priority: 'low' | 'medium' | 'high'
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
    title: string
  }
}

interface GetOutstandingTestsCardProps {
  tests: Test[]
  total: number
  isCompact?: boolean
  onNavigate?: () => void
}

export function GetOutstandingTestsCard({ tests, total, isCompact = false, onNavigate }: GetOutstandingTestsCardProps) {
  const handleTestClick = (e: React.MouseEvent, featureId: string) => {
    e.preventDefault()
    onNavigate?.()
    // Navigate to the feature page
    window.location.href = `/student/features/${featureId}`
  }

  const formatDeadline = (dateString: string) => {
    const deadline = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours}h left`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d left`
    }
  }

  return (
    <Card className={`p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ${
      isCompact ? 'p-2' : ''
    }`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-blue-700 dark:text-blue-300 ${
            isCompact ? 'text-sm' : 'text-lg'
          }`}>
            Outstanding Tests
          </h3>
          <Badge variant="secondary" className="text-blue-700 dark:text-blue-300">
            {total} {total === 1 ? 'test' : 'tests'}
          </Badge>
        </div>

        <div className={`space-y-4 ${isCompact ? 'space-y-2' : ''}`}>
          {tests.map((test) => (
            <div 
              key={test.ticket.id}
              onClick={(e) => handleTestClick(e, test.feature.id)}
              className="cursor-pointer"
            >
              <div className="p-2 rounded-md bg-background/50 hover:bg-background/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`${
                      test.ticket.priority === 'high' ? 'text-red-500 border-red-500' :
                      test.ticket.priority === 'medium' ? 'text-yellow-500 border-yellow-500' :
                      'text-green-500 border-green-500'
                    }`}>
                      {test.ticket.priority}
                    </Badge>
                    <span className={`font-medium ${isCompact ? 'text-xs' : 'text-sm'}`}>
                      {test.feature.name}
                    </span>
                  </div>
                  <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    {formatDeadline(test.deadline)}
                  </span>
                </div>
                {!isCompact && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {test.ticket.title}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-muted-foreground">
                    Status: {test.ticket.status}
                  </span>
                  <Badge variant="outline" className={`${
                    test.ticket.status === 'open' ? 'text-blue-500 border-blue-500' :
                    test.ticket.status === 'in_progress' ? 'text-yellow-500 border-yellow-500' :
                    'text-green-500 border-green-500'
                  }`}>
                    {test.ticket.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 