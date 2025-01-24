import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TicketDetails } from '../tabs/Tickets/components/TicketDetails'

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div>Invalid ticket ID</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-[1400px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ticket Details</h1>
        <Button variant="outline" onClick={() => navigate('/admin?tab=tickets')}>
          Back to Tickets
        </Button>
      </div>

      <TicketDetails ticketId={id} />
    </div>
  )
} 