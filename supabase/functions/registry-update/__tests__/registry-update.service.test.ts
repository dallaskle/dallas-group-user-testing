import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { RegistryUpdateService } from '../registry-update.service.ts'

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

Deno.test('RegistryUpdateService.updateProjectRegistry', async () => {
  const updates = {
    name: 'Updated Project',
    description: 'Updated Description'
  }

  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: { ...mockProjectRegistry, ...updates },
              error: null
            })
          })
        })
      })
    })
  }

  const service = new RegistryUpdateService(mockSupabaseClient as any)
  const result = await service.updateProjectRegistry(mockProjectRegistry.id, updates)

  // Assert the result matches our mock data
  assertEquals(result.name, updates.name)
  assertEquals(result.description, updates.description)
})

Deno.test('RegistryUpdateService.updateFeatureRegistry', async () => {
  const updates = {
    name: 'Updated Feature',
    description: 'Updated Description'
  }

  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: { ...mockFeatureRegistry, ...updates },
              error: null
            })
          })
        })
      })
    })
  }

  const service = new RegistryUpdateService(mockSupabaseClient as any)
  const result = await service.updateFeatureRegistry(mockFeatureRegistry.id, updates)

  // Assert the result matches our mock data
  assertEquals(result.name, updates.name)
  assertEquals(result.description, updates.description)
})

Deno.test('RegistryUpdateService - handles errors', async () => {
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: null,
              error: mockError
            })
          })
        })
      })
    })
  }

  const service = new RegistryUpdateService(mockSupabaseClient as any)
  
  try {
    await service.updateProjectRegistry('test-id', { name: 'Test' })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 