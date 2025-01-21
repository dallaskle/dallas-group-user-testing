import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { TicketAuditLogEntry } from '../../api/types'

interface TicketAuditLogItemProps {
  entry: TicketAuditLogEntry
}

const formatId = (id: string) => {
  if (!id) return 'None'
  return `${id.slice(0, 6)}...${id.slice(-4)}`
}

export const TicketDetailsAuditLogItem = ({ entry }: TicketAuditLogItemProps) => {
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
      <div className="flex items-center space-x-2">
        <span className="font-medium text-sm">{entry.users.name}</span>
        <span className="text-muted-foreground text-sm">
          changed {getFieldLabel(entry.field_name)}
        </span>
      </div>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">From:</span>
          <Badge 
            variant="secondary" 
            className="cursor-help"
            title={entry.old_value || 'None'}
          >
            {entry.field_name === 'assigned_to' 
              ? formatId(entry.old_value || '') 
              : formatValue(entry.old_value)}
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">To:</span>
          <Badge 
            className="cursor-help"
            title={entry.new_value || 'None'}
          >
            {entry.field_name === 'assigned_to' 
              ? formatId(entry.new_value || '') 
              : formatValue(entry.new_value)}
          </Badge>
        </div>
      </div>
      <div className="text-xs text-muted-foreground pt-2 border-t">
        {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
      </div>
    </Card>
  )
} 