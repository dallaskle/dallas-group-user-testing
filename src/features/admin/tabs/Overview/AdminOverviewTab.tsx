import { useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { 
  SummaryCards,
  ProjectProgressChart,
  TesterPerformanceTable,
  RecentActivity
} from './components'

export const AdminOverviewTab = () => {
  const {
    projectRegistriesCount,
    totalProjectsCount,
    pendingValidationsCount,
    pendingTestsCount,
    totalTestersCount,
    projectProgress,
    testerPerformance,
    isLoading,
    error,
    fetchOverviewData
  } = useAdminDashboardStore()

  useEffect(() => {
    fetchOverviewData()
  }, [fetchOverviewData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SummaryCards 
        projectRegistriesCount={projectRegistriesCount}
        totalProjectsCount={totalProjectsCount}
        pendingValidationsCount={pendingValidationsCount}
        pendingTestsCount={pendingTestsCount}
        totalTestersCount={totalTestersCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProjectProgressChart projectProgress={projectProgress} />
        <TesterPerformanceTable testerPerformance={testerPerformance} />
      </div>

      <RecentActivity />
    </div>
  )
}
