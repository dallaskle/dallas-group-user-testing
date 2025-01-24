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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'
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
  const { 
    tickets, 
    isLoading, 
    fetchTickets,
    transitionTicket,
    updateTicket,
    deleteTicket 
  } = useAdminDashboardStore()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleRowClick = (ticketId: string) => {
    navigate(`/admin/tickets/${ticketId}`)
  }

  const handleStatusChange = async (ticketId: string, status: TicketStatus) => {
    await transitionTicket(ticketId, status)
    await fetchTickets()
  }

  const handlePriorityChange = async (ticketId: string, priority: TicketPriority) => {
    await updateTicket({ id: ticketId, priority })
    await fetchTickets()
  }

  const handleDelete = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      await deleteTicket(ticketId)
      await fetchTickets()
    }
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
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticketResponse) => {
            const ticket = ticketResponse.ticket_data.ticket
            return (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={(e) => {
                  // Don't navigate if clicking on the actions button
                  if ((e.target as HTMLElement).closest('.actions-button')) {
                    e.stopPropagation()
                    return
                  }
                  handleRowClick(ticket.id)
                }}
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
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 actions-button"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Set Status
                        </DropdownMenuLabel>
                        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleStatusChange(ticket.id, status as TicketStatus)}
                            disabled={ticket.status === status}
                          >
                            Mark as {status.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Set Priority
                        </DropdownMenuLabel>
                        {['low', 'medium', 'high'].map((priority) => (
                          <DropdownMenuItem
                            key={priority}
                            onClick={() => handlePriorityChange(ticket.id, priority as TicketPriority)}
                            disabled={ticket.priority === priority}
                          >
                            Set {priority} priority
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
          {(!tickets || tickets.length === 0) && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                No tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 