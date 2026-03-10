<template>
  <BasePageLayout :title="company ? company.name : 'Компания'">
    <template #header-title>
      <router-link
        :to="{ name: 'CrmCompanies' }"
        class="inline-flex items-center gap-(--spacing-1) text-(--text-sm) text-text-secondary hover:text-primary-default mb-(--spacing-2)"
      >
        <ArrowLeftIcon class="size-4" />
        К списку компаний
      </router-link>
      <div v-if="company" class="flex flex-wrap items-start gap-(--spacing-4)">
        <div
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary-default/10 text-primary-default text-(--text-xl) font-semibold"
        >
          {{ initials }}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-text-primary text-(--text-xl) font-semibold">
            {{ company.name }}
          </h1>
          <p v-if="company.inn" class="text-text-secondary text-(--text-sm) mt-(--spacing-0-5)">
            ИНН {{ company.inn }}
          </p>
          <div class="flex flex-wrap gap-(--spacing-2) mt-(--spacing-3)">
            <PermissionGuard :permission="CRM_PERMISSIONS.companyUpdate">
              <Button size="md" variant="outline" @click="openEdit">Редактировать</Button>
            </PermissionGuard>
            <PermissionGuard :permission="CRM_PERMISSIONS.companyDelete">
              <Button size="md" variant="ghost" @click="confirmDeleteCompany">Удалить</Button>
            </PermissionGuard>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div v-if="isLoading" class="flex justify-center py-12">
        <Spinner class="size-8 text-primary-default" />
      </div>
      <template v-else-if="company">
        <DetailTabsPanel
          v-model="activeTab"
          :tabs="tabs"
          :tab-components="tabComponents"
          :tab-props="tabProps"
        />
      </template>
      <div v-else class="text-center py-12 text-text-muted">Компания не найдена.</div>
    </template>

    <template #modals>
      <CompanyFormModal
        :is-open="showFormModal"
        :company="company ?? null"
        @close="handleFormClose"
        @update="handleUpdate"
      />
      <Modal :is-open="showAttachContactModal" @close="closeAttachContactModal">
        <CompanyAttachContactForm
          :workspace-id="workspaceId"
          :is-open="showAttachContactModal"
          @close="closeAttachContactModal"
          @confirm="confirmAttachContact"
        />
      </Modal>
      <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
        <ConfirmModal
          title="Удалить компанию?"
          message="Компания будет удалена без возможности восстановления."
          confirm-text="Удалить"
          confirm-variant="danger"
          @close="showDeleteModal = false"
          @confirm="doDelete"
        />
      </Modal>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Button, Spinner, DetailTabsPanel } from '@/shared/ui'
  import { ArrowLeftIcon } from '@/shared/ui/icon'
  import { BasePageLayout } from '@/shared/ui/common'
  import {
    CompanyFormModal,
    CompanyAttachContactForm,
    CompanyMainInfo,
    CompanyContactsSection,
    CompanyDealsSection,
    useCompanyDetail,
  } from '@/features/companies'
  import { ActivityFeed } from '@/features/activity'
  import { ProjectEntityPanel } from '@/features/projects'
  import { companyService } from '@/entities/company'
  import { usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS, PROJECT_PERMISSIONS } from '@/features/permissions/config'
  import { PermissionGuard } from '@/features/permissions'
  import type { CreateCompanyDto } from '@/entities/company'
  import type { Deal } from '@/entities/deal'

  const router = useRouter()
  const { can } = usePermissions()

  const {
    workspaceId,
    companyId,
    company,
    companyContacts,
    companyDeals,
    companyDealsLoading,
    isLoading,
    fetchCompany,
    fetchCompanyContacts,
  } = useCompanyDetail()

  const activeTab = ref('main')
  const showFormModal = ref(false)
  const showDeleteModal = ref(false)
  const showAttachContactModal = ref(false)

  const allTabs = [
    { id: 'main', label: 'Основная информация' },
    { id: 'contacts', label: 'Контакты' },
    { id: 'deals', label: 'Сделки' },
    { id: 'activity', label: 'Активность' },
    { id: 'projects', label: 'Проекты' },
  ]
  const tabs = computed(() =>
    allTabs.filter((t) => {
      if (t.id === 'activity') return can(CRM_PERMISSIONS.activityRead)
      if (t.id === 'projects') return can(PROJECT_PERMISSIONS.projectRead)
      return true
    }),
  )

  watch(
    tabs,
    (next) => {
      const ids = next.map((t) => t.id)
      if (!ids.includes(activeTab.value)) {
        activeTab.value = ids[0] ?? 'main'
      }
    },
    { immediate: true },
  )

  const tabComponents = {
    main: CompanyMainInfo,
    contacts: CompanyContactsSection,
    deals: CompanyDealsSection,
    activity: ActivityFeed,
    projects: ProjectEntityPanel,
  }

  const tabProps = computed(() => ({
    main: { company: company.value! },
    contacts: {
      contacts: companyContacts.value,
      onAttachContact: openAttachContact,
      onCreateContact: openCreateContact,
    },
    deals: {
      deals: companyDeals.value,
      loading: companyDealsLoading.value,
      dealsSum: companyDealsSum.value,
    },
    activity: {
      entityType: 'company' as const,
      entityId: companyId.value,
      canCreate: can(CRM_PERMISSIONS.activityCreate),
      canEdit: can(CRM_PERMISSIONS.activityUpdate),
      canDelete: can(CRM_PERMISSIONS.activityDelete),
    },
    projects: {
      workspaceId: workspaceId.value,
      entityType: 'crm_company',
      entityId: companyId.value,
      entityName: company.value?.name,
      canEdit: can(PROJECT_PERMISSIONS.entityAttach),
      projectsBasePath: '/projects',
    },
  }))

  const companyDealsSum = computed(() =>
    companyDeals.value.reduce((acc: number, d: Deal) => acc + (d.budget ?? 0), 0),
  )

  const initials = computed(() => {
    if (!company.value?.name) return '?'
    return company.value.name.slice(0, 2).toUpperCase()
  })

  function openEdit() {
    showFormModal.value = true
  }

  function handleFormClose() {
    showFormModal.value = false
    fetchCompany()
  }

  function openAttachContact() {
    showAttachContactModal.value = true
  }

  function closeAttachContactModal() {
    showAttachContactModal.value = false
  }

  async function confirmAttachContact(contactId: string) {
    if (!workspaceId.value || !companyId.value) return
    await companyService.attachContact(workspaceId.value, companyId.value, contactId)
    showAttachContactModal.value = false
    await fetchCompany()
    await fetchCompanyContacts()
  }

  function openCreateContact() {
    router.push({ path: '/crm/contacts', query: { create: '1', companyId: companyId.value } })
  }

  function confirmDeleteCompany() {
    showDeleteModal.value = true
  }

  async function doDelete() {
    if (!company.value || !workspaceId.value) return
    await companyService.delete(workspaceId.value, company.value.id)
    showDeleteModal.value = false
    router.push({ name: 'CrmCompanies' })
  }

  async function handleUpdate(id: string, data: CreateCompanyDto) {
    if (!workspaceId.value) return
    await companyService.update(workspaceId.value, id, data)
    showFormModal.value = false
    await fetchCompany()
  }
</script>
