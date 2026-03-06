<template>
  <BasePageLayout
    title="CRM — Контакты"
    description="Управляйте контактами. Поиск, фильтры и табличный вид."
  >
    <template #header-actions>
      <PermissionGuard :permission="CRM_PERMISSIONS.contactCreate">
        <Button variant="primary" @click="actions.openCreateModal">
          <PlusIcon class="size-5 mr-2" />
          Создать контакт
        </Button>
      </PermissionGuard>
    </template>

    <template #content>
      <div class="space-y-(--spacing-6)">
        <ContactsToolbar
          :search-input="actions.searchInput.value"
          :show-filters="actions.showFilters.value"
          :filters="actions.contactFilters.value"
          :companies="actions.filterCompanies.value"
          :available-tags="actions.availableTags.value"
          @update:search-input="actions.setSearchInput"
          @update:show-filters="actions.setShowFilters"
          @search="actions.onSearch"
          @update:filters="actions.updateContactFilters"
          @import="actions.onImport"
          @export="actions.onExport"
          @reset-filters="actions.resetFilters"
        />

        <div
          v-if="actions.selectedIds.value?.size > 0"
          class="flex items-center gap-(--spacing-4) py-(--spacing-2) px-(--spacing-4) rounded-(--radius-lg) bg-bg-tertiary border border-border-light"
        >
          <span class="text-(--text-sm) text-text-secondary">
            Выбрано: {{ actions.selectedIds.value.size }}
          </span>
          <PermissionGuard :permission="CRM_PERMISSIONS.contactDelete">
            <Button variant="outline" size="md" @click="actions.bulkDelete">Удалить</Button>
          </PermissionGuard>
          <Button variant="ghost" size="md" disabled>Изменить ответственного</Button>
          <Button variant="ghost" size="md" disabled>Добавить тег</Button>
        </div>

        <ContactsTableWidget
          :contacts="actions.contacts.value"
          :total="actions.total.value"
          :is-loading="actions.isLoading.value"
          :is-error="actions.isError.value"
          :page="actions.page.value"
          :page-size="actions.pageSize.value"
          :page-size-options="actions.PAGE_SIZE_OPTIONS"
          :sort-by="actions.sortBy.value"
          :sort-order="actions.sortOrder.value"
          :selected-ids="actions.selectedIds.value"
          :handle-sort="actions.handleSort"
          :handle-row-select="actions.handleRowSelect"
          :handle-select-all="actions.handleSelectAll"
          :set-page="actions.setPage"
          :set-page-size="actions.setPageSize"
          :fetch-contacts="actions.fetchContacts"
          @edit="actions.openEditModal"
          @delete="actions.confirmDelete"
          @add-to-deal="actions.openAttachToDeal"
          @row-click="actions.openQuickView"
        />
      </div>
    </template>

  </BasePageLayout>
</template>

<script setup lang="ts">
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import {
    useContactsPageActions,
    ContactsToolbar,
    ContactsTableWidget,
  } from '@/features/contacts'

  const actions = useContactsPageActions()
</script>
