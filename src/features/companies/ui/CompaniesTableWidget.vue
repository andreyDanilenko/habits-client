<template>
  <DataTable
    title="Компании"
    :data="companies"
    :columns="companyColumns"
    :get-row-id="getRowId"
    :loading="isLoading"
    :error="isError"
    empty-message="Нет компаний для отображения."
    error-message="Ошибка загрузки компаний."
    :selectable="true"
    :sticky-selection="true"
    :sticky-actions="true"
    :selected-ids="selectedIds"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    @select="handleRowSelect"
    @select-all="onSelectAll"
    @sort="handleSort"
    :row-actions="rowActionsRenderer"
  >
    <template #headerActions>
      <Button variant="ghost" size="md" :disabled="isLoading" @click="fetchCompanies">
        Обновить
      </Button>
    </template>
    <template #footer>
      <Pagination
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @page-change="setPage"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { DataTable, Button, Pagination } from '@/shared/ui'
  import type { DataTableColumn } from '@/shared/ui'
  import { getCompanyColumns } from '../config/columns'
  import CompaniesTableRowActions from './CompaniesTableRowActions.vue'
  import type { Company } from '@/entities/company'

  const props = defineProps<{
    companies: Company[]
    total: number
    isLoading: boolean
    isError: boolean
    page: number
    pageSize: number
    sortBy: string | null
    sortOrder: 'asc' | 'desc'
    selectedIds: Set<string | number>
    handleSort: (columnId: string) => void
    handleRowSelect: (id: string | number) => void
    handleSelectAll: (ids: (string | number)[]) => void
    setPage: (page: number) => void
    fetchCompanies: () => Promise<void>
  }>()

  const emit = defineEmits<{
    edit: [company: Company]
    delete: [company: Company]
    'company-click': [company: Company]
    'contacts-click': [company: Company]
  }>()

  const getRowId = (row: Company): string => row.id

  const companyColumns: DataTableColumn<Company>[] = getCompanyColumns({
    onCompanyClick: (company) => emit('company-click', company),
    onContactsClick: (company) => emit('contacts-click', company),
  })

  const onSelectAll = () => {
    props.handleSelectAll(props.companies.map((c) => c.id))
  }

  function rowActionsRenderer(row: Company) {
    return h(CompaniesTableRowActions, {
      company: row,
      onEdit: (c: Company) => emit('edit', c),
      onDelete: (c: Company) => emit('delete', c),
    })
  }
</script>
