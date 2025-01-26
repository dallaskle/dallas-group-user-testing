import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectRegistryListService } from '../project-registry-list.service.ts'

const mockProjectRegistry = {
  id: 'test-registry-id',
  name: 'Test Registry',
  description: 'Test Description',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockFeatureRegistry = {
  id: 'test-feature-registry-id',
  project_registry_id: mockProjectRegistry.id,
  name: 'Test Feature',
  description: 'Test Description',
  is_required: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

Deno.test('ProjectRegistryListService.getProjectRegistries', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: [mockProjectRegistry],
          error: null
        })
      })
    })
  }

  const service = new ProjectRegistryListService(mockSupabaseClient as any)
  const result = await service.getProjectRegistries()

  // Assert the result matches our mock data
  assertEquals(result, [mockProjectRegistry])
})

Deno.test('ProjectRegistryListService.getFeaturesByRegistry', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({
            order: () => Promise.resolve({
              data: [mockFeatureRegistry],
              error: null
            })
          })
        })
      })
    })
  }

  const service = new ProjectRegistryListService(mockSupabaseClient as any)
  const result = await service.getFeaturesByRegistry(mockProjectRegistry.id)

  // Assert the result matches our mock data
  assertEquals(result, [mockFeatureRegistry])
})

Deno.test('ProjectRegistryListService - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({
          data: null,
          error: mockError
        })
      })
    })
  }

  const service = new ProjectRegistryListService(mockSupabaseClient as any)
  
  try {
    await service.getProjectRegistries()
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 