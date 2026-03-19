import type { Ref } from 'vue'
import { ref } from 'vue'
import { taskService } from '@/entities/task'
import { isRichContentEmpty } from '@/shared/lib/rich-content'
import type { Task, TaskComment } from '@/entities/task'

export function useTaskCommentsList(
  task: Ref<Task | null>,
  workspaceId: Ref<string>,
  onUpdated?: () => void,
) {
  const comments = ref<TaskComment[]>([])
  const commentsLoading = ref(false)
  const commentSaving = ref(false)

  async function fetchComments() {
    if (!task.value) return
    commentsLoading.value = true
    try {
      comments.value = await taskService.getComments(workspaceId.value, task.value.id)
    } catch (e) {
      console.error('Failed to fetch comments:', e)
      comments.value = []
    } finally {
      commentsLoading.value = false
    }
  }

  async function addComment(body: string): Promise<boolean> {
    if (!task.value || isRichContentEmpty(body)) return false
    commentSaving.value = true
    try {
      const created = await taskService.createComment(workspaceId.value, task.value.id, body)
      comments.value = [...comments.value, created]
      onUpdated?.()
      return true
    } catch (e) {
      console.error('Failed to add comment:', e)
      return false
    } finally {
      commentSaving.value = false
    }
  }

  async function addReply(parentId: string, body: string): Promise<boolean> {
    if (!task.value || isRichContentEmpty(body)) return false
    commentSaving.value = true
    try {
      const created = await taskService.createComment(
        workspaceId.value,
        task.value.id,
        body,
        parentId,
      )
      comments.value = [...comments.value, created]
      onUpdated?.()
      return true
    } catch (e) {
      console.error('Failed to add comment:', e)
      return false
    } finally {
      commentSaving.value = false
    }
  }

  async function saveCommentEdit(commentId: string, body: string): Promise<boolean> {
    if (!task.value || isRichContentEmpty(body)) return false
    commentSaving.value = true
    try {
      await taskService.updateComment(workspaceId.value, task.value.id, commentId, body)
      await fetchComments()
      onUpdated?.()
      return true
    } catch (e) {
      console.error('Failed to update comment:', e)
      return false
    } finally {
      commentSaving.value = false
    }
  }

  async function deleteCommentById(commentId: string) {
    if (!task.value) return
    try {
      await taskService.deleteComment(workspaceId.value, task.value.id, commentId)
      await fetchComments()
      onUpdated?.()
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }

  return {
    comments,
    commentsLoading,
    commentSaving,
    fetchComments,
    addComment,
    addReply,
    saveCommentEdit,
    deleteCommentById,
  }
}
