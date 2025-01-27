import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useProjectsStore } from '../../store/projects.store'

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const validationStatusColors: Record<string, string> = {
  'Working': 'text-green-500',
  'Needs Fixing': 'text-red-500',
}

export function OutstandingTestingTickets() {
  const navigate = useNavigate()
  const { outstandingTestingTickets: tickets, isLoadingTickets: isLoading, fetchOutstandingTestingTickets } = useProjectsStore()

  useEffect(() => {
    fetchOutstandingTestingTickets()
  }, [fetchOutstandingTestingTickets])

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

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`)
  }

  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Outstanding Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="text-lg">Outstanding Tests</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <p className="text-center text-muted-foreground">No outstanding tests</p>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="mt-1 flex-shrink-0">
                    {ticket.ticket.priority === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="text-sm">
                      <span className="font-medium">{ticket.feature.name}</span>
                      <span className="text-muted-foreground"> in </span>
                      <span className="font-medium">{ticket.feature.project.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Validations: {ticket.feature.current_validations}/{ticket.feature.required_validations}</span>
                      <span className="mr-2">{formatDeadline(ticket.deadline)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {ticket.ticket.assignedTo ? (
                          <>Assigned to <span className="font-medium">{ticket.ticket.assignedTo.name}</span></>
                        ) : (
                          'Unassigned'
                        )}
                      </span>
                      <Badge
                        className={`${priorityColors[ticket.ticket.priority]}`}
                        variant="secondary"
                      >
                        {ticket.ticket.priority}
                      </Badge>
                    </div>
                    {ticket.validation && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        {ticket.validation.status === 'Working' ? (
                          <CheckCircle2 className={`h-3 w-3 ${validationStatusColors[ticket.validation.status]}`} />
                        ) : (
                          <XCircle className={`h-3 w-3 ${validationStatusColors[ticket.validation.status]}`} />
                        )}
                        <span className={validationStatusColors[ticket.validation.status]}>
                          {ticket.validation.status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 