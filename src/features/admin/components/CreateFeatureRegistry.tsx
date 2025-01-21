'use client'

import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFeatureRegistry } from '../api/createFeatureRegistry'
import { getProjectRegistries } from '../api/createProjectRegistry'

interface ProjectRegistry {
  id: string
  name: string
}

const featureRegistrySchema = z.object({
  projectRegistryId: z.string().min(1, 'Project is required'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  isRequired: z.boolean().default(false),
})

type FeatureRegistryForm = z.infer<typeof featureRegistrySchema>

export const CreateFeatureRegistry = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<ProjectRegistry[]>([])
  const { toast } = useToast()

  const form = useForm<FeatureRegistryForm>({
    resolver: zodResolver(featureRegistrySchema),
    defaultValues: {
      projectRegistryId: '',
      name: '',
      description: '',
      isRequired: false,
    },
  })

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjectRegistries()
        setProjects(data)
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        })
      }
    }

    fetchProjects()
  }, [toast])

  const handleSubmit = async (data: FeatureRegistryForm) => {
    try {
      setIsLoading(true)
      await createFeatureRegistry(data)
      toast({
        title: 'Success',
        description: 'Feature registry created successfully',
      })
      form.reset()
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Feature Registry</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="projectRegistryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
      </CardContent>
    </Card>
  )
} 