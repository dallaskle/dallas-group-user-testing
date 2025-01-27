import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { AdminOverviewService } from '../admin-overview.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  is_tester: true,
  is_student: false,
  is_admin: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  student_id: 'test-student-id',
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

// Mock data for overview response
const mockOverviewData = {
  projectRegistriesCount: 5,
  totalProjectsCount: 10,
  pendingValidationsCount: 15,
  pendingTestsCount: 8,
  totalTestersCount: 3,
  projectProgress: [{
    status: 'In Progress',
    project: {
      name: mockProject.name,
      student: mockUser
    }
  }],
  testerPerformance: [{
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    testsPending: 3,
    testsCompleted: 12,
    lastTestCompleted: new Date().toISOString(),
    accuracyRate: 85,
    avgResponseTime: 3600000 // 1 hour in milliseconds
  }]
}

// Create mock Supabase client
const createMockSupabaseClient = (returnData = mockOverviewData) => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        in: () => ({
          order: () => ({
            limit: () => Promise.resolve({
              data: [mockUser],
              error: null,
              count: returnData.totalTestersCount
            })
          }),
          count: returnData.pendingTestsCount
        }),
        count: returnData.totalTestersCount
      }),
      count: returnData.projectRegistriesCount,
      data: [mockFeature]
    })
  })
})

Deno.test('AdminOverviewService.getOverviewData', async () => {
  const mockSupabaseClient = createMockSupabaseClient()
  const service = new AdminOverviewService(mockSupabaseClient as any)
  const result = await service.getOverviewData(mockUser.id)

  // Test that the response has all required fields
  assertEquals(Object.keys(result).sort(), [
    'projectRegistriesCount',
    'totalProjectsCount',
    'pendingValidationsCount',
    'pendingTestsCount',
    'totalTestersCount',
    'projectProgress',
    'testerPerformance'
  ].sort())
})

Deno.test('AdminOverviewService.getOverviewData - handles errors', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => Promise.resolve({
        data: null,
        error: mockError
      })
    })
  }

  const service = new AdminOverviewService(mockSupabaseClient as any)
  
  try {
    await service.getOverviewData(mockUser.id)
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 