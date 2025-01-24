import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import type { TicketStatus, TicketPriority } from '../../../api/adminDashboard.api'

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
}

export interface AdminTicketListProps {
  className?: string
}

export function AdminTicketList({ className }: AdminTicketListProps) {
  const navigate = useNavigate()
  const { tickets, isLoading, fetchTickets } = useAdminDashboardStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleRowClick = (ticketId: string) => {
    navigate(`/admin/tickets/${ticketId}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticketResponse) => {
            const ticket = ticketResponse.ticket_data.ticket
            return (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleRowClick(ticket.id)}
              >
                <TableCell className="font-medium">{ticket.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusColors[ticket.status]}
                    variant="secondary"
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={priorityColors[ticket.priority]}
                    variant="secondary"
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {ticketResponse.ticket_data.assignedToUser?.name || 'Unassigned'}
                </TableCell>
                <TableCell>
                  {ticketResponse.ticket_data.createdByUser?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  {new Date(ticket.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )
          })}
          {(!tickets || tickets.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 