import React from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectRegistryCard } from './ProjectRegistryCard';
import { QAScorecard } from './QAScorecard';
import { TesterMetrics } from './TesterMetrics';
import { ProjectProgress } from './ProjectProgress';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex gap-4">
          {/* Add any quick actions or filters here */}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="testers">Testers</TabsTrigger>
          <TabsTrigger value="registry">Project Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Tab */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Summary Cards */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Total Projects</h3>
              <div className="text-2xl font-bold">24</div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Active Testers</h3>
              <div className="text-2xl font-bold">12</div>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Pending Validations</h3>
              <div className="text-2xl font-bold">45</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProjectProgress />
            <TesterMetrics />
          </div>
        </TabsContent>

        <TabsContent value="projects">
          {/* Projects Tab */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Progress</h2>
              {/* Add filters/search here */}
            </div>
            <ProjectProgress fullWidth />
          </div>
        </TabsContent>

        <TabsContent value="testers">
          {/* Testers Tab */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tester Performance</h2>
              {/* Add filters/search here */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QAScorecard />
              <TesterMetrics fullWidth />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registry">
          {/* Project Registry Tab */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Registry</h2>
              <button className="btn btn-primary">Add New Template</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProjectRegistryCard />
              {/* More registry cards */}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 