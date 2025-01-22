import { useState, useEffect } from 'react'
import { UserCircle, Pencil, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { commentsApi } from '../api/comments.api'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { Database } from '@/shared/types/database.types'

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: {
    name: string
  } | null
}

interface CommentsProps {
  featureId: string
  className?: string
}

export const Comments = ({ featureId, className }: CommentsProps) => {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<{id: string, content: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadComments()
  }, [featureId])

  const loadComments = async () => {
    try {
      setIsLoading(true)
      const data = await commentsApi.getFeatureComments(featureId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast({
        title: 'Error',
        description: 'Failed to load comments. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return

    try {
      setIsLoading(true)
      const comment = await commentsApi.createComment({
        feature_id: featureId,
        content: newComment.trim(),
        author_id: user.id,
      })
      setComments([...comments, comment])
      setNewComment('')
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      })
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateComment = async () => {
    if (!editingComment) return

    try {
      setIsLoading(true)
      const updatedComment = await commentsApi.updateComment(
        editingComment.id,
        editingComment.content
      )
      setComments(comments.map(c => 
        c.id === updatedComment.id ? updatedComment : c
      ))
      setEditingComment(null)
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      })
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to update comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (id: string) => {
    try {
      setIsLoading(true)
      await commentsApi.deleteComment(id)
      setComments(comments.filter(c => c.id !== id))
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      })
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Comments</h3>
      
      <div className="space-y-4">
        {/* Comments List */}
        {comments.map(comment => (
          <div key={comment.id} className="p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{comment.author?.name || 'Unknown'}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              {user?.id === comment.author_id && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingComment({
                      id: comment.id,
                      content: comment.content
                    })}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteComment(comment.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            {editingComment?.id === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editingComment.content}
                  onChange={(e) => setEditingComment({
                    ...editingComment,
                    content: e.target.value
                  })}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingComment(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateComment}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
        ))}

        {/* New Comment Input */}
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={isLoading || !newComment.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 