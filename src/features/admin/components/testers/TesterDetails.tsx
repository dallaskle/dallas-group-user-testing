import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTesterManagement } from '../../store/testerManagement.store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const TesterDetails = () => {
  const { selectedTester } = useTesterManagement()

  if (!selectedTester) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Select a tester to view details
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{selectedTester.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTester.email}
              </p>
            </div>
            <Badge variant={selectedTester.is_tester ? "default" : "secondary"}>
              {selectedTester.is_tester ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Success Rate</h4>
              <div className="space-y-2">
                <Progress value={selectedTester.successRate} />
                <p className="text-sm text-muted-foreground">
                  {selectedTester.successRate.toFixed(1)}% success rate across {selectedTester.validationCount} validations
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Ticket Distribution</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active</span>
                  <span>{selectedTester.activeTickets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed</span>
                  <span>{selectedTester.completedTickets}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No recent activity
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No active tickets
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 