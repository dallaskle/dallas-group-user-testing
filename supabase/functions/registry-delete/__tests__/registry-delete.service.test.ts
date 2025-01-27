import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { RegistryDeleteService } from '../registry-delete.service.ts'

const mockProjectRegistry = {
  id: 'test-project-id',
  name: 'Test Project',
  description: 'Test Description',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockFeatureRegistry = {
  id: 'test-feature-id',
  name: 'Test Feature',
  description: 'Test Description',
  status: 'active',
  project_registry_id: mockProjectRegistry.id,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

Deno.test('RegistryDeleteService.deleteProjectRegistry', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          data: null,
          error: null
        })
      })
    })
  }

  const service = new RegistryDeleteService(mockSupabaseClient as any)
  const result = await service.deleteProjectRegistry(mockProjectRegistry.id)

  // Assert the result matches our expectations
  assertEquals(result.success, true)
  assertEquals(result.id, mockProjectRegistry.id)
})

Deno.test('RegistryDeleteService.deleteFeatureRegistry', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          data: null,
          error: null
        })
      })
    })
  }

  const service = new RegistryDeleteService(mockSupabaseClient as any)
  const result = await service.deleteFeatureRegistry(mockFeatureRegistry.id)

  // Assert the result matches our expectations
  assertEquals(result.success, true)
  assertEquals(result.id, mockFeatureRegistry.id)
})

Deno.test('RegistryDeleteService - handles errors', async () => {
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          data: null,
          error: mockError
        })
      })
    })
  }

  const service = new RegistryDeleteService(mockSupabaseClient as any)
  
  try {
    await service.deleteProjectRegistry('test-id')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 