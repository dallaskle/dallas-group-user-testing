import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { ProjectsGetService } from '../projects-get.service.ts'

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

const mockProjectRegistry = {
  id: mockProject.project_registry_id,
  name: 'Test Project Registry',
  description: 'Test Description',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockEnhancedProject = {
  ...mockProject,
  registry: mockProjectRegistry,
  features: [mockFeature],
  feature_count: 1,
  validation_count: 1
}

const mockFeatureWithProject = {
  ...mockFeature,
  project: {
    id: mockProject.id
  }
}

Deno.test('ProjectsGetService.getProjectById', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: { ...mockProject, registry: mockProjectRegistry, features: [mockFeature] },
            error: null
          })
        })
      })
    })
  }

  const service = new ProjectsGetService(mockSupabaseClient as any)
  const result = await service.getProjectById(mockProject.id)

  // Assert the result matches our mock data
  assertEquals(result, mockEnhancedProject)
})

Deno.test('ProjectsGetService.getFeatureById', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: mockFeatureWithProject,
            error: null
          })
        })
      })
    })
  }

  const service = new ProjectsGetService(mockSupabaseClient as any)
  const result = await service.getFeatureById(mockFeature.id)

  // Assert the result matches our mock data
  assertEquals(result, mockFeatureWithProject)
})

Deno.test('ProjectsGetService - handles error', async () => {
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

  const service = new ProjectsGetService(mockSupabaseClient as any)
  
  try {
    await service.getProjectById(mockProject.id)
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 