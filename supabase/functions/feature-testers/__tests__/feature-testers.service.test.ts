import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { FeatureTestersService } from '../feature-testers.service.ts'

const mockTestingTicket = {
  id: 'test-testing-ticket-id',
  feature_id: 'test-feature-id',
  deadline: new Date().toISOString(),
  created_at: new Date().toISOString(),
  tickets: {
    assigned_to: 'test-user-id',
    title: 'Test Ticket',
    status: 'open',
    assigned_to_user: {
      name: 'Test User',
      email: 'test@example.com'
    }
  }
}

Deno.test('FeatureTestersService.getFeatureTestingTickets', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [mockTestingTicket],
            error: null
          })
        })
      })
    })
  }

  const service = new FeatureTestersService(mockSupabaseClient as any)
  const result = await service.getFeatureTestingTickets('test-feature-id')

  // Assert the result matches our mock data
  assertEquals(result, [mockTestingTicket])
})

Deno.test('FeatureTestersService.getFeatureTestingTickets - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: null,
            error: mockError
          })
        })
      })
    })
  }

  const service = new FeatureTestersService(mockSupabaseClient as any)
  
  try {
    await service.getFeatureTestingTickets('test-feature-id')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 