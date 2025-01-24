import { supabase } from '@/lib/supabase'
import type { ProjectProgress } from '../store/adminDashboard.store'

export const getProjectRegistriesCount = async () => {
  const { count, error } = await supabase
    .from('project_registry')
    .select('*', { count: 'exact', head: true })
  
  if (error) throw error
  return count || 0
}

export const getTotalProjectsCount = async () => {
  const { count, error } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
  
  if (error) throw error
  return count || 0
}

export const getPendingValidationsCount = async () => {
  const { data, error } = await supabase
    .from('features')
    .select('required_validations, current_validations')
  
  if (error) throw error
  
  return data.reduce((acc, feature) => {
    const pending = feature.required_validations - feature.current_validations
    return acc + (pending > 0 ? pending : 0)
  }, 0)
}

export const getPendingTestsCount = async () => {
  const { count, error } = await supabase
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'testing')
    .in('status', ['open', 'in_progress'])
  
  if (error) throw error
  return count || 0
}

export const getTotalTestersCount = async () => {
  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('is_tester', true)
  
  if (error) throw error
  return count || 0
}

export const getProjectProgress = async (): Promise<ProjectProgress[]> => {
  const { data, error } = await supabase
    .from('features')
    .select(`
      status,
      projects (
        name
      )
    `)
    .returns<Array<{ status: ProjectProgress['status']; projects: { name: string } | null }>>()
  
  if (error) throw error
  
  return data.map(feature => ({
    status: feature.status,
    project: feature.projects ? { name: feature.projects.name } : null
  }))
}

export const getTesterPerformance = async () => {
  // Get all testers
  const { data: testers, error: testersError } = await supabase
    .from('users')
    .select('id, name')
    .eq('is_tester', true)
  
  if (testersError) throw testersError

  // For each tester, get their tickets
  const testerStats = await Promise.all(testers.map(async (tester) => {
    const { count: pendingCount, error: pendingError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .in('status', ['open', 'in_progress'])

    const { count: completedCount, error: completedError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .eq('status', 'resolved')

    const { data: lastCompleted, error: lastCompletedError } = await supabase
      .from('tickets')
      .select('created_at')
      .eq('type', 'testing')
      .eq('assigned_to', tester.id)
      .eq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(1)

    if (pendingError || completedError || lastCompletedError) {
      throw pendingError || completedError || lastCompletedError
    }

    return {
      name: tester.name,
      testsPending: pendingCount || 0,
      testsCompleted: completedCount || 0,
      lastTestCompleted: lastCompleted?.[0]?.created_at || null
    }
  }))

  return testerStats
}
