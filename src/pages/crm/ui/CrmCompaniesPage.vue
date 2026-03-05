<template>
  <div class="max-w-7xl mx-auto space-y-6 pb-8">
    <h1 class="text-text-primary">CRM — Компании</h1>

    <CompaniesToolbar v-model:search-query="searchQuery" @create="openCreateModal" />

    <CompaniesTableWidget
      :companies="companies"
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
      :fetch-companies="fetchCompanies"
      @edit="openEditModal"
      @delete="confirmDelete"
      @company-click="goToCompany"
      @contacts-click="goToContactsByCompany"
    />

    <CompanyFormModal
      :is-open="showFormModal"
      :company="companyToEdit"
      @close="closeFormModal"
      @save="handleCreate"
      @update="handleUpdate"
    />

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
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Modal, ConfirmModal } from '@/shared/ui'
  import {
    useCompaniesPage,
    CompaniesToolbar,
    CompaniesTableWidget,
    CompanyFormModal,
  } from '@/features/companies'
  import type { Company, CreateCompanyDto } from '@/entities/company'

  const router = useRouter()

  const {
    searchQuery,
    companies,
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
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompaniesPage()

  const showFormModal = ref(false)
  const companyToEdit = ref<Company | null>(null)
  const showDeleteModal = ref(false)
  const companyToDelete = ref<Company | null>(null)

  const openCreateModal = () => {
    companyToEdit.value = null
    showFormModal.value = true
  }

  const openEditModal = (company: Company) => {
    companyToEdit.value = company
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    companyToEdit.value = null
  }

  const handleCreate = async (data: CreateCompanyDto) => {
    await createCompany(data)
    closeFormModal()
  }

  const handleUpdate = async (id: string, data: CreateCompanyDto) => {
    await updateCompany(id, data)
    closeFormModal()
  }

  const confirmDelete = (company: Company) => {
    companyToDelete.value = company
    showDeleteModal.value = true
  }

  function goToCompany(company: Company) {
    router.push({ name: 'CrmCompanyDetail', params: { id: company.id } })
  }

  function goToContactsByCompany(company: Company) {
    router.push({ path: '/crm/contacts', query: { companyId: company.id } })
  }

  const doDelete = async () => {
    if (companyToDelete.value) {
      await deleteCompany(companyToDelete.value.id)
      companyToDelete.value = null
      showDeleteModal.value = false
    }
  }
</script>
