import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTesterStore } from '../store/tester.store'
import { Play } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export const TestHistory = () => {
  const { ticketHistory, fetchTicketHistory, isLoading } = useTesterStore()
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

  return (
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