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

        <!-- Простая отладочная зона DnD без Kanban-обёртки (моки, чистый vuedraggable) -->
        <section class="border border-dashed rounded-md p-4">
          <h2 class="text-sm font-medium text-gray-600 mb-2">
            Debug Kanban DnD (mock pipelines → lists of lists)
          </h2>

          <div class="flex gap-4 overflow-x-auto">
            <div
              v-for="(col, colIndex) in debugColumns"
              :key="col.id"
              class="min-w-[220px] rounded-md border bg-gray-100 p-2 flex flex-col gap-2"
            >
              <div class="font-medium text-gray-800 text-sm">
                {{ col.title }}
                <span class="text-xs text-gray-500 ml-1"> ({{ col.items.length }}) </span>
              </div>

              <draggable
                v-model="debugColumns[colIndex].items"
                item-key="id"
                :group="{ name: 'debug-kanban' }"
                class="space-y-2 min-h-[80px]"
                @change="(e) => onDebugChange(col.id, e)"
              >
                <template #item="{ element }">
                  <div class="border border-gray-300 rounded-sm bg-white px-3 py-2 text-sm">
                    <div class="font-medium text-gray-800">
                      {{ element.name }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ element.id }}
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </div>
        </section>
      </div>
    </template>
  </BasePageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { BasePageLayout } from '@/shared/ui/common'
  import { Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'
  import { PermissionGuard, usePermissions } from '@/features/permissions'
  import { CRM_PERMISSIONS } from '@/features/permissions/config'
  import draggable from 'vuedraggable'
  import {
    useDealsPageActions,
    DealsToolbar,
    DealsTableWidget,
    DealsKanbanView,
  } from '@/features/deals'

  const { can } = usePermissions()
  const actions = useDealsPageActions()

  // Прототип канбан-доски: пайплайн как список колонок (lists of lists),
  // каждая колонка хранит собственный массив сделок.
  const debugColumns = ref([
    {
      id: 'stage-a',
      title: 'Stage A',
      items: [
        { id: 'debug-1', name: 'Debug deal 1' },
        { id: 'debug-2', name: 'Debug deal 2' },
      ],
    },
    {
      id: 'stage-b',
      title: 'Stage B',
      items: [{ id: 'debug-3', name: 'Debug deal 3' }],
    },
  ])

  const onDebugChange = (columnId: string, evt: unknown) => {
    // Можно логировать, как vue-draggable-next сообщает о добавлении/удалении:
    // console.log('debug change', columnId, evt)
  }
</script>
