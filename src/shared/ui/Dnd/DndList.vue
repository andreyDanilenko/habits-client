<template>
  <draggable
    :list="debugList"
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
      <slot name="item" :element="element" :index="index" />
    </template>
  </draggable>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import draggable from 'vuedraggable'

  const debugList = ref([
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
  ])

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

  // мост между внешним v-model и внутренним list
  const model = computed({
    get: () => props.modelValue,
    set: (value: unknown[]) => emit('update:modelValue', value),
  })

  const resolvedItemKey = computed(() => {
    if (typeof props.itemKey === 'string') return props.itemKey
    if (typeof props.itemKey === 'function') return props.itemKey
    return (item: any) => (item && (item.id ?? item.key ?? item._id)) ?? String(item)
  })

  function onChange(evt: {
    added?: { element: unknown }
    removed?: { element: unknown }
    moved?: { element: unknown }
  }) {
    emit('change', evt)
  }
</script>

<style scoped>
  .DndList__ghost {
    opacity: 0.4;
  }
  .DndList__chosen {
    cursor: grabbing;
  }
  .DndList__drag {
    cursor: grabbing;
  }
</style>
