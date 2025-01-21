import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateFeatureRegistry } from '../components/CreateFeatureRegistry';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { getFeatureRegistries } from '../api/createFeatureRegistry';

interface Feature {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
  status: 'Not Started' | 'In Progress' | 'Successful Test' | 'Failed Test';
}

interface ProjectRegistry {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  features: Feature[];
}

const ProjectRegistryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectRegistry | null>(null);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from('project_registry')
          .select('*')
          .eq('id', id)
          .single();

        if (projectError) throw projectError;
        if (!projectData) throw new Error('Project not found');

        // Fetch features
        const features = await getFeatureRegistries(id!);

        setProject({
          ...projectData,
          features: features || [],
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load project details',
          variant: 'destructive',
        });
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, toast]);

  const handleFeatureAdded = async () => {
    try {
      const features = await getFeatureRegistries(id!);
      if (project) {
        setProject({
          ...project,
          features: features || [],
        });
      }
      setIsAddFeatureOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh features',
        variant: 'destructive',
      });
    }
  };

  const requiredFeatures = project?.features.filter(f => f.is_required) || [];
  const optionalFeatures = project?.features.filter(f => !f.is_required) || [];

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
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
                  <Badge
                    variant={
                      feature.status === 'Successful Test' ? 'success' :
                      feature.status === 'Failed Test' ? 'destructive' :
                      feature.status === 'In Progress' ? 'secondary' :
                      'outline'
                    }
                  >
                    {feature.status}
                  </Badge>
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
                  <Badge
                    variant={
                      feature.status === 'Successful Test' ? 'success' :
                      feature.status === 'Failed Test' ? 'destructive' :
                      feature.status === 'In Progress' ? 'secondary' :
                      'outline'
                    }
                  >
                    {feature.status}
                  </Badge>
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
