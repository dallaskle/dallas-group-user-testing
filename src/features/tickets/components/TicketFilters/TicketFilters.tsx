import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTicketsStore } from '../../store/tickets.store'
import type { TicketType, TicketStatus, TicketPriority } from '../../api/types'

export interface TicketFiltersProps {
  className?: string
}

export function TicketFilters({ className }: TicketFiltersProps) {
  const { filters, setFilters, fetchTickets } = useTicketsStore()

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | undefined
  ) => {
    setFilters({ [key]: value === 'all' ? undefined : value })
    fetchTickets()
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => handleFilterChange('type', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="testing">Testing</SelectItem>
          <SelectItem value="support">Support</SelectItem>
          <SelectItem value="question">Question</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) => handleFilterChange('status', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'all'}
        onValueChange={(value) => handleFilterChange('priority', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 