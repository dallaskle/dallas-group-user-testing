import React from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProjectProgressProps {
  fullWidth?: boolean;
}

interface ProjectStatus {
  id: string;
  name: string;
  totalFeatures: number;
  tested: number;
  validated: number;
  failed: number;
}

const mockProjects: ProjectStatus[] = [
  {
    id: '1',
    name: 'Project Alpha',
    totalFeatures: 20,
    tested: 15,
    validated: 12,
    failed: 3,
  },
  {
    id: '2',
    name: 'Project Beta',
    totalFeatures: 15,
    tested: 10,
    validated: 8,
    failed: 2,
  },
  // Add more mock data as needed
];

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ fullWidth = false }) => {
  return (
    <Card className={`p-6 ${fullWidth ? 'w-full' : ''}`}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Project Testing Progress</h3>
          <select className="select select-sm">
            <option>All Projects</option>
            <option>Active Projects</option>
            <option>Completed Projects</option>
          </select>
        </div>

        <div className="space-y-4">
          {mockProjects.map((project) => {
            const testedPercent = (project.tested / project.totalFeatures) * 100;
            const validatedPercent = (project.validated / project.totalFeatures) * 100;
            const failedPercent = (project.failed / project.totalFeatures) * 100;

            return (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-gray-500">
                    {project.validated}/{project.totalFeatures} validated
                  </span>
                </div>

                <div className="space-y-1">
                  <Progress 
                    value={validatedPercent}
                    className="bg-gray-200 h-2"
                  />
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="space-x-4">
                      <span>
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
                        Validated: {validatedPercent.toFixed(0)}%
                      </span>
                      <span>
                        <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1" />
                        In Progress: {(testedPercent - validatedPercent).toFixed(0)}%
                      </span>
                      <span>
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
                        Failed: {failedPercent.toFixed(0)}%
                      </span>
                    </div>
                    <span>{project.tested} tested</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}; 