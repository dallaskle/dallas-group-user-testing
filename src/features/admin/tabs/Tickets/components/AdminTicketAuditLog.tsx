import { useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminDashboardStore } from '../../../store/adminDashboard.store'
import { AdminTicketAuditLogItem } from './AdminTicketAuditLogItem'

interface AdminTicketAuditLogProps {
  ticketId?: string
  className?: string
}

export const AdminTicketAuditLog = ({ ticketId, className = '' }: AdminTicketAuditLogProps) => {
  const { ticketAuditLogs, isLoading, error, fetchTicketAuditLog, clearTicketAuditLog } = useAdminDashboardStore()

  useEffect(() => {
    console.log('🔄 [AdminTicketAuditLog] Effect triggered:', { 
      ticketId,
      isLoading,
      logsCount: ticketAuditLogs.length 
    })

    // Initial fetch
    fetchTicketAuditLog(ticketId)

    // Cleanup on unmount or ticketId change
    return () => {
      console.log('🧹 [AdminTicketAuditLog] Cleanup triggered:', { ticketId })
      clearTicketAuditLog()
    }
  }, [ticketId]) // Only depend on ticketId changes

  console.log('🎨 [AdminTicketAuditLog] Rendering:', { 
    ticketId,
    isLoading,
    hasError: !!error,
    logsCount: ticketAuditLogs.length 
  })

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
        No changes have been recorded {ticketId ? 'for this ticket' : ''}.
      </div>
    )
  }

  return (
    <ScrollArea className={`h-[600px] pr-4 ${className}`}>
      <div className="space-y-4">
        {ticketAuditLogs.map((entry) => (
          <AdminTicketAuditLogItem 
            key={entry.id} 
            entry={entry}
            showTicketDetails={!ticketId} 
          />
        ))}
      </div>
    </ScrollArea>
  )
} 