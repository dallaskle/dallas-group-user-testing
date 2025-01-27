import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { AdminProjectsService } from '../admin-projects.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  registry: [{
    id: 'test-registry-id',
    name: 'Test Registry',
    created_by: mockUser.id,
    creator: mockUser
  }],
  student: mockUser
}

const mockFeature = {
  id: 'test-feature-id',
  name: 'Test Feature',
  status: 'In Progress',
  project_id: mockProject.id,
  required_validations: 2,
  current_validations: 1,
  project: {
    id: mockProject.id,
    student: mockUser
  }
}

const mockRegistry = {
  id: 'test-registry-id',
  name: 'Test Registry',
  description: 'Test Description',
  created_at: new Date().toISOString(),
  creator: mockUser,
  features: [{
    id: 'test-feature-registry-id',
    name: 'Test Feature Registry',
    description: 'Test Description',
    is_required: true
  }],
  projects: [{
    id: mockProject.id,
    student: mockUser
  }]
}

// Create mock Supabase client
const createMockSupabaseClient = () => ({
  from: () => ({
    select: () => ({
      in: () => Promise.resolve({
        data: [mockFeature],
        error: null
      }),
      data: [mockProject],
      error: null
    })
  })
})

Deno.test('AdminProjectsService.getProjectsWithDetails', async () => {
  const mockSupabaseClient = createMockSupabaseClient()
  const service = new AdminProjectsService(mockSupabaseClient as any)
  const result = await service.getProjectsWithDetails()

  // Test that we get an array of projects
  assertEquals(Array.isArray(result), true)
  
  if (result.length > 0) {
    const project = result[0]
    // Test that each project has the required fields
    assertEquals(Object.keys(project).sort(), [
      'id',
      'name',
      'registry',
      'user',
      'features',
      'features_count',
      'validations',
      'status_counts'
    ].sort())
  }
})

Deno.test('AdminProjectsService.getProjectRegistriesWithDetails', async () => {
  const mockSupabaseClient = {
    from: () => ({
      select: () => Promise.resolve({
        data: [mockRegistry],
        error: null
      })
    })
  }

  const service = new AdminProjectsService(mockSupabaseClient as any)
  const result = await service.getProjectRegistriesWithDetails()

  // Test that we get an array of registries
  assertEquals(Array.isArray(result), true)
  
  if (result.length > 0) {
    const registry = result[0]
    // Test that each registry has the required fields
    assertEquals(Object.keys(registry).sort(), [
      'id',
      'name',
      'description',
      'created_at',
      'created_by',
      'feature_count',
      'projects_count',
      'features'
    ].sort())
  }
})

Deno.test('AdminProjectsService - handles errors', async () => {
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => Promise.resolve({
        data: null,
        error: mockError
      })
    })
  }

  const service = new AdminProjectsService(mockSupabaseClient as any)
  
  try {
    await service.getProjectsWithDetails()
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 