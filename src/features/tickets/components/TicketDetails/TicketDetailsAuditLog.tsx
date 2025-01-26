import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuditLogStore } from '../../store/audit-log.store'
import { TicketDetailsAuditLogItem } from './TicketAuditLogItem'

interface TicketDetailsAuditLogProps {
  ticketId: string
  className?: string
}

export const TicketDetailsAuditLog = ({ ticketId, className = '' }: TicketDetailsAuditLogProps) => {
  const { logs, isLoading, error, fetchLogs, clearLogs } = useAuditLogStore()

  useEffect(() => {
    fetchLogs(ticketId)

    return () => {
      clearLogs()
    }
  }, [ticketId])

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
        No changes have been recorded for this ticket.
      </div>
    )
  }

  return (
    <ScrollArea className={`h-[600px] ${className}`}>
      <div className="space-y-4 px-4">
        {logs.map((entry) => (
          <TicketDetailsAuditLogItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  )
} 