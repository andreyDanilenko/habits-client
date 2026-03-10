<template>
  <div class="KanbanBoard flex gap-4 overflow-x-auto pb-4">
    <KanbanColumn
      v-for="col in columns"
      :key="col.id"
      :column="col"
      :item-key="itemKey"
      :dnd-group="dndGroup"
      :disabled="disabled"
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
    move: [payload: { item: unknown; fromColumnId?: string; toColumnId?: string }]
  }>()

  const columns = defineModel<KanbanColumnModel[]>('columns', { required: true })

  function onMove(e: { item: unknown; fromColumnId?: string; toColumnId?: string }) {
    emit('move', e)
  }
</script>
