import React, { useState } from 'react'
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectRegistryCard } from './ProjectRegistryCard';
import { QAScorecard } from './QAScorecard';
import { TesterMetrics } from './TesterMetrics';
import { ProjectProgress } from './ProjectProgress';
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreateProjectRegistry } from './CreateProjectRegistry'
import { Plus } from 'lucide-react'

export const AdminDashboard = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs defaultValue="registry">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registry">Project Registry</TabsTrigger>
          <TabsTrigger value="testers">Testers</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {/* Overview Tab Content */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Progress</h2>
            {/* Add filters/search here */}
          </div>
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
        
        <TabsContent value="registry">
          {/* Project Registry Tab */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Project Registry</h2>
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add New Template
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProjectRegistryCard />
              {/* More registry cards */}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="testers">
          {/* Testers Tab Content */}
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
        
        <TabsContent value="tickets">
          {/* Tickets Tab Content */}
          <div>Tickets management coming soon...</div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project Template</DialogTitle>
          </DialogHeader>
          <CreateProjectRegistry onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
} 