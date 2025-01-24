import { useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatDistanceToNow } from 'date-fns'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

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

  // Calculate project progress data for pie chart
  const progressData = Object.entries(
    projectProgress.reduce((acc, curr) => {
      const status = curr.status
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      {/* Top Row - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Project Registries</h3>
          <div className="text-2xl font-bold mt-2">{projectRegistriesCount}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Projects</h3>
          <div className="text-2xl font-bold mt-2">{totalProjectsCount}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Pending Validations</h3>
          <div className="text-2xl font-bold mt-2">{pendingValidationsCount}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Pending Tests</h3>
          <div className="text-2xl font-bold mt-2">{pendingTestsCount}</div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Testers</h3>
          <div className="text-2xl font-bold mt-2">{totalTestersCount}</div>
        </Card>
      </div>

      {/* Middle Row - Project Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Project Progress</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="text-muted-foreground">
            Coming soon...
          </div>
        </Card>
      </div>

      {/* Bottom Row - Tester Performance */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Tester Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Tests Pending</th>
                <th className="text-left py-3 px-4">Tests Completed</th>
                <th className="text-left py-3 px-4">Last Test Completed</th>
              </tr>
            </thead>
            <tbody>
              {testerPerformance.map((tester, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-3 px-4">{tester.name}</td>
                  <td className="py-3 px-4">{tester.testsPending}</td>
                  <td className="py-3 px-4">{tester.testsCompleted}</td>
                  <td className="py-3 px-4">
                    {tester.lastTestCompleted 
                      ? formatDistanceToNow(new Date(tester.lastTestCompleted), { addSuffix: true })
                      : 'Never'}
                  </td>
                </tr>
              ))}
              {testerPerformance.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-muted-foreground">
                    No tester data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
