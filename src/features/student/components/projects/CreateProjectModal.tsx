import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useProjectsStore } from '../../store/projects.store'
import { Database } from '@/shared/types/database.types'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

type ProjectRegistry = Database['public']['Tables']['project_registry']['Row']
type FeatureRegistry = Database['public']['Tables']['feature_registry']['Row']

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [selectedRegistry, setSelectedRegistry] = useState<ProjectRegistry | null>(null)
  const [registries, setRegistries] = useState<ProjectRegistry[]>([])
  const [features, setFeatures] = useState<FeatureRegistry[]>([])
  const [selectedOptionalFeatures, setSelectedOptionalFeatures] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch project registries
  useEffect(() => {
    const fetchRegistries = async () => {
      const { data, error } = await supabase
        .from('project_registry')
        .select('*')
        .order('name')

      if (error) {
        toast.error('Failed to load project registries')
        return
      }

      setRegistries(data)
    }

    if (isOpen) {
      fetchRegistries()
    }
  }, [isOpen])

  // Fetch features when registry is selected
  useEffect(() => {
    const fetchFeatures = async () => {
      if (!selectedRegistry) return

      const { data, error } = await supabase
        .from('feature_registry')
        .select('*')
        .eq('project_registry_id', selectedRegistry.id)
        .order('is_required', { ascending: false })
        .order('name')

      if (error) {
        toast.error('Failed to load features')
        return
      }

      setFeatures(data)
    }

    fetchFeatures()
  }, [selectedRegistry])

  const handleSubmit = async () => {
    if (!selectedRegistry || !name.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/student-create-project`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          project_registry_id: selectedRegistry.id,
          optional_feature_ids: selectedOptionalFeatures
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const project = await response.json()
      toast.success('Project created successfully')
      onClose()
      navigate(`/student/projects/${project.id}`)
    } catch (error) {
      toast.error('Failed to create project')
    } finally {
      setIsLoading(false)
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

          {selectedRegistry && features.length > 0 && (
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                {features.map((feature) => (
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