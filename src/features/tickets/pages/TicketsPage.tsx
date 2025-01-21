import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TicketList } from '../components/TicketList/TicketList'
import { TicketForm } from '../components/TicketForm/TicketForm'
import { TicketFilters } from '../components/TicketFilters/TicketFilters'

export default function TicketsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Ticket</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
            </DialogHeader>
            <TicketForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              className="mt-4"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <TicketFilters />
        <TicketList className="rounded-md border" />
      </div>
    </div>
  )
} 