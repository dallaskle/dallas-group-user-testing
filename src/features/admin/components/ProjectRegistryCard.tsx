import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Users, FileText, GitBranch } from 'lucide-react';
import type { ProjectRegistryDetails } from '../api/adminDashboard.api';

interface ProjectRegistryCardProps {
  registry: ProjectRegistryDetails;
}

export const ProjectRegistryCard = ({ registry }: ProjectRegistryCardProps) => {
  const navigate = useNavigate();

  const requiredFeatures = registry.features.filter(f => f.is_required).length;
  const optionalFeatures = registry.features.length - requiredFeatures;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{registry.name}</CardTitle>
            <CardDescription className="mt-2">{registry.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            Created by {registry.created_by.name}
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="mr-2 h-4 w-4" />
            {registry.feature_count} Features ({requiredFeatures} Required)
          </div>

          <div className="flex items-center text-sm text-muted-foreground">
            <GitBranch className="mr-2 h-4 w-4" />
            {registry.projects_count} Active Projects
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(registry.created_at), { addSuffix: true })}
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate(`/admin/registry/${registry.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}; 