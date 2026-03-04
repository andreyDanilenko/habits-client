<script setup lang="ts" generic="T = any">
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
    if (typeof content === 'string') {
      return h(
        'span',
        {
          class: 'block truncate',
          title: content,
        },
        content,
      )
    }
    return content
  }
</script>

<template>
  <component :is="rendered" />
</template>
