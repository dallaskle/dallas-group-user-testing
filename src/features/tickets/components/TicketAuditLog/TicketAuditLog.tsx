import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTicketsStore } from '../../store/tickets.store'
import { TicketAuditLogItem } from './TicketAuditLogItem'

interface TicketAuditLogProps {
  ticketId?: string
  className?: string
}

export const TicketAuditLog = ({ ticketId, className = '' }: TicketAuditLogProps) => {
  const { auditLogs, isLoading, fetchAuditLog } = useTicketsStore()

  useEffect(() => {
    // Pass undefined to get all logs, or ticketId for specific ticket
    fetchAuditLog(ticketId)
  }, [ticketId, fetchAuditLog])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!auditLogs.length) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No changes have been recorded {ticketId ? 'for this ticket' : ''}.
      </div>
    )
  }

  return (
    <ScrollArea className={`h-[600px] pr-4 ${className}`}>
      <div className="space-y-4">
        {auditLogs.map((entry) => (
          <TicketAuditLogItem 
            key={entry.id} 
            entry={entry}
            showTicketDetails={!ticketId} 
          />
        ))}
      </div>
    </ScrollArea>
  )
} 