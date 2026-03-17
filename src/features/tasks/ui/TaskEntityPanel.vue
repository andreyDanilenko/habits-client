<template>
  <div class="space-y-(--spacing-4)">
    <div class="flex items-center justify-between gap-(--spacing-4)">
      <h3 class="text-(--text-sm) font-medium text-text-secondary">Задачи</h3>
      <PermissionGuard :permission="TASKS_PERMISSIONS.taskCreate">
        <Button size="md" variant="outline" @click="openCreate">
        <PlusIcon class="size-4 mr-1 inline" />
        Быстрая задача
      </Button>
      </PermissionGuard>
    </div>

    <div v-if="loading" class="flex justify-center py-(--spacing-8)">
      <Spinner class="size-6 text-primary-default" />
    </div>

    <template v-else>
      <div
        v-if="tasks.length === 0"
        class="rounded-(--radius-md) border border-border-light border-dashed bg-bg-tertiary/50 p-(--spacing-6) text-center"
      >
        <p class="text-text-muted text-(--text-sm) mb-(--spacing-3)">
          {{ entityName ? `Нет задач по «${entityName}».` : 'Нет связанных задач.' }}
        </p>
        <PermissionGuard :permission="TASKS_PERMISSIONS.taskCreate">
          <Button size="md" variant="primary" @click="openCreate">
            <PlusIcon class="size-4 mr-1 inline" />
            Создать задачу
          </Button>
        </PermissionGuard>
      </div>

      <ul v-else class="space-y-(--spacing-2)">
        <li
          v-for="task in tasks"
          :key="task.id"
          class="flex items-center justify-between gap-(--spacing-3) py-(--spacing-3) px-(--spacing-4) rounded-(--radius-md) border border-border-light bg-bg-primary hover:bg-bg-secondary transition-colors"
        >
          <div class="min-w-0 flex-1 cursor-pointer" @click="openEdit(task)">
            <div class="flex items-center gap-(--spacing-2)">
              <span
                class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) font-medium shrink-0"
                :class="priorityClass(task.priority)"
              >
                {{ priorityLabel(task.priority) }}
              </span>
              <span
                v-if="task.status === 'completed'"
                class="inline-flex items-center px-(--spacing-2) py-(--spacing-1) rounded-(--radius-sm) text-(--text-xs) bg-success-light text-success-default shrink-0"
              >
                Выполнена
              </span>
            </div>
            <span class="font-medium text-text-primary block truncate mt-(--spacing-1)">{{ task.title }}</span>
            <p class="text-(--text-sm) text-text-muted mt-(--spacing-1)">{{ formatDate(task.dueDate) }}</p>
          </div>
          <div class="flex items-center gap-(--spacing-2) shrink-0">
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
              <Button
                v-if="task.status !== 'completed'"
                size="sm"
                variant="ghost"
                @click.stop="completeTask(task)"
              >
                Выполнить
              </Button>
              <Button
                v-else
                size="sm"
                variant="ghost"
                @click.stop="reopenTask(task)"
              >
                Вернуть
              </Button>
              <Button size="sm" variant="ghost" @click.stop="openEdit(task)">Изменить</Button>
            </PermissionGuard>
            <PermissionGuard :permission="TASKS_PERMISSIONS.taskDelete">
              <Button
                size="sm"
                variant="ghost"
                class="text-error-default"
                @click.stop="confirmDelete(task)"
              >
                Удалить
              </Button>
            </PermissionGuard>
          </div>
        </li>
      </ul>
    </template>

    <TaskFormModal
      :is-open="showModal"
      :editing-task="editingTask"
      :assignee-options="assigneeOptions"
      :default-assignee-id="currentUserId"
      :saving="saving"
      @close="closeModal"
      @save="saveTask"
    />

    <Modal :is-open="showDeleteModal" @close="closeDeleteModal">
      <ConfirmModal
        title="Удалить задачу?"
        :message="deleteTarget ? `«${deleteTarget.title}» будет удалена.` : ''"
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="closeDeleteModal"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button, Spinner, Modal, ConfirmModal } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import TaskFormModal from './TaskFormModal.vue'
  import { useTaskEntityPanel } from '../model/use-task-entity-panel'

  const props = defineProps<{
    workspaceId: string
    entityType: string
    entityId: string
    entityName?: string
  }>()

  const {
    tasks,
    assigneeOptions,
    loading,
    saving,
    showModal,
    showDeleteModal,
    editingTask,
    deleteTarget,
    currentUserId,
    openCreate,
    openEdit,
    closeModal,
    closeDeleteModal,
    saveTask,
    confirmDelete,
    doDelete,
    completeTask,
    reopenTask,
    formatDate,
  } = useTaskEntityPanel(props)

  function priorityClass(priority: string) {
    const map: Record<string, string> = {
      low: 'bg-bg-tertiary text-text-secondary',
      medium: 'bg-info-light text-info-default',
      high: 'bg-warning-light text-warning-default',
      critical: 'bg-error-light text-error-default',
    }
    return map[priority] ?? map.medium
  }

  const entityName = computed(() => props.entityName)

  function priorityLabel(priority: string) {
    const map: Record<string, string> = {
      low: 'Низкий',
      medium: 'Средний',
      high: 'Высокий',
      critical: 'Критический',
    }
    return map[priority] ?? priority
  }
</script>
