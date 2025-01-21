import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTicketsStore } from '../../store/tickets.store'
import type { TicketResponse } from '../../api/types'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

const statusTransitions = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['in_progress'],
}

export interface TicketDetailsProps {
  ticketId: string
  className?: string
}

export function TicketDetails({ ticketId, className }: TicketDetailsProps) {
  const {
    selectedTicket,
    isLoading,
    fetchTicketById,
    transitionTicket,
    assignTicket,
  } = useTicketsStore()

  useEffect(() => {
    fetchTicketById(ticketId)
  }, [ticketId, fetchTicketById])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!selectedTicket) {
    return (
      <div className="text-center text-gray-500">Ticket not found</div>
    )
  }

  const { ticket, testingDetails, supportDetails, assignedToUser, createdByUser } =
    selectedTicket

  const handleStatusTransition = async (newStatus: string) => {
    await transitionTicket(ticket.id, newStatus)
  }

  const handleAssign = async (userId: string | null) => {
    await assignTicket(ticket.id, userId)
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{ticket.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{ticket.type}</Badge>
          <Badge className={statusColors[ticket.status]} variant="secondary">
            {ticket.status}
          </Badge>
          <Badge className={priorityColors[ticket.priority]} variant="secondary">
            {ticket.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1 text-sm text-gray-900">{ticket.description}</p>
          </div>

          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created By</h3>
              <p className="mt-1 text-sm text-gray-900">
                {createdByUser?.name || 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Assigned To</h3>
              <p className="mt-1 text-sm text-gray-900">
                {assignedToUser?.name || 'Unassigned'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Type-specific details */}
          {ticket.type === 'testing' && testingDetails && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Testing Details
              </h3>
              <div className="mt-1 space-y-2">
                <p className="text-sm text-gray-900">
                  Deadline:{' '}
                  {new Date(testingDetails.deadline).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {ticket.type === 'support' && supportDetails && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Support Details
              </h3>
              <div className="mt-1 space-y-2">
                <p className="text-sm text-gray-900">
                  Category: {supportDetails.category}
                </p>
                {supportDetails.ai_response && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      AI Response
                    </h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {supportDetails.ai_response}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status transitions */}
          <div>
            <h3 className="text-sm font-medium text-gray-500">Actions</h3>
            <div className="mt-2 flex gap-2">
              {statusTransitions[ticket.status]?.map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  onClick={() => handleStatusTransition(status)}
                >
                  Move to {status.replace('_', ' ')}
                </Button>
              ))}
              {!assignedToUser && (
                <Button
                  variant="outline"
                  onClick={() => handleAssign('current-user-id')}
                >
                  Assign to me
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 