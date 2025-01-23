import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { projectsApi } from '../api/projects.api'
import { toast } from 'sonner'

interface ProjectSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

export const ProjectSettingsDialog = ({ isOpen, onClose, projectId, projectName }: ProjectSettingsDialogProps) => {
  const navigate = useNavigate()
  const [name, setName] = useState(projectName)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const handleUpdateName = async () => {
    if (!name.trim() || name === projectName) return
    
    setIsLoading(true)
    try {
      await projectsApi.updateProject(projectId, { name: name.trim() })
      toast.success('Project name updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update project name')
      console.error('Failed to update project name:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setIsLoading(true)
    try {
      await projectsApi.deleteProject(projectId)
      toast.success('Project deleted successfully')
      navigate('/student')
    } catch (error) {
      toast.error('Failed to delete project')
      console.error('Failed to delete project:', error)
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Manage your project settings here
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="flex justify-between">
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isLoading}
              >
                Delete Project
              </Button>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateName}
                  disabled={isLoading || !name.trim() || name === projectName}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open: boolean) => {
        setIsDeleteDialogOpen(open)
        if (!open) setDeleteConfirmation('')
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action cannot be undone. This will permanently delete your project
                and all its features.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirmDelete">
                  Type <span className="font-semibold">{projectName}</span> to confirm
                </Label>
                <Input
                  id="confirmDelete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Enter project name"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isLoading || deleteConfirmation !== projectName}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 