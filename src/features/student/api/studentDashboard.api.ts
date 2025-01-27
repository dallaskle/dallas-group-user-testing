import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { 
  DashboardProject, 
  DashboardStats, 
  RecentActivity, 
  OutstandingTestingTicket 
} from '../store/dashboard.store'

export const studentDashboardApi = {
  async getOutstandingTestingTickets(): Promise<OutstandingTestingTicket[]> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('student-dashboard/outstanding-tickets', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  },

  async getDashboardData(): Promise<{
    projects: DashboardProject[]
    stats: DashboardStats
    recentActivity: RecentActivity[]
  }> {
    const session = useAuthStore.getState().session
    if (!session?.access_token) throw new Error('No active session')

    const { data, error } = await supabase.functions.invoke('student-dashboard/dashboard-data', {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (error) throw error
    return data
  }
} 