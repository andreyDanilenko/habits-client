<template>
  <div
    class="KanbanColumn flex-shrink-0 w-72 rounded-xl border border-border-default bg-bg-secondary/50 flex flex-col overflow-hidden"
    :style="columnColorStyle"
  >
    <div class="KanbanColumn__Header px-4 py-3 border-b border-border-default">
      <slot name="header" :column="column" :count="column.items.length">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium text-text-primary">{{ column.title }}</span>
          <span class="text-sm text-text-muted">{{ column.items.length }}</span>
        </div>
      </slot>
    </div>
    <div class="KanbanColumn__Body flex-1 overflow-y-auto p-2 min-h-[200px] flex flex-col">
      <DndList
        :model-value="column.items"
        :item-key="itemKey"
        :group="dndGroup"
        tag="div"
        class="space-y-2 min-h-full flex-1"
        :disabled="disabled"
        :empty-insert-threshold="40"
        @update:model-value="onListChange"
        @change="onDndChange"
      >
        <template #item="{ element }">
          <slot name="card" :item="element" :column="column">
            <div class="rounded-lg border border-border-default bg-bg-primary p-3 text-sm">
              {{ element }}
            </div>
          </slot>
        </template>
      </DndList>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { DndList } from '@/shared/ui/Dnd'
  import type { KanbanColumnModel } from './KanbanBoard.types'

  const props = withDefaults(
    defineProps<{
      column: KanbanColumnModel
      itemKey?: string | ((item: unknown) => string)
      dndGroup?: string
      disabled?: boolean
    }>(),
    {
      dndGroup: 'kanban',
      disabled: false,
    },
  )

  const emit = defineEmits<{
    'update:column': [column: KanbanColumnModel]
    'move': [payload: { item: unknown; fromColumnId?: string; toColumnId?: string }]
  }>()

  const columnColorStyle = computed(() => {
    if (!props.column.color) return {}
    return {
      '--kanban-column-accent': props.column.color,
      borderTopColor: props.column.color,
      borderTopWidth: '3px',
    }
  })

  function onListChange(newItems: unknown[]) {
    emit('update:column', { ...props.column, items: newItems })
  }

  function onDndChange(evt: { added?: { element: unknown }; removed?: { element: unknown }; moved?: { element: unknown } }) {
    if (evt.added) {
      emit('move', { item: evt.added.element, toColumnId: props.column.id })
    }
    if (evt.removed) {
      emit('move', { item: evt.removed.element, fromColumnId: props.column.id })
    }
  }
</script>
