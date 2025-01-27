import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { AdminTestersService } from '../admin-testers.service.ts'

// Mock data
const mockUser = {
  id: '123',
  email: 'test@example.com',
  role: 'tester'
}

const mockTicket = {
  id: '456',
  title: 'Test Ticket',
  status: 'resolved',
  created_at: '2024-01-01',
  updated_at: '2024-01-02',
  tester_id: mockUser.id,
  validation_status: 'approved'
}

const mockValidation = {
  id: '789',
  ticket_id: mockTicket.id,
  status: 'approved',
  created_at: '2024-01-02'
}

// Mock Supabase client
const mockSupabaseClient = {
  from: (table: string) => ({
    select: (query: string) => ({
      eq: (field: string, value: any) => ({
        data: table === 'users' ? [mockUser] :
              table === 'tickets' ? [mockTicket] :
              table === 'validations' ? [mockValidation] : [],
        error: null
      }),
      in: (field: string, values: any[]) => ({
        data: table === 'tickets' ? [mockTicket] : [],
        error: null
      })
    })
  })
}

Deno.test('AdminTestersService.getTesterPerformance', async () => {
  const service = new AdminTestersService(mockSupabaseClient as any)
  const result = await service.getTesterPerformance()
  
  assertEquals(Array.isArray(result), true)
  if (result.length > 0) {
    const tester = result[0]
    assertEquals(typeof tester.id, 'string')
    assertEquals(typeof tester.email, 'string')
    assertEquals(typeof tester.pendingTickets, 'number')
    assertEquals(typeof tester.completedTickets, 'number')
    assertEquals(typeof tester.lastCompletedAt, 'string')
    assertEquals(typeof tester.accuracyRate, 'number')
  }
})

Deno.test('AdminTestersService.getTestHistory', async () => {
  const service = new AdminTestersService(mockSupabaseClient as any)
  const result = await service.getTestHistory()
  
  assertEquals(Array.isArray(result), true)
  if (result.length > 0) {
    const ticket = result[0]
    assertEquals(typeof ticket.id, 'string')
    assertEquals(typeof ticket.title, 'string')
    assertEquals(typeof ticket.status, 'string')
    assertEquals(typeof ticket.created_at, 'string')
    assertEquals(typeof ticket.tester_id, 'string')
    assertEquals(typeof ticket.validation_status, 'string')
  }
})

Deno.test('AdminTestersService - handles errors', async () => {
  const errorClient = {
    from: () => ({
      select: () => ({
        eq: () => ({ data: null, error: new Error('Database error') }),
        in: () => ({ data: null, error: new Error('Database error') })
      })
    })
  }
  
  const service = new AdminTestersService(errorClient as any)
  
  try {
    await service.getTesterPerformance()
    throw new Error('Should have thrown an error')
  } catch (error) {
    assertEquals(error.message, 'Database error')
  }
  
  try {
    await service.getTestHistory()
    throw new Error('Should have thrown an error')
  } catch (error) {
    assertEquals(error.message, 'Database error')
  }
}) 