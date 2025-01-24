import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { TesterStats } from '../../../store/adminDashboard.store'

interface TesterPerformanceTableProps {
  testerPerformance: TesterStats[]
}

export const TesterPerformanceTable = ({ testerPerformance }: TesterPerformanceTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Tester Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-center py-2 px-4 text-sm text-muted-foreground font-medium">Name</th>
              <th className="text-center py-2 px-4 text-sm text-muted-foreground font-medium">Tests Pending</th>
              <th className="text-center py-2 px-4 text-sm text-muted-foreground font-medium">Tests Completed</th>
              <th className="text-center py-2 px-4 text-sm text-muted-foreground font-medium">Last Test</th>
            </tr>
          </thead>
          <tbody>
            {testerPerformance.map((tester, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="text-center py-3 px-4">{tester.name}</td>
                <td className="text-center py-3 px-4">{tester.testsPending}</td>
                <td className="text-center py-3 px-4">{tester.testsCompleted}</td>
                <td className="text-center py-3 px-4 text-sm text-muted-foreground">
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
  )
} 