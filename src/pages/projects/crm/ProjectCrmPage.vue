<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-8">
    <nav class="flex items-center gap-2 text-sm text-text-secondary">
      <router-link :to="{ name: 'ProjectsList' }" class="hover:text-primary-default"
        >Проекты</router-link
      >
      <span class="text-text-muted">/</span>
      <router-link
        v-if="project"
        :to="{ name: 'ProjectDetail', params: { id: projectId } }"
        class="font-medium text-text-primary hover:text-primary-default"
      >
        Проект: {{ project.name }}
      </router-link>
      <span class="flex items-center gap-2">
        <span class="text-text-muted">/</span>
        <span class="text-text-primary">CRM</span>
      </span>
    </nav>

    <div v-if="isLoading" class="flex justify-center py-12">
      <Spinner class="size-8 text-primary-default" />
    </div>

    <template v-else-if="project">
      <nav class="flex border-b border-border-default mb-4">
        <button
          v-for="section in crmSections"
          :key="section.id"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
            crmSection === section.id
              ? 'border-primary-default text-primary-default'
              : 'border-transparent text-text-secondary hover:text-text-primary',
          ]"
          @click="crmSection = section.id"
        >
          {{ section.label }} ({{ section.count }})
        </button>
      </nav>

      <template v-if="crmSection === 'contacts'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 class="text-sm font-medium text-text-secondary">Контакты в проекте</h3>
          <div class="flex items-center gap-2">
            <input
              v-model="contactsSearch"
              type="search"
              placeholder="Поиск по имени..."
              class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary-default"
            />
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityAttach">
              <Button size="md" variant="primary" @click="openAddModal('crm_contact')"
                >Добавить контакты</Button
              >
            </PermissionGuard>
          </div>
        </div>
        <div v-if="contactsLoading" class="text-text-muted text-sm py-4">Загрузка…</div>
        <div
          v-else-if="filteredContacts.length === 0"
          class="rounded-lg border border-border-light border-dashed p-6 text-center text-text-muted text-sm"
        >
          {{ contactsSearch ? 'Ничего не найдено.' : 'В этом проекте пока нет контактов.' }}
          <PermissionGuard v-if="!contactsSearch" :permission="PROJECT_PERMISSIONS.entityAttach">
            <Button size="md" variant="primary" class="mt-2" @click="openAddModal('crm_contact')">
              Добавить контакты
            </Button>
          </PermissionGuard>
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="c in filteredContacts"
            :key="c.id"
            class="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-border-light"
          >
            <router-link
              :to="{ name: 'CrmContactDetail', params: { id: c.id } }"
              class="text-primary-default hover:underline truncate"
            >
              {{ contactLabel(c) }}
            </router-link>
            <span class="text-xs text-text-muted shrink-0">{{
              c.emails?.[0]?.address ?? c.phones?.[0]?.number ?? '—'
            }}</span>
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityDetach">
              <button
                type="button"
                class="p-1.5 rounded text-text-muted hover:bg-bg-tertiary hover:text-danger-default"
                title="Удалить из проекта"
                @click="confirmDetach('crm_contact', c.id, contactLabel(c))"
              >
                <XMarkIcon class="size-4" />
              </button>
            </PermissionGuard>
          </li>
        </ul>
      </template>

      <template v-else-if="crmSection === 'companies'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 class="text-sm font-medium text-text-secondary">Компании в проекте</h3>
          <div class="flex items-center gap-2">
            <input
              v-model="companiesSearch"
              type="search"
              placeholder="Поиск по названию..."
              class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary-default"
            />
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityAttach">
              <Button size="md" variant="primary" @click="openAddModal('crm_company')"
                >Добавить компании</Button
              >
            </PermissionGuard>
          </div>
        </div>
        <div v-if="companiesLoading" class="text-text-muted text-sm py-4">Загрузка…</div>
        <div
          v-else-if="filteredCompanies.length === 0"
          class="rounded-lg border border-border-light border-dashed p-6 text-center text-text-muted text-sm"
        >
          {{ companiesSearch ? 'Ничего не найдено.' : 'В этом проекте пока нет компаний.' }}
          <PermissionGuard v-if="!companiesSearch" :permission="PROJECT_PERMISSIONS.entityAttach">
            <Button size="md" variant="primary" class="mt-2" @click="openAddModal('crm_company')">
              Добавить компании
            </Button>
          </PermissionGuard>
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="c in filteredCompanies"
            :key="c.id"
            class="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-border-light"
          >
            <router-link
              :to="{ name: 'CrmCompanyDetail', params: { id: c.id } }"
              class="text-primary-default hover:underline truncate"
            >
              {{ c.name }}
            </router-link>
            <span class="text-xs text-text-muted shrink-0">{{ c.inn ?? '—' }}</span>
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityDetach">
              <button
                type="button"
                class="p-1.5 rounded text-text-muted hover:bg-bg-tertiary hover:text-danger-default"
                title="Удалить из проекта"
                @click="confirmDetach('crm_company', c.id, c.name)"
              >
                <XMarkIcon class="size-4" />
              </button>
            </PermissionGuard>
          </li>
        </ul>
      </template>

      <template v-else-if="crmSection === 'deals'">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 class="text-sm font-medium text-text-secondary">Сделки в проекте</h3>
          <div class="flex flex-wrap items-center gap-2">
            <template v-if="pipelines.length > 1">
              <label class="text-sm text-text-muted">Воронка:</label>
              <select
                :value="selectedPipelineId"
                class="px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm min-w-[160px]"
                @change="onPipelineSelect($event)"
              >
                <option v-for="p in pipelines" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </template>
            <PermissionGuard :permission="CRM_PERMISSIONS.dealCreate">
              <Button size="md" variant="primary" @click="openCreateDealModal"
                >Создать сделку</Button
              >
            </PermissionGuard>
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityAttach">
              <Button size="md" variant="outline" @click="openAddModal('crm_deal')"
                >Добавить сделки</Button
              >
            </PermissionGuard>
          </div>
        </div>
        <div v-if="dealsLoading && pipelines.length === 0" class="text-text-muted text-sm py-4">
          Загрузка…
        </div>
        <div v-else-if="pipelines.length === 0" class="text-text-muted text-sm py-4">
          Нет воронок. Создайте воронку в CRM.
        </div>
        <div
          v-else-if="deals.length === 0"
          class="rounded-lg border border-border-light border-dashed p-6 text-center text-text-muted text-sm"
        >
          В этом проекте пока нет сделок.
          <div class="flex gap-2 justify-center mt-2">
            <PermissionGuard :permission="CRM_PERMISSIONS.dealCreate">
              <Button size="md" variant="primary" @click="openCreateDealModal"
                >Создать сделку</Button
              >
            </PermissionGuard>
            <PermissionGuard :permission="PROJECT_PERMISSIONS.entityAttach">
              <Button size="md" variant="outline" @click="openAddModal('crm_deal')"
                >Добавить сделки</Button
              >
            </PermissionGuard>
          </div>
        </div>
        <DealsKanbanView
          v-else
          :key="selectedPipelineId"
          :columns="kanbanColumns"
          @update:columns="onKanbanColumnsUpdate"
          :pipelines="pipelines"
          :is-loading="dealsLoading"
          :is-error="false"
          :saving-deal-ids="savingDealIds"
          show-remove-from-project
          :can-remove-from-project="canRemoveFromProject"
          @move="handleDealMove"
          @open-deal="openDealCard"
          @edit="openEditDealModal"
          @copy="openEditDealModal"
          @delete="confirmDeleteDeal"
          @remove-from-project="onRemoveDealFromProject"
        />
      </template>
    </template>

    <div v-else class="text-center py-12 text-text-muted">Проект не найден.</div>

    <AddEntitiesToProjectModal
      :is-open="showAddModal"
      :entity-type="addModalEntityType"
      :workspace-id="workspaceId"
      :project-id="projectId"
      :already-attached-ids="addModalAlreadyIds"
      @close="showAddModal = false"
      @add="handleAddEntities"
    />
    <Modal
      :is-open="showDealFormModal"
      :fullscreen-on-mobile="isMobile"
      content-class="lg:max-w-[min(52rem,calc(100vw-2rem))]"
      @close="closeDealFormModal"
    >
      <DealFormModal
        v-if="showDealFormModal"
        :is-open="true"
        :deal="dealToEdit"
        :pipelines="pipelines"
        :pipeline-id="selectedPipelineId"
        :default-stage-id="defaultStageId"
        :workspace-id="workspaceId"
        :default-owner-id="defaultOwnerId"
        @close="closeDealFormModal"
        @save="handleDealFormSave"
        @update="handleDealFormUpdate"
      />
    </Modal>
    <Modal :is-open="showDeleteDealModal" @close="showDeleteDealModal = false">
      <ConfirmModal
        title="Удалить сделку?"
        message="Сделка будет удалена без возможности восстановления."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteDealModal = false"
        @confirm="doDeleteDeal"
      />
    </Modal>
    <Modal :is-open="!!detachTarget" @close="detachTarget = null">
      <ConfirmModal
        :title="`Удалить ${detachTarget?.name ?? 'сущность'} из проекта?`"
        message="Сущность останется в CRM, из проекта будет отвязана."
        confirm-text="Удалить из проекта"
        confirm-variant="danger"
        @close="detachTarget = null"
        @confirm="doDetach"
      />
    </Modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Button, Spinner, Modal, ConfirmModal } from '@/shared/ui'
  import { XMarkIcon } from '@/shared/ui/icon'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS, PROJECT_PERMISSIONS } from '@/features/permissions/config'
  import { AddEntitiesToProjectModal } from '@/features/projects'
  import { DealsKanbanView, DealFormModal } from '@/features/deals'
  import { projectService } from '@/entities/project'
  import { contactService } from '@/entities/contact'
  import { companyService } from '@/entities/company'
  import { dealService } from '@/entities/deal'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useUserStore } from '@/entities/user'
  import type { Project, ProjectEntityType } from '@/entities/project'
  import type { Contact } from '@/entities/contact'
  import type { Company } from '@/entities/company'
  import type { Deal, Pipeline, CreateDealDto } from '@/entities/deal'
  import type { KanbanColumnModel } from '@/shared/ui'

  const FALLBACK_STAGE_ID = '__no_stage__'

  const route = useRoute()
  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const userStore = useUserStore()
  const { can } = usePermissions()

  const canRemoveFromProject = computed(() => can(PROJECT_PERMISSIONS.entityDetach))

  const workspaceId = computed(() => workspaceStore.currentWorkspace?.id ?? '')
  const projectId = computed(() => route.params.id as string)
  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '')

  const project = ref<Project | null>(null)
  const isLoading = ref(true)
  const crmSection = ref<'contacts' | 'companies' | 'deals'>('contacts')
  const contactsSearch = ref('')
  const companiesSearch = ref('')

  const contacts = ref<Contact[]>([])
  const companies = ref<Company[]>([])
  const deals = ref<Deal[]>([])
  const pipelines = ref<Pipeline[]>([])
  const contactsLoading = ref(false)
  const companiesLoading = ref(false)
  const dealsLoading = ref(false)
  const showAddModal = ref(false)
  const addModalEntityType = ref<ProjectEntityType>('crm_contact')
  const showDeleteDealModal = ref(false)
  const dealToDelete = ref<Deal | null>(null)
  const detachTarget = ref<{ type: ProjectEntityType; id: string; name: string } | null>(null)
  const savingDealIds = ref<Set<string>>(new Set())
  const showDealFormModal = ref(false)
  const dealToEdit = ref<Deal | null>(null)
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

  const crmSections = computed(() => [
    { id: 'contacts' as const, label: 'Контакты', count: contacts.value.length },
    { id: 'companies' as const, label: 'Компании', count: companies.value.length },
    { id: 'deals' as const, label: 'Сделки', count: deals.value.length },
  ])

  const filteredContacts = computed(() => {
    const q = contactsSearch.value.trim().toLowerCase()
    if (!q) return contacts.value
    return contacts.value.filter((c) => {
      const name = [c.firstName, c.lastName].filter(Boolean).join(' ').toLowerCase()
      const email = c.emails?.[0]?.address?.toLowerCase() ?? ''
      return name.includes(q) || email.includes(q)
    })
  })

  const filteredCompanies = computed(() => {
    const q = companiesSearch.value.trim().toLowerCase()
    if (!q) return companies.value
    return companies.value.filter(
      (c) => (c.name ?? '').toLowerCase().includes(q) || (c.inn ?? '').includes(q),
    )
  })

  const selectedPipelineId = ref('')
  const selectedPipeline = computed(
    () =>
      pipelines.value.find((p) => p.id === selectedPipelineId.value) ??
      pipelines.value.find((p) => p.isDefault) ??
      pipelines.value[0],
  )
  const defaultStageId = computed(() => selectedPipeline.value?.stages?.[0]?.id ?? '')

  const kanbanColumns = ref<KanbanColumnModel<Deal>[]>([])

  function buildKanbanColumns(): KanbanColumnModel<Deal>[] {
    const uniqueDeals: Deal[] = []
    const seenIds = new Set<string>()

    for (const d of deals.value) {
      if (seenIds.has(d.id)) continue
      seenIds.add(d.id)
      uniqueDeals.push(d)
    }

    const pipeline = selectedPipeline.value
    const pipelineId = pipeline?.id
    const dealsInOtherPipelines = pipelineId
      ? uniqueDeals.filter((d) => d.pipelineId !== pipelineId)
      : uniqueDeals

    if (!pipeline?.stages?.length) {
      if (uniqueDeals.length === 0) return []
      return [
        {
          id: FALLBACK_STAGE_ID,
          title: 'Сделки',
          items: [...uniqueDeals],
          meta: {
            sum: uniqueDeals.reduce((acc, d) => acc + (d.budget ?? 0), 0),
            count: uniqueDeals.length,
          },
        },
      ]
    }

    const sortedStages = [...pipeline.stages].sort((a, b) => a.order - b.order)
    const columns: KanbanColumnModel<Deal>[] = sortedStages.map((stage) => {
      const stageDeals = uniqueDeals.filter((d) => d.stageId === stage.id)
      const sum = stageDeals.reduce((acc, d) => acc + (d.budget ?? 0), 0)
      return {
        id: stage.id,
        title: stage.name,
        color: stage.color,
        items: [...stageDeals],
        meta: { sum, count: stageDeals.length },
      }
    })

    if (dealsInOtherPipelines.length > 0) {
      const sum = dealsInOtherPipelines.reduce((acc, d) => acc + (d.budget ?? 0), 0)
      columns.push({
        id: FALLBACK_STAGE_ID,
        title: 'Другие воронки',
        items: [...dealsInOtherPipelines],
        meta: { sum, count: dealsInOtherPipelines.length },
      })
    }
    return columns
  }

  watch(
    [deals, selectedPipeline],
    () => {
      kanbanColumns.value = buildKanbanColumns()
    },
    { immediate: true },
  )

  const addModalAlreadyIds = computed(() => {
    if (addModalEntityType.value === 'crm_contact') return contacts.value.map((c) => c.id)
    if (addModalEntityType.value === 'crm_company') return companies.value.map((c) => c.id)
    return deals.value.map((d) => d.id)
  })

  function contactLabel(c: Contact) {
    return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.emails?.[0]?.address || c.id
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

  async function fetchPipelines() {
    if (!workspaceId.value) return
    try {
      pipelines.value = await dealService.getPipelines(workspaceId.value)
    } catch {
      pipelines.value = []
    }
  }

  async function fetchContacts() {
    if (!workspaceId.value || !projectId.value) return
    contactsLoading.value = true
    try {
      const ids = await projectService.listEntityIds(
        workspaceId.value,
        projectId.value,
        'crm_contact',
      )
      contacts.value = ids.length
        ? await Promise.all(ids.map((id) => contactService.getById(workspaceId.value, id)))
        : []
    } catch {
      contacts.value = []
    } finally {
      contactsLoading.value = false
    }
  }

  async function fetchCompanies() {
    if (!workspaceId.value || !projectId.value) return
    companiesLoading.value = true
    try {
      const ids = await projectService.listEntityIds(
        workspaceId.value,
        projectId.value,
        'crm_company',
      )
      companies.value = ids.length
        ? await Promise.all(ids.map((id) => companyService.getById(workspaceId.value, id)))
        : []
    } catch {
      companies.value = []
    } finally {
      companiesLoading.value = false
    }
  }

  async function fetchDeals() {
    if (!workspaceId.value || !projectId.value) return
    dealsLoading.value = true
    try {
      const ids = await projectService.listEntityIds(workspaceId.value, projectId.value, 'crm_deal')
      deals.value = ids.length
        ? await Promise.all(ids.map((id) => dealService.getById(workspaceId.value, id)))
        : []
    } catch {
      deals.value = []
    } finally {
      dealsLoading.value = false
    }
  }

  function refetchAll() {
    fetchContacts()
    fetchCompanies()
    fetchDeals()
  }

  watch([workspaceId, projectId], fetchProject, { immediate: true })
  watch(
    project,
    async (p) => {
      if (p) {
        await fetchPipelines()
        if (!selectedPipelineId.value && pipelines.value.length > 0) {
          const def = pipelines.value.find((pl) => pl.isDefault) ?? pipelines.value[0]
          selectedPipelineId.value = def.id
        }
        fetchContacts()
        fetchCompanies()
        await fetchDeals()
        if (deals.value.length > 0 && pipelines.value.length > 1) {
          const byPipeline = new Map<string, number>()
          for (const d of deals.value) {
            if (d.pipelineId) byPipeline.set(d.pipelineId, (byPipeline.get(d.pipelineId) ?? 0) + 1)
          }
          let bestId = ''
          let bestCount = 0
          for (const [id, count] of byPipeline) {
            if (count > bestCount) {
              bestCount = count
              bestId = id
            }
          }
          if (bestId) selectedPipelineId.value = bestId
        }
      } else {
        contacts.value = []
        companies.value = []
        deals.value = []
        pipelines.value = []
        selectedPipelineId.value = ''
      }
    },
    { immediate: true },
  )

  function onPipelineSelect(evt: Event) {
    const v = (evt.target as HTMLSelectElement)?.value
    if (v) selectedPipelineId.value = v
  }

  function onKanbanColumnsUpdate(_v: KanbanColumnModel<Deal>[]) {
    // no-op: колонки только из watch(deals) и handleDealMove, чтобы не было дублей при двух эмитах DnD
  }

  async function handleDealMove(payload: { item: unknown; toColumnId?: string }) {
    const deal = payload.item as Deal
    const toId = payload.toColumnId
    const targetPipelineId = selectedPipeline.value?.id

    if (!toId || !deal?.id || !workspaceId.value || toId === FALLBACK_STAGE_ID || !targetPipelineId)
      return

    savingDealIds.value = new Set(savingDealIds.value).add(deal.id)

    const prevDeals = deals.value.map((d) => ({ ...d }))

    deals.value = deals.value.map((d) =>
      d.id === deal.id ? { ...d, stageId: toId, pipelineId: targetPipelineId } : d,
    )
    kanbanColumns.value = buildKanbanColumns()

    try {
      await dealService.update(workspaceId.value, deal.id, {
        stageId: toId,
        pipelineId: targetPipelineId,
      })
    } catch {
      deals.value = prevDeals
      kanbanColumns.value = buildKanbanColumns()
    } finally {
      const next = new Set(savingDealIds.value)
      next.delete(deal.id)
      savingDealIds.value = next
    }
  }

  function openDealCard(deal: Deal) {
    router.push({ name: 'CrmDealDetail', params: { id: deal.id } })
  }

  function onRemoveDealFromProject(deal: Deal) {
    confirmDetach('crm_deal', deal.id, deal.name)
  }

  function openCreateDealModal() {
    dealToEdit.value = null
    showDealFormModal.value = true
  }

  function openEditDealModal(deal: Deal) {
    dealToEdit.value = deal
    showDealFormModal.value = true
  }

  function closeDealFormModal() {
    showDealFormModal.value = false
    dealToEdit.value = null
  }

  async function handleDealFormSave(data: CreateDealDto) {
    if (!workspaceId.value || !projectId.value) return
    const created = await dealService.create(workspaceId.value, data)
    await projectService.attachEntity(workspaceId.value, projectId.value, {
      entityType: 'crm_deal',
      entityId: created.id,
    })
    closeDealFormModal()
    await fetchDeals()
  }

  async function handleDealFormUpdate(id: string, data: CreateDealDto) {
    if (!workspaceId.value) return
    await dealService.update(workspaceId.value, id, data)
    closeDealFormModal()
    await fetchDeals()
  }

  function confirmDeleteDeal(deal: Deal) {
    dealToDelete.value = deal
    showDeleteDealModal.value = true
  }

  async function doDeleteDeal() {
    if (!dealToDelete.value || !workspaceId.value) return
    await dealService.delete(workspaceId.value, dealToDelete.value.id)
    dealToDelete.value = null
    showDeleteDealModal.value = false
    await fetchDeals()
  }

  function openAddModal(type: ProjectEntityType) {
    addModalEntityType.value = type
    showAddModal.value = true
  }

  async function handleAddEntities(entityIds: string[]) {
    if (!workspaceId.value || !projectId.value) return
    for (const entityId of entityIds) {
      await projectService.attachEntity(workspaceId.value, projectId.value, {
        entityType: addModalEntityType.value,
        entityId,
      })
    }
    showAddModal.value = false
    refetchAll()
  }

  function confirmDetach(type: ProjectEntityType, id: string, name: string) {
    detachTarget.value = { type, id, name }
  }

  async function doDetach() {
    if (!detachTarget.value || !workspaceId.value || !projectId.value) return
    await projectService.detachEntity(
      workspaceId.value,
      projectId.value,
      detachTarget.value.type,
      detachTarget.value.id,
    )
    detachTarget.value = null
    refetchAll()
  }
</script>
