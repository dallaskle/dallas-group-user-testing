import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Database } from '@/shared/types/database.types'
import { useToast } from '@/components/ui/use-toast'
import { validationsApi } from '../api/validations.api'

type Feature = Database['public']['Tables']['features']['Row']

const validationSchema = z.object({
  status: z.enum(['Working', 'Needs Fixing']),
  notes: z.string().min(10, 'Notes must be at least 10 characters'),
  video: z.instanceof(File).optional(),
})

type ValidationForm = z.infer<typeof validationSchema>

interface AddValidationProps {
  feature: Feature
  onSuccess: () => void
  onCancel: () => void
}

export const AddValidation = ({
  feature,
  onSuccess,
  onCancel,
}: AddValidationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<ValidationForm>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      status: 'Working',
      notes: '',
    },
  })

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a preview URL for the video
      const previewUrl = URL.createObjectURL(file)
      setVideoPreview(previewUrl)
      form.setValue('video', file)
    }
  }

  const handleSubmit = async (data: ValidationForm) => {
    try {
      setIsSubmitting(true)

      let videoUrl = ''
      if (data.video) {
        videoUrl = await validationsApi.uploadVideo(data.video)
      }

      await validationsApi.createValidation({
        featureId: feature.id,
        status: data.status,
        notes: data.notes,
        videoUrl,
      })

      toast({
        title: 'Success',
        description: 'Validation added successfully',
      })
      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add validation',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Working">Working</SelectItem>
                  <SelectItem value="Needs Fixing">Needs Fixing</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your validation results..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Video Evidence</FormLabel>
          <FormControl>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full"
            />
          </FormControl>
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-2 w-full rounded-md"
            />
          )}
        </FormItem>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Validation'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 
