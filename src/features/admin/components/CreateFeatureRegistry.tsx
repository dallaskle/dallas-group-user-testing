'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'
import { createFeatureRegistry } from '../api/createFeatureRegistry'

const featureRegistrySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  isRequired: z.boolean().default(false),
})

type FeatureRegistryForm = z.infer<typeof featureRegistrySchema>

interface CreateFeatureRegistryProps {
  projectRegistryId: string
  onSuccess?: () => void
}

export const CreateFeatureRegistry = ({ projectRegistryId, onSuccess }: CreateFeatureRegistryProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FeatureRegistryForm>({
    resolver: zodResolver(featureRegistrySchema),
    defaultValues: {
      name: '',
      description: '',
      isRequired: false,
    },
  })

  const handleSubmit = async (data: FeatureRegistryForm) => {
    try {
      setIsLoading(true)
      await createFeatureRegistry({
        ...data,
        projectRegistryId,
      })
      toast({
        title: 'Success',
        description: 'Feature registry created successfully',
      })
      form.reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create feature registry',
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
          name="isRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  aria-label="Required feature"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Required Feature</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
          aria-label="Create feature registry"
        >
          {isLoading ? 'Creating...' : 'Create Feature Registry'}
        </Button>
      </form>
    </Form>
  )
} 