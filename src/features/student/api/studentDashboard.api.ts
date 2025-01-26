import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { 
  DashboardProject, 
  DashboardStats, 
  RecentActivity, 
  OutstandingTestingTicket 
} from '../store/dashboard.store'

type Feature = Database['public']['Tables']['features']['Row']

interface ValidationWithFeature {
  id: string
  created_at: string
  status: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

interface TestingTicketWithFeature {
  id: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
  ticket: {
    created_at: string
    title: string
    status: string
  }
}

interface CommentWithFeature {
  id: string
  created_at: string
  content: string
  feature: {
    name: string
    project: {
      name: string
    }
  }
}

interface FeatureWithProject {
  id: string
  name: string
  current_validations: number
  required_validations: number
  project: {
    name: string
    student_id: string
  }
}

interface TestingTicketResponse {
  id: string
  deadline: string
  feature_id: string
  validation_id: string | null
  validation: {
    status: string
    notes: string | null
  }[] | null
  ticket: {
    id: string
    title: string
    status: string
    priority: string
    assigned_to: string | null
    assignedTo: {
      id: string
      name: string
      email: string
    } | null
  }
}

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