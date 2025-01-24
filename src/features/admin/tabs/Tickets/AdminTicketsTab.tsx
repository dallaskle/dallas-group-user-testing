import { useState, Suspense, lazy } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { AdminTicketList } from './components/AdminTicketList'
import { AdminTicketFilters } from './components/AdminTicketFilters'
import { AdminTicketAuditLog } from './components/AdminTicketAuditLog'
import { Card, CardContent } from '@/components/ui/card'

const CreateTicketModal = lazy(() => import('./components/CreateTicket/CreateTicketModal'))

export const AdminTicketsTab = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { clearTicketAuditLog, tickets } = useAdminDashboardStore()

  const handleTabChange = (value: string) => {
    if (value === 'list') {
      clearTicketAuditLog()
    }
  }

  // Calculate ticket statistics
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t?.ticket_data?.ticket?.status === 'open')
  const openPercentage = totalTickets > 0 ? Math.round((openTickets.length / totalTickets) * 100) : 0
  const inProgressTickets = tickets.filter(t => t?.ticket_data?.ticket?.status === 'in_progress')
  const inProgressPercentage = totalTickets > 0 ? Math.round((inProgressTickets.length / totalTickets) * 100) : 0
  const highPriorityTickets = tickets.filter(t => t?.ticket_data?.ticket?.priority === 'high')
  const highPriorityPercentage = totalTickets > 0 ? Math.round((highPriorityTickets.length / totalTickets) * 100) : 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tickets</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalTickets}</div>
            <div className="text-sm text-gray-500">Total Tickets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{openTickets.length}</div>
            <div className="text-sm text-gray-500">Open ({openPercentage}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{inProgressTickets.length}</div>
            <div className="text-sm text-gray-500">In Progress ({inProgressPercentage}%)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{highPriorityTickets.length}</div>
            <div className="text-sm text-gray-500">High Priority ({highPriorityPercentage}%)</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">Tickets</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <AdminTicketFilters />
          <AdminTicketList />
        </TabsContent>
        
        <TabsContent value="audit">
          <AdminTicketAuditLog />
        </TabsContent>
      </Tabs>

      <Suspense fallback={<div>Loading...</div>}>
        <CreateTicketModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </Suspense>
    </div>
  )
}
