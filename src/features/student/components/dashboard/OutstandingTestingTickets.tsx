import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  const handleTicketClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Tests</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>Outstanding Tests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground">No outstanding tests</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket.id)}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-medium leading-none">{ticket.ticket.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {ticket.feature.name} in {ticket.feature.project.name}
                  </p>
                </div>
                <Badge
                  className={priorityColors[ticket.ticket.priority]}
                  variant="secondary"
                >
                  {ticket.ticket.priority}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Due: {new Date(ticket.deadline).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
} 