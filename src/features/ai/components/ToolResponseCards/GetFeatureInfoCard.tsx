import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { UserCircle } from 'lucide-react'

interface Validation {
  id: string
  status: 'Working' | 'Needs Fixing'
  notes: string | null
  video_url: string | null
  created_at: string
  validator: {
    name: string
  } | null
}

interface TestingTicket {
  id: string
  feature_id: string
  deadline: string
  created_at: string
  tickets: {
    assigned_to: string
    title: string
    status: string
    assigned_to_user: {
      name: string
      email: string
    } | null
  }
}

interface Feature {
  id: string
  project_id: string
  name: string
  description: string
  status: string
  required_validations: number
  current_validations: number
  created_at: string
  updated_at: string
  project: {
    id: string
  }
  validations: Validation[]
  testing_tickets: TestingTicket[]
}

interface GetFeatureInfoCardProps {
  feature: Feature
  isCompact?: boolean
  onNavigate?: () => void
}

export function GetFeatureInfoCard({ feature, isCompact = false, onNavigate }: GetFeatureInfoCardProps) {
  const validationProgress = (feature.current_validations / feature.required_validations) * 100

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isCompact) {
      onNavigate?.()
    }
    window.location.href = `/student/features/${feature.id}`
  }

  return (
    <div className="block cursor-pointer" onClick={handleNavigate}>
      <Card className={`p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors ${
        isCompact ? 'p-2' : ''
      }`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${isCompact ? 'text-sm' : 'text-lg'}`}>
                {feature.name}
              </h3>
              <Badge variant={
                feature.status === 'Not Started' ? 'secondary' :
                feature.status === 'In Progress' ? 'default' :
                feature.status === 'Successful Test' ? 'success' :
                'destructive'
              } className="mt-1">
                {feature.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {!isCompact && (
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          )}

          {/* Validation Progress */}
          <div>
            <h4 className="text-sm font-medium mb-2">Validation Progress</h4>
            <Progress value={validationProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{feature.current_validations} of {feature.required_validations} validations</span>
              <span>{Math.round(validationProgress)}%</span>
            </div>
          </div>

          {/* Recent Validations */}
          {!isCompact && feature.validations && feature.validations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Validations</h4>
              <div className="space-y-2">
                {feature.validations.slice(0, 2).map((validation) => (
                  <div
                    key={validation.id}
                    className="p-2 rounded-lg border bg-background/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={validation.status === 'Working' ? 'success' : 'destructive'}>
                        {validation.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(validation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{validation.validator?.name || 'Unknown User'}</span>
                    </div>
                    {validation.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{validation.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Testers */}
          {!isCompact && feature.testing_tickets && feature.testing_tickets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Assigned Testers</h4>
              <div className="space-y-2">
                {feature.testing_tickets.slice(0, 2).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-2 rounded-lg border bg-background/50"
                  >
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {ticket.tickets.assigned_to_user?.name || 'Unassigned'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(ticket.deadline).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="mt-1" variant={
                      ticket.tickets.status === 'open' ? 'secondary' :
                      ticket.tickets.status === 'in_progress' ? 'default' :
                      ticket.tickets.status === 'resolved' ? 'success' :
                      'outline'
                    }>
                      {ticket.tickets.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Details Link */}
          <div className="text-xs text-muted-foreground">
            Click to view full details
          </div>
        </div>
      </Card>
    </div>
  )
} 