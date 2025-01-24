import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { AdminTicketList } from './components/AdminTicketList'
import { AdminTicketForm } from './components/AdminTicketForm'
import { AdminTicketFilters } from './components/AdminTicketFilters'
import { AdminTicketAuditLog } from './components/AdminTicketAuditLog'

export const AdminTicketsTab = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { clearTicketAuditLog } = useAdminDashboardStore()

  const handleTabChange = (value: string) => {
    if (value === 'list') {
      clearTicketAuditLog()
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Ticket Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Ticket</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <AdminTicketForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              className="mt-4"
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-6" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="list">Tickets List</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <AdminTicketFilters />
          <AdminTicketList className="rounded-md border" />
        </TabsContent>

        <TabsContent value="audit">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-medium">Global Ticket Audit Log</h2>
            </div>
            <AdminTicketAuditLog className="rounded-md border" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
