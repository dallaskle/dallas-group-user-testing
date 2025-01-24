import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'

export interface AdminTicketFiltersProps {
  className?: string
}

export function AdminTicketFilters({ className }: AdminTicketFiltersProps) {
  const { ticketFilters, setTicketFilters, fetchTickets } = useAdminDashboardStore()

  const handleFilterChange = (
    key: keyof typeof ticketFilters,
    value: string | undefined
  ) => {
    setTicketFilters({ [key]: value === 'all' ? undefined : value })
    fetchTickets()
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <Select
        value={ticketFilters.type || 'all'}
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
        value={ticketFilters.status || 'all'}
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
        value={ticketFilters.priority || 'all'}
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