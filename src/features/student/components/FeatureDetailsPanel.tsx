import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Database } from '@/shared/types/database.types'
import { cn } from '@/lib/utils'
import { AddValidation } from './AddValidation'
import { AddTesterDialog } from './AddTesterDialog'
import { validationsApi } from '../api/validations.api'

type Feature = Database['public']['Tables']['features']['Row']
type Validation = Database['public']['Tables']['validations']['Row']

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
  const [isAddValidationOpen, setIsAddValidationOpen] = useState(false)
  const [isAddTesterOpen, setIsAddTesterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (feature) {
      loadValidations()
    }
  }, [feature])

  const loadValidations = async () => {
    if (!feature) return
    
    try {
      setIsLoading(true)
      const data = await validationsApi.getFeatureValidations(feature.id)
      setValidations(data)
    } catch (error) {
      console.error('Failed to load validations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidationAdded = () => {
    setIsAddValidationOpen(false)
    loadValidations()
  }

  const handleTesterAdded = () => {
    setIsAddTesterOpen(false)
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

        {/* Validations List */}
        <div>
          <h3 className="text-sm font-medium mb-3">Validations</h3>
          <div className="space-y-3">
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
                  {validation.notes && (
                    <p className="text-sm text-muted-foreground">{validation.notes}</p>
                  )}
                  {validation.video_url && (
                    <div className="mt-2">
                      <video
                        src={validation.video_url}
                        controls
                        className="w-full rounded-md"
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            className="w-full"
            onClick={() => setIsAddValidationOpen(true)}
          >
            Add Validation
          </Button>
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => setIsAddTesterOpen(true)}
          >
            Add Tester
          </Button>
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
