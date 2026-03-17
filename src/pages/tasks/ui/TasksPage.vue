<template>
  <BasePageLayout title="Мои задачи">
    <template #header-actions>
      <PermissionGuard :permission="TASKS_PERMISSIONS.taskCreate">
        <Button variant="primary" @click="openCreate">
          <PlusIcon class="w-4 h-4 mr-(--spacing-2) inline" />
          Новая задача
        </Button>
      </PermissionGuard>
    </template>

    <template #content>
      <TasksToolbar
        :search-query="searchDisplay"
        :view-mode="viewMode"
        :has-active-filters="hasActiveFilters"
        :active-filters-count="activeFiltersCount"
        @update:search-query="searchDisplay = $event"
        @update:view-mode="viewMode = $event"
        @search="onSearch"
        @open-filters="showFiltersDrawer = true"
      />

      <div
        class="relative min-h-[200px] transition-opacity duration-[var(--duration-normal)] mt-(--spacing-4)"
        :class="{ 'opacity-60 pointer-events-none': loading }"
      >
        <div
          v-if="loading && tasks.length === 0"
          class="absolute inset-0 flex items-center justify-center text-text-muted"
        >
          Загрузка...
        </div>
        <div
          v-else-if="tasks.length === 0"
          class="text-text-secondary py-(--spacing-8) text-center"
        >
          Нет задач. Создайте первую задачу.
        </div>
        <TaskList
          v-else-if="viewMode === 'list'"
          :tasks="tasks"
          :assignee-options="assigneeOptions"
          :format-date="formatDate"
          @view="viewTask"
          @edit="openEdit"
          @delete="confirmDelete"
          @complete="completeTask"
          @reopen="reopenTask"
          @start="startTask"
        />
        <TasksKanbanView
          v-else
          v-model:columns="kanbanColumns"
          :tasks="tasks"
          :saving-task-ids="savingTaskIds"
          :assignee-options="assigneeOptions"
          :format-date="formatDate"
          :loading="loading"
          @view="viewTask"
          @move="handleTaskMove"
        />
      </div>
    </template>

    <template #modals>
      <TasksFiltersDrawer
        :is-open="showFiltersDrawer"
        :status-filter="statusFilter"
        :type-filter="typeFilter"
        :priority-filter="priorityFilter"
        :assignee-filter="assigneeFilter"
        :my-tasks-only="myTasksOnly"
        :overdue-only="overdueOnly"
        :status-options="statusOptions"
        :type-options="typeOptions"
        :priority-options="priorityOptions"
        :assignee-options="assigneeSelectOptions"
        :has-active-filters="hasActiveFilters"
        @close="showFiltersDrawer = false"
        @reset="resetFilters"
        @update:status-filter="setStatusFilter"
        @update:type-filter="setTypeFilter"
        @update:priority-filter="setPriorityFilter"
        @update:assignee-filter="setAssigneeFilter"
        @update:my-tasks-only="updateMyTasksOnly"
        @update:overdue-only="updateOverdueOnly"
      />

      <TaskDetailModal
        :task="detailTask"
        :workspace-id="workspaceId"
        :current-user-id="currentUserId"
        :assignee-options="assigneeOptions"
        :subtasks-refresh-key="subtasksRefreshKey"
        @close="closeDetailModal"
        @edit="openEdit"
        @complete="completeTask"
        @reopen="reopenTask"
        @delete="confirmDelete"
        @add-subtask="openAddSubtask"
        @view-subtask="viewSubtask"
      />

      <TaskFormModal
        :is-open="showModal"
        :editing-task="editingTask"
        :assignee-options="assigneeOptions"
        :default-assignee-id="currentUserId"
        :parent-id="creatingSubtaskFor?.id"
        :saving="saving"
        @close="closeModal"
        @save="saveTask"
      />

      <Modal
        :is-open="showDeleteModal"
        content-class="bg-bg-primary rounded-(--radius-xl) shadow-card-hover"
        @update:is-open="showDeleteModal = $event"
      >
        <ConfirmModal
          title="Удалить задачу?"
          :message="deleteTarget ? `«${deleteTarget.title}» будет удалена.` : ''"
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="closeDeleteModal"
          @confirm="doDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Modal, ConfirmModal, Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { TASKS_PERMISSIONS } from '@/features/permissions/config'
  import {
    TaskFormModal,
    TaskList,
    TaskDetailModal,
    TasksFiltersDrawer,
    TasksToolbar,
    TasksKanbanView,
  } from '@/features/tasks/ui'
  import { useTasksPage } from '@/features/tasks/model'

  const showFiltersDrawer = ref(false)

  const {
    tasks,
    assigneeOptions,
    loading,
    saving,
    showModal,
    showDeleteModal,
    editingTask,
    detailTask,
    deleteTarget,
    statusFilter,
    priorityFilter,
    typeFilter,
    assigneeFilter,
    searchQuery,
    searchDisplay,
    myTasksOnly,
    overdueOnly,
    currentUserId,
    openCreate,
    viewTask,
    openEdit,
    openAddSubtask,
    viewSubtask,
    creatingSubtaskFor,
    subtasksRefreshKey,
    workspaceId,
    closeModal,
    closeDetailModal,
    closeDeleteModal,
    saveTask,
    confirmDelete,
    doDelete,
    completeTask,
    reopenTask,
    startTask,
    formatDate,
    viewMode,
    kanbanColumns,
    savingTaskIds,
    handleTaskMove,
  } = useTasksPage()

  const statusOptions = [
    { value: '', label: 'Все статусы' },
    { value: 'pending', label: 'К выполнению' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'completed', label: 'Выполнена' },
    { value: 'cancelled', label: 'Отменена' },
  ]

  const typeOptions = [
    { value: '', label: 'Все типы' },
    { value: 'task', label: 'Задача' },
    { value: 'bug', label: 'Ошибка' },
    { value: 'feature', label: 'Функция' },
    { value: 'meeting', label: 'Встреча' },
    { value: 'call', label: 'Звонок' },
    { value: 'other', label: 'Другое' },
  ]

  const priorityOptions = [
    { value: '', label: 'Все приоритеты' },
    { value: 'low', label: 'Низкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'high', label: 'Высокий' },
    { value: 'critical', label: 'Критический' },
  ]

  const assigneeSelectOptions = computed(() => [
    { value: '', label: 'Все исполнители' },
    ...assigneeOptions.value.map((o) => ({ value: o.value, label: o.label })),
  ])

  const hasActiveFilters = computed(
    () =>
      !!statusFilter.value ||
      !!priorityFilter.value ||
      !!typeFilter.value ||
      !!assigneeFilter.value ||
      !!searchQuery.value ||
      myTasksOnly.value ||
      overdueOnly.value,
  )

  const activeFiltersCount = computed(() => {
    let n = 0
    if (statusFilter.value) n++
    if (priorityFilter.value) n++
    if (typeFilter.value) n++
    if (assigneeFilter.value) n++
    if (searchQuery.value) n++
    if (myTasksOnly.value) n++
    if (overdueOnly.value) n++
    return n
  })

  function onSearch(v: string) {
    searchQuery.value = v
    searchDisplay.value = v
  }

  function setStatusFilter(v: string | number | null | undefined) {
    statusFilter.value = v ? String(v) : ''
  }

  function setTypeFilter(v: string | number | null | undefined) {
    typeFilter.value = v ? String(v) : ''
  }

  function setPriorityFilter(v: string | number | null | undefined) {
    priorityFilter.value = v ? String(v) : ''
  }

  function setAssigneeFilter(v: string | number | null | undefined) {
    assigneeFilter.value = v ? String(v) : ''
  }

  function updateMyTasksOnly(v: boolean) {
    myTasksOnly.value = v
  }

  function updateOverdueOnly(v: boolean) {
    overdueOnly.value = v
  }

  function resetFilters() {
    statusFilter.value = ''
    priorityFilter.value = ''
    typeFilter.value = ''
    assigneeFilter.value = ''
    searchQuery.value = ''
    searchDisplay.value = ''
    myTasksOnly.value = false
    overdueOnly.value = false
    showFiltersDrawer.value = false
  }
</script>
