import { useEffect, useState } from 'react'
import { X, UserCircle, ChevronDown, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
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
import { AddValidation } from './AddValidation'
import { AddTesterDialog } from './AddTesterDialog'
import { validationsApi } from '../api/validations.api'
import { supabase } from '@/lib/supabase'

type Feature = Database['public']['Tables']['features']['Row']
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

interface FeatureDetailsPanelProps {
  feature: Feature | null
  isOpen: boolean
  onClose: () => void
}

export const FeatureDetailsPanel = ({
  feature,
  isOpen,
  onClose
}: FeatureDetailsPanelProps) => {
  const [validations, setValidations] = useState<Validation[]>([])
  const [testingTickets, setTestingTickets] = useState<TestingTicket[]>([])
  const [isAddValidationOpen, setIsAddValidationOpen] = useState(false)
  const [isAddTesterOpen, setIsAddTesterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidationsOpen, setIsValidationsOpen] = useState(true)
  const [isTestersOpen, setIsTestersOpen] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (feature) {
      loadValidations()
      loadTestingTickets()
    }
  }, [feature])

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
      console.log('Loaded validations:', data)
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
    <div
      className={cn(
        'fixed inset-y-0 right-0 w-[400px] bg-background border-l transform transition-transform duration-200 ease-in-out z-50 overflow-y-auto',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{feature.name}</h2>
          <Badge variant={
            feature.status === 'Not Started' ? 'secondary' :
            feature.status === 'In Progress' ? 'default' :
            feature.status === 'Successful Test' ? 'success' :
            'destructive'
          }>
            {feature.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              navigate(`/student/features/${feature.id}`)
              onClose()
            }}
            className="h-8 w-8"
            aria-label="Open feature details"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>

        {/* Validation Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <h3 className="font-medium">Validation Progress</h3>
            <span className="text-muted-foreground">
              {feature.current_validations} of {feature.required_validations} validations
            </span>
          </div>
          <Progress value={validationProgress} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => setIsAddTesterOpen(true)}
          >
            Add Tester
          </Button>
          <Button 
            className="w-full"
            onClick={() => setIsAddValidationOpen(true)}
          >
            Add Validation
          </Button>
        </div>

        {/* Assigned Testers */}
        <Collapsible
          open={isTestersOpen}
          onOpenChange={setIsTestersOpen}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
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
          <CollapsibleContent className="space-y-2">
            {testingTickets.length > 0 ? (
              testingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
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
                  <Badge variant={
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

        {/* Validations List */}
        <Collapsible
          open={isValidationsOpen}
          onOpenChange={setIsValidationsOpen}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
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
          <CollapsibleContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
              </div>
            ) : validations.length > 0 ? (
              validations.map((validation) => (
                <div
                  key={validation.id}
                  className="p-3 rounded-lg border"
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
