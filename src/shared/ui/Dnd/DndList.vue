<template>
  <draggable
    v-model="model"
    :item-key="resolvedItemKey"
    :group="group"
    :tag="tag"
    :animation="animation"
    :disabled="disabled"
    :ghost-class="ghostClass"
    :chosen-class="chosenClass"
    :drag-class="dragClass"
    :empty-insert-threshold="emptyInsertThreshold"
    v-bind="$attrs"
    @change="onChange"
  >
    <template #item="{ element, index }">
      <div>
        <slot name="item" :element="element" :index="index" />
      </div>
    </template>
  </draggable>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'

const props = withDefaults(
  defineProps<{
    modelValue: unknown[]
    itemKey?: string | ((item: unknown) => string)
    group?: string | Record<string, unknown>
    tag?: string
    animation?: number
    disabled?: boolean
    ghostClass?: string
    chosenClass?: string
    dragClass?: string
    emptyInsertThreshold?: number
  }>(),
  {
    tag: 'div',
    animation: 150,
    disabled: false,
    ghostClass: 'DndList__ghost',
    chosenClass: 'DndList__chosen',
    dragClass: 'DndList__drag',
    emptyInsertThreshold: 5,
  },
)

const emit = defineEmits<{
  'update:modelValue': [unknown[]]
  change: [
    {
      added?: { element: unknown }
      removed?: { element: unknown }
      moved?: { element: unknown }
    },
  ]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value: unknown[]) => emit('update:modelValue', value),
})

const resolvedItemKey = computed(() => {
  if (typeof props.itemKey === 'string') return props.itemKey
  if (typeof props.itemKey === 'function') return props.itemKey
  return (item: any) => (item && (item.id ?? item.key ?? item._id)) ?? String(item)
})

function onChange(evt: { added?; removed?; moved? }) {
  emit('change', evt)
}
</script>
