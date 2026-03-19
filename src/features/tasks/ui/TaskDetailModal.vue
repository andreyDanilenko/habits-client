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
        <Button
          variant="link"
          size="sm"
          :left-icon="ArrowLeftIcon"
          custom-class="TaskDetailModal__ViewParent text-text-muted"
          @click="$emit('viewParent', task.parentId)"
        >
          {{
            displayParentTask ? `К задаче «${displayParentTask.title}»` : 'К родительской задаче'
          }}
        </Button>
      </div>

      <div :key="task?.id ?? 'empty'" class="space-y-(--spacing-6)">
        <!-- Шапка: метаданные + трекинг времени -->
        <div class="flex flex-wrap items-center justify-between gap-(--spacing-3)">
          <div class="flex flex-wrap items-center gap-(--spacing-2)">
            <PriorityBadge :priority="task.priority" />
            <StatusBadge :status="task.status" />
            <TypeBadge :type="task.type" />
            <span v-if="assigneeName" class="text-[11px] text-text-secondary">
              → {{ assigneeName }}
            </span>
            <span class="text-[11px] text-text-muted">{{ formatDate(task.dueDate) }}</span>
          </div>
          <!-- Трекинг времени в шапке (изолирован для избежания ре-рендера модалки каждую секунду) -->
          <TaskTimerDisplay
            ref="timerRef"
            :task-total-seconds="taskTotalSeconds"
            :can-edit="canEditTask"
            :time-saving="timeSaving"
            :workspace-id="workspaceId"
            :task-id="task?.id ?? null"
          />
        </div>

        <!-- Описание (Markdown) -->
        <TaskDetailSection v-if="task.description" title="Описание">
          <MarkdownContent :content="task.description" />
        </TaskDetailSection>

        <!-- Подзадачи -->
        <TaskDetailSection
          v-if="!task.parentId"
          :title="`Подзадачи (${subtasksCompletedCount}/${subtasks.length})`"
        >
          <template #action>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskCreate">
              <Button
                variant="link"
                size="xs"
                custom-class="TaskDetailModal__AddSubtask text-[11px]"
                @click="$emit('addSubtask', task)"
              >
                + Добавить
              </Button>
            </PermissionGuard>
          </template>
          <div v-if="subtasksLoading" class="text-(--text-xs) text-text-muted py-(--spacing-2)">
            Загрузка...
          </div>
          <ul v-else-if="subtasks.length" class="space-y-0 overflow-hidden">
            <TaskSubtaskRow
              v-for="st in subtasks"
              :key="st.id"
              :task="st"
              :format-date="formatDate"
              @click="$emit('viewSubtask', st)"
            />
          </ul>
          <p v-else class="text-(--text-xs) text-text-muted py-(--spacing-2)">
            Нет подзадач. Добавьте для разбиения работы.
          </p>
        </TaskDetailSection>

        <!-- Чеклист -->
        <TaskChecklist
          v-model="checklistItems"
          :can-edit="canEditTask"
        />

        <!-- Теги -->
        <TaskTagsSection
          v-model="tagsItems"
          :can-edit="canEditTask"
        />

        <!-- Связанные задачи -->
        <TaskLinkedSection
          :linked-tasks="linkedTasks"
          :loading="linkedTasksLoading"
          :can-edit="canEditTask"
          :workspace-id="workspaceId"
          :current-task-id="task.id"
          :exclude-task-ids="[task.id, ...linkedTasks.map((l) => l.id)]"
          @view="handleViewLinked"
          @add="addTaskLink"
          @remove="removeTaskLink"
        />

        <!-- Активность: табы как в Jira -->
        <DetailTabsPanel v-model="activityTab" :tabs="activityTabs">
          <template #comments>
            <div class="space-y-(--spacing-3)">
              <div v-if="commentsLoading" class="text-(--text-xs) text-text-muted py-(--spacing-2)">
                Загрузка...
              </div>
              <template v-else>
                <CommentThread
                  v-for="c in visibleRootComments"
                  :key="c.id"
                  :comment="c"
                  :is-root="true"
                />
                <div v-if="hasMoreComments" class="flex justify-center pt-(--spacing-2)">
                  <Button
                    variant="link"
                    size="xs"
                    custom-class="TaskDetailModal__ShowMore text-[11px]"
                    @click="showMoreComments"
                  >
                    Показать ещё ({{ rootComments.length - visibleCommentsCount }})
                  </Button>
                </div>
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
              </template>
            </div>
          </template>
          <template #time>
            <TaskTimeSection
              :spent-minutes="task.spentMinutes ?? 0"
              :spent-seconds="task.spentSeconds ?? 0"
              :duration="task.duration"
              :can-edit="canEditTask"
              :saving="timeSaving"
              @add-time="addTime"
              @set-spent="setSpentMinutes"
            />
          </template>
          <template #changes>
            <div v-if="taskActivitiesLoading && taskActivities.length === 0" class="text-(--text-xs) text-text-muted py-(--spacing-4)">
              Загрузка...
            </div>
            <template v-else>
              <ul v-if="taskActivities.length" class="space-y-(--spacing-3)">
                <li
                  v-for="a in taskActivities"
                  :key="a.id"
                  class="flex items-start gap-(--spacing-2) py-(--spacing-2) border-b border-border-light last:border-0"
                >
                  <span class="text-(--text-sm) shrink-0">{{ a.emoji || '•' }}</span>
                  <div class="min-w-0 flex-1">
                    <p class="text-(--text-xs) text-text-primary">{{ formatActivityTitle(a.title) }}</p>
                    <p class="text-[11px] text-text-muted">
                      {{ a.userName || 'Пользователь' }} · {{ formatRelativeTime(a.createdAt) }}
                    </p>
                  </div>
                </li>
              </ul>
              <div v-if="hasMoreActivities" class="flex justify-center pt-(--spacing-2)">
                <Button
                  variant="link"
                  size="xs"
                  :disabled="taskActivitiesLoading"
                  custom-class="TaskDetailModal__ShowMore text-[11px]"
                  @click="showMoreActivities"
                >
                  {{ taskActivitiesLoading ? 'Загрузка...' : `Показать ещё (${taskActivitiesTotal - taskActivities.length})` }}
                </Button>
              </div>
              <p v-if="!taskActivities.length" class="text-(--text-xs) text-text-muted py-(--spacing-4)">
                Нет изменений
              </p>
            </template>
          </template>
        </DetailTabsPanel>

        <!-- Вложения -->
        <!-- <TaskAttachmentsSection
          :attachments="attachments"
          :loading="attachmentsLoading"
          :can-edit="canEditTask"
          :uploading="attachmentsUploading"
          :workspace-id="workspaceId"
          :task-id="task.id"
          @upload="uploadAttachment"
          @delete="deleteAttachment"
        /> -->
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
  import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
  import { Modal, ModalContent, Button, RichTextEditor, MarkdownContent, DetailTabsPanel } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import CommentThread from './CommentThread.vue'
  import {
    TaskDetailSection,
    TaskSubtaskRow,
    TaskChecklist,
    TaskTagsSection,
    TaskLinkedSection,
    TaskTimeSection,
    TaskTimerDisplay,
    PriorityBadge,
    StatusBadge,
    TypeBadge,
    type LinkedTask,
  } from './sections'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import { formatDateRu, formatRelativeTime, useDebounceFn } from '@/shared/lib'
  import { taskService } from '@/entities/task'
  import { useTaskComments } from '../model/use-task-comments'
  import { useTaskLocalData } from '../model/use-task-local-data'
  import type { Task, TaskChecklistItem, TaskActivity } from '@/entities/task'

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
    viewLinkedTask: [taskId: string]
    commentsUpdated: []
    taskUpdated: [task: Task]
  }>()

  const { can } = usePermissions()
  const canEditTask = computed(() => can(TASKS_PERMISSIONS.taskUpdate))

  const assigneeName = computed(() => {
    if (!props.task) return ''
    const opt = props.assigneeOptions.find((o) => o.value === props.task!.assigneeId)
    return opt?.label ?? ''
  })

  const checklistItems = ref<TaskChecklistItem[]>([])
  const tagsItems = ref<string[]>([])
  const linkedTasks = ref<LinkedTask[]>([])
  const attachments = ref<{ id: string; name: string; url: string; size?: number; mimeType?: string }[]>([])
  const attachmentsLoading = ref(false)
  const timeSaving = ref(false)
  const activityTab = ref('comments')
  const ACTIVITIES_PAGE_SIZE = 10
  const taskActivities = ref<TaskActivity[]>([])
  const taskActivitiesTotal = ref(0)
  const taskActivitiesLoading = ref(false)
  const hasMoreActivities = computed(() => taskActivities.value.length < taskActivitiesTotal.value)
  const timerRef = ref<InstanceType<typeof TaskTimerDisplay> | null>(null)

  const taskTotalSeconds = computed(
    () => (props.task?.spentMinutes ?? 0) * 60 + (props.task?.spentSeconds ?? 0),
  )

  function formatTimeHMS(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
  }

  function formatActivityTitle(title: string): string {
    const m = title.match(/^Добавил\s+(\d+)(?:\s+мин(?:\s+(\d+)\s+сек)?|\s+сек)$/)
    if (!m) return title
    const totalSec = m[2] ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : m[0].includes('мин') ? parseInt(m[1], 10) * 60 : parseInt(m[1], 10)
    return `Добавил ${formatTimeHMS(totalSec)}`
  }

  async function setSpentMinutes(minutes: number) {
    if (!props.task?.id || !props.workspaceId) return
    timerRef.value?.stopAndSave()
    timeSaving.value = true
    try {
      const updated = await taskService.update(props.workspaceId, props.task.id, {
        spentMinutes: minutes,
        spentSeconds: 0,
      })
      emit('taskUpdated', updated)
      fetchTaskActivities().catch((e) => console.error('fetchTaskActivities:', e))
    } catch (e) {
      console.error('Failed to set spent time:', e)
    } finally {
      timeSaving.value = false
    }
  }

  const taskIdRef = computed(() => props.task?.id)
  const { getTags, setTags, getChecklist } = useTaskLocalData(taskIdRef)

  const lastTagsFromTask = ref<string[]>([])
  const isSyncingTagsFromTask = ref(false)
  const prevTaskIdRef = ref<string | null>(null)

  watch(
    () => props.task,
    (t) => {
      if (!t) {
        checklistItems.value = []
        tagsItems.value = []
        lastTagsFromTask.value = []
        linkedTasks.value = []
        attachments.value = []
        prevTaskIdRef.value = null
      } else {
        const taskIdChanged = prevTaskIdRef.value !== t.id
        prevTaskIdRef.value = t.id

        checklistItems.value = t.checklist?.length ? t.checklist : getChecklist()
        const tags = t.tags?.length ? t.tags : getTags()
        isSyncingTagsFromTask.value = true
        lastTagsFromTask.value = [...tags]
        tagsItems.value = tags
        nextTick(() => { isSyncingTagsFromTask.value = false })

        if (taskIdChanged) {
          linkedTasks.value = []
          fetchAttachments()
          fetchTaskLinks()
          fetchSubtasks()
        }
      }
    },
    { immediate: true },
  )

  async function fetchAttachments() {
    if (!props.task?.id || !props.workspaceId) return
    attachmentsLoading.value = true
    try {
      const list = await taskService.getAttachments(props.workspaceId, props.task.id)
      attachments.value = list.map((a) => ({
        id: a.id,
        name: a.fileName,
        url: a.url,
        size: a.fileSize,
        mimeType: a.mimeType,
      }))
    } catch (e) {
      console.error('Failed to fetch attachments:', e)
      attachments.value = []
    } finally {
      attachmentsLoading.value = false
    }
  }


  async function addTime(seconds: number) {
    if (!props.task?.id || !props.workspaceId || seconds <= 0) return
    timeSaving.value = true
    try {
      const total = taskTotalSeconds.value + seconds
      const mins = Math.floor(total / 60)
      const secs = total % 60
      const updated = await taskService.update(props.workspaceId, props.task.id, {
        spentMinutes: mins,
        spentSeconds: secs,
      })
      emit('taskUpdated', updated)
      fetchTaskActivities().catch((e) => console.error('fetchTaskActivities:', e))
    } catch (e) {
      console.error('Failed to add time:', e)
    } finally {
      timeSaving.value = false
    }
  }

  async function fetchTaskActivities(reset = true) {
    if (!props.task?.id || !props.workspaceId) return
    taskActivitiesLoading.value = true
    const offset = reset ? 0 : taskActivities.value.length
    try {
      const res = await taskService.getTaskActivities(
        props.workspaceId,
        props.task.id,
        ACTIVITIES_PAGE_SIZE,
        offset,
      )
      taskActivitiesTotal.value = res.total
      taskActivities.value = reset ? res.activities : [...taskActivities.value, ...res.activities]
    } catch (e) {
      console.error('Failed to fetch task activities:', e)
      if (reset) taskActivities.value = []
    } finally {
      taskActivitiesLoading.value = false
    }
  }

  function showMoreActivities() {
    fetchTaskActivities(false)
  }

  watch(
    () => [props.task?.id, props.workspaceId, activityTab.value],
    () => {
      if (props.task?.id && props.workspaceId && activityTab.value === 'changes') {
        fetchTaskActivities(true)
      } else if (!props.task?.id) {
        taskActivities.value = []
        taskActivitiesTotal.value = 0
      }
    },
    { immediate: true },
  )

  // Убрано: watch checklistItems вызывал циклы при обновлении
  // watch(checklistItems, (v) => setChecklist(v), { deep: true })

  const tagsSaving = ref(false)
  async function saveTagsToApi(tags: string[]) {
    if (!props.task?.id || !props.workspaceId) return
    tagsSaving.value = true
    try {
      const updated = await taskService.update(props.workspaceId, props.task.id, { tags })
      lastTagsFromTask.value = [...(updated.tags ?? tags)]
      emit('taskUpdated', updated)
      setTags(updated.tags ?? tags)
    } catch (e) {
      console.error('Failed to save tags:', e)
    } finally {
      tagsSaving.value = false
    }
  }
  const debouncedSaveTags = useDebounceFn(saveTagsToApi, 400)
  watch(tagsItems, (v) => {
    if (isSyncingTagsFromTask.value) return
    const a = [...(v ?? [])].sort()
    const b = [...lastTagsFromTask.value].sort()
    if (a.length === b.length && a.every((x, i) => x === b[i])) return
    lastTagsFromTask.value = [...(v ?? [])]
    debouncedSaveTags(v)
  }, { deep: true })

  const linkedTasksLoading = ref(false)
  async function fetchTaskLinks() {
    if (!props.task?.id) return
    linkedTasksLoading.value = true
    try {
      const links = await taskService.getTaskLinks(props.workspaceId, props.task.id)
      linkedTasks.value = links.map((l) => ({
        linkId: l.id,
        id: l.linkedTaskId,
        title: l.linkedTitle,
        priority: l.linkedPriority,
        linkType: l.linkType as 'blocks' | 'blocked_by',
      }))
    } catch (e) {
      console.error('Failed to fetch task links:', e)
      linkedTasks.value = []
    } finally {
      linkedTasksLoading.value = false
    }
  }


  async function removeTaskLink(linkId: string) {
    if (!props.task?.id) return
    try {
      await taskService.deleteTaskLink(props.workspaceId, props.task.id, linkId)
      linkedTasks.value = linkedTasks.value.filter((l) => l.linkId !== linkId)
    } catch (e) {
      console.error('Failed to remove link:', e)
    }
  }

  async function addTaskLink(linkedTaskId: string, linkType: 'blocks' | 'blocked_by') {
    if (!props.task?.id) return
    try {
      await taskService.addTaskLink(props.workspaceId, props.task.id, linkedTaskId, linkType)
      await fetchTaskLinks()
    } catch (e) {
      console.error('Failed to add link:', e)
      throw e
    }
  }

  function handleViewLinked(lt: LinkedTask) {
    emit('viewLinkedTask', lt.id)
  }

  const subtasks = ref<Task[]>([])
  const subtasksLoading = ref(false)
  const subtasksCompletedCount = computed(() =>
    subtasks.value.filter((t) => t.status === 'completed').length,
  )

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
    () => props.subtasksRefreshKey,
    () => {
      if (props.task?.id) fetchSubtasks()
    },
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

  const activityTabs = computed(() => [
    { id: 'comments', label: `Комментарии (${comments.value.length})` },
    { id: 'time', label: 'Время' },
    { id: 'changes', label: `Изменения (${taskActivitiesTotal.value})` },
  ])

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
  .task-detail-fade-enter-active,
  .task-detail-fade-leave-active {
    transition: opacity 0.15s ease;
  }
  .task-detail-fade-enter-from,
  .task-detail-fade-leave-to {
    opacity: 0;
  }
  @media (hover: hover) {
    .TaskDetailModal__ViewParent:hover {
      color: var(--color-primary-default);
    }
    .TaskDetailModal__AddSubtask:hover,
    .TaskDetailModal__ShowMore:hover {
      color: var(--color-primary-dark);
    }
  }
  @media (hover: none) {
    .TaskDetailModal__AddSubtask:hover,
    .TaskDetailModal__ShowMore:hover {
      color: var(--color-primary-default);
    }
  }
</style>
