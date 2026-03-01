<template>
  <VueDraggableNext
    v-model="model"
    :item-key="itemKey"
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
    <!-- Библиотека использует только default-слот: ожидает массив дочерних узлов (по одному на элемент списка) -->
    <template #default>
      <template v-for="(element, index) in props.modelValue" :key="getItemKey(element, index)">
        <slot name="item" :element="element" :index="index" />
      </template>
    </template>
  </VueDraggableNext>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { VueDraggableNext } from 'vue-draggable-next'

  /**
   * Обёртка над vue-draggable-next для использования по принципу чистой архитектуры.
   * Библиотека DnD изолирована в shared — страницы и фичи используют только этот компонент.
   */
  const props = withDefaults(
    defineProps<{
      /** Массив элементов (v-model) */
      modelValue: unknown[]
      /** Ключ элемента для key (id или функция) */
      itemKey?: string | ((item: unknown) => string)
      /** Имя группы для перетаскивания между списками (одинаковое у связанных колонок) */
      group?: string
      /** HTML-тег контейнера */
      tag?: string
      /** Анимация в ms */
      animation?: number
      /** Отключить перетаскивание */
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
    'update:modelValue': [value: unknown[]]
    change: [event: { added?: { element: unknown }; removed?: { element: unknown }; moved?: { element: unknown } }]
  }>()

  const model = computed({
    get: () => props.modelValue,
    set: (value: unknown[]) => emit('update:modelValue', value),
  })

  function getItemKey(item: unknown, index: number): string {
    if (props.itemKey === undefined) return String(index)
    if (typeof props.itemKey === 'function') return props.itemKey(item)
    const obj = item as Record<string, unknown>
    return String(obj?.[props.itemKey] ?? index)
  }

  function onChange(evt: { added?: { element: unknown }; removed?: { element: unknown }; moved?: { element: unknown } }) {
    emit('change', evt)
  }

  defineExpose({ getItemKey })
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
