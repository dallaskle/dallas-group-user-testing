import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { CommentsUpdateService } from '../comments-update.service.ts'

const mockComment = {
  id: 'test-comment-id',
  feature_id: 'test-feature-id',
  content: 'Updated test comment',
  author_id: 'test-author-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: {
    name: 'Test Author'
  }
}

Deno.test('CommentsUpdateService.updateComment', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: mockComment,
              error: null
            })
          })
        })
      })
    })
  }

  const service = new CommentsUpdateService(mockSupabaseClient as any)
  const result = await service.updateComment('test-comment-id', 'Updated test comment')

  // Assert the result matches our mock data
  assertEquals(result, mockComment)
})

Deno.test('CommentsUpdateService.updateComment - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: null,
              error: mockError
            })
          })
        })
      })
    })
  }

  const service = new CommentsUpdateService(mockSupabaseClient as any)
  
  try {
    await service.updateComment('test-comment-id', 'Updated test comment')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 