import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { CommentsCreateService } from '../comments-create.service.ts'

const mockComment = {
  id: 'test-comment-id',
  feature_id: 'test-feature-id',
  content: 'Test comment',
  author_id: 'test-author-id',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  author: {
    name: 'Test Author'
  }
}

Deno.test('CommentsCreateService.createComment', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: mockComment,
            error: null
          })
        })
      })
    })
  }

  const service = new CommentsCreateService(mockSupabaseClient as any)
  const result = await service.createComment({
    feature_id: 'test-feature-id',
    content: 'Test comment',
    author_id: 'test-author-id'
  })

  // Assert the result matches our mock data
  assertEquals(result, mockComment)
})

Deno.test('CommentsCreateService.createComment - handles error', async () => {
  // Mock Supabase client that returns an error
  const mockError = new Error('Database error')
  const mockSupabaseClient = {
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: null,
            error: mockError
          })
        })
      })
    })
  }

  const service = new CommentsCreateService(mockSupabaseClient as any)
  
  try {
    await service.createComment({
      feature_id: 'test-feature-id',
      content: 'Test comment',
      author_id: 'test-author-id'
    })
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 