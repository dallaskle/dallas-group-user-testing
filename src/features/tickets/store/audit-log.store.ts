import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ticketsApi } from '../api/tickets.api'
import type { TicketAuditLogEntry } from '../api/types'

interface AuditLogState {
  logs: TicketAuditLogEntry[]
  isLoading: boolean
  error: Error | null
  currentTicketId?: string
}

interface AuditLogActions {
  fetchLogs: (ticketId?: string) => Promise<void>
  clearLogs: () => void
}

export const useAuditLogStore = create<AuditLogState & AuditLogActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      logs: [],
      isLoading: false,
      error: null,
      currentTicketId: undefined,

      fetchLogs: async (ticketId?: string) => {
        console.log('🔍 [AuditLogStore] Fetch requested:', { ticketId })
        const currentState = get()
        
        // Log current state
        console.log('📊 [AuditLogStore] Current state:', {
          currentTicketId: currentState.currentTicketId,
          hasLogs: currentState.logs.length > 0,
          isLoading: currentState.isLoading
        })

        // Prevent duplicate requests
        if (currentState.currentTicketId === ticketId && currentState.logs.length > 0) {
          console.log('🔄 [AuditLogStore] Skipping duplicate request:', { ticketId })
          return
        }

        try {
          console.log('⏳ [AuditLogStore] Setting loading state:', { ticketId })
          set({ isLoading: true, error: null, currentTicketId: ticketId })

          console.log('🚀 [AuditLogStore] Making API request:', { ticketId })
          const response = await ticketsApi.getAuditLog(ticketId)
          
          console.log('✅ [AuditLogStore] Request successful:', { 
            ticketId,
            logsCount: response.audit_logs.length 
          })
          
          set({ logs: response.audit_logs })
        } catch (error) {
          console.error('❌ [AuditLogStore] Request failed:', { 
            ticketId, 
            error 
          })
          set({ error: error as Error })
        } finally {
          console.log('🏁 [AuditLogStore] Request completed:', { ticketId })
          set({ isLoading: false })
        }
      },

      clearLogs: () => {
        console.log('🧹 [AuditLogStore] Clearing logs')
        set({ 
          logs: [], 
          currentTicketId: undefined,
          error: null 
        })
      },
    }),
    { name: 'audit-log-store' }
  )
) 