<template>
  <BasePageLayout
    title="CRM — Сделки"
    description="Управляйте сделками. Канбан или табличный вид."
    :error-message="actions.error.value"
  >
    <template #header-actions>
      <PermissionGuard :permission="CRM_PERMISSIONS.dealCreate">
        <Button variant="primary" @click="actions.openCreateModal">
          <PlusIcon class="size-5 mr-2" />
          Создать сделку
        </Button>
      </PermissionGuard>
    </template>

    <template #content>
      <div class="space-y-6">
        <DealsToolbar
          :pipelines="actions.pipelines.value"
          :view-mode="actions.viewMode.value"
          :selected-pipeline-id="actions.selectedPipelineId.value"
          :date-from="actions.dateFrom.value"
          :date-to="actions.dateTo.value"
          :status="actions.statusFilter.value"
          @update:view-mode="actions.setViewMode"
          @update:selected-pipeline-id="actions.setSelectedPipelineId"
          @update:date-from="actions.setDateFrom"
          @update:date-to="actions.setDateTo"
          @update:status="actions.setStatusFilter"
        />

        <DealsKanbanView
          v-if="actions.viewMode.value === 'kanban'"
          :key="actions.selectedPipelineId.value"
          :columns="actions.kanbanColumns.value"
          @update:columns="actions.setKanbanColumnsFromBoard"
          :pipelines="actions.pipelines.value"
          :is-loading="actions.isLoading.value"
          :is-error="actions.isError.value"
          :saving-deal-ids="actions.savingDealIds.value"
          @move="actions.handleDealMove"
          @open-deal="actions.openDealCard"
          @edit="actions.openEditModal"
          @copy="actions.openEditModal"
          @delete="actions.confirmDelete"
        />

        <DealsTableWidget
          v-else
          :deals="actions.deals.value"
          :pipelines="actions.pipelines.value"
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
          :fetch-deals="actions.fetchDeals"
          @edit="actions.openEditModal"
          @delete="actions.confirmDelete"
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
    useDealsPageActions,
    DealsToolbar,
    DealsTableWidget,
    DealsKanbanView,
  } from '@/features/deals'

  const actions = useDealsPageActions()

  const onDebugChange = (columnId: string, evt: unknown) => {
    // Можно логировать, как vue-draggable-next сообщает о добавлении/удалении:
    // console.log('debug change', columnId, evt)
  }
</script>
