import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { getTesterHistory } from '../tester-history.service.ts'

const mockSupabaseClient = {
  from: () => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          in: () => ({
            order: () => Promise.resolve({
              data: [
                {
                  id: '1',
                  type: 'testing',
                  status: 'resolved',
                  title: 'Test Ticket',
                  created_by_user: { id: '1', name: 'Test User' },
                  testing_ticket: {
                    feature: {
                      project: {
                        student: { id: '2', name: 'Student' }
                      }
                    }
                  }
                }
              ],
              error: null
            })
          })
        })
      })
    })
  })
}

Deno.test('getTesterHistory - should return tickets', async () => {
  const result = await getTesterHistory(mockSupabaseClient as any, 'test-user-id')
  
  assertEquals(result.length, 1)
  assertEquals(result[0].id, '1')
  assertEquals(result[0].type, 'testing')
  assertEquals(result[0].status, 'resolved')
}) 