<template>
  <BasePageLayout
    title="CRM — Сделки"
    description="Управляйте сделками. Канбан или табличный вид."
    :error-message="errorMessage"
  >
    <template #content>
      <div class="space-y-6">
        <DealsToolbar
          :pipelines="pipelines"
          :view-mode="viewMode"
          :selected-pipeline-id="selectedPipelineId"
          :date-from="dateFrom"
          :date-to="dateTo"
          :status="statusFilter"
          @create="openCreateModal"
          @update:view-mode="viewMode = $event"
          @update:selected-pipeline-id="selectedPipelineId = $event"
          @update:date-from="dateFrom = $event"
          @update:date-to="dateTo = $event"
          @update:status="statusFilter = $event"
        />

        <DealsKanbanView
          v-if="viewMode === 'kanban'"
          :columns="kanbanColumns"
          @update:columns="setKanbanColumnsFromBoard"
          :pipelines="pipelines"
          :is-loading="isLoading"
          :is-error="isError"
          :saving-deal-ids="savingDealIds"
          @move="handleDealMove"
          @open-deal="openDealCard"
          @edit="openEditModal"
          @copy="openEditModal"
          @delete="confirmDelete"
        />

        <DealsTableWidget
          v-else
          :deals="deals"
          :pipelines="pipelines"
          :total="total"
          :is-loading="isLoading"
          :is-error="isError"
          :page="page"
          :page-size="pageSize"
          :sort-by="sortBy"
          :sort-order="sortOrder"
          :selected-ids="selectedIds"
          :handle-sort="handleSort"
          :handle-row-select="handleRowSelect"
          :handle-select-all="handleSelectAll"
          :set-page="setPage"
          :fetch-deals="fetchDeals"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>
    </template>

    <template #modals>
      <DealFormModal
        :is-open="showFormModal"
        :deal="dealToEdit"
        :pipelines="pipelines"
        :pipeline-id="selectedPipelineId"
        :default-stage-id="defaultStageId"
        :workspace-id="workspaceId"
        :default-owner-id="defaultOwnerId"
        :preselected-contact="preselectedContactForDeal"
        @close="closeFormModal"
        @save="handleCreate"
        @update="handleUpdate"
        @create-contact="openCreateContactFromDeal"
        @preselected-applied="preselectedContactForDeal = null"
      />

      <ContactFormModal
        :is-open="showContactModal"
        :contact="null"
        :workspace-id="workspaceId"
        :default-owner-id="defaultOwnerId"
        :preselected-company="preselectedCompanyForContact"
        @close="closeContactModal"
        @save="onContactCreatedFromDeal"
        @create-company="openCreateCompanyFromContact"
        @preselected-company-applied="preselectedCompanyForContact = null"
      />

      <CompanyFormModal
        :is-open="showCompanyModal"
        :company="null"
        @close="showCompanyModal = false"
        @save="onCompanyCreatedFromContact"
      />

      <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
        <ConfirmModal
          title="Удалить сделку?"
          message="Сделка будет удалена без возможности восстановления."
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
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Modal, ConfirmModal } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import {
    useDealsPage,
    DealsToolbar,
    DealsTableWidget,
    DealsKanbanView,
    DealFormModal,
  } from '@/features/deals'
  import { ContactFormModal } from '@/features/contacts'
  import { CompanyFormModal } from '@/features/companies'
  import { contactService } from '@/entities/contact'
  import { companyService } from '@/entities/company'
  import type { Deal, CreateDealDto } from '@/entities/deal'
  import type { Contact, CreateContactDto } from '@/entities/contact'
  import type { Company, CreateCompanyDto } from '@/entities/company'

  const router = useRouter()
  const userStore = useUserStore()
  const {
    workspaceId,
    pipelines,
    deals,
    total,
    isLoading,
    isError,
    viewMode,
    selectedPipelineId,
    dateFrom,
    dateTo,
    statusFilter,
    kanbanColumns,
    setKanbanColumnsFromBoard,
    savingDealIds,
    handleDealMove,
    page,
    pageSize,
    sortBy,
    sortOrder,
    selectedIds,
    handleSort,
    handleRowSelect,
    handleSelectAll,
    setPage,
    fetchDeals,
    createDeal,
    updateDeal,
    deleteDeal,
    defaultStageId,
  } = useDealsPage()

  const errorMessage = computed(() => (isError.value ? 'Не удалось загрузить сделки' : null))

  const openDealCard = (deal: Deal) => {
    router.push({ name: 'CrmDealDetail', params: { id: deal.id } })
  }

  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '1')

  const showFormModal = ref(false)
  const dealToEdit = ref<Deal | null>(null)
  const showDeleteModal = ref(false)
  const dealToDelete = ref<Deal | null>(null)
  const showContactModal = ref(false)
  const preselectedContactForDeal = ref<Contact | null>(null)
  const showCompanyModal = ref(false)
  const preselectedCompanyForContact = ref<Company | null>(null)

  const openCreateModal = () => {
    dealToEdit.value = null
    showFormModal.value = true
  }

  const openEditModal = (deal: Deal) => {
    dealToEdit.value = deal
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    dealToEdit.value = null
  }

  const openCreateContactFromDeal = () => {
    showContactModal.value = true
  }

  const openCreateCompanyFromContact = () => {
    showCompanyModal.value = true
  }

  const onCompanyCreatedFromContact = async (data: CreateCompanyDto) => {
    if (!workspaceId.value) return
    try {
      const created = await companyService.create(workspaceId.value, data)
      preselectedCompanyForContact.value = created
    } finally {
      showCompanyModal.value = false
    }
  }

  const closeContactModal = () => {
    showContactModal.value = false
  }

  const onContactCreatedFromDeal = async (data: CreateContactDto) => {
    if (!workspaceId.value) return
    try {
      const created = await contactService.create(workspaceId.value, data)
      preselectedContactForDeal.value = created
    } finally {
      showContactModal.value = false
    }
  }

  const handleCreate = async (data: CreateDealDto) => {
    await createDeal(data)
    closeFormModal()
  }

  const handleUpdate = async (id: string, data: CreateDealDto) => {
    await updateDeal(id, data)
    closeFormModal()
  }

  const confirmDelete = (deal: Deal) => {
    dealToDelete.value = deal
    showDeleteModal.value = true
  }

  const doDelete = async () => {
    if (dealToDelete.value) {
      await deleteDeal(dealToDelete.value.id)
      dealToDelete.value = null
      showDeleteModal.value = false
    }
  }
</script>
