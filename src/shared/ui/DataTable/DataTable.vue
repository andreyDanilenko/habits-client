<template>
  <section :class="['DataTable__Card', props.className].filter(Boolean)">
    <header class="DataTable__Header">
      <h2 class="DataTable__Title">{{ title }}</h2>
      <div v-if="$slots.headerActions" class="DataTable__Actions">
        <slot name="headerActions" />
      </div>
    </header>

    <div v-if="loading" class="DataTable__ProgressWrap" role="status" aria-label="Загрузка">
      <div class="DataTable__ProgressBar" />
    </div>

    <div class="DataTable__ScrollWrap">
      <table class="DataTable__Table">
        <colgroup>
          <col v-if="selectable" class="DataTable__ColCheckbox" />
          <col v-for="col in columns" :key="col.id" class="DataTable__ColData" />
          <col v-if="rowActions" class="DataTable__ColActions" />
        </colgroup>
        <thead>
          <tr>
            <th v-if="selectable" class="DataTable__Th DataTable__Th--checkbox">
              <Checkbox
                :model-value="allSelected"
                aria-label="Выбрать все"
                @update:model-value="onSelectAll?.()"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.id"
              class="DataTable__Th"
              :class="{ 'DataTable__Th--left': col.align === 'left' }"
            >
              <button
                v-if="col.sortable && onSort"
                type="button"
                class="DataTable__ThSort"
                :aria-pressed="sortBy === col.id"
                @click="onSort(col.id)"
              >
                {{ col.label }}
                <span class="DataTable__SortIcon" aria-hidden>
                  {{ sortBy === col.id ? (sortOrder === 'asc' ? '↑' : '↓') : '↕' }}
                </span>
              </button>
              <template v-else>{{ col.label }}</template>
            </th>
            <th v-if="rowActions" class="DataTable__Th DataTable__Th--actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-if="error">
            <td :colspan="colCount" class="DataTable__Message" role="alert">{{ errorMessage }}</td>
          </tr>
          <tr v-else-if="!loading && data.length === 0">
            <td :colspan="colCount" class="DataTable__Message">{{ emptyMessage }}</td>
          </tr>
          <tr
            v-for="row in data"
            :key="String(getRowId(row))"
            :class="['DataTable__Row', { 'DataTable__Row--selected': selectedIdsSet.has(getRowId(row)) }]"
            :aria-selected="selectedIdsSet.has(getRowId(row))"
            :role="onRowClick || onSelect ? 'button' : undefined"
            :tabindex="onRowClick || onSelect ? 0 : undefined"
            @click="handleRowClick(row, $event)"
            @keydown.enter.space="handleRowKeydown(row, $event)"
          >
            <td v-if="selectable" class="DataTable__Td DataTable__Td--checkbox" @click.stop>
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
              class="DataTable__Td"
              :class="[col.align === 'left' && 'DataTable__Td--left', col.cellClassName]"
            >
              <DataTableCell :column="col" :row="row" />
            </td>
            <td v-if="rowActions" class="DataTable__Td DataTable__Td--actions" @click.stop>
              <div class="DataTable__RowActions">
                <component :is="() => (rowActions && rowActions(row)) ?? null" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="$slots.footer" class="DataTable__Footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Checkbox from '@/shared/ui/Checkbox.vue'
  import type { DataTableProps, SortOrder } from './DataTable.types'
  import DataTableCell from './DataTableCell.vue'
  import './DataTable.css'

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

  const selectedIdsSet = computed(() => props.selectedIds ?? new Set())
  const allSelected = computed(
    () =>
      props.data.length > 0 &&
      props.data.every((row) => selectedIdsSet.value.has(props.getRowId(row))),
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
