import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import { AdminTicketAuditLogItem } from './AdminTicketAuditLogItem'

interface TicketDetailsAuditLogProps {
  ticketId: string
  className?: string
}

export const AdminTicketDetailsAuditLog = ({ ticketId, className = '' }: TicketDetailsAuditLogProps) => {
  const { 
    ticketAuditLogs, 
    isAuditLogLoading, 
    error, 
    fetchTicketAuditLog, 
    clearTicketAuditLog,
    currentTicketAuditLogId
  } = useAdminDashboardStore()

  useEffect(() => {
    // Only fetch if we have a ticketId and it's different from current
    if (ticketId && ticketId !== currentTicketAuditLogId) {
      fetchTicketAuditLog(ticketId)
    }

    // Only cleanup on unmount, not on ticketId changes
    return () => {
      if (ticketId === currentTicketAuditLogId) {
        clearTicketAuditLog()
      }
    }
  }, [ticketId, currentTicketAuditLogId, fetchTicketAuditLog])

  if (isAuditLogLoading) {
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
          <AdminTicketAuditLogItem key={entry.id} entry={entry} />
        ))}
      </div>
    </ScrollArea>
  )
} 