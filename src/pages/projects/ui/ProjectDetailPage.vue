<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-8">
    <nav class="flex items-center gap-2 text-sm text-text-secondary">
      <router-link
        :to="{ name: 'ProjectsList' }"
        class="inline-flex items-center gap-1 hover:text-primary-default"
      >
        <ArrowLeftIcon class="size-4" />
        Проекты
      </router-link>
      <span v-if="project" class="flex items-center gap-2">
        <span class="text-text-muted">/</span>
        <span class="font-medium text-text-primary">Проект: {{ project.name }}</span>
      </span>
    </nav>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner class="size-8 text-primary-default" />
    </div>

    <template v-else-if="project">
      <header class="flex flex-wrap items-start gap-4 p-4 rounded-xl border border-border-default bg-bg-primary">
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-semibold text-text-primary">{{ project.name }}</h1>
          <p v-if="project.description" class="text-text-secondary text-sm mt-0.5">
            {{ project.description }}
          </p>
          <p class="text-xs text-text-muted mt-2">
            Обновлён: {{ formatDate(project.updatedAt) }}
          </p>
          <div class="flex flex-wrap gap-2 mt-3">
            <Button size="md" variant="outline" @click="openEdit">Редактировать</Button>
            <Button size="md" variant="ghost" class="text-danger-default" @click="confirmDelete">
              Удалить
            </Button>
          </div>
        </div>
      </header>

      <!-- Модули: переход в контекст модуля (не дублирование структуры CRM и т.д.) -->
      <div class="rounded-xl border border-border-default bg-bg-primary overflow-hidden">
        <div class="p-6">
          <h2 class="text-sm font-medium text-text-secondary mb-3">Модули</h2>
          <div class="flex flex-wrap gap-3">
            <router-link
              :to="{ name: 'ProjectCrm', params: { id: projectId } }"
              class="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-border-default bg-bg-primary hover:border-primary-default hover:bg-bg-secondary text-text-primary transition-colors"
            >
              <CrmIcon class="size-5 text-primary-default" />
              <span class="font-medium">CRM</span>
              <span class="text-sm text-text-muted">({{ crmCount }} сущностей)</span>
            </router-link>
          </div>
          <p class="text-xs text-text-muted mt-3">
            Переход откроет страницу модуля в контексте этого проекта (контакты, компании и сделки проекта).
          </p>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-12 text-text-muted">Проект не найден.</div>

    <ProjectFormModal
      :is-open="showEditModal"
      :project="project ?? null"
      @close="showEditModal = false"
      @update="handleUpdate"
    />

    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <ConfirmModal
        title="Удалить проект?"
        message="Связи с контактами, компаниями и сделками будут удалены. Сами сущности CRM не удаляются."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteModal = false"
        @confirm="doDelete"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Button, Spinner, Modal, ConfirmModal } from '@/shared/ui'
  import { ArrowLeftIcon, CrmIcon } from '@/shared/ui/icon'
  import { ProjectFormModal } from '@/features/projects'
  import { projectService } from '@/entities/project'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { formatDateDisplay } from '@/shared/lib/date'
  import type { Project } from '@/entities/project'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const projectId = computed(() => route.params.id as string)

  const project = ref<Project | null>(null)
  const isLoading = ref(true)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)

  const entityCounts = ref({ contacts: 0, companies: 0, deals: 0 })
  const crmCount = computed(
    () => entityCounts.value.contacts + entityCounts.value.companies + entityCounts.value.deals,
  )

  function formatDate(iso: string) {
    return formatDateDisplay(iso)
  }

  async function fetchProject() {
    if (!workspaceId.value || !projectId.value) {
      project.value = null
      return
    }
    isLoading.value = true
    try {
      project.value = await projectService.getById(workspaceId.value, projectId.value)
    } catch {
      project.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchEntityCounts() {
    if (!workspaceId.value || !projectId.value) return
    try {
      const [contactIds, companyIds, dealIds] = await Promise.all([
        projectService.listEntityIds(workspaceId.value, projectId.value, 'crm_contact'),
        projectService.listEntityIds(workspaceId.value, projectId.value, 'crm_company'),
        projectService.listEntityIds(workspaceId.value, projectId.value, 'crm_deal'),
      ])
      entityCounts.value = {
        contacts: contactIds.length,
        companies: companyIds.length,
        deals: dealIds.length,
      }
    } catch {
      entityCounts.value = { contacts: 0, companies: 0, deals: 0 }
    }
  }

  watch([workspaceId, projectId], fetchProject, { immediate: true })
  watch(
    project,
    (p) => {
      if (p) fetchEntityCounts()
      else entityCounts.value = { contacts: 0, companies: 0, deals: 0 }
    },
    { immediate: true },
  )

  function openEdit() {
    showEditModal.value = true
  }

  async function handleUpdate(id: string, dto: { name?: string; description?: string | null }) {
    if (!workspaceId.value) return
    project.value = await projectService.update(workspaceId.value, id, dto)
    showEditModal.value = false
  }

  function confirmDelete() {
    showDeleteModal.value = true
  }

  async function doDelete() {
    if (!project.value || !workspaceId.value) return
    await projectService.delete(workspaceId.value, project.value.id)
    showDeleteModal.value = false
    router.push({ name: 'ProjectsList' })
  }
</script>
