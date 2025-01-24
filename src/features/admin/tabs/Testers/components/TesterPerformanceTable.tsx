import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import type { TesterPerformanceData } from '../../../api/adminDashboard.api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TesterPerformanceTableProps {
  testerPerformance: TesterPerformanceData[]
}

export const TesterPerformanceTable = ({ testerPerformance }: TesterPerformanceTableProps) => {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Tester Performance</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Tests Pending</TableHead>
              <TableHead className="text-right">Tests Completed</TableHead>
              <TableHead className="text-right">Accuracy Rate</TableHead>
              <TableHead className="text-right">Avg Response Time</TableHead>
              <TableHead>Last Test</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testerPerformance.map((tester) => (
              <TableRow key={tester.id}>
                <TableCell className="font-medium">{tester.name}</TableCell>
                <TableCell>{tester.email}</TableCell>
                <TableCell className="text-right">{tester.testsPending}</TableCell>
                <TableCell className="text-right">{tester.testsCompleted}</TableCell>
                <TableCell className="text-right">
                  <span className={
                    tester.accuracyRate >= 90 ? 'text-green-600' :
                    tester.accuracyRate >= 75 ? 'text-yellow-600' :
                    'text-red-600'
                  }>
                    {tester.accuracyRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatDistanceToNow(tester.avgResponseTime, { addSuffix: false })}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {tester.lastTestCompleted 
                    ? formatDistanceToNow(new Date(tester.lastTestCompleted), { addSuffix: true })
                    : 'Never'}
                </TableCell>
              </TableRow>
            ))}
            {testerPerformance.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No tester data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
} 