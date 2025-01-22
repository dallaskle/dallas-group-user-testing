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
import { Database } from '@/shared/types/database.types'
import { cn } from '@/lib/utils'
import { AddValidation } from '../components/AddValidation'
import { AddTesterDialog } from '../components/AddTesterDialog'
import { supabase } from '@/lib/supabase'
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
type TestingTicket = Database['public']['Tables']['testing_tickets']['Row'] & {
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

const FeatureDetailsPage = () => {
  const navigate = useNavigate()
  const { featureId } = useParams<{ featureId: string }>()
  const [feature, setFeature] = useState<Feature | null>(null)
  const [validations, setValidations] = useState<Validation[]>([])
  const [testingTickets, setTestingTickets] = useState<TestingTicket[]>([])
  const [isAddValidationOpen, setIsAddValidationOpen] = useState(false)
  const [isAddTesterOpen, setIsAddTesterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidationsOpen, setIsValidationsOpen] = useState(true)
  const [isTestersOpen, setIsTestersOpen] = useState(true)

  useEffect(() => {
    if (featureId) {
      loadFeature()
    }
  }, [featureId])

  useEffect(() => {
    if (feature) {
      loadValidations()
      loadTestingTickets()
    }
  }, [feature])

  const loadFeature = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select(`
          *,
          project:projects!features_project_id_fkey (
            id
          )
        `)
        .eq('id', featureId)
        .single()

      if (error) throw error
      setFeature(data)
    } catch (error) {
      console.error('Failed to load feature:', error)
      navigate('/student')
    }
  }

  const loadValidations = async () => {
    if (!feature) return
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('validations')
        .select(`
          *,
          validator:users!validations_validated_by_fkey (
            name
          )
        `)
        .eq('feature_id', feature.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setValidations(data)
    } catch (error) {
      console.error('Failed to load validations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTestingTickets = async () => {
    if (!feature) return

    try {
      const { data, error } = await supabase
        .from('testing_tickets')
        .select(`
          *,
          tickets (
            assigned_to,
            title,
            status,
            assigned_to_user:users!tickets_assigned_to_fkey (
              name,
              email
            )
          )
        `)
        .eq('feature_id', feature.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestingTickets(data || [])
    } catch (error) {
      console.error('Failed to load testing tickets:', error)
    }
  }

  const handleValidationAdded = () => {
    setIsAddValidationOpen(false)
    loadValidations()
  }

  const handleTesterAdded = () => {
    setIsAddTesterOpen(false)
    loadTestingTickets()
  }

  if (!feature) return null

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
                            {ticket.tickets.assigned_to_user?.name || 'Unknown'}
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