import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useTesterStore } from '../store/tester.store'
import { TesterMetrics } from '@/features/admin/components/TesterMetrics'
import { QAScorecard } from '@/features/admin/components/QAScorecard'
import { Database } from '@/shared/types/database.types'

type Validation = Database['public']['Tables']['validations']['Row']
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row'] & {
  feature: Database['public']['Tables']['features']['Row']
  validation: Validation | null
}
type Ticket = Database['public']['Tables']['tickets']['Row'] & {
  testing_ticket: TestingTicket
}

const TesterDashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { queue, ticketHistory, fetchQueue, fetchTicketHistory, isLoading } = useTesterStore()

  useEffect(() => {
    fetchQueue()
    fetchTicketHistory()
  }, [fetchQueue, fetchTicketHistory])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tester Dashboard</h1>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="queue">Test Queue</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
          <TabsTrigger value="metrics">My Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Test Queue</h2>
              <Button onClick={() => fetchQueue()}>Refresh Queue</Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : queue.length > 0 ? (
              <div className="grid gap-4">
                {queue.map((ticket) => (
                  <Card key={ticket.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <div className="text-sm text-gray-600">
                          <p>Feature: {ticket.testing_ticket.feature.name}</p>
                          <p>Deadline: {new Date(ticket.testing_ticket.deadline).toLocaleDateString()}</p>
                        </div>
                        <p className="text-gray-700 mt-4">{ticket.description}</p>
                      </div>
                      <Button
                        onClick={() => {
                          useTesterStore.getState().setCurrentTestById(ticket.id)
                          navigate(`/testing/${ticket.id}`)
                        }}
                        variant="secondary"
                        className="shrink-0"
                      >
                        Start Testing
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-center text-gray-500">No tests in queue</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Test History</h2>
              <Button onClick={() => fetchTicketHistory()}>Refresh History</Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : ticketHistory.length > 0 ? (
              <div className="grid gap-4">
                {ticketHistory.map((ticket) => (
                  <Card key={ticket.id} className="p-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <div className="text-sm text-gray-600">
                        <p>Feature: {ticket.testing_ticket.feature.name}</p>
                        <p>Completed: {new Date(ticket.updated_at).toLocaleDateString()}</p>
                        {ticket.testing_ticket.validation && (
                          <>
                            <p className="mt-2 font-medium">Validation Details:</p>
                            <div className="ml-2">
                              <p>Status: <span className={
                                ticket.testing_ticket.validation.status === 'Working' 
                                  ? 'text-green-600 font-medium'
                                  : 'text-red-600 font-medium'
                              }>
                                {ticket.testing_ticket.validation.status}
                              </span></p>
                              {ticket.testing_ticket.validation.notes && (
                                <p>Notes: {ticket.testing_ticket.validation.notes}</p>
                              )}
                              <a 
                                href={ticket.testing_ticket.validation.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                View Test Video
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-gray-700 mt-4">{ticket.description}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-center text-gray-500">No completed tests</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QAScorecard />
            <TesterMetrics fullWidth />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TesterDashboard 