import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateFeatureRegistry } from '../components/CreateFeatureRegistry';
import { Plus, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRegistry } from '../components/RegistryProvider';

const ProjectRegistryView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const { toast } = useToast();
  const { 
    projectRegistries, 
    featureRegistries, 
    isLoading,
    error,
    createFeatureRegistry 
  } = useRegistry();

  // Find the current project
  const project = projectRegistries.find(p => p.id === id);
  
  // Get features for this project
  const projectFeatures = featureRegistries.filter(f => f.project_registry_id === id);
  const requiredFeatures = projectFeatures.filter(f => f.is_required);
  const optionalFeatures = projectFeatures.filter(f => !f.is_required);

  const handleFeatureAdded = async () => {
    setIsAddFeatureOpen(false);
    toast({
      title: 'Success',
      description: 'Feature added successfully',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          Project not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        className="gap-2 mb-4"
        onClick={() => navigate('/admin')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-500 mt-2">{project.description}</p>
        </div>
        <Badge
          variant={
            project.status === 'active' ? 'default' :
            project.status === 'draft' ? 'secondary' :
            'outline'
          }
          className="text-base"
        >
          {project.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Required Features</CardTitle>
            <Badge variant="default">{requiredFeatures.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredFeatures.map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {requiredFeatures.length === 0 && (
              <p className="text-gray-500 text-center py-4">No required features yet</p>
            )}
          </CardContent>
        </Card>

        {/* Optional Features */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold">Optional Features</CardTitle>
            <Badge variant="secondary">{optionalFeatures.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {optionalFeatures.map((feature) => (
              <div
                key={feature.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {optionalFeatures.length === 0 && (
              <p className="text-gray-500 text-center py-4">No optional features yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => setIsAddFeatureOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <Dialog open={isAddFeatureOpen} onOpenChange={setIsAddFeatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
          </DialogHeader>
          <CreateFeatureRegistry 
            projectRegistryId={id!} 
            onSuccess={handleFeatureAdded}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRegistryView; 
