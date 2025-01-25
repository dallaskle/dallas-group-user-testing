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
                  description: 'Test Description',
                  priority: 'medium',
                  created_by: 'test-user-id',
                  assigned_to: 'test-user-id',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  created_by_user: {
                    id: 'test-user-id',
                    name: 'Test User'
                  },
                  testing_ticket: {
                    id: '1',
                    feature_id: '1',
                    validation_id: null,
                    deadline: new Date().toISOString(),
                    feature: {
                      id: '1',
                      name: 'Test Feature',
                      project: {
                        id: '1',
                        name: 'Test Project',
                        student: {
                          id: '2',
                          name: 'Student'
                        }
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
  
  assertEquals(result?.length, 1)
  assertEquals(result?.[0].id, '1')
  assertEquals(result?.[0].type, 'testing')
  assertEquals(result?.[0].status, 'resolved')
}) 