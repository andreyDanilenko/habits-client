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
      <draggable
        v-model="column.items"
        item-key="id"
        animation="200"
        :group="{ name: dndGroup || 'deals' }"
        tag="div"
        class="space-y-2 min-h-full flex-1"
        @start="() => console.log('KANBAN START', column.id)"
        @end="() => console.log('KANBAN END', column.id)"
        @change="
          (e) => {
            console.log('KANBAN CHANGE', column.id, e)
            onDndChange(e)
          }
        "
      >
        <template #item="{ element }">
          <div>
            <slot name="card" :item="element" :column="column">
              {{ element }}
            </slot>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import draggable from 'vuedraggable'
  import type { KanbanColumnModel } from './KanbanBoard.types'

  const props = withDefaults(
    defineProps<{
      column: KanbanColumnModel
      dndGroup?: string
    }>(),
    {
      dndGroup: 'deals',
    },
  )

  const emit = defineEmits<{
    move: [payload: { item: unknown; fromColumnId?: string; toColumnId?: string }]
  }>()

  const columnColorStyle = computed(() =>
    props.column.color
      ? {
          '--kanban-column-accent': props.column.color,
          borderTopColor: props.column.color,
          borderTopWidth: '3px',
        }
      : {},
  )

  function onDndChange(evt: {
    added?: { element: unknown }
    removed?: { element: unknown }
    moved?: { element: unknown }
  }) {
    console.log()

    if (evt.added) emit('move', { item: evt.added.element, toColumnId: props.column.id })
    if (evt.removed) emit('move', { item: evt.removed.element, fromColumnId: props.column.id })
  }
</script>
