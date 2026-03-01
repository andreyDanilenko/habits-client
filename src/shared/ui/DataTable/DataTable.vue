<template>
  <section
    :class="[
      'flex flex-col items-start p-6 gap-6 w-full bg-bg-primary rounded-lg border border-border-default',
      props.className,
    ].filter(Boolean)"
  >
    <header class="flex flex-row justify-between items-center w-full min-h-8">
      <h2 class="font-semibold text-xl leading-normal text-text-primary m-0">{{ title }}</h2>
      <div v-if="$slots.headerActions" class="flex flex-row items-center gap-2">
        <slot name="headerActions" />
      </div>
    </header>

    <div
      v-if="loading"
      class="w-full h-1 bg-bg-tertiary rounded-full overflow-hidden"
      role="status"
      aria-label="Загрузка"
    >
      <div
        class="h-full w-2/5 bg-primary-default rounded-full animate-[data-table-progress_0.8s_ease-in-out_infinite]"
      />
    </div>

    <div class="w-full overflow-x-auto">
      <table class="w-full table-fixed border-collapse">
        <colgroup>
          <col v-if="selectable" style="width: 1%; min-width: 50px" />
          <col v-for="col in columns" :key="col.id" style="width: auto" />
          <col v-if="rowActions" style="width: 100px" />
        </colgroup>
        <thead>
          <tr>
            <th
              v-if="selectable"
              class="py-3 px-2 border-b border-border-light font-semibold text-sm text-text-secondary text-left pl-4 align-middle"
            >
              <Checkbox
                :model-value="allSelected"
                aria-label="Выбрать все"
                @update:model-value="onSelectAll?.()"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.id"
              class="py-3 px-2 border-b border-border-light font-semibold text-sm text-text-secondary align-middle"
              :class="[
                col.align === 'left' ? 'text-left pl-0' : 'text-center',
              ]"
            >
              <button
                v-if="col.sortable && onSort"
                type="button"
                class="inline-flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-inherit font-inherit hover:text-primary-default"
                :aria-pressed="sortBy === col.id"
                @click="onSort(col.id)"
              >
                {{ col.label }}
                <span class="text-xs opacity-80" aria-hidden>
                  {{ sortBy === col.id ? (sortOrder === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
            <th
              v-if="rowActions"
              class="py-2 px-2 border-b border-border-light font-semibold text-sm text-text-secondary align-middle"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-if="error">
            <td :colspan="colCount" class="p-6 text-center text-text-muted text-sm" role="alert">
              {{ errorMessage }}
            </td>
          </tr>
          <tr v-else-if="!loading && safeData.length === 0">
            <td :colspan="colCount" class="p-6 text-center text-text-muted text-sm">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr
            v-for="row in safeData"
            :key="String(getRowId(row))"
            class="group cursor-pointer"
            :aria-selected="selectedIdsSet.has(getRowId(row))"
            :role="onRowClick || onSelect ? 'button' : undefined"
            :tabindex="onRowClick || onSelect ? 0 : undefined"
            @click="handleRowClick(row, $event)"
            @keydown.enter.space="handleRowKeydown(row, $event)"
          >
            <td
              v-if="selectable"
              class="py-3 px-2 pl-4 border-b border-border-light text-sm leading-snug text-text-primary text-left align-middle group-hover:bg-bg-tertiary"
              :class="selectedIdsSet.has(getRowId(row)) && 'bg-primary-default/10'"
              @click.stop
            >
              <Checkbox
                :model-value="selectedIdsSet.has(getRowId(row))"
                aria-label="Выбрать строку"
                @update:model-value="onSelect?.(getRowId(row))"
                @click.stop
              />
            </td>
            <td
              v-for="col in columns"
              :key="col.id"
              class="py-3 px-2 border-b border-border-light text-sm leading-snug text-text-primary align-middle group-hover:bg-bg-tertiary"
              :class="[
                col.align === 'left' ? 'text-left pl-0' : 'text-center',
                selectedIdsSet.has(getRowId(row)) && 'bg-primary-default/10',
                col.cellClassName,
              ]"
            >
              <DataTableCell :column="col" :row="row" />
            </td>
            <td
              v-if="rowActions"
              class="py-2 px-2 border-b border-border-light text-sm text-text-primary align-middle group-hover:bg-bg-tertiary"
              :class="selectedIdsSet.has(getRowId(row)) && 'bg-primary-default/10'"
              @click.stop
            >
              <div class="flex items-center justify-center gap-2">
                <component :is="() => (rowActions && rowActions(row)) ?? null" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="$slots.footer" class="flex justify-between items-center w-full min-h-12">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Checkbox from '@/shared/ui/Checkbox.vue'
  import type { DataTableProps, SortOrder } from './DataTable.types'
  import DataTableCell from './DataTableCell.vue'

  const props = withDefaults(
    defineProps<
      DataTableProps<unknown> & {
        sortOrder?: SortOrder
      }
    >(),
    {
      loading: false,
      error: false,
      emptyMessage: 'Нет данных для отображения.',
      errorMessage: 'Ошибка загрузки данных.',
      selectable: false,
      sortOrder: 'asc',
      className: '',
    },
  )

  const safeData = computed(() => props.data ?? [])
  const selectedIdsSet = computed(() => props.selectedIds ?? new Set())
  const allSelected = computed(
    () =>
      safeData.value.length > 0 &&
      safeData.value.every((row) => selectedIdsSet.value.has(props.getRowId(row))),
  )
  const colCount =
    (props.selectable ? 1 : 0) + props.columns.length + (props.rowActions ? 1 : 0)

  function handleRowClick(row: unknown, e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.closest('a')) return
    if (target.closest('button') || target.closest('input') || target.closest('[role="checkbox"]'))
      return
    if (props.onRowClick) {
      props.onRowClick(row)
      return
    }
    if (props.onSelect) props.onSelect(props.getRowId(row as Record<string, unknown>))
  }

  function handleRowKeydown(row: unknown, e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (props.onRowClick) props.onRowClick(row)
      else if (props.onSelect) props.onSelect(props.getRowId(row as Record<string, unknown>))
    }
  }
</script>
