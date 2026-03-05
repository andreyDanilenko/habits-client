<template>
  <div class="KanbanBoard flex gap-4 overflow-x-auto pb-4">
    <KanbanColumn
      v-for="col in columns"
      :key="col.id"
      :column="col"
      :item-key="itemKey"
      :dnd-group="dndGroup"
      :disabled="disabled"
      @update:column="onColumnUpdate"
      @move="onMove"
    >
      <template #header="slotProps">
        <slot name="column-header" v-bind="slotProps" />
      </template>
      <template #card="slotProps">
        <slot name="card" v-bind="slotProps" />
      </template>
    </KanbanColumn>
  </div>
</template>

<script setup lang="ts">
  import KanbanColumn from './KanbanColumn.vue'
  import type { KanbanColumnModel, KanbanBoardProps } from './KanbanBoard.types'

  const props = withDefaults(defineProps<KanbanBoardProps>(), {
    dndGroup: 'kanban',
    disabled: false,
  })

  const emit = defineEmits<{
    'update:columns': [columns: KanbanColumnModel[]]
    move: [payload: { item: unknown; fromColumnId?: string; toColumnId?: string }]
  }>()

  const columns = defineModel<KanbanColumnModel[]>('columns', { required: true })

  function onColumnUpdate(updated: KanbanColumnModel) {
    const next = columns.value.map((c) =>
      c.id === updated.id ? { ...c, items: updated.items } : c,
    )
    emit('update:columns', next)
  }

  function onMove(e: { item: unknown; fromColumnId?: string; toColumnId?: string }) {
    emit('move', e)
  }
</script>
