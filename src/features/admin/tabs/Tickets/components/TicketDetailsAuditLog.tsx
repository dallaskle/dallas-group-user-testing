import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import { TicketDetailsAuditLogItem } from './TicketDetailsAuditLogItem'

interface TicketDetailsAuditLogProps {
  ticketId: string
  className?: string
}

export const TicketDetailsAuditLog = ({ ticketId, className = '' }: TicketDetailsAuditLogProps) => {
  const { ticketAuditLogs, isLoading, error, fetchTicketAuditLog, clearTicketAuditLog } = useAdminDashboardStore()

  useEffect(() => {
    console.log('🔄 [TicketDetailsAuditLog] Effect triggered:', { ticketId })
    fetchTicketAuditLog(ticketId)

    return () => {
      console.log('🧹 [TicketDetailsAuditLog] Cleanup triggered:', { ticketId })
      clearTicketAuditLog()
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
        Error loading audit log: {error}
      </div>
    )
  }

  if (!ticketAuditLogs.length) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No changes have been recorded for this ticket.
      </div>
    )
  }

  return (
    <ScrollArea className={`h-[600px] ${className}`}>
      <div className="space-y-4 px-4">
        {ticketAuditLogs.map((entry) => (
          <TicketDetailsAuditLogItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  )
} 