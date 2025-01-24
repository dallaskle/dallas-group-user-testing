import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProjectRegistryCard } from '../../components/ProjectRegistryCard'
import { CreateProjectRegistry } from '../../components/CreateProjectRegistry'
import { useAdminDashboardStore } from '../../store/adminDashboard.store'
import { Badge } from '@/components/ui/badge'

export const AdminProjectsTab = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const navigate = useNavigate()
  const { 
    projects, 
    projectRegistries,
    isLoading,
    error,
    fetchProjects,
    fetchProjectRegistries
  } = useAdminDashboardStore()

  useEffect(() => {
    fetchProjects()
    fetchProjectRegistries()
  }, [fetchProjects, fetchProjectRegistries])

  return (
    <div className="space-y-8">
      {/* Project Registry Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Project Templates</h2>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Template
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectRegistries.map((registry) => (
              <ProjectRegistryCard 
                key={registry.id} 
                registry={registry}
              />
            ))}
            {projectRegistries.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No project templates found. Create one to get started.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Projects Table Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Projects</h2>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Registry</TableHead>
                <TableHead>Validation Progress</TableHead>
                <TableHead>Not Started</TableHead>
                <TableHead>In Progress</TableHead>
                <TableHead>Successful Test</TableHead>
                <TableHead>Failed Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.user.name}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.registry.name}</TableCell>
                    <TableCell>
                      <Badge variant={project.validations.completed >= project.validations.required ? "success" : "default"}>
                        {project.validations.completed} of {project.validations.required}
                      </Badge>
                    </TableCell>
                    <TableCell>{project.status_counts.not_started}</TableCell>
                    <TableCell>{project.status_counts.in_progress}</TableCell>
                    <TableCell>{project.status_counts.successful_test}</TableCell>
                    <TableCell>{project.status_counts.failed_test}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project Template</DialogTitle>
          </DialogHeader>
          <CreateProjectRegistry onSuccess={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}