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
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :format-date="formatDate"
          variant="compact"
          @click="openEdit(task)"
        >
          <template #actions="{ task: t }">
            <Tooltip trigger="click" placement="bottom" variant="dropdown">
              <template #trigger>
                <Button variant="ghost" size="md" class="!p-2">
                  <CogIcon class="w-5 h-5 text-text-muted hover:text-text-secondary" />
                </Button>
              </template>
              <div class="w-48 bg-bg-primary rounded-lg shadow-card border border-border-default py-1">
                <PermissionGuard :permission="TASKS_PERMISSIONS.taskUpdate">
                  <Button
                    v-if="t.status !== 'completed'"
                    variant="ghost"
                    size="md"
                    custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                    @click="completeTask(t)"
                  >
                    Выполнить
                  </Button>
                  <Button
                    v-else
                    variant="ghost"
                    size="md"
                    custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                    @click="reopenTask(t)"
                  >
                    Вернуть
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    custom-class="w-full justify-start !px-4 !py-2 text-text-primary hover:bg-bg-tertiary"
                    @click="openEdit(t)"
                  >
                    Изменить
                  </Button>
                </PermissionGuard>
                <PermissionGuard :permission="TASKS_PERMISSIONS.taskDelete">
                  <Button
                    variant="ghost"
                    size="md"
                    custom-class="w-full justify-start !px-4 !py-2 text-error-default hover:bg-error-light"
                    @click="confirmDelete(t)"
                  >
                    Удалить
                  </Button>
                </PermissionGuard>
              </div>
            </Tooltip>
          </template>
        </TaskCard>
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
  import { Button, Spinner, Modal, ConfirmModal, Tooltip } from '@/shared/ui'
  import { PlusIcon, CogIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import TaskFormModal from './TaskFormModal.vue'
  import TaskCard from './TaskCard.vue'
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

  const entityName = computed(() => props.entityName)
</script>
