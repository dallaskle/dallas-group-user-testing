import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TicketDetails } from '../components/TicketDetails/TicketDetails'

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <div>Invalid ticket ID</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/tickets')}
          className="mb-4"
        >
          ← Back to Tickets
        </Button>
        <h1 className="text-3xl font-bold">Ticket Details</h1>
      </div>

      <TicketDetails ticketId={id} className="max-w-3xl" />
    </div>
  )
} 