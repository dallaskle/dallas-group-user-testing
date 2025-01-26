import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, UserCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Database } from '@/database.types'
import { cn } from '@/lib/utils'
import { AddValidation } from '../components/AddValidation'
import { AddTesterDialog } from '../components/AddTesterDialog'
import { useProjectsStore } from '../store/projects.store'
import { validationsApi } from '../api/validations.api'
import { ticketsApi } from '@/features/tickets/api/tickets.api'
import { Comments } from '../components/Comments'

type Feature = Database['public']['Tables']['features']['Row'] & {
  project: {
    id: string
  }
}

type Validation = Database['public']['Tables']['validations']['Row'] & {
  validator: {
    name: string
  } | null
}

type TestingTicket = {
  id: string
  feature_id: string
  deadline: string
  created_at: string
  tickets: {
    assigned_to: string
    title: string
    status: string
    assigned_to_user: {
      name: string
      email: string
    } | null
  }
}

interface PageState {
  feature: Feature | null
  validations: Validation[]
  testingTickets: TestingTicket[]
  isLoading: boolean
  error: Error | null
}

const FeatureDetailsPage = () => {
  const navigate = useNavigate()
  const { featureId } = useParams<{ featureId: string }>()
  const [pageState, setPageState] = useState<PageState>({
    feature: null,
    validations: [],
    testingTickets: [],
    isLoading: false,
    error: null
  })
  const [isAddValidationOpen, setIsAddValidationOpen] = useState(false)
  const [isAddTesterOpen, setIsAddTesterOpen] = useState(false)
  const [isValidationsOpen, setIsValidationsOpen] = useState(true)
  const [isTestersOpen, setIsTestersOpen] = useState(true)

  const { fetchFeatureById } = useProjectsStore()

  useEffect(() => {
    if (featureId) {
      loadPageData()
    }
  }, [featureId])

  const loadPageData = async () => {
    if (!featureId) return

    setPageState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Fetch all data in parallel
      const [feature, validations, testingTickets] = await Promise.all([
        fetchFeatureById(featureId),
        validationsApi.getFeatureValidationsWithValidator(featureId),
        ticketsApi.getFeatureTestingTickets(featureId)
      ])

      setPageState({
        feature,
        validations,
        testingTickets,
        isLoading: false,
        error: null
      })
    } catch (error) {
      setPageState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to load page data')
      }))
      navigate('/student')
    }
  }

  const handleValidationAdded = () => {
    setIsAddValidationOpen(false)
    loadPageData()
  }

  const handleTesterAdded = () => {
    setIsAddTesterOpen(false)
    loadPageData()
  }

  if (!pageState.feature) return null

  const { feature, validations, testingTickets, isLoading } = pageState
  const validationProgress = (feature.current_validations / feature.required_validations) * 100

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/student/projects/${feature.project.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{feature.name}</h1>
            <Badge variant={
              feature.status === 'Not Started' ? 'secondary' :
              feature.status === 'In Progress' ? 'default' :
              feature.status === 'Successful Test' ? 'success' :
              'destructive'
            } className="mt-2">
              {feature.status}
            </Badge>
          </div>
          <div className="space-x-3">
            <Button 
              variant="outline"
              onClick={() => setIsAddTesterOpen(true)}
            >
              Add Tester
            </Button>
            <Button 
              onClick={() => setIsAddValidationOpen(true)}
            >
              Add Validation
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>

          {/* Validation Progress */}
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Validation Progress</h3>
            <div className="space-y-2">
              <Progress value={validationProgress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{feature.current_validations} of {feature.required_validations} validations</span>
                <span>{Math.round(validationProgress)}%</span>
              </div>
            </div>
          </div>

          {/* Validations List */}
          <div className="bg-card rounded-lg border p-6">
            <Collapsible
              open={isValidationsOpen}
              onOpenChange={setIsValidationsOpen}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Validations ({validations.length})
                </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isValidationsOpen ? "rotate-180" : ""
                      )}
                    />
                    <span className="sr-only">Toggle validations</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
                  </div>
                ) : validations.length > 0 ? (
                  validations.map((validation) => (
                    <div
                      key={validation.id}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={validation.status === 'Working' ? 'success' : 'destructive'}>
                          {validation.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(validation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{validation.validator?.name || 'Unknown User'}</span>
                      </div>
                      {validation.notes && (
                        <p className="text-sm text-muted-foreground">{validation.notes}</p>
                      )}
                      {validation.video_url && (
                        <div className="mt-2">
                          <video
                            key={validation.id}
                            src={validation.video_url}
                            controls
                            className="w-full rounded-md"
                            preload="metadata"
                            playsInline
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No validations yet
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Testers */}
          <div className="bg-card rounded-lg border p-6">
            <Collapsible
              open={isTestersOpen}
              onOpenChange={setIsTestersOpen}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Assigned Testers ({testingTickets.length})
                </h3>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        isTestersOpen ? "rotate-180" : ""
                      )}
                    />
                    <span className="sr-only">Toggle testers</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-3">
                {testingTickets.length > 0 ? (
                  testingTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {ticket.tickets.assigned_to_user?.name || 'Unassigned'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(ticket.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className="mt-2" variant={
                        ticket.tickets.status === 'open' ? 'secondary' :
                        ticket.tickets.status === 'in_progress' ? 'default' :
                        ticket.tickets.status === 'resolved' ? 'success' :
                        'outline'
                      }>
                        {ticket.tickets.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No testers assigned yet
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Comments Section */}
          <div className="bg-card rounded-lg border p-6">
            <Comments featureId={feature.id} />
          </div>
        </div>
      </div>

      <Dialog open={isAddValidationOpen} onOpenChange={setIsAddValidationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Validation</DialogTitle>
          </DialogHeader>
          <AddValidation
            feature={feature}
            onSuccess={handleValidationAdded}
            onCancel={() => setIsAddValidationOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddTesterOpen} onOpenChange={setIsAddTesterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tester</DialogTitle>
          </DialogHeader>
          <AddTesterDialog
            feature={feature}
            onSuccess={handleTesterAdded}
            onCancel={() => setIsAddTesterOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FeatureDetailsPage 