<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <h3 class="text-sm font-medium text-text-secondary">Проекты</h3>
      <Button
        v-if="canEdit"
        size="md"
        variant="outline"
        :disabled="availableToAdd.length === 0 || loadingList"
        @click="showAddModal = true"
      >
        <PlusIcon class="size-4 mr-1 inline" />
        Добавить в проект
      </Button>
    </div>

    <p v-if="error" class="text-sm text-danger-default flex items-center gap-2">
      {{ error }}
      <button type="button" class="underline" @click="fetch">Повторить</button>
    </p>

    <div v-if="loading" class="flex justify-center py-8">
      <Spinner class="size-6 text-primary-default" />
    </div>

    <template v-else>
      <div
        v-if="entityProjects.length === 0"
        class="rounded-lg border border-border-light border-dashed bg-bg-tertiary/50 p-6 text-center"
      >
        <p class="text-text-muted text-sm mb-3">
          {{ entityName ? `${entityName} не добавлен ни в один проект.` : 'Сущность не добавлена ни в один проект.' }}
        </p>
        <Button v-if="canEdit" size="md" variant="primary" @click="showAddModal = true">
          <PlusIcon class="size-4 mr-1 inline" />
          Добавить в проект
        </Button>
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="project in entityProjects"
          :key="project.id"
          class="flex items-center justify-between gap-3 py-3 px-4 rounded-lg border border-border-light bg-bg-primary"
        >
          <div class="min-w-0 flex-1">
            <span class="font-medium text-text-primary">{{ project.name }}</span>
            <p v-if="project.description" class="text-sm text-text-muted truncate mt-0.5">
              {{ project.description }}
            </p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <router-link
              v-if="projectsBasePath"
              :to="`${projectsBasePath}/${project.id}`"
              class="text-sm text-primary-default hover:underline"
            >
              Открыть
            </router-link>
            <button
              v-if="canEdit"
              type="button"
              class="p-1.5 rounded text-text-muted hover:bg-bg-tertiary hover:text-danger-default transition-colors"
              title="Удалить из проекта"
              @click="confirmRemove(project)"
            >
              <XMarkIcon class="size-4" />
            </button>
          </div>
        </li>
      </ul>
    </template>

    <ProjectAddModal
      :is-open="showAddModal"
      :available-projects="availableToAdd"
      :loading-list="loadingList"
      @close="showAddModal = false"
      @add="handleAdd"
    />

    <Modal :is-open="!!projectToRemove" @close="projectToRemove = null">
      <ConfirmModal
        :title="`Удалить ${entityName || 'сущность'} из проекта?`"
        :message="projectToRemove ? `Будет отвязан от проекта «${projectToRemove.name}». Сущность не удаляется из системы.` : ''"
        confirm-text="Удалить из проекта"
        confirm-variant="danger"
        @close="projectToRemove = null"
        @confirm="doRemove"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Modal, ConfirmModal, Button, Spinner } from '@/shared/ui'
  import { PlusIcon, XMarkIcon } from '@/shared/ui/icon'
  import { useEntityProjects } from '../model/useEntityProjects'
  import ProjectAddModal from './ProjectAddModal.vue'
  import type { Project, ProjectEntityType } from '@/entities/project'

  const props = withDefaults(
    defineProps<{
      workspaceId: string
      entityType: ProjectEntityType
      entityId: string
      entityName?: string
      canEdit?: boolean
      /** Базовый путь для ссылки «Открыть» (например /projects). Если пусто — ссылка не показывается. */
      projectsBasePath?: string
    }>(),
    { canEdit: true, projectsBasePath: '' },
  )

  const workspaceId = computed(() => props.workspaceId)
  const entityId = computed(() => props.entityId)
  const entityType = computed(() => props.entityType)

  const {
    entityProjects,
    availableToAdd,
    loading,
    loadingList,
    error,
    fetch,
    addToProjects,
    removeFromProject,
  } = useEntityProjects(workspaceId, entityType, entityId)

  const showAddModal = ref(false)
  const projectToRemove = ref<Project | null>(null)

  function confirmRemove(project: Project) {
    projectToRemove.value = project
  }

  async function doRemove() {
    if (!projectToRemove.value) return
    await removeFromProject(projectToRemove.value.id)
    projectToRemove.value = null
  }

  async function handleAdd(projectIds: string[]) {
    await addToProjects(projectIds)
    showAddModal.value = false
  }
</script>
