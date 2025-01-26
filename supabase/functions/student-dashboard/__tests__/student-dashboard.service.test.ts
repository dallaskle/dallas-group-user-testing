import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { StudentDashboardService } from '../student-dashboard.service.ts'

const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  is_student: true,
  is_tester: false,
  is_admin: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  student_id: mockUser.id,
  project_registry_id: 'test-registry-id',
  registry: {
    name: 'Test Registry'
  },
  features: [
    {
      id: 'test-feature-1',
      name: 'Test Feature 1',
      status: 'In Progress',
      current_validations: 1,
      required_validations: 2
    },
    {
      id: 'test-feature-2',
      name: 'Test Feature 2',
      status: 'Not Started',
      current_validations: 0,
      required_validations: 2
    }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const mockFeature = {
  id: 'test-feature-1',
  name: 'Test Feature 1',
  current_validations: 1,
  required_validations: 2,
  project: {
    name: 'Test Project',
    student_id: mockUser.id
  }
}

const mockTestingTicket = {
  id: 'test-ticket-id',
  feature_id: mockFeature.id,
  deadline: new Date().toISOString(),
  validation_id: null,
  validation: [],
  ticket: {
    id: 'test-ticket-id',
    title: 'Test Ticket',
    status: 'open',
    priority: 'medium',
    assigned_to: null,
    assignedTo: null
  }
}

const mockValidation = {
  id: 'test-validation-id',
  created_at: new Date().toISOString(),
  status: 'Working',
  feature: {
    name: mockProject.features[0].name,
    project: {
      name: mockProject.name
    }
  }
}

const mockTestingTicketWithFeature = {
  id: 'test-testing-ticket-id',
  feature: {
    name: mockProject.features[0].name,
    project: {
      name: mockProject.name
    }
  },
  ticket: {
    created_at: new Date().toISOString(),
    title: 'Test Ticket',
    status: 'open'
  }
}

const mockComment = {
  id: 'test-comment-id',
  created_at: new Date().toISOString(),
  content: 'Test comment',
  feature: {
    name: mockProject.features[0].name,
    project: {
      name: mockProject.name
    }
  }
}

Deno.test('StudentDashboardService.getOutstandingTestingTickets', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: (table: string) => {
      return {
        select: (query?: string) => {
          return {
            eq: (field: string, value: string) => {
              if (table === 'features') {
                return Promise.resolve({
                  data: [mockFeature],
                  error: null
                })
              }
              return {
                in: (field: string, values: string[]) => {
                  return {
                    eq: (field: string, value: string) => {
                      return {
                        order: () => {
                          return Promise.resolve({
                            data: [mockTestingTicket],
                            error: null
                          })
                        }
                      }
                    }
                  }
                },
                order: () => {
                  return Promise.resolve({
                    data: [mockTestingTicket],
                    error: null
                  })
                }
              }
            },
            in: (field: string, values: string[]) => {
              return {
                eq: (field: string, value: string) => {
                  return {
                    order: () => {
                      return Promise.resolve({
                        data: [mockTestingTicket],
                        error: null
                      })
                    }
                  }
                },
                order: () => {
                  return Promise.resolve({
                    data: [mockTestingTicket],
                    error: null
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  const service = new StudentDashboardService(mockSupabaseClient as any)
  const result = await service.getOutstandingTestingTickets(mockUser.id)

  // Assert we got results
  assertEquals(result.length, 1)
  
  // Now we can safely check the first result
  const firstResult = result[0]
  assertEquals(firstResult?.id, mockTestingTicket.id)
  assertEquals(firstResult?.ticket?.status, 'open')
})

Deno.test('StudentDashboardService.getDashboardData', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: (table: string) => {
      return {
        select: (query?: string) => {
          return {
            eq: (field: string, value: string) => {
              return {
                order: () => {
                  return Promise.resolve({
                    data: [mockProject],
                    error: null
                  })
                },
                gt: (field: string, value: string) => {
                  return {
                    order: () => ({
                      limit: () => Promise.resolve({
                        data: table === 'validations' ? [mockValidation] :
                              table === 'testing_tickets' ? [mockTestingTicketWithFeature] :
                              table === 'comments' ? [mockComment] : [],
                        error: null
                      })
                    })
                  }
                }
              }
            },
            gt: (field: string, value: string) => {
              return {
                order: () => ({
                  limit: () => Promise.resolve({
                    data: table === 'validations' ? [mockValidation] :
                          table === 'testing_tickets' ? [mockTestingTicketWithFeature] :
                          table === 'comments' ? [mockComment] : [],
                    error: null
                  })
                })
              }
            },
            order: () => {
              return Promise.resolve({
                data: [mockProject],
                error: null
              })
            }
          }
        }
      }
    }
  }

  const service = new StudentDashboardService(mockSupabaseClient as any)
  const result = await service.getDashboardData(mockUser.id)

  // Assert the dashboard data structure
  assertEquals(result.projects.length, 1)
  assertEquals(result.stats.total_projects, 1)
  assertEquals(result.stats.total_features, 2)
  assertEquals(result.recentActivity.length, 3) // One of each type
}) 