import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Database } from '@/shared/types/database.types'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CreateFeature } from '../components/CreateFeature'

type Project = Database['public']['Tables']['projects']['Row']
type Feature = Database['public']['Tables']['features']['Row']

type ProjectWithFeatures = Project & {
  features: Feature[]
  registry: Database['public']['Tables']['project_registry']['Row']
}

export const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectWithFeatures | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select(`
            *,
            registry:project_registry(*),
            features(*)
          `)
          .eq('id', id)
          .single()

        if (projectError) throw projectError

        setProject(projectData)
      } catch (error) {
        toast.error('Failed to load project')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleFeatureAdded = () => {
    setIsAddFeatureOpen(false)
    // Refresh project data
    if (id) {
      setIsLoading(true)
      supabase
        .from('projects')
        .select(`
          *,
          registry:project_registry(*),
          features(*)
        `)
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            toast.error('Failed to refresh project data')
          } else {
            setProject(data)
          }
          setIsLoading(false)
        })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
        </div>
      </div>
    )
  }

  const featuresByStatus = {
    'Not Started': project.features.filter(f => f.status === 'Not Started'),
    'In Progress': project.features.filter(f => f.status === 'In Progress'),
    'Successful Test': project.features.filter(f => f.status === 'Successful Test'),
    'Failed Test': project.features.filter(f => f.status === 'Failed Test')
  }

  const totalValidations = project.features.reduce((sum, feature) => sum + feature.current_validations, 0)
  const requiredValidations = project.features.reduce((sum, feature) => sum + feature.required_validations, 0)
  const validationProgress = (totalValidations / requiredValidations) * 100

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">{project.name}</h1>
            <p className="text-gray-500 mt-2">Based on {project.registry.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg py-1">
              {project.features.length} Features
            </Badge>
            <Button
              onClick={() => setIsAddFeatureOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Validation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={validationProgress} className="h-2" />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{totalValidations} of {requiredValidations} validations complete</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(Object.entries(featuresByStatus) as [keyof typeof featuresByStatus, Feature[]][]).map(([status, features]) => (
          <Card key={status} className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{status}</span>
                <Badge variant="secondary">{features.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {features.map(feature => (
                  <div
                    key={feature.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
                  >
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                    <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                      <span>Validations: {feature.current_validations}/{feature.required_validations}</span>
                    </div>
                  </div>
                ))}
                {features.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No features</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddFeatureOpen} onOpenChange={setIsAddFeatureOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
          </DialogHeader>
          <CreateFeature 
            projectId={id!} 
            onSuccess={handleFeatureAdded}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ProjectDetailsPage 