<template>
  <Modal
    :is-open="!!task"
    :fullscreen-on-mobile="isMobile"
    :content-class="
      isMobile
        ? 'fixed inset-0 flex flex-col h-[100dvh] max-w-none max-h-none m-0 rounded-none overflow-hidden lg:relative lg:flex-none lg:h-auto lg:max-w-[min(52rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:mx-auto lg:rounded-xl lg:my-4 lg:overflow-x-auto lg:overflow-y-auto'
        : 'lg:!max-w-[min(52rem,calc(100vw-2rem))]'
    "
    @close="$emit('close')"
  >
    <ModalContent
      v-if="task"
      :title="task.title"
      :fullscreen-on-mobile="isMobile"
      :show-close-button="true"
      @close="$emit('close')"
    >
      <div class="space-y-(--spacing-6)">
        <!-- Шапка: метаданные -->
        <div class="flex flex-wrap items-center gap-(--spacing-2)">
          <span
            class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) font-medium"
            :class="priorityClass(task.priority)"
          >
            {{ priorityLabel(task.priority) }}
          </span>
          <span
            class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs)"
            :class="statusClass(task.status)"
          >
            {{ statusLabel(task.status) }}
          </span>
          <span class="text-(--text-xs) text-text-muted">{{ typeLabel(task.type) }}</span>
          <span v-if="assigneeName" class="text-(--text-xs) text-text-secondary">
            → {{ assigneeName }}
          </span>
          <span class="text-(--text-xs) text-text-muted">{{ formatDate(task.dueDate) }}</span>
        </div>

        <!-- Описание -->
        <div v-if="task.description">
          <h4 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
            Описание
          </h4>
          <p class="text-(--text-sm) text-text-primary whitespace-pre-wrap">{{ task.description }}</p>
        </div>

        <!-- Подзадачи -->
        <div
          v-if="!task.parentId"
          class="border border-border-light rounded-(--radius-md) p-(--spacing-4)"
        >
          <div class="flex items-center justify-between mb-(--spacing-2)">
            <h4 class="text-(--text-sm) font-medium text-text-secondary">
              Подзадачи ({{ subtasks.length }})
            </h4>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskCreate">
              <Button size="sm" variant="outline" @click="$emit('addSubtask', task)">
                + Добавить
              </Button>
            </PermissionGuard>
          </div>
          <div v-if="subtasksLoading" class="text-(--text-sm) text-text-muted py-(--spacing-2)">
            Загрузка...
          </div>
          <ul v-else-if="subtasks.length">
            <li
              v-for="st in subtasks"
              :key="st.id"
              class="flex items-center justify-between py-(--spacing-2) px-(--spacing-3) rounded-(--radius-sm) hover:bg-bg-tertiary -mx-(--spacing-3) cursor-pointer"
              @click="$emit('viewSubtask', st)"
            >
              <div class="flex items-center gap-(--spacing-2) min-w-0 flex-1">
                <span
                  class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs)"
                  :class="statusClass(st.status)"
                >
                  {{ statusLabel(st.status) }}
                </span>
                <span class="text-(--text-sm) text-text-primary truncate">{{ st.title }}</span>
              </div>
              <span class="text-(--text-xs) text-text-muted shrink-0">{{ formatDate(st.dueDate) }}</span>
            </li>
          </ul>
          <p v-else class="text-(--text-sm) text-text-muted py-(--spacing-2)">
            Нет подзадач. Добавьте для разбиения работы.
          </p>
        </div>

        <!-- Placeholder: Связанные задачи (blocks, как в Jira) -->
        <div class="border border-border-light rounded-(--radius-md) p-(--spacing-4)">
          <h4 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Связанные задачи</h4>
          <p class="text-(--text-sm) text-text-muted">Скоро: блокирует / блокируется</p>
        </div>

        <!-- Активность: комментарии (единый поток) -->
        <div class="border border-border-light rounded-(--radius-md) p-(--spacing-4)">
          <h4 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">
            Активность ({{ comments.length }})
          </h4>
          <div v-if="commentsLoading" class="text-(--text-sm) text-text-muted py-(--spacing-2)">
            Загрузка...
          </div>
          <div v-else class="space-y-(--spacing-3)">
            <div
              v-for="c in comments"
              :key="c.id"
              class="flex gap-(--spacing-3) py-(--spacing-2)"
            >
              <div class="flex-1 min-w-0">
                <p class="text-(--text-sm) text-text-primary whitespace-pre-wrap">{{ c.body }}</p>
                <p class="text-(--text-xs) text-text-muted mt-(--spacing-1)">
                  {{ getCreatorName(c.createdBy) }} · {{ formatDateTime(c.createdAt) }}
                </p>
              </div>
              <PermissionGuard
                v-if="canDeleteComment(c)"
                :permission="TASKS_PERMISSIONS.taskUpdate"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  class="text-error-default shrink-0"
                  @click="deleteComment(c)"
                >
                  Удалить
                </Button>
              </PermissionGuard>
            </div>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
              <div class="pt-(--spacing-2) border-t border-border-light">
                <Textarea
                  v-model="newCommentBody"
                  placeholder="Добавить комментарий..."
                  :rows="2"
                  resize="none"
                  class="mb-(--spacing-2)"
                />
                <Button
                  size="sm"
                  variant="primary"
                  :disabled="!newCommentBody.trim() || commentSaving"
                  @click="addComment"
                >
                  {{ commentSaving ? 'Отправка...' : 'Отправить' }}
                </Button>
              </div>
            </PermissionGuard>
          </div>
        </div>

        <!-- Placeholder: Время -->
        <div class="border border-border-light rounded-(--radius-md) p-(--spacing-4)">
          <h4 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Время</h4>
          <p class="text-(--text-sm) text-text-muted">
            {{ task.spentMinutes ? `Затрачено: ${task.spentMinutes} мин` : 'Скоро: тайм-трекинг' }}
          </p>
        </div>

        <!-- Placeholder: Вложения -->
        <div class="border border-border-light rounded-(--radius-md) p-(--spacing-4)">
          <h4 class="text-(--text-sm) font-medium text-text-secondary mb-(--spacing-2)">Вложения</h4>
          <p class="text-(--text-sm) text-text-muted">Скоро: прикрепление файлов</p>
        </div>
      </div>

      <template #footer>
        <div class="flex flex-wrap items-center justify-end gap-(--spacing-2)">
          <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
            <Button
              v-if="task.status !== 'completed'"
              variant="primary"
              size="md"
              @click="$emit('complete', task)"
            >
              Выполнить
            </Button>
            <Button
              v-else
              variant="outline"
              size="md"
              @click="$emit('reopen', task)"
            >
              Вернуть
            </Button>
            <Button variant="outline" size="md" @click="$emit('edit', task)">
              Изменить
            </Button>
          </PermissionGuard>
          <PermissionGuard :permission="TASKS_PERMISSIONS.taskDelete">
            <Button
              variant="ghost"
              size="md"
              class="text-error-default"
              @click="$emit('delete', task)"
            >
              Удалить
            </Button>
          </PermissionGuard>
        </div>
      </template>
    </ModalContent>
  </Modal>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
  import { Modal, ModalContent, Button, Textarea } from '@/shared/ui'
  import { PermissionGuard } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import { formatDateRu } from '@/shared/lib'
  import { taskService } from '@/entities/task'
  import type { Task, TaskComment } from '@/entities/task'

  const props = defineProps<{
    task: Task | null
    workspaceId: string
    currentUserId: string
    assigneeOptions: { value: string; label: string }[]
    subtasksRefreshKey?: number
  }>()

  const emit = defineEmits<{
    close: []
    edit: [task: Task]
    complete: [task: Task]
    reopen: [task: Task]
    delete: [task: Task]
    addSubtask: [task: Task]
    viewSubtask: [task: Task]
    commentsUpdated: []
  }>()

  const assigneeName = computed(() => {
    if (!props.task) return ''
    const opt = props.assigneeOptions.find((o) => o.value === props.task!.assigneeId)
    return opt?.label ?? ''
  })

  const subtasks = ref<Task[]>([])
  const subtasksLoading = ref(false)

  async function fetchSubtasks() {
    if (!props.task) return
    subtasksLoading.value = true
    try {
      subtasks.value = await taskService.getList({
        workspaceId: props.workspaceId,
        parentId: props.task.id,
      })
    } catch (e) {
      console.error('Failed to fetch subtasks:', e)
      subtasks.value = []
    } finally {
      subtasksLoading.value = false
    }
  }

  watch(
    () => [props.task?.id, props.subtasksRefreshKey],
    () => {
      if (props.task?.id) fetchSubtasks()
      else subtasks.value = []
    },
    { immediate: true },
  )

  const comments = ref<TaskComment[]>([])
  const commentsLoading = ref(false)
  const newCommentBody = ref('')
  const commentSaving = ref(false)

  async function fetchComments() {
    if (!props.task) return
    commentsLoading.value = true
    try {
      comments.value = await taskService.getComments(props.workspaceId, props.task.id)
    } catch (e) {
      console.error('Failed to fetch comments:', e)
      comments.value = []
    } finally {
      commentsLoading.value = false
    }
  }

  watch(
    () => props.task?.id,
    (id) => {
      if (id) fetchComments()
      else comments.value = []
    },
    { immediate: true },
  )

  function getCreatorName(userId: string) {
    const opt = props.assigneeOptions.find((o) => o.value === userId)
    return opt?.label ?? 'Пользователь'
  }

  function canDeleteComment(c: TaskComment) {
    return c.createdBy === props.currentUserId
  }

  async function addComment() {
    if (!props.task || !newCommentBody.value.trim()) return
    commentSaving.value = true
    try {
      await taskService.createComment(props.workspaceId, props.task.id, newCommentBody.value.trim())
      newCommentBody.value = ''
      await fetchComments()
      emit('commentsUpdated')
    } catch (e) {
      console.error('Failed to add comment:', e)
    } finally {
      commentSaving.value = false
    }
  }

  async function deleteComment(c: TaskComment) {
    if (!props.task) return
    try {
      await taskService.deleteComment(props.workspaceId, props.task.id, c.id)
      await fetchComments()
      emit('commentsUpdated')
    } catch (e) {
      console.error('Failed to delete comment:', e)
    }
  }

  function formatDateTime(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy, HH:mm')
  }

  const isMobile = ref(false)
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  function formatDate(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy')
  }

  function priorityClass(priority: string) {
    const map: Record<string, string> = {
      low: 'bg-bg-tertiary text-text-secondary',
      medium: 'bg-info-light text-info-default',
      high: 'bg-warning-light text-warning-default',
      critical: 'bg-error-light text-error-default',
    }
    return map[priority] ?? map.medium
  }

  function priorityLabel(priority: string) {
    const map: Record<string, string> = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      critical: 'Критический',
    }
    return map[priority] ?? priority
  }

  function statusClass(status: string) {
    const map: Record<string, string> = {
      pending: 'bg-bg-tertiary text-text-secondary',
      in_progress: 'bg-info-light text-info-default',
      completed: 'bg-success-light text-success-default',
      cancelled: 'bg-bg-tertiary text-text-muted',
    }
    return map[status] ?? map.pending
  }

  function statusLabel(status: string) {
    const map: Record<string, string> = {
      pending: 'К выполнению',
      in_progress: 'В работе',
      completed: 'Выполнена',
      cancelled: 'Отменена',
    }
    return map[status] ?? status
  }

  function typeLabel(type: string) {
    const map: Record<string, string> = {
      task: 'Задача',
      bug: 'Ошибка',
      feature: 'Функция',
      meeting: 'Встреча',
      call: 'Звонок',
      email: 'Email',
      lunch: 'Обед',
      other: 'Другое',
    }
    return map[type] ?? type
  }
</script>
