import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { CommentsListService } from '../comments-list.service.ts'

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

Deno.test('CommentsListService.getFeatureComments', async () => {
  // Mock Supabase client
  const mockSupabaseClient = {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [mockComment],
            error: null
          })
        })
      })
    })
  }

  const service = new CommentsListService(mockSupabaseClient as any)
  const result = await service.getFeatureComments('test-feature-id')

  // Assert the result matches our mock data
  assertEquals(result, [mockComment])
})

Deno.test('CommentsListService.getFeatureComments - handles error', async () => {
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

  const service = new CommentsListService(mockSupabaseClient as any)
  
  try {
    await service.getFeatureComments('test-feature-id')
    throw new Error('Expected error was not thrown')
  } catch (error) {
    assertEquals(error, mockError)
  }
}) 