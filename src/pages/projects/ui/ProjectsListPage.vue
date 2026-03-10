<template>
  <BasePageLayout title="Проекты">
    <template #header-actions>
      <PermissionGuard :permission="PROJECT_PERMISSIONS.projectCreate">
        <Button variant="primary" class="w-full sm:w-auto" @click="openCreate">
          <PlusIcon class="size-4 mr-2 inline" />
          Создать проект
        </Button>
      </PermissionGuard>
    </template>

    <template #content>
      <div v-if="searchVisible" class="flex gap-(--spacing-2)">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Поиск по названию..."
          class="flex-1 px-(--spacing-3) py-(--spacing-2) border border-border-default rounded-(--radius-lg) bg-bg-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-default"
        />
      </div>

      <div v-if="isLoading" class="flex justify-center py-(--spacing-12)">
        <Spinner class="size-8 text-primary-default" />
      </div>

      <div
        v-else-if="filteredProjects.length === 0"
        class="rounded-(--radius-xl) border border-border-default border-dashed bg-bg-tertiary/50 p-(--spacing-8) text-center"
      >
        <p class="text-text-muted mb-(--spacing-4)">
          {{
            searchQuery
              ? 'По запросу проектов не найдено.'
              : 'У вас пока нет проектов. Создайте первый проект, чтобы группировать контакты, компании и сделки CRM.'
          }}
        </p>
        <PermissionGuard v-if="!searchQuery" :permission="PROJECT_PERMISSIONS.projectCreate">
          <Button variant="primary" @click="openCreate"> Создать проект </Button>
        </PermissionGuard>
      </div>

      <ul v-else class="space-y-(--spacing-3)">
        <li
          v-for="project in filteredProjects"
          :key="project.id"
          class="rounded-(--radius-xl) border border-border-default bg-bg-primary p-(--spacing-4) hover:border-primary-default/50 transition-colors"
        >
          <router-link :to="projectLink(project.id)" class="block">
            <div class="flex items-start justify-between gap-(--spacing-4)">
              <div class="min-w-0 flex-1">
                <h2 class="font-medium text-text-primary">{{ project.name }}</h2>
                <p
                  v-if="project.description"
                  class="text-(--text-sm) text-text-muted mt-(--spacing-1) line-clamp-2"
                >
                  {{ project.description }}
                </p>
                <p class="text-(--text-xs) text-text-muted mt-(--spacing-2)">
                  {{ formatDate(project.updatedAt) }}
                </p>
                <div
                  class="flex flex-wrap gap-(--spacing-3) mt-(--spacing-2) text-(--text-xs) text-text-secondary"
                >
                  <span>Контакты: {{ getCount(project.id, 'contacts') }}</span>
                  <span>Компании: {{ getCount(project.id, 'companies') }}</span>
                  <span>Сделки: {{ getCount(project.id, 'deals') }}</span>
                </div>
              </div>
              <div class="flex items-center gap-(--spacing-1) shrink-0" @click.prevent>
                <PermissionGuard :permission="PROJECT_PERMISSIONS.projectUpdate">
                  <Button
                    size="md"
                    variant="ghost"
                    title="Редактировать"
                    @click="openEdit(project)"
                  >
                    Редактировать
                  </Button>
                </PermissionGuard>
                <PermissionGuard :permission="PROJECT_PERMISSIONS.projectDelete">
                  <Button
                    size="md"
                    variant="ghost"
                    class="text-danger-default hover:bg-danger-light"
                    title="Удалить"
                    @click.prevent="confirmDelete(project)"
                  >
                    Удалить
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </router-link>
        </li>
      </ul>
    </template>

    <template #modals>
      <ProjectFormModal
        :is-open="showFormModal"
        :project="projectToEdit"
        @close="handleFormClose"
        @create="handleCreate"
        @update="handleUpdate"
      />

      <Modal :is-open="!!projectToDelete" @close="projectToDelete = null">
        <ConfirmModal
          title="Удалить проект?"
          message="Связи с контактами, компаниями и сделками будут удалены. Сами сущности CRM не удаляются."
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="projectToDelete = null"
          @confirm="doDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button, Spinner, Modal, ConfirmModal } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { PROJECT_PERMISSIONS } from '@/features/permissions/config'
  import { ProjectFormModal } from '@/features/projects'
  import { projectService } from '@/entities/project'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { formatDateDisplay } from '@/shared/lib/date'
  import type { Project } from '@/entities/project'

  const router = useRouter()
  const workspaceStore = useWorkspaceStore()

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const projects = ref<Project[]>([])
  const counts = ref<Record<string, { contacts: number; companies: number; deals: number }>>({})
  const isLoading = ref(true)
  const searchQuery = ref('')
  const searchVisible = ref(true)
  const showFormModal = ref(false)
  const projectToEdit = ref<Project | null>(null)
  const projectToDelete = ref<Project | null>(null)

  const filteredProjects = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return projects.value
    return projects.value.filter((p) => p.name.toLowerCase().includes(q))
  })

  function formatDate(iso: string) {
    return formatDateDisplay(iso)
  }

  function getCount(projectId: string, key: 'contacts' | 'companies' | 'deals') {
    return counts.value[projectId]?.[key] ?? 0
  }

  function projectLink(id: string) {
    return { name: 'ProjectDetail', params: { id } }
  }

  async function fetchProjects() {
    if (!workspaceId.value) return
    isLoading.value = true
    try {
      projects.value = await projectService.getList(workspaceId.value)
      const next: Record<string, { contacts: number; companies: number; deals: number }> = {}
      await Promise.all(
        projects.value.map(async (p) => {
          const [contactIds, companyIds, dealIds] = await Promise.all([
            projectService.listEntityIds(workspaceId.value, p.id, 'crm_contact'),
            projectService.listEntityIds(workspaceId.value, p.id, 'crm_company'),
            projectService.listEntityIds(workspaceId.value, p.id, 'crm_deal'),
          ])
          next[p.id] = {
            contacts: contactIds.length,
            companies: companyIds.length,
            deals: dealIds.length,
          }
        }),
      )
      counts.value = next
    } catch {
      projects.value = []
    } finally {
      isLoading.value = false
    }
  }

  watch(workspaceId, fetchProjects, { immediate: true })

  function openCreate() {
    projectToEdit.value = null
    showFormModal.value = true
  }

  function openEdit(project: Project) {
    projectToEdit.value = project
    showFormModal.value = true
  }

  async function handleCreate(dto: { name: string; description?: string | null }) {
    if (!workspaceId.value) return
    const created = await projectService.create(workspaceId.value, dto)
    showFormModal.value = false
    await fetchProjects()
    router.push(projectLink(created.id))
  }

  async function handleUpdate(id: string, dto: { name?: string; description?: string | null }) {
    if (!workspaceId.value) return
    await projectService.update(workspaceId.value, id, dto)
    showFormModal.value = false
    projectToEdit.value = null
    await fetchProjects()
  }

  function handleFormClose() {
    showFormModal.value = false
    projectToEdit.value = null
  }

  function confirmDelete(project: Project) {
    projectToDelete.value = project
  }

  async function doDelete() {
    if (!projectToDelete.value || !workspaceId.value) return
    await projectService.delete(workspaceId.value, projectToDelete.value.id)
    projectToDelete.value = null
    await fetchProjects()
  }
</script>
