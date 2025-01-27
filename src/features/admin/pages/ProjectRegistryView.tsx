import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreateFeatureRegistry } from '../tabs/Projects/components/CreateFeatureRegistry';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useRegistry } from '../tabs/Projects/RegistryProvider';
import { registryService } from '../services/registry.service';

const ProjectRegistryView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { 
    projectRegistries, 
    featureRegistries, 
    isLoading,
    error,
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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      await registryService.deleteProjectRegistry(id);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      navigate('/admin');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
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
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate('/admin?tab=projects')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => setIsAddFeatureOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Feature
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-500 mt-2">{project.description}</p>
        </div>
        <Badge
          variant="default"
          className="text-base"
        >
          Active
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
          variant="ghost"
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Delete Project
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All associated features will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRegistryView; 
