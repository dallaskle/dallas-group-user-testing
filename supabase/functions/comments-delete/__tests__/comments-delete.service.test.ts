import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { CommentsDeleteService } from '../comments-delete.service.ts'

Deno.test('CommentsDeleteService.deleteComment', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          error: null
        })
      })
    })
  }

  const service = new CommentsDeleteService(mockSupabaseClient as any)
  
  // Should not throw error
  await service.deleteComment('test-comment-id')
})

Deno.test('CommentsDeleteService.deleteComment - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      delete: () => ({
        eq: () => Promise.resolve({
          error: mockError
        })
      })
    })
  }

  const service = new CommentsDeleteService(mockSupabaseClient as any)
  
  try {
    await service.deleteComment('test-comment-id')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 