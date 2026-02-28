<script setup lang="ts" generic="T">
  import { h } from 'vue'
  import type { DataTableColumn } from './DataTable.types'

  const props = defineProps<{
    column: DataTableColumn<T>
    row: T
  }>()

  const value = () => props.column.getValue(props.row)
  const rendered = () => {
    const v = value()
    const content = props.column.render
      ? props.column.render(v, props.row)
      : (v != null ? String(v) : '')
    return typeof content === 'string' ? h('span', content) : content
  }
</script>

<template>
  <component :is="rendered" />
</template>
