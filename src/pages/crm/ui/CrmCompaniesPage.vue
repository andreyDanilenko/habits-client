<template>
  <BasePageLayout
    title="CRM — Компании"
    description="Управляйте компаниями. Поиск и табличный вид."
  >
    <template #header-actions>
      <PermissionGuard :permission="CRM_PERMISSIONS.companyCreate">
        <Button variant="primary" @click="actions.openCreateModal">
          <PlusIcon class="size-5 mr-2" />
          Создать компанию
        </Button>
      </PermissionGuard>
    </template>

    <template #content>
      <CompaniesToolbar
        :search-input="actions.searchInput.value"
        @update:search-input="actions.setSearchInput"
        @search="actions.onSearch"
        @open-filters="showFiltersDrawer = true"
      />

      <CompaniesFiltersDrawer :is-open="showFiltersDrawer" @close="showFiltersDrawer = false" />

      <div class="mt-(--spacing-4)">
        <CompaniesTableWidget
          :companies="actions.companies.value"
          :total="actions.total.value"
          :is-loading="actions.isLoading.value"
          :is-error="actions.isError.value"
          :page="actions.page.value"
          :page-size="actions.pageSize.value"
          :sort-by="actions.sortBy.value"
          :sort-order="actions.sortOrder.value"
          :selected-ids="actions.selectedIds.value"
          :handle-sort="actions.handleSort"
          :handle-row-select="actions.handleRowSelect"
          :handle-select-all="actions.handleSelectAll"
          :set-page="actions.setPage"
          :fetch-companies="actions.fetchCompanies"
          @edit="actions.openEditModal"
          @delete="actions.confirmDelete"
          @company-click="actions.goToCompany"
          @contacts-click="actions.goToContactsByCompany"
        />
      </div>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import {
    useCompaniesPageActions,
    CompaniesToolbar,
    CompaniesFiltersDrawer,
    CompaniesTableWidget,
  } from '@/features/companies'

  const actions = useCompaniesPageActions()
  const showFiltersDrawer = ref(false)
</script>
