import { useParams } from 'react-router-dom'
import { TicketDetails } from '../components/TicketDetails/TicketDetails'

export default function TicketDetailsPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return <div>Invalid ticket ID</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Ticket Details</h1>
      </div>

      <TicketDetails ticketId={id} />
    </div>
  )
} 