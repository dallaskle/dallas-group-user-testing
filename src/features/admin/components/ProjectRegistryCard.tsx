import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const mockTemplate: ProjectTemplate = {
  id: '1',
  name: 'Full Stack Web App',
  description: 'Complete web application with authentication, database integration, and API endpoints.',
  requiredFeatures: 25,
  optionalFeatures: 10,
  lastUpdated: '2 days ago',
  status: 'active',
  tags: ['React', 'TypeScript', 'Supabase'],
};

export const ProjectRegistryCard: React.FC = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{mockTemplate.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{mockTemplate.description}</p>
        </div>
        <Badge
          variant={
            mockTemplate.status === 'active' ? 'default' :
            mockTemplate.status === 'draft' ? 'secondary' :
            'outline'
          }
        >
          {mockTemplate.status}
        </Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {mockTemplate.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Required Features</div>
          <div className="font-medium">{mockTemplate.requiredFeatures}</div>
        </div>
        <div>
          <div className="text-gray-500">Optional Features</div>
          <div className="font-medium">{mockTemplate.optionalFeatures}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t text-sm">
        <span className="text-gray-500">
          Updated {mockTemplate.lastUpdated}
        </span>
        <div className="flex gap-2">
          <button className="btn btn-sm btn-ghost">Edit</button>
          <button className="btn btn-sm btn-primary">Use Template</button>
        </div>
      </div>
    </Card>
  );
}; 