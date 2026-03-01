<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <h1 class="text-text-primary">CRM — Контакты</h1>

    <ContactsToolbar
      v-model:search-query="searchQuery"
      v-model:show-filters="showFilters"
      :filters="contactFilters"
      :companies="filterCompanies"
      :available-tags="availableTags"
      @create="openCreateModal"
      @import="onImport"
      @export="onExport"
      @reset-filters="resetFilters"
    />

    <div
      v-if="selectedIds && selectedIds.size > 0"
      class="flex items-center gap-4 py-2 px-4 rounded-lg bg-bg-tertiary border border-border-light"
    >
      <span class="text-sm text-text-secondary">Выбрано: {{ selectedIds.size }}</span>
      <Button variant="outline" size="sm" @click="bulkDelete">Удалить</Button>
      <Button variant="ghost" size="sm" disabled>Изменить ответственного</Button>
      <Button variant="ghost" size="sm" disabled>Добавить тег</Button>
    </div>

    <ContactsTableWidget
      :contacts="contacts"
      :total="total"
      :is-loading="isLoading"
      :is-error="isError"
      :page="page"
      :page-size="pageSize"
      :page-size-options="PAGE_SIZE_OPTIONS"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :selected-ids="selectedIds"
      :handle-sort="handleSort"
      :handle-row-select="handleRowSelect"
      :handle-select-all="handleSelectAll"
      :set-page="setPage"
      :set-page-size="setPageSize"
      :fetch-contacts="fetchContacts"
      @edit="openEditModal"
      @delete="confirmDelete"
      @add-to-deal="goToCreateDeal"
      @row-click="openQuickView"
    />

    <CompanyFormModal
      :is-open="showCompanyModal"
      :company="null"
      @close="showCompanyModal = false"
      @save="onCompanyCreatedFromContact"
    />

    <ContactFormModal
      :is-open="showFormModal"
      :contact="contactToEdit"
      :workspace-id="workspaceId"
      :default-owner-id="defaultOwnerId"
      :preselected-company="preselectedCompanyForContact"
      @close="closeFormModal"
      @save="handleCreate"
      @update="handleUpdate"
      @create-company="openCreateCompanyFromContact"
      @preselected-company-applied="preselectedCompanyForContact = null"
    />

    <Modal :is-open="showDeleteModal" @close="showDeleteModal = false">
      <ConfirmModal
        title="Удалить контакт?"
        message="Контакт будет удалён без возможности восстановления."
        confirm-text="Удалить"
        confirm-variant="danger"
        @close="showDeleteModal = false"
        @confirm="doDelete"
      />
    </Modal>

    <Drawer
      :is-open="!!contactQuickView"
      title="Быстрый просмотр"
      width="md"
      @close="contactQuickView = null"
    >
      <ContactQuickViewPanel
        v-if="contactQuickView"
        :contact="contactQuickView"
        @close="contactQuickView = null"
        @edit="openEditFromQuickView"
        @open-card="goToContactCard"
        @create-deal="goToCreateDeal"
      />
    </Drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Modal, ConfirmModal, Drawer } from '@/shared/ui'
  import { useUserStore } from '@/entities/user'
  import {
    useContactsPage,
    ContactsToolbar,
    ContactsTableWidget,
    ContactFormModal,
    ContactQuickViewPanel,
  } from '@/features/contacts'
  import { CompanyFormModal } from '@/features/companies'
  import { companyService } from '@/entities/company'
  import type { Contact, CreateContactDto } from '@/entities/contact'
  import type { ContactFilters } from '@/features/contacts'
  import type { Company, CreateCompanyDto } from '@/entities/company'

  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()
  const {
    workspaceId,
    searchQuery,
    companyIdFilter,
    contacts,
    total,
    isLoading,
    isError,
    page,
    pageSize,
    PAGE_SIZE_OPTIONS,
    sortBy,
    sortOrder,
    selectedIds,
    handleSort,
    handleRowSelect,
    handleSelectAll,
    setPage,
    setPageSize,
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  } = useContactsPage()

  watch(
    () => route.query.companyId,
    (id) => {
      companyIdFilter.value = (id as string) ?? ''
    },
    { immediate: true },
  )

  const defaultOwnerId = computed(() => userStore.currentUser?.id ?? '1')

  const showFormModal = ref(false)
  const contactToEdit = ref<Contact | null>(null)
  const showDeleteModal = ref(false)
  const contactToDelete = ref<Contact | null>(null)
  const contactQuickView = ref<Contact | null>(null)
  const showFilters = ref(false)
  const showCompanyModal = ref(false)
  const preselectedCompanyForContact = ref<Company | null>(null)
  const contactFilters = ref<ContactFilters>({})
  const filterCompanies = ref<{ id: string; name: string }[]>([])
  const availableTags = ref<string[]>([])

  function openEditFromQuickView(contact: Contact) {
    contactQuickView.value = null
    contactToEdit.value = contact
    showFormModal.value = true
  }

  function resetFilters() {
    contactFilters.value = {}
  }

  function onImport() {
    // Заглушка MVP
  }

  function onExport() {
    // Заглушка MVP
  }

  function openQuickView(contact: Contact) {
    contactQuickView.value = contact
  }

  function goToContactCard(contact: Contact) {
    contactQuickView.value = null
    router.push(`/crm/contacts/${contact.id}`)
  }

  function goToCreateDeal(_contact: Contact) {
    contactQuickView.value = null
    router.push('/crm/deals')
  }

  async function bulkDelete() {
    const ids = Array.from(selectedIds.value)
    if (ids.length === 0) return
    for (const id of ids) {
      await deleteContact(String(id))
    }
  }

  const openCreateModal = () => {
    contactToEdit.value = null
    showFormModal.value = true
  }

  const openEditModal = (contact: Contact) => {
    contactToEdit.value = contact
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    contactToEdit.value = null
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

  const handleCreate = async (data: CreateContactDto) => {
    await createContact(data)
    closeFormModal()
  }

  const handleUpdate = async (id: string, data: CreateContactDto) => {
    await updateContact(id, data)
    closeFormModal()
  }

  const confirmDelete = (contact: Contact) => {
    contactToDelete.value = contact
    showDeleteModal.value = true
  }

  const doDelete = async () => {
    if (contactToDelete.value) {
      await deleteContact(contactToDelete.value.id)
      contactToDelete.value = null
      showDeleteModal.value = false
    }
  }
</script>
