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
      <!-- Возврат к родительской задаче (для подзадач) -->
      <div v-if="task.parentId" class="mb-(--spacing-3) flex items-center gap-(--spacing-2)">
        <button
          type="button"
          class="inline-flex items-center gap-(--spacing-1) text-(--text-sm) text-text-muted hover:text-primary-default transition-colors"
          @click="$emit('viewParent', task.parentId)"
        >
          <ArrowLeftIcon size="sm" />
          <span>{{
            displayParentTask ? `К задаче «${displayParentTask.title}»` : 'К родительской задаче'
          }}</span>
        </button>
      </div>

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

        <!-- Описание (Markdown) -->
        <div v-if="task.description" class="TaskDetailSection">
          <h4 class="TaskDetailSection__Title">Описание</h4>
          <MarkdownContent :content="task.description" />
        </div>

        <!-- Подзадачи -->
        <div v-if="!task.parentId" class="TaskDetailSection">
          <div class="flex items-center justify-between mb-(--spacing-2)">
            <h4 class="TaskDetailSection__Title">Подзадачи ({{ subtasks.length }})</h4>
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
              <span class="text-(--text-xs) text-text-muted shrink-0">{{
                formatDate(st.dueDate)
              }}</span>
            </li>
          </ul>
          <p v-else class="text-(--text-sm) text-text-muted py-(--spacing-2)">
            Нет подзадач. Добавьте для разбиения работы.
          </p>
        </div>

        <!-- Чеклист (placeholder) -->
        <div class="TaskDetailSection TaskDetailSection--placeholder">
          <h4 class="TaskDetailSection__Title">Чеклист</h4>
          <p class="text-(--text-sm) text-text-muted">Скоро: пункты с отметкой</p>
        </div>

        <!-- Теги (placeholder) -->
        <div class="TaskDetailSection TaskDetailSection--placeholder">
          <h4 class="TaskDetailSection__Title">Теги</h4>
          <p class="text-(--text-sm) text-text-muted">Скоро: добавление тегов</p>
        </div>

        <!-- Связанные задачи (placeholder) -->
        <div class="TaskDetailSection TaskDetailSection--placeholder">
          <h4 class="TaskDetailSection__Title">Связанные задачи</h4>
          <p class="text-(--text-sm) text-text-muted">Скоро: блокирует / блокируется</p>
        </div>

        <!-- Активность: комментарии -->
        <div class="TaskDetailSection">
          <h4 class="TaskDetailSection__Title">Активность ({{ comments.length }})</h4>
          <div v-if="commentsLoading" class="text-(--text-sm) text-text-muted py-(--spacing-2)">
            Загрузка...
          </div>
          <div v-else class="space-y-(--spacing-3)">
            <CommentThread
              v-for="c in visibleRootComments"
              :key="c.id"
              :comment="c"
              :is-root="true"
            />
            <!-- Показать ещё комментарии -->
            <div v-if="hasMoreComments" class="flex justify-center pt-(--spacing-2)">
              <Button size="sm" variant="ghost" @click="showMoreComments">
                Показать ещё ({{ rootComments.length - visibleCommentsCount }})
              </Button>
            </div>
            <!-- Форма нового комментария (всегда доступна) -->
            <div class="pt-(--spacing-2) border-t border-border-light">
              <RichTextEditor
                v-model="newCommentBody"
                placeholder="Добавить комментарий..."
                compact
                class="mb-(--spacing-2)"
              />
              <Button
                size="sm"
                variant="primary"
                :disabled="isRichContentEmpty(newCommentBody) || commentSaving"
                @click="addComment"
              >
                {{ commentSaving ? 'Отправка...' : 'Отправить' }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Время -->
        <div class="TaskDetailSection TaskDetailSection--placeholder">
          <h4 class="TaskDetailSection__Title">Время</h4>
          <p class="text-(--text-sm) text-text-muted">
            {{ task.spentMinutes ? `Затрачено: ${task.spentMinutes} мин` : 'Скоро: тайм-трекинг' }}
            <span v-if="task.duration" class="text-text-secondary">
              · Оценка: {{ task.duration }} мин</span
            >
          </p>
        </div>

        <!-- Вложения -->
        <div class="TaskDetailSection TaskDetailSection--placeholder">
          <h4 class="TaskDetailSection__Title">Вложения</h4>
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
            <Button v-else variant="outline" size="md" @click="$emit('reopen', task)">
              Вернуть
            </Button>
            <Button variant="outline" size="md" @click="$emit('edit', task)"> Изменить </Button>
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
  import { Modal, ModalContent, Button, RichTextEditor, MarkdownContent } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import CommentThread from './CommentThread.vue'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import { formatDateRu } from '@/shared/lib'
  import {
    taskService,
    priorityClass,
    priorityLabel,
    statusClass,
    statusLabel,
    typeLabel,
  } from '@/entities/task'
  import { useTaskComments } from '../model/use-task-comments'
  import type { Task } from '@/entities/task'

  const props = defineProps<{
    task: Task | null
    parentTask?: Task | null
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
    viewParent: [parentId: string]
    commentsUpdated: []
  }>()

  const { can } = usePermissions()
  const canEditTask = computed(() => can(TASKS_PERMISSIONS.taskUpdate))

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

  const taskRef = computed(() => props.task)
  const workspaceIdRef = computed(() => props.workspaceId)
  const currentUserIdRef = computed(() => props.currentUserId)
  const assigneeOptionsRef = computed(() => props.assigneeOptions)

  const {
    comments,
    commentsLoading,
    newCommentBody,
    commentSaving,
    rootComments,
    visibleRootComments,
    visibleCommentsCount,
    hasMoreComments,
    showMoreComments,
    addComment,
    isRichContentEmpty,
    handleCommentMenuClickOutside,
  } = useTaskComments(
    taskRef,
    workspaceIdRef,
    currentUserIdRef,
    assigneeOptionsRef,
    canEditTask,
    () => emit('commentsUpdated'),
  )

  const fetchedParentTask = ref<Task | null>(null)
  const displayParentTask = computed(() => props.parentTask ?? fetchedParentTask.value)

  watch(
    () => props.task?.id,
    async (id) => {
      fetchedParentTask.value = null
      if (id && props.task?.parentId && !props.parentTask) {
        try {
          fetchedParentTask.value = await taskService.getById(
            props.workspaceId,
            props.task.parentId,
          )
        } catch {
          // ignore
        }
      }
    },
    { immediate: true },
  )

  const isMobile = ref(false)
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    document.addEventListener('click', handleCommentMenuClickOutside)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
    document.removeEventListener('click', handleCommentMenuClickOutside)
  })

  function formatDate(s: string) {
    if (!s) return ''
    return formatDateRu(s, 'd MMM yyyy')
  }
</script>

<style scoped>
  .TaskDetailSection {
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--spacing-4);
  }

  .TaskDetailSection--placeholder {
    background-color: var(--color-bg-tertiary);
  }

  .TaskDetailSection__Title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-2);
  }
</style>
