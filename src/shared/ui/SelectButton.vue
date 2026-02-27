<template>
  <button
    type="button"
    :class="[
      'transition-all',
      props.size === 'sm' && 'px-3 py-1.5 text-sm rounded-lg border',
      props.size === 'md' &&
        'w-10 h-10 flex items-center justify-center rounded-lg border-2 text-lg',
      props.size === 'lg' &&
        'w-12 h-12 flex items-center justify-center rounded-lg border-2 text-lg font-medium',
      props.size === 'circle' && 'w-8 h-8 rounded-full border-2',
      props.isSelected
        ? props.size === 'circle'
          ? 'border-text-primary'
          : 'border-primary-default text-primary-dark bg-primary-light'
        : props.size === 'circle'
          ? 'border-border-default'
          : 'border-border-default text-text-primary bg-bg-primary hover:bg-bg-tertiary',
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
    },
  )

  defineEmits<{
    click: []
  }>()
</script>
