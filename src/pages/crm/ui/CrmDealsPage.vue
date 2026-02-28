<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <h1 class="text-text-primary">CRM — Сделки</h1>

    <DealsToolbar @create="openCreateModal" />

    <DealsTableWidget
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

    <ContactFormModal
      :is-open="showContactModal"
      :contact="null"
      :workspace-id="workspaceId"
      :default-owner-id="defaultOwnerId"
      @close="closeContactModal"
      @save="onContactCreatedFromDeal"
    />

    <DealFormModal
      :is-open="showFormModal"
      :deal="dealToEdit"
      :pipelines="pipelines"
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
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Modal, ConfirmModal } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import {
    useDealsPage,
    DealsToolbar,
    DealsTableWidget,
    DealFormModal,
  } from '@/features/deals'
  import { ContactFormModal } from '@/features/contacts'
  import { contactService } from '@/entities/contact'
  import type { Deal, CreateDealDto } from '@/entities/deal'
  import type { Contact, CreateContactDto } from '@/entities/contact'

  const userStore = useUserStore()
  const {
    workspaceId,
    pipelines,
    deals,
    total,
    isLoading,
    isError,
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

  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '1')

  const showFormModal = ref(false)
  const dealToEdit = ref<Deal | null>(null)
  const showDeleteModal = ref(false)
  const dealToDelete = ref<Deal | null>(null)
  const showContactModal = ref(false)
  const preselectedContactForDeal = ref<Contact | null>(null)

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
