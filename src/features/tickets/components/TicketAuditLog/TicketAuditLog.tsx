import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuditLogStore } from '../../store/audit-log.store'
import { TicketAuditLogItem } from './TicketAuditLogItem'

interface TicketAuditLogProps {
  ticketId?: string
  className?: string
}

export const TicketAuditLog = ({ ticketId, className = '' }: TicketAuditLogProps) => {
  const { logs, isLoading, error, fetchLogs, clearLogs } = useAuditLogStore()

  useEffect(() => {

    // Initial fetch
    fetchLogs(ticketId)

    // Cleanup on unmount or ticketId change
    return () => {
      clearLogs()
    }
  }, [ticketId]) // Only depend on ticketId changes

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        Error loading audit log: {error.message}
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No changes have been recorded {ticketId ? 'for this ticket' : ''}.
      </div>
    )
  }

  return (
    <ScrollArea className={`h-[600px] pr-4 ${className}`}>
      <div className="space-y-4">
        {logs.map((entry) => (
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