import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminOverviewTab } from '../tabs/Overview/AdminOverviewTab';
import { AdminProjectsTab } from '../tabs/Projects/AdminProjectsTab';
import { AdminTestersTab } from '../tabs/Testers/AdminTestersTab';
import { AdminTicketsTab } from '../tabs/Tickets/AdminTicketsTab';
import { useSearchParams } from 'react-router-dom';

export const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Monitor and manage projects, testers, and validations</p>
      
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
          <AdminTestersTab />
        </TabsContent>
        
        <TabsContent value="tickets">
          <AdminTicketsTab />
        </TabsContent>
      </Tabs>
    </>
  )
} 