import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ValidationsListService } from '../validations-list.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockValidation = {
  id: 'test-validation-id',
  feature_id: 'test-feature-id',
  validated_by: mockUser.id,
  status: 'Working',
  video_url: 'https://example.com/video.mp4',
  notes: 'Test notes',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockValidationWithValidator = {
  ...mockValidation,
  validator: {
    name: mockUser.name
  }
}

const mockValidationWithFeature = {
  ...mockValidationWithValidator,
  feature: {
    name: 'Test Feature'
  }
}

Deno.test('ValidationsListService.getValidationsByFeatureIds', async () => {
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        in: () => ({
          order: () => Promise.resolve({
            data: [mockValidationWithValidator],
            error: null
          })
        })
      })
    })
  }

  const service = new ValidationsListService(mockSupabaseClient as any)
  const result = await service.getValidationsByFeatureIds(
    ['test-feature-id'],
    { 'test-feature-id': 'Test Feature' }
  )

  assertEquals(result, [mockValidationWithFeature])
})

Deno.test('ValidationsListService.getFeatureValidationsWithValidator', async () => {
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [mockValidationWithValidator],
            error: null
          })
        })
      })
    })
  }

  const service = new ValidationsListService(mockSupabaseClient as any)
  const result = await service.getFeatureValidationsWithValidator('test-feature-id')

  assertEquals(result, [mockValidationWithValidator])
})

Deno.test('ValidationsListService.getFeatureValidations', async () => {
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [mockValidation],
            error: null
          })
        })
      })
    })
  }

  const service = new ValidationsListService(mockSupabaseClient as any)
  const result = await service.getFeatureValidations('test-feature-id')

  assertEquals(result, [mockValidation])
})

Deno.test('ValidationsListService - handles error', async () => {
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: null,
            error: mockError
          })
        })
      })
    })
  }

  const service = new ValidationsListService(mockSupabaseClient as any)
  
  try {
    await service.getFeatureValidations('test-feature-id')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 