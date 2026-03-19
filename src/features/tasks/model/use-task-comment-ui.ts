import { ref } from 'vue'
import type { TaskComment } from '@/entities/task'

export function useTaskCommentUi(expandReplies: (commentId: string) => void) {
  const commentMenuOpen = ref<string | null>(null)
  const editingCommentId = ref<string | null>(null)
  const editCommentBody = ref('')
  const replyToCommentId = ref<string | null>(null)
  const replyCommentBody = ref('')

  function toggleReplyForm(commentId: string) {
    if (replyToCommentId.value === commentId) {
      replyToCommentId.value = null
      replyCommentBody.value = ''
    } else {
      replyToCommentId.value = commentId
      expandReplies(commentId)
    }
  }

  function toggleCommentMenu(commentId: string) {
    commentMenuOpen.value = commentMenuOpen.value === commentId ? null : commentId
  }

  function startEditComment(c: TaskComment) {
    editingCommentId.value = c.id
    editCommentBody.value = c.body
  }

  function cancelEditComment() {
    editingCommentId.value = null
    editCommentBody.value = ''
  }

  return {
    commentMenuOpen,
    editingCommentId,
    editCommentBody,
    replyToCommentId,
    replyCommentBody,
    toggleReplyForm,
    toggleCommentMenu,
    startEditComment,
    cancelEditComment,
  }
}
