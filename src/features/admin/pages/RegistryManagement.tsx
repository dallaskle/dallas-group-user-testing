'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateProjectRegistry } from '../components/CreateProjectRegistry'
import { CreateFeatureRegistry } from '../components/CreateFeatureRegistry'

export const RegistryManagement = () => {
  const [activeTab, setActiveTab] = useState('project')

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Registry Management</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="project">Project Registry</TabsTrigger>
          <TabsTrigger value="feature">Feature Registry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="project">
          <CreateProjectRegistry />
        </TabsContent>
        
        <TabsContent value="feature">
          <CreateFeatureRegistry projectRegistryId={''} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 