import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QAScorecard } from './QAScorecard';
import { TesterMetrics } from './TesterMetrics';
import { AdminOverviewTab } from '../tabs/Overview/AdminOverviewTab';
import { AdminProjectsTab } from '../tabs/Projects/AdminProjectsTab';
import TicketsPage from '@/features/tickets/pages/TicketsPage';
import { useSearchParams } from 'react-router-dom';

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="testers">Testers</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <AdminOverviewTab />
        </TabsContent>
        
        <TabsContent value="projects">
          <AdminProjectsTab />
        </TabsContent>
        
        <TabsContent value="testers">
          {/* Testers Tab Content */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tester Performance</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QAScorecard />
              <TesterMetrics fullWidth />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="tickets">
          <TicketsPage />
        </TabsContent>
      </Tabs>
    </>
  )
} 