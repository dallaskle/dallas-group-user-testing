import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useTesterStore } from '../store/tester.store'
import { TesterMetrics } from '@/features/admin/components/TesterMetrics'
import { QAScorecard } from '@/features/admin/components/QAScorecard'
import { Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const TesterDashboard = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { queue, ticketHistory, fetchQueue, fetchTicketHistory, isLoading } = useTesterStore()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

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
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Feature: {ticket.testing_ticket.feature.name}</p>
                          <p>Project: {ticket.testing_ticket.feature.project.name}</p>
                          <p>Student: {ticket.testing_ticket.feature.project.student.name}</p>
                          <p>Assigned by: {ticket.created_by_user.name}</p>
                          <p>Deadline: {new Date(ticket.testing_ticket.deadline).toLocaleDateString()}</p>
                          
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {ticket.testing_ticket.feature.validations.length > 0 
                                  ? "Previous Validations"
                                  : "No Previous Validations"
                                }
                              </p>
                              <span className="text-sm text-gray-500">
                                ({ticket.testing_ticket.feature.current_validations} of {ticket.testing_ticket.feature.required_validations} required)
                              </span>
                            </div>
                            {ticket.testing_ticket.feature.validations.length > 0 && (
                              <div className="ml-2 mt-1 space-y-2">
                                {ticket.testing_ticket.feature.validations.map((validation) => (
                                  <div key={validation.id} className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      validation.status === 'Working' 
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {validation.status}
                                    </span>
                                    <span className="text-gray-500">by {validation.validated_by.name}</span>
                                    {validation.notes && (
                                      <span className="text-gray-500">- {validation.notes}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
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
                        <Play className="h-4 w-4 mr-2" />
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800 p-0"
                                onClick={() => setSelectedVideo(ticket.testing_ticket.validation?.video_url || null)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                View Test Video
                              </Button>
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

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Validation Recording</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="aspect-video">
              <video
                src={selectedVideo}
                controls
                className="w-full h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TesterDashboard 