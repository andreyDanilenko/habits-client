<template>
  <button
    type="button"
    :class="[
      'transition-all',
      props.size === 'sm' && 'px-3 py-1.5 text-sm rounded-lg border',
      props.size === 'md' && 'w-10 h-10 flex items-center justify-center rounded-lg border-2 text-lg',
      props.size === 'lg' && 'w-12 h-12 flex items-center justify-center rounded-lg border-2 text-lg font-medium',
      props.size === 'circle' && 'w-8 h-8 rounded-full border-2',
      props.isSelected
        ? props.size === 'circle'
          ? 'border-gray-700'
          : 'border-indigo-500 text-indigo-700 bg-indigo-50'
        : props.size === 'circle'
          ? 'border-gray-300'
          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
    ]"
    :style="props.customStyle"
    @click="$emit('click')"
  >
    <slot>{{ props.label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isSelected?: boolean
    size?: 'sm' | 'md' | 'lg' | 'circle'
    label?: string
    customStyle?: Record<string, string>
  }>(),
  {
    size: 'sm',
  }
)

defineEmits<{
  click: []
}>()
</script>
