import { supabase } from '@/lib/supabase'
import { activityLogApi } from './activityLog'

export const adminDashboardApi = {
  async getDashboardStats() {
    try {
      // Get total students
      const { count: totalStudents, error: studentsError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_student', true)

      if (studentsError) throw studentsError

      // Get total testers
      const { count: totalTesters, error: testersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_tester', true)

      if (testersError) throw testersError

      // Get total projects
      const { count: totalProjects, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

      if (projectsError) throw projectsError

      // Get total features
      const { count: totalFeatures, error: featuresError } = await supabase
        .from('features')
        .select('*', { count: 'exact', head: true })

      if (featuresError) throw featuresError

      // Get recent activity
      const recentActivity = await activityLogApi.getRecentActivity()

      return {
        totalStudents,
        totalTesters,
        totalProjects,
        totalFeatures,
        recentActivity
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalStudents: 0,
        totalTesters: 0,
        totalProjects: 0,
        totalFeatures: 0,
        recentActivity: []
      }
    }
  }
}