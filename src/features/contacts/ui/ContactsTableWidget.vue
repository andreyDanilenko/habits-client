<template>
  <DataTable
    title="Контакты"
    :data="contacts"
    :columns="contactColumns"
    :get-row-id="getRowId"
    :loading="isLoading"
    :error="isError"
    empty-message="Нет контактов для отображения."
    error-message="Ошибка загрузки контактов. Обновите страницу."
    :selectable="true"
    :selected-ids="selectedIds"
    :sort-by="sortBy"
    :sort-order="sortOrder"
    :on-row-click="handleRowClick"
    @select="handleRowSelect"
    @select-all="onSelectAll"
    @sort="handleSort"
    :row-actions="rowActionsRenderer"
  >
    <template #headerActions>
      <Button variant="ghost" size="md" :disabled="isLoading" @click="fetchContacts">
        Обновить
      </Button>
    </template>
    <template #footer>
      <div class="flex flex-wrap items-center justify-between gap-4 w-full">
        <div class="flex items-center gap-2">
          <span class="text-sm text-text-secondary">Показать по</span>
          <select
            :value="pageSize"
            class="rounded border border-border-default bg-bg-primary px-2 py-1 text-sm text-text-primary"
            @change="onPageSizeChange"
          >
            <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
        <Pagination
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @page-change="setPage"
        />
      </div>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { DataTable, Button, Pagination } from '@/shared/ui'
  import { contactColumns } from '../config/columns'
  import ContactsTableRowActions from './ContactsTableRowActions.vue'
  import type { Contact } from '@/entities/contact'

  const props = defineProps<{
    contacts: Contact[]
    total: number
    isLoading: boolean
    isError: boolean
    page: number
    pageSize: number
    pageSizeOptions: readonly number[]
    sortBy: string | null
    sortOrder: 'asc' | 'desc'
    selectedIds: Set<string | number>
    handleSort: (columnId: string) => void
    handleRowSelect: (id: string | number) => void
    handleSelectAll: (ids: (string | number)[]) => void
    setPage: (page: number) => void
    setPageSize: (size: number) => void
    fetchContacts: () => Promise<void>
  }>()

  const emit = defineEmits<{
    edit: [contact: Contact]
    delete: [contact: Contact]
    'add-to-deal': [contact: Contact]
    'row-click': [contact: Contact]
  }>()

  const getRowId = (row: Contact): string => row.id

  const handleRowClick = (row: Contact) => {
    emit('row-click', row)
  }

  const onSelectAll = () => {
    props.handleSelectAll(props.contacts.map((c) => c.id))
  }

  const onPageSizeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    props.setPageSize(Number(target.value))
  }

  function rowActionsRenderer(row: Contact) {
    return h(ContactsTableRowActions, {
      contact: row,
      onEdit: (c: Contact) => emit('edit', c),
      onDelete: (c: Contact) => emit('delete', c),
      onAddToDeal: (c: Contact) => emit('add-to-deal', c),
    })
  }
</script>
