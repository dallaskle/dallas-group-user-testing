import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format, addDays } from 'date-fns'
import { useTicketsStore } from '@/features/tickets/store/tickets.store'
import { Database } from '@/database.types'
import { useToast } from '@/components/ui/use-toast'
import { testerApi } from '@/features/tester/api/tester.api'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type User = Database['public']['Tables']['users']['Row']

const addTesterSchema = z.object({
  testerId: z.string().min(1, 'Please select a tester'),
  deadline: z.string().min(1, 'Please set a deadline'),
})

type AddTesterForm = z.infer<typeof addTesterSchema>

interface AddTesterDialogProps {
  feature: Database['public']['Tables']['features']['Row']
  onSuccess?: () => void
  onCancel?: () => void
}

export const AddTesterDialog = ({ feature, onSuccess, onCancel }: AddTesterDialogProps) => {
  const [testers, setTesters] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { createTicket } = useTicketsStore()
  const { toast } = useToast()

  const form = useForm<AddTesterForm>({
    resolver: zodResolver(addTesterSchema),
    defaultValues: {
      testerId: '',
      deadline: format(addDays(new Date(), 3), "yyyy-MM-dd'T'HH:mm"),
    },
  })

  // Load testers when component mounts
  useEffect(() => {
    const loadTesters = async () => {
      try {
        const testers = await testerApi.getTesters()
        setTesters(testers)
      } catch (error) {
        console.error('Failed to load testers:', error)
        toast({
          title: 'Error',
          description: 'Failed to load testers',
          variant: 'destructive',
        })
      }
    }

    loadTesters()
  }, [toast])

  const handleSubmit = async (data: AddTesterForm) => {
    try {
      setIsLoading(true)

      // Create a testing ticket
      await createTicket({
        type: 'testing',
        title: `Test Feature: ${feature.name}`,
        description: `Please test the feature "${feature.name}" and provide validation.\n\nFeature Description: ${feature.description}`,
        priority: 'medium',
        featureId: feature.id,
        deadline: data.deadline,
        assignedTo: data.testerId
      })

      toast({
        title: 'Success',
        description: 'Tester assigned successfully',
      })

      onSuccess?.()
    } catch (error) {
      console.error('Failed to assign tester:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign tester',
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
          name="testerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Tester</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tester" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {testers.map((tester) => (
                    <SelectItem key={tester.id} value={tester.id}>
                      {tester.name}
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
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deadline</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Tester'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 