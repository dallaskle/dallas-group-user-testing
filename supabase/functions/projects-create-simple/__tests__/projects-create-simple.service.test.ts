import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectsCreateSimpleService } from '../projects-create-simple.service.ts'

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

Deno.test('ProjectsCreateSimpleService.createProject', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: mockProject,
            error: null
          })
        })
      })
    })
  }

  const service = new ProjectsCreateSimpleService(mockSupabaseClient as any)
  const result = await service.createProject({
    name: mockProject.name,
    project_registry_id: mockProject.project_registry_id,
    student_id: mockProject.student_id
  })

  // Assert the result matches our mock data
  assertEquals(result, mockProject)
})

Deno.test('ProjectsCreateSimpleService - handles error', async () => {
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

  const service = new ProjectsCreateSimpleService(mockSupabaseClient as any)
  
  try {
    await service.createProject({
      name: mockProject.name,
      project_registry_id: mockProject.project_registry_id,
      student_id: mockProject.student_id
    })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 