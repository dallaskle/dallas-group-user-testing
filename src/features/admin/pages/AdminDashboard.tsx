import { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminDashboard } from '../store/adminDashboard.store'
import { GlobalMetricsRow } from '../components/overview/GlobalMetricsRow'
import { RecentActivity } from '../components/overview/RecentActivity'
import { ProjectProgress } from '../components/overview/ProjectProgress'
import { TesterMetrics } from '../components/overview/TesterMetrics'
import { RegistryList } from '../components/project-registry/RegistryList'
import { FeatureList } from '../components/project-registry/FeatureList'
import { TesterList } from '../components/testers/TesterList'
import { TesterDetails } from '../components/testers/TesterDetails'
import { TicketStats } from '../components/tickets/TicketStats'
import { TicketList } from '../components/tickets/TicketList'

export const AdminDashboard = () => {
  const { fetchAllData } = useAdminDashboard()

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage projects, testers, and validations
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Project Registry</TabsTrigger>
          <TabsTrigger value="testers">Testers</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <GlobalMetricsRow />
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <ProjectProgress />
            <RecentActivity />
          </div>

          <TesterMetrics />
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RegistryList />
            <FeatureList />
          </div>
        </TabsContent>

        <TabsContent value="testers">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <TesterList />
            <TesterDetails />
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-8">
          <TicketStats />
          <TicketList />
        </TabsContent>
      </Tabs>
    </div>
  )
} 