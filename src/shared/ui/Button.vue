<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
    @click="handleClick"
  >
    <Spinner v-if="loading" class="w-4 h-4 mr-2" />
    <slot />
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Spinner from './Spinner.vue'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
  })

  const emit = defineEmits<{
    click: [e: MouseEvent]
  }>()

  const sizeClasses = computed(
    () =>
      ({
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      })[props.size],
  )

  const variantClasses = computed(
    () =>
      ({
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
        outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
        ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      })[props.variant],
  )

  const handleClick = (e: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', e)
    }
  }
</script>
