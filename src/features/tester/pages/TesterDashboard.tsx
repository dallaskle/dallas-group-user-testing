import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTesterStore } from '../store/tester.store'
import { TestQueue } from '../components/TestQueue'
import { TestHistory } from '../components/TestHistory'
import { TesterMetrics } from '../components/TesterMetrics'

const TesterDashboard = () => {
  const { fetchQueue, fetchTicketHistory } = useTesterStore()

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
          <TestQueue />
        </TabsContent>

        <TabsContent value="history">
          <TestHistory />
        </TabsContent>

        <TabsContent value="metrics">
          <TesterMetrics />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default TesterDashboard 