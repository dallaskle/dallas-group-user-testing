import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminDashboard } from '../../store/adminDashboard.store'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const QAScoreBadge = ({ score }: { score: number }) => {
  let color = 'bg-red-500'
  if (score >= 90) color = 'bg-green-500'
  else if (score >= 75) color = 'bg-yellow-500'
  else if (score >= 60) color = 'bg-orange-500'

  return (
    <Badge className={color}>
      {score}%
    </Badge>
  )
}

const LoadingRow = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
  </TableRow>
)

export const TesterMetrics = () => {
  const { testerMetrics, isLoadingTesterMetrics } = useAdminDashboard()

  const sortedTesters = [...testerMetrics].sort((a, b) => b.qaScore - a.qaScore)

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Tester Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Validations</TableHead>
              <TableHead>Tickets</TableHead>
              <TableHead>QA Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingTesterMetrics ? (
              Array.from({ length: 5 }).map((_, i) => (
                <LoadingRow key={i} />
              ))
            ) : (
              sortedTesters.map((tester) => (
                <TableRow key={tester.id}>
                  <TableCell className="font-medium">{tester.name}</TableCell>
                  <TableCell>{tester.validationsCompleted}</TableCell>
                  <TableCell>{tester.ticketsAssigned}</TableCell>
                  <TableCell>
                    <QAScoreBadge score={tester.qaScore} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 