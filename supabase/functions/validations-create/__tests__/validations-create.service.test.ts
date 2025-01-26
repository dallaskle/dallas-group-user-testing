import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ValidationsCreateService } from '../validations-create.service.ts'

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

const mockFeature = {
  id: 'test-feature-id',
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
  id: 'test-ticket-id',
  type: 'testing',
  status: 'open',
  title: `Validate feature: ${mockFeature.id}`,
  description: 'Self-assigned testing ticket for feature validation',
  priority: 'medium',
  created_by: mockUser.id,
  assigned_to: mockUser.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

Deno.test('ValidationsCreateService.createValidation', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { current_validations: 1 },
            error: null
          })
        })
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: mockValidation,
            error: null
          })
        })
      }),
      update: () => ({
        eq: () => Promise.resolve({
          error: null
        })
      })
    })
  }

  const service = new ValidationsCreateService(mockSupabaseClient as any)
  const result = await service.createValidation(mockUser.id, {
    featureId: mockFeature.id,
    status: 'Working',
    notes: 'Test notes',
    videoUrl: 'https://example.com/video.mp4'
  })

  // Assert the result matches our mock data
  assertEquals(result, mockValidation)
})

Deno.test('ValidationsCreateService.createValidation - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: null,
            error: mockError
          })
        })
      })
    })
  }

  const service = new ValidationsCreateService(mockSupabaseClient as any)
  
  try {
    await service.createValidation(mockUser.id, {
      featureId: mockFeature.id,
      status: 'Working',
      notes: 'Test notes',
      videoUrl: 'https://example.com/video.mp4'
    })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 