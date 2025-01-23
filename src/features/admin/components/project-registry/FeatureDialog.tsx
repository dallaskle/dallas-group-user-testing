import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useProjectRegistry } from '../../store/projectRegistry.store'
import type { Database } from '@/shared/types/database.types'

type Feature = Database['public']['Tables']['feature_registry']['Row']

interface FeatureDialogProps {
  mode: 'create' | 'edit'
  registryId?: string
  feature?: Feature
  trigger: React.ReactNode
}

export const FeatureDialog = ({ mode, registryId, feature, trigger }: FeatureDialogProps) => {
  const { addFeature, updateFeature } = useProjectRegistry()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(feature?.name || '')
  const [description, setDescription] = useState(feature?.description || '')
  const [isRequired, setIsRequired] = useState(feature?.is_required || false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (mode === 'create' && registryId) {
        await addFeature(registryId, {
          name,
          description,
          is_required: isRequired
        })
      } else if (feature) {
        await updateFeature(feature.id, {
          name,
          description,
          is_required: isRequired
        })
      }
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting feature:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Feature' : 'Edit Feature'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter feature name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter feature description"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked as boolean)}
            />
            <Label htmlFor="required">Required Feature</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 