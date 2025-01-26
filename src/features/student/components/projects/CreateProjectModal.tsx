import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Database } from '@/database.types'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useProjectsStore } from '../../store/projects.store'

type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
type FeatureRegistry = Database['public']['Tables']['feature_registry']['Row']

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const navigate = useNavigate()
  const { fetchProjectRegistries, fetchFeaturesByRegistry, createProjectWithFeatures, registries, features: registryFeatures, isLoading } = useProjectsStore()

  const [name, setName] = useState('')
  const [selectedRegistry, setSelectedRegistry] = useState<ProjectRegistry | null>(null)
  const [selectedOptionalFeatures, setSelectedOptionalFeatures] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      fetchProjectRegistries()
    }
  }, [isOpen, fetchProjectRegistries])

  useEffect(() => {
    if (selectedRegistry) {
      fetchFeaturesByRegistry(selectedRegistry.id)
    }
  }, [selectedRegistry, fetchFeaturesByRegistry])

  const handleSubmit = async () => {
    if (!selectedRegistry || !name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const project = await createProjectWithFeatures(name, selectedRegistry.id, selectedOptionalFeatures)
      toast.success('Project created successfully')
      onClose()
      navigate(`/student/projects/${project.id}`)
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Project Template</Label>
            <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
              {registries.map((registry) => (
                <div
                  key={registry.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRegistry?.id === registry.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRegistry(registry)}
                >
                  <h3 className="font-medium">{registry.name}</h3>
                  <p className="text-sm text-gray-500">{registry.description}</p>
                </div>
              ))}
            </div>
          </div>

          {selectedRegistry && registryFeatures.length > 0 && (
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {registryFeatures.map((feature: FeatureRegistry) => (
                  <div key={feature.id} className="flex items-start space-x-3">
                    {!feature.is_required && (
                      <Checkbox
                        id={feature.id}
                        checked={selectedOptionalFeatures.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          setSelectedOptionalFeatures(prev =>
                            checked
                              ? [...prev, feature.id]
                              : prev.filter(id => id !== feature.id)
                          )
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium flex items-center space-x-2"
                      >
                        {feature.name}
                        {feature.is_required && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </label>
                      <p className="text-sm text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 