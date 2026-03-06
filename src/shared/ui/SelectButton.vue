<template>
  <button
    type="button"
    :class="[
      'transition-all flex items-center justify-center border-2 focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-2',
      sizeClasses,
      isSelectedClasses,
      customClass,
    ]"
    :style="buttonStyle"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    isSelected?: boolean
    size?: 'sm' | 'md' | 'lg' | 'circle'
    label?: string
    customClass?: string
    customStyle?: Record<string, string>
  }

  const props = withDefaults(defineProps<Props>(), {
    isSelected: false,
    size: 'sm',
    label: '',
    customClass: '',
    customStyle: () => ({}),
  })

  defineEmits<{
    click: []
  }>()

  const sizeClasses = computed(() => {
    switch (props.size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-lg'
      case 'md':
        return 'w-10 h-10 rounded-lg text-lg'
      case 'lg':
        return 'w-12 h-12 rounded-lg text-lg font-medium'
      case 'circle':
        return 'w-8 h-8 rounded-full'
      default:
        return 'px-3 py-1.5 text-sm rounded-lg'
    }
  })

  const isSelectedClasses = computed(() => {
    if (props.isSelected) {
      if (props.size === 'circle') {
        return 'border-text-primary'
      } else {
        return 'border-primary-default text-primary-dark bg-primary-light'
      }
    } else {
      if (props.size === 'circle') {
        return 'border-border-default'
      } else {
        return 'border-border-default text-text-primary bg-bg-primary hover:bg-bg-tertiary'
      }
    }
  })

  const buttonStyle = computed(() => {
    if (props.size === 'circle' && props.customStyle?.backgroundColor) {
      return {
        backgroundColor: props.customStyle.backgroundColor,
        borderColor: props.isSelected ? props.customStyle.backgroundColor : undefined,
      }
    }
    return props.customStyle
  })
</script>
