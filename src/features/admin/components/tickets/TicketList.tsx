import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTicketManagement } from '../../store/ticketManagement.store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DeleteConfirmation } from '../shared/DeleteConfirmation'
import { TicketFilters } from './TicketFilters'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDownIcon,
  TrashIcon,
  DotsHorizontalIcon,
} from '@radix-ui/react-icons'

const LoadingRow = () => (
  <TableRow>
    <TableCell><div className="h-4 w-4 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-32 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-24 rounded bg-muted animate-pulse" /></TableCell>
    <TableCell><div className="h-4 w-8 rounded bg-muted animate-pulse" /></TableCell>
  </TableRow>
)

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'subtle'

const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    open: 'default',
    in_progress: 'secondary',
    resolved: 'success',
    closed: 'subtle'
  } as const

  const variant = (variants[status as keyof typeof variants] || 'default') as BadgeVariant

  const label = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed'
  }[status] || status

  return <Badge variant={variant}>{label}</Badge>
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const variants = {
    low: 'secondary',
    medium: 'default',
    high: 'destructive'
  } as const

  const variant = (variants[priority as keyof typeof variants] || 'default') as BadgeVariant

  const label = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  }[priority] || priority

  return <Badge variant={variant}>{label}</Badge>
}

export const TicketList = () => {
  const {
    tickets,
    selectedTickets,
    isLoading,
    fetchTickets,
    updateTicket,
    deleteTicket,
    bulkUpdateTickets,
    toggleTicketSelection,
    clearSelectedTickets
  } = useTicketManagement()

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleStatusChange = async (id: string, status: string) => {
    await updateTicket(id, { status: status as any })
  }

  const handlePriorityChange = async (id: string, priority: string) => {
    await updateTicket(id, { priority: priority as any })
  }

  const handleBulkStatusChange = async (status: string) => {
    await bulkUpdateTickets({ status: status as any })
  }

  const handleBulkPriorityChange = async (priority: string) => {
    await bulkUpdateTickets({ priority: priority as any })
  }

  const handleBulkDelete = async () => {
    await Promise.all(selectedTickets.map(id => deleteTicket(id)))
    clearSelectedTickets()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>Tickets</CardTitle>
          {selectedTickets.length > 0 && (
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Status
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('open')}>
                      Open
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('in_progress')}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('resolved')}>
                      Resolved
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkStatusChange('closed')}>
                      Closed
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Priority
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Change Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => handleBulkPriorityChange('low')}>
                      Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkPriorityChange('medium')}>
                      Medium
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleBulkPriorityChange('high')}>
                      High
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DeleteConfirmation
                title="Delete Selected Tickets"
                description={`Are you sure you want to delete ${selectedTickets.length} selected ticket${selectedTickets.length === 1 ? '' : 's'}? This action cannot be undone.`}
                onConfirm={handleBulkDelete}
                trigger={
                  <Button variant="outline" size="sm">
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          )}
        </div>
        <TicketFilters />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedTickets.length === tickets.length && tickets.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      tickets.forEach(ticket => toggleTicketSelection(ticket.id))
                    } else {
                      clearSelectedTickets()
                    }
                  }}
                />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <LoadingRow key={i} />
              ))
            ) : (
              tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={() => toggleTicketSelection(ticket.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {ticket.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    {ticket.assigned_to_user?.name || 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => handleStatusChange(ticket.id, 'open')}>
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(ticket.id, 'in_progress')}>
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(ticket.id, 'resolved')}>
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleStatusChange(ticket.id, 'closed')}>
                            Mark as Closed
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem onSelect={() => handlePriorityChange(ticket.id, 'low')}>
                            Set Low Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handlePriorityChange(ticket.id, 'medium')}>
                            Set Medium Priority
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handlePriorityChange(ticket.id, 'high')}>
                            Set High Priority
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DeleteConfirmation
                          title="Delete Ticket"
                          description={`Are you sure you want to delete "${ticket.title}"? This action cannot be undone.`}
                          onConfirm={() => deleteTicket(ticket.id)}
                          trigger={
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}

            {!isLoading && tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 