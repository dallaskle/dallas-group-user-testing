import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Clock, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { studentDashboardApi } from '../../api/studentDashboard.api'

interface OutstandingTestingTicket {
  id: string
  deadline: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
  ticket: {
    title: string
    status: string
    priority: string
  }
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export function OutstandingTestingTickets() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [tickets, setTickets] = useState<OutstandingTestingTicket[]>([])

  useEffect(() => {
    const loadTickets = async () => {
      if (!user?.id) return
      
      try {
        setIsLoading(true)
        const data = await studentDashboardApi.getOutstandingTestingTickets(user.id)
        setTickets(data)
      } catch (error) {
        console.error('Failed to load testing tickets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [user?.id])

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
                  <div className="mt-1">
                    {ticket.ticket.priority === 'high' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={priorityColors[ticket.ticket.priority]}
                              variant="secondary"
                            >
                              {ticket.ticket.priority}
                            </Badge>
                            <span className="text-muted-foreground line-clamp-1">
                              {ticket.ticket.title}
                            </span>
                          </div>
                          <p className="text-sm">
                            <span className="font-medium">{ticket.feature.name}</span>
                            <span className="text-muted-foreground"> in </span>
                            <span className="font-medium">{ticket.feature.project.name}</span>
                          </p>
                        </div>
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDeadline(ticket.deadline)}
                      </time>
                    </div>
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