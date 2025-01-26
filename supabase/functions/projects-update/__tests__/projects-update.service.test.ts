import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectsUpdateService } from '../projects-update.service.ts'

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

const mockUpdatedProject = {
  ...mockProject,
  name: 'Updated Project Name'
}

const mockUpdatedFeature = {
  ...mockFeature,
  name: 'Updated Feature Name',
  description: 'Updated Description'
}

Deno.test('ProjectsUpdateService.updateProject', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: mockUpdatedProject,
              error: null
            })
          })
        })
      })
    })
  }

  const service = new ProjectsUpdateService(mockSupabaseClient as any)
  const result = await service.updateProject({
    id: mockProject.id,
    updates: { name: mockUpdatedProject.name }
  })

  // Assert the result matches our mock data
  assertEquals(result, mockUpdatedProject)
})

Deno.test('ProjectsUpdateService.updateFeature', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: mockUpdatedFeature,
              error: null
            })
          })
        })
      })
    })
  }

  const service = new ProjectsUpdateService(mockSupabaseClient as any)
  const result = await service.updateFeature({
    id: mockFeature.id,
    updates: {
      name: mockUpdatedFeature.name,
      description: mockUpdatedFeature.description
    }
  })

  // Assert the result matches our mock data
  assertEquals(result, mockUpdatedFeature)
})

Deno.test('ProjectsUpdateService - handles error', async () => {
  // Mock Supabase client that returns an error
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

  const service = new ProjectsUpdateService(mockSupabaseClient as any)
  
  try {
    await service.updateProject({
      id: mockProject.id,
      updates: { name: 'Test' }
    })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 