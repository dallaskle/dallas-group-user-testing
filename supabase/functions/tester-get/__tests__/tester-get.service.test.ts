import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { TesterGetService } from '../tester-get.service.ts'

const mockTesters = [
  {
    id: 'test-tester-1',
    name: 'Test Tester 1',
    email: 'tester1@example.com',
    is_tester: true,
    is_student: false,
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'test-tester-2',
    name: 'Test Tester 2',
    email: 'tester2@example.com',
    is_tester: true,
    is_student: false,
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

Deno.test('TesterGetService.getTesters', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: mockTesters,
            error: null
          })
        })
      })
    })
  }

  const service = new TesterGetService(mockSupabaseClient as any)
  const result = await service.getTesters()

  // Assert the result matches our mock data
  assertEquals(result, mockTesters)
})

Deno.test('TesterGetService.getTesters - handles error', async () => {
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

  const service = new TesterGetService(mockSupabaseClient as any)
  
  try {
    await service.getTesters()
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 