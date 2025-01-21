import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTesterStore } from '../store/tester.store'
import { TesterMetrics } from '@/features/admin/components/TesterMetrics'
import { QAScorecard } from '@/features/admin/components/QAScorecard'

const TesterDashboard = () => {
  const navigate = useNavigate()
  const { queue, currentTest, fetchQueue, isLoading } = useTesterStore()

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Tester Dashboard</h1>

      <Tabs defaultValue="queue">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="queue">Test Queue</TabsTrigger>
          <TabsTrigger value="current">Current Test</TabsTrigger>
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
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Feature: {ticket.feature.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Deadline: {new Date(ticket.testing_ticket.deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate(`/testing/${ticket.id}`)}
                        variant="secondary"
                      >
                        Start Testing
                      </Button>
                    </div>
                    <p className="mt-4 text-gray-700">{ticket.description}</p>
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

        <TabsContent value="current">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Test</h2>
            {currentTest ? (
              <Card className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{currentTest.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Feature: {currentTest.feature.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(currentTest.testing_ticket.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/testing/${currentTest.id}`)}
                    variant="secondary"
                  >
                    Continue Testing
                  </Button>
                </div>
                <p className="mt-4 text-gray-700">{currentTest.description}</p>
              </Card>
            ) : (
              <Card className="p-6">
                <p className="text-center text-gray-500">No active test</p>
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