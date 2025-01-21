import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import type { TicketAuditLogEntry } from '../../api/types'

interface TicketAuditLogItemProps {
  entry: TicketAuditLogEntry
  showTicketDetails?: boolean
}

export const TicketAuditLogItem = ({ entry, showTicketDetails = false }: TicketAuditLogItemProps) => {
  const getFieldLabel = (fieldName: string) => {
    switch (fieldName) {
      case 'status':
        return 'Status'
      case 'assigned_to':
        return 'Assigned To'
      case 'priority':
        return 'Priority'
      default:
        return fieldName
    }
  }

  const formatValue = (value: string | null) => {
    if (!value) return 'None'
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card className="p-4 space-y-2">
      {showTicketDetails && entry.tickets && (
        <div className="flex items-center justify-between mb-2">
          <Link 
            to={`/tickets/${entry.ticket_id}`}
            className="text-sm font-medium hover:underline"
          >
            {entry.tickets.title}
          </Link>
          <div className="flex gap-2">
            <Badge variant="outline">{entry.tickets.type}</Badge>
            <Badge variant="secondary">{entry.tickets.status}</Badge>
            <Badge variant="secondary">{entry.tickets.priority}</Badge>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{entry.users.name}</span>
          <span className="text-muted-foreground text-sm">
            changed {getFieldLabel(entry.field_name)}
          </span>
        </div>
        <Badge variant="outline">
          {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
        </Badge>
      </div>
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-muted-foreground">From:</span>
        <Badge variant="secondary">{formatValue(entry.old_value)}</Badge>
        <span className="text-muted-foreground">To:</span>
        <Badge>{formatValue(entry.new_value)}</Badge>
      </div>
    </Card>
  )
} 