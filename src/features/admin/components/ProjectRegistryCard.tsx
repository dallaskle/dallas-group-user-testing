import React from 'react';
import { useNavigate } from 'react-router-dom';
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

export const ProjectRegistryCard = () => {
  const navigate = useNavigate();
  const project = mockProject; // Using mock data for now

  const handleClick = () => {
    navigate(`/admin/registry/${project.id}`);
  };

  return (
    <Card 
      className="p-6 space-y-4 cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={handleClick}
      tabIndex={-1} // Removes focus outline while keeping keyboard navigation
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        </div>
        <Badge
          variant={
            project.status === 'active' ? 'default' :
            project.status === 'draft' ? 'secondary' :
            'outline'
          }
        >
          {project.status}
        </Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {project.tags.map((tag) => (
          <Badge key={tag} variant="outline">{tag}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Required Features</div>
          <div className="font-medium">{project.requiredFeatures}</div>
        </div>
        <div>
          <div className="text-gray-500">Optional Features</div>
          <div className="font-medium">{project.optionalFeatures}</div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t text-sm">
        <span className="text-gray-500">
          Updated {project.lastUpdated}
        </span>
        <div className="flex gap-2">
          <button 
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
            onClick={(e) => {
              e.stopPropagation();
              // Edit functionality will be implemented
            }}
          >
            Edit
          </button>
          <button 
            className="text-sm font-medium text-forest hover:text-forest-dark"
            onClick={(e) => {
              e.stopPropagation();
              // Use template functionality will be implemented
            }}
          >
            Use Template
          </button>
        </div>
      </div>
    </Card>
  );
}; 