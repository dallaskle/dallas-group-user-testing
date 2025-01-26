import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectsDeleteService } from '../projects-delete.service.ts'

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

Deno.test('ProjectsDeleteService.deleteProject', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          or: () => Promise.resolve({
            data: [],
            error: null
          }),
          in: () => Promise.resolve({
            data: [],
            error: null
          })
        }),
        in: () => Promise.resolve({
          data: [],
          error: null
        })
      }),
      delete: () => ({
        eq: () => Promise.resolve({
          error: null
        }),
        in: () => Promise.resolve({
          error: null
        })
      })
    })
  }

  const service = new ProjectsDeleteService(mockSupabaseClient as any)
  
  try {
    await service.deleteProject(mockProject.id)
    // If we get here, the test passed
    assertEquals(true, true)
  } catch (error) {
    // If we get here, the test failed
    assertEquals(true, false, 'Expected no error but got one')
  }
})

Deno.test('ProjectsDeleteService.deleteFeature', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          error: null
        })
      })
    })
  }

  const service = new ProjectsDeleteService(mockSupabaseClient as any)
  
  try {
    await service.deleteFeature(mockFeature.id)
    // If we get here, the test passed
    assertEquals(true, true)
  } catch (error) {
    // If we get here, the test failed
    assertEquals(true, false, 'Expected no error but got one')
  }
})

Deno.test('ProjectsDeleteService - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          error: mockError
        })
      })
    })
  }

  const service = new ProjectsDeleteService(mockSupabaseClient as any)
  
  try {
    await service.deleteFeature(mockFeature.id)
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 