import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { useProjects } from './ProjectsProvider'

const featureSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  required_validations: z.number().min(1).max(10).default(3),
})

type FeatureForm = z.infer<typeof featureSchema>

interface CreateFeatureProps {
  projectId: string
  onSuccess?: () => void
}

export const CreateFeature = ({ projectId, onSuccess }: CreateFeatureProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { createFeature } = useProjects()

  const form = useForm<FeatureForm>({
    resolver: zodResolver(featureSchema),
    defaultValues: {
      name: '',
      description: '',
      required_validations: 3,
    },
  })

  const handleSubmit = async (data: FeatureForm) => {
    try {
      setIsLoading(true)
      await createFeature({
        project_id: projectId,
        ...data,
      })
      toast({
        title: 'Success',
        description: 'Feature created successfully',
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create feature',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feature Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  placeholder="Enter feature name"
                  aria-label="Feature name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={isLoading}
                  placeholder="Enter feature description"
                  aria-label="Feature description"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="required_validations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Validations</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={10}
                  disabled={isLoading}
                  aria-label="Required validations"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          aria-label="Create feature"
        >
          {isLoading ? 'Creating...' : 'Create Feature'}
        </Button>
      </form>
    </Form>
  )
} 