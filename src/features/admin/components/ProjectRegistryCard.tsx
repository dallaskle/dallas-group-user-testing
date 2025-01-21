import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tables } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface ProjectRegistryCardProps {
  registry: Tables<'project_registry'>;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  requiredFeatures: number;
  optionalFeatures: number;
  lastUpdated: string;
  status: 'active' | 'draft' | 'archived';
  tags: string[];
}

// Mock data for development
const mockProject: ProjectTemplate = {
  id: '1',
  name: 'Full Stack Web App',
  description: 'Complete web application with authentication, database integration, and API endpoints.',
  requiredFeatures: 25,
  optionalFeatures: 10,
  lastUpdated: '2 days ago',
  status: 'active',
  tags: ['React', 'TypeScript', 'Supabase'],
};

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