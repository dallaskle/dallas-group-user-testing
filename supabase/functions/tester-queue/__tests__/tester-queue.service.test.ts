import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { TesterQueueService } from '../tester-queue.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  is_tester: true,
  is_student: false,
  is_admin: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  student_id: 'test-student-id',
  project_registry_id: 'test-registry-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockFeature = {
  id: 'test-feature-id',
  project_id: mockProject.id,
  name: 'Test Feature',
  description: 'Test Description',
  status: 'In Progress',
  required_validations: 2,
  current_validations: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockValidation = {
  id: 'test-validation-id',
  feature_id: mockFeature.id,
  validated_by: mockUser.id,
  status: 'Working',
  video_url: 'https://example.com/video.mp4',
  notes: 'Test notes',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockTestingTicket = {
  id: 'test-testing-ticket-id',
  feature_id: mockFeature.id,
  validation_id: mockValidation.id,
  deadline: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockTicket = {
  id: 'test-ticket-id',
  type: 'testing',
  status: 'open',
  title: 'Test Ticket',
  description: 'Test Description',
  priority: 'medium',
  created_by: mockUser.id,
  assigned_to: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockEnhancedTicket = {
  ...mockTicket,
  created_by_user: mockUser,
  testing_ticket: {
    ...mockTestingTicket,
    feature: {
      ...mockFeature,
      project: {
        ...mockProject,
        student: mockUser
      },
      validations: [{
        ...mockValidation,
        validated_by: mockUser
      }]
    },
    validation: {
      ...mockValidation,
      validated_by: mockUser
    }
  }
}

Deno.test('TesterQueueService.getQueue', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => ({
              order: () => Promise.resolve({
                data: [mockEnhancedTicket],
                error: null
              })
            })
          })
        })
      })
    })
  }

  const service = new TesterQueueService(mockSupabaseClient as any)
  const result = await service.getQueue(mockUser.id)

  // Assert the result matches our mock data
  assertEquals(result, [mockEnhancedTicket])
})

Deno.test('TesterQueueService.getQueue - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => ({
              order: () => Promise.resolve({
                data: null,
                error: mockError
              })
            })
          })
        })
      })
    })
  }

  const service = new TesterQueueService(mockSupabaseClient as any)
  
  try {
    await service.getQueue(mockUser.id)
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 