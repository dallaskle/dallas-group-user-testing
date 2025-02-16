import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import type { TicketStatus } from '../../../api/adminDashboard.api'
import { supabase } from '@/lib/supabase'
import { AdminTicketDetailsAuditLog } from './AdminTicketDetailsAuditLog'

const statusColors: Record<TicketStatus, string> = {
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

const statusTransitions: Record<TicketStatus, TicketStatus[]> = {
  open: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed', 'in_progress'],
  closed: ['in_progress'],
}

export interface TicketDetailsProps {
  ticketId: string
  className?: string
}

export function AdminTicketDetails({ ticketId, className }: TicketDetailsProps) {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const {
    selectedTicket,
    isLoading,
    error,
    fetchTicketById,
    transitionTicket,
    assignTicket,
    fetchTicketAuditLog,
  } = useAdminDashboardStore()

  useEffect(() => {
    if (ticketId && (!selectedTicket || selectedTicket.ticket_data.ticket.id !== ticketId)) {
      fetchTicketById(ticketId)
    }
  }, [ticketId, selectedTicket, fetchTicketById])

  useEffect(() => {
    let isMounted = true
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && isMounted) {
        setCurrentUser(user)
        // Get user data including is_admin
        const { data: userData } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        if (isMounted) {
          setIsAdmin(userData?.is_admin ?? false)
        }
      }
    }
    getCurrentUser()
    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error loading ticket: {error}
      </div>
    )
  }

  if (!selectedTicket?.ticket_data) {
    return (
      <div className="text-center text-gray-500">Ticket not found</div>
    )
  }

  const { ticket, testingDetails, supportDetails, assignedToUser, createdByUser } =
    selectedTicket.ticket_data

  const handleStatusTransition = async (newStatus: TicketStatus) => {
    try {
      await transitionTicket(ticket.id, newStatus)
      // Refresh ticket data after transition
      await fetchTicketById(ticket.id)
    } catch (error) {
      console.error('Failed to transition ticket:', error)
    }
  }

  const handleAssign = async (userId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }
      await assignTicket(ticket.id, userId)
      // Refresh ticket data after assignment
      await fetchTicketById(ticket.id)
      // Also refresh audit log since we made a change
      await fetchTicketAuditLog(ticket.id)
    } catch (error) {
      console.error('Failed to assign ticket:', error)
      // You might want to add toast notification here
    }
  }

  const isAssignedToCurrentUser = currentUser && assignedToUser?.id === currentUser.id

  return (
    <div className="flex flex-col gap-6">
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
                {ticket.status !== 'closed' && (
                  <div className="flex gap-2">
                    {/* Show unassign button if admin or if assigned to current user */}
                    {(isAdmin || isAssignedToCurrentUser) && assignedToUser && (
                      <Button
                        variant="outline"
                        onClick={() => handleAssign(null)}
                      >
                        Unassign
                      </Button>
                    )}
                    {/* Show assign/reassign button if:
                        - Ticket is unassigned OR
                        - Admin and ticket is assigned to someone else */}
                    {(!assignedToUser || (isAdmin && !isAssignedToCurrentUser)) && (
                      <Button
                        variant="outline"
                        onClick={() => handleAssign(currentUser?.id ?? null)}
                      >
                        {assignedToUser ? 'Reassign to me' : 'Assign to me'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-xl">Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <AdminTicketDetailsAuditLog ticketId={ticketId} />
        </CardContent>
      </Card>
    </div>
  )
} 