import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTesterManagement } from '../../store/testerManagement.store'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { DeleteConfirmation } from '../shared/DeleteConfirmation'
import { Button } from '@/components/ui/button'
import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons'

const LoadingRow = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
  </TableRow>
)

const SuccessRateBadge = ({ rate }: { rate: number }) => {
  let variant = 'default'
  if (rate >= 90) variant = 'default'
  else if (rate >= 75) variant = 'secondary'
  else variant = 'destructive'

  return (
    <Badge variant={variant}>
      {rate.toFixed(1)}%
    </Badge>
  )
}

export const TesterList = () => {
  const { testers, isLoading, updateTesterStatus, fetchTesters } = useTesterManagement()

  useEffect(() => {
    fetchTesters()
  }, [fetchTesters])

  const handleStatusChange = async (id: string, isActive: boolean) => {
    await updateTesterStatus(id, isActive)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Validations</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Active Tickets</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <LoadingRow key={i} />
              ))
            ) : (
              testers.map((tester) => (
                <TableRow key={tester.id}>
                  <TableCell className="font-medium">
                    {tester.name}
                  </TableCell>
                  <TableCell>
                    {tester.email}
                  </TableCell>
                  <TableCell>
                    {tester.validationCount}
                  </TableCell>
                  <TableCell>
                    <SuccessRateBadge rate={tester.successRate} />
                  </TableCell>
                  <TableCell>
                    {tester.activeTickets}
                  </TableCell>
                  <TableCell>
                    {tester.completedTickets}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tester.is_tester}
                      onCheckedChange={(checked) => handleStatusChange(tester.id, checked)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}

            {!isLoading && testers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No testers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 