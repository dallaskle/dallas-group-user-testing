import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Database } from '@/shared/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Layout, LayoutDashboard, LayoutPanelLeft, Settings } from 'lucide-react'
import { CreateFeature } from '../components/CreateFeature'
import { FeatureDetailsPanel } from '../components/FeatureDetailsPanel'
import { ProjectSettingsDialog } from '../components/ProjectSettingsDialog'
import { ValidationHistoryPanel } from '../components/ValidationHistoryPanel'
import { useProjects } from '../components/ProjectsProvider'
import { BinderTabs, BinderTabsList, BinderTabsTrigger, BinderTabsContent } from '@/components/ui/binder-tabs'
import { ProjectTicketList } from '@/features/tickets/components/TicketList/ProjectTicketList'
import { TicketFilters } from '@/features/tickets/components/TicketFilters/TicketFilters'
import { useTicketsStore } from '@/features/tickets/store/tickets.store'
import { supabase } from '@/lib/supabase'

type Feature = Database['public']['Tables']['features']['Row']
type ProjectRegistry = {
  name: string
}

type ProjectBase = Database['public']['Tables']['projects']['Row'] & {
  features: Feature[]
}

type ProjectWithRegistry = ProjectBase & {
  registry: ProjectRegistry
}

type ProjectWithProjectRegistry = ProjectBase & {
  project_registry: ProjectRegistry
}

type Project = ProjectWithRegistry | ProjectWithProjectRegistry

type ViewType = 'grid' | 'single' | 'highlight'

export const ProjectDetailsPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { projects, isLoading: isProjectsLoading } = useProjects()
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [viewType, setViewType] = useState<ViewType>('grid')
  const [activeStatus, setActiveStatus] = useState<string>('Not Started')
  const [highlightedStatus, setHighlightedStatus] = useState<string>('Not Started')
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'features' | 'history' | 'tickets'>('features')
  const { clearAuditLog } = useTicketsStore()

  useEffect(() => {
    const loadProject = async () => {
      // First try to find the project in the projects state
      const foundProject = projects.find(p => p.id === id)
      if (foundProject) {
        setProject(foundProject)
        setIsLoading(false)
        return
      }

      // If not found in state, try to fetch from database
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            features (
              *
            ),
            project_registry (
              name
            )
          `)
          .eq('id', id)
          .single()

        if (error) throw error
        setProject(data)
      } catch (error) {
        console.error('Failed to load project:', error)
        navigate('/student')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadProject()
    }
  }, [id, projects, navigate])

  useEffect(() => {
    if (activeTab === 'features') {
      clearAuditLog()
    }
  }, [activeTab, clearAuditLog])

  const handleFeatureClick = (feature: Feature) => {
    setSelectedFeature(feature)
  }

  const handleFeatureAdded = () => {
    setIsAddFeatureOpen(false)
  }

  if (isLoading || isProjectsLoading) {
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
          <Button
            variant="ghost"
            onClick={() => navigate('/student')}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const featuresByStatus = {
    'Not Started': project.features.filter((f: Feature) => f.status === 'Not Started'),
    'In Progress': project.features.filter((f: Feature) => f.status === 'In Progress'),
    'Successful Test': project.features.filter((f: Feature) => f.status === 'Successful Test'),
    'Failed Test': project.features.filter((f: Feature) => f.status === 'Failed Test')
  }

  const totalValidations = project.features.reduce((sum: number, feature: Feature) => sum + feature.current_validations, 0)
  const requiredValidations = project.features.reduce((sum: number, feature: Feature) => sum + feature.required_validations, 0)
  const validationProgress = (totalValidations / requiredValidations) * 100

  const renderFeatureList = (features: Feature[], className?: string) => (
    <div className={`space-y-4 ${className}`}>
      {features.map(feature => (
        <div
          key={feature.id}
          className="p-3 rounded-lg border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
          onClick={() => handleFeatureClick(feature)}
          onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick(feature)}
          tabIndex={0}
          role="button"
          aria-label={`View details for ${feature.name}`}
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
  )

  const renderGridView = () => (
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
            {renderFeatureList(features, "max-h-[calc(100vh-12rem)] overflow-y-auto")}
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderSingleView = () => (
    <div className="space-y-6">
      <BinderTabs value={activeStatus} onValueChange={setActiveStatus} className="w-full">
        <BinderTabsList className="inline-flex">
          {Object.keys(featuresByStatus).map(status => (
            <BinderTabsTrigger key={status} value={status} className="flex items-center gap-2">
              {status}
              <Badge variant="secondary">{featuresByStatus[status as keyof typeof featuresByStatus].length}</Badge>
            </BinderTabsTrigger>
          ))}
        </BinderTabsList>
      </BinderTabs>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{activeStatus}</span>
            <Badge variant="secondary">{featuresByStatus[activeStatus as keyof typeof featuresByStatus].length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {featuresByStatus[activeStatus as keyof typeof featuresByStatus].map(feature => (
              <div
                key={feature.id}
                className="p-3 rounded-lg border border-gray-200 hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => handleFeatureClick(feature)}
                onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick(feature)}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${feature.name}`}
              >
                <h3 className="font-medium">{feature.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                  <span>Validations: {feature.current_validations}/{feature.required_validations}</span>
                </div>
              </div>
            ))}
            {featuresByStatus[activeStatus as keyof typeof featuresByStatus].length === 0 && (
              <p className="text-gray-500 text-center py-4">No features</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderHighlightView = () => {
    const highlightedFeatures = featuresByStatus[highlightedStatus as keyof typeof featuresByStatus]
    const otherStatuses = Object.entries(featuresByStatus).filter(([status]) => status !== highlightedStatus)
    
    return (
      <div className="space-y-6">
        <BinderTabs value={highlightedStatus} onValueChange={setHighlightedStatus} className="w-full">
          <BinderTabsList className="inline-flex">
            {Object.keys(featuresByStatus).map(status => (
              <BinderTabsTrigger key={status} value={status} className="flex items-center gap-2">
                <span>{status}</span>
                <Badge variant="secondary">{featuresByStatus[status as keyof typeof featuresByStatus].length}</Badge>
              </BinderTabsTrigger>
            ))}
          </BinderTabsList>
        </BinderTabs>
        <div className="grid grid-cols-4 gap-6">
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{highlightedStatus}</span>
                <Badge variant="secondary">{highlightedFeatures.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderFeatureList(highlightedFeatures, "max-h-[calc(100vh-12rem)] overflow-y-auto")}
            </CardContent>
          </Card>
          <div className="col-span-1 space-y-6">
            {otherStatuses.map(([status, features]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{status}</span>
                    <Badge variant="secondary">{features.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderFeatureList(features, "max-h-[calc(100vh-40rem)] overflow-y-auto")}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const viewContent = (
    <>
      <div className="flex items-center justify-start gap-2 mb-4">
        <Button
          variant={viewType === 'grid' ? 'default' : 'outline'}
          onClick={() => setViewType('grid')}
          size="sm"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Grid
        </Button>
        <Button
          variant={viewType === 'single' ? 'default' : 'outline'}
          onClick={() => setViewType('single')}
          size="sm"
        >
          <Layout className="h-4 w-4 mr-2" />
          Single
        </Button>
        <Button
          variant={viewType === 'highlight' ? 'default' : 'outline'}
          onClick={() => setViewType('highlight')}
          size="sm"
        >
          <LayoutPanelLeft className="h-4 w-4 mr-2" />
          Highlight
        </Button>
      </div>
      {viewType === 'grid' && renderGridView()}
      {viewType === 'single' && renderSingleView()}
      {viewType === 'highlight' && renderHighlightView()}
    </>
  )

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">{project?.name}</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Project Settings</span>
              </Button>
            </div>
            <p className="text-gray-500 mt-2">
              Based on {('project_registry' in project!) ? project.project_registry.name : project.registry.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg py-1">
              {project?.features.length} Features
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

      <BinderTabs defaultValue="features" className="w-full" onValueChange={(value) => setActiveTab(value as 'features' | 'history' | 'tickets')}>
        <BinderTabsList>
          <BinderTabsTrigger value="features">Features</BinderTabsTrigger>
          <BinderTabsTrigger value="history">Validation History</BinderTabsTrigger>
          <BinderTabsTrigger value="tickets">Tickets</BinderTabsTrigger>
        </BinderTabsList>
        <BinderTabsContent value="features">
          {viewContent}
        </BinderTabsContent>
        <BinderTabsContent value="history">
          <ValidationHistoryPanel projectId={id!} />
        </BinderTabsContent>
        <BinderTabsContent value="tickets">
          <div className="space-y-6">
            <TicketFilters />
            <ProjectTicketList 
              className="rounded-md border" 
              projectId={id!}
            />
          </div>
        </BinderTabsContent>
      </BinderTabs>

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

      {project && (
        <ProjectSettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          projectId={project.id}
          projectName={project.name}
        />
      )}

      <FeatureDetailsPanel
        feature={selectedFeature}
        isOpen={!!selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </div>
  )
}

export default ProjectDetailsPage 