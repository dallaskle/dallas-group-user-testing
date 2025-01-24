import { useEffect } from 'react'
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { TesterPerformanceTable } from './components/TesterPerformanceTable'
import { TestHistory } from './components/TestHistory'

export const AdminTestersTab = () => {
  const { 
    testerPerformance,
    testHistory,
    isLoading,
    fetchTesterPerformance,
    fetchTestHistory
  } = useAdminDashboardStore()

  useEffect(() => {
    fetchTesterPerformance()
    fetchTestHistory()
  }, [fetchTesterPerformance, fetchTestHistory])

  return (
    <div className="space-y-8">
      <TesterPerformanceTable testerPerformance={testerPerformance} />
      <TestHistory 
        testHistory={testHistory}
        onRefresh={fetchTestHistory}
        isLoading={isLoading}
      />
    </div>
  )
}
