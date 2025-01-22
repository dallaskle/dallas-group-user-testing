import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tables } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ProjectRegistryCardProps {
  registry: Tables<'project_registry'>;
}

export const ProjectRegistryCard = ({ registry }: ProjectRegistryCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{registry.name}</CardTitle>
        <CardDescription>{registry.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500">
          Last updated {formatDistanceToNow(new Date(registry.updated_at), { addSuffix: true })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
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