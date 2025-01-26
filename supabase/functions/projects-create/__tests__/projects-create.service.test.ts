import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectsCreateService } from '../projects-create.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  is_student: true,
  is_admin: false,
  is_tester: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  student_id: mockUser.id,
  project_registry_id: 'test-registry-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockFeatureRegistry = {
  id: 'test-feature-registry-id',
  project_registry_id: mockProject.project_registry_id,
  name: 'Test Feature',
  description: 'Test Description',
  is_required: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockOptionalFeatureRegistry = {
  ...mockFeatureRegistry,
  id: 'test-optional-feature-id',
  is_required: false
}

Deno.test('ProjectsCreateService.createProject', async () => {
  // Mock Supabase client with proper chaining
  const mockSupabaseClient = {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: mockProject,
            error: null
          })
        })
      }),
      select: () => ({
        eq: () => ({
          eq: () => ({
            in: () => ({
              order: () => Promise.resolve({
                data: [mockOptionalFeatureRegistry],
                error: null
              })
            })
          })
        })
      })
    })
  }

  const service = new ProjectsCreateService(mockSupabaseClient as any)
  const result = await service.createProject(mockUser.id, {
    name: mockProject.name,
    registryId: mockProject.project_registry_id,
    optionalFeatureIds: [mockOptionalFeatureRegistry.id]
  })

  // Assert the result matches our mock data
  assertEquals(result, mockProject)
})

Deno.test('ProjectsCreateService - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: mockError
          })
        })
      })
    })
  }

  const service = new ProjectsCreateService(mockSupabaseClient as any)
  
  try {
    await service.createProject(mockUser.id, {
      name: mockProject.name,
      registryId: mockProject.project_registry_id,
      optionalFeatureIds: []
    })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 