<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'cursor-pointer inline-flex flex-row items-center rounded-lg font-medium transition-colors',
      customClass && customClass.includes('justify-') ? '' : 'justify-center',
      'focus:outline-none',
      props.variant !== 'ghost' && props.variant !== 'link' && props.variant !== 'icon'
        ? 'focus:ring-1 focus:ring-offset-0 focus:ring-primary-light'
        : '',
      'disabled:opacity-50 disabled:cursor-not-allowed relative',
      iconOnly ? 'p-1 rounded' : sizeClasses,
      variantClasses,
      customClass,
    ]"
    @click="handleClick"
  >
    <Spinner v-if="loading" class="w-4 h-4 mr-2" :class="spinnerColor" />

    <component
      v-if="leftIcon"
      :is="leftIcon"
      :size="iconSize"
      :class="iconOnly ? '' : customClass && customClass.includes('justify-center') ? '' : 'mr-2'"
    />

    <template v-if="!iconOnly">
      <slot />
    </template>

    <!-- Иконка справа -->
    <component v-if="rightIcon" :is="rightIcon" :size="iconSize" :class="iconOnly ? '' : 'ml-2'" />
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Component } from 'vue'
  import Spinner from './Spinner.vue'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon' | 'link'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean

    leftIcon?: Component
    rightIcon?: Component
    iconOnly?: boolean
    iconColor?: 'default' | 'danger' | 'success' | 'warning' | 'info'
    customClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    iconOnly: false,
    iconColor: 'default',
    customClass: '',
  })

  const emit = defineEmits<{
    click: [e: MouseEvent]
  }>()

  const sizeClasses = computed(
    () =>
      ({
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-md',
        lg: 'px-6 py-3 text-base',
      })[props.size],
  )

  const variantClasses = computed(() => {
    if (props.variant === 'icon') {
      const iconColorClasses = {
        default:
          'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary disabled:hover:text-text-muted disabled:hover:bg-transparent',
        danger:
          'text-text-muted hover:text-error-default hover:bg-error-light disabled:hover:text-text-muted disabled:hover:bg-transparent',
        success:
          'text-text-muted hover:text-success-default hover:bg-success-light disabled:hover:text-text-muted disabled:hover:bg-transparent',
        warning:
          'text-text-muted hover:text-warning-default hover:bg-warning-light disabled:hover:text-text-muted disabled:hover:bg-transparent',
        info: 'text-text-muted hover:text-info-default hover:bg-info-light disabled:hover:text-text-muted disabled:hover:bg-transparent',
      }
      return `p-1 rounded ${iconColorClasses[props.iconColor]}`
    }

    const baseVariants: Record<string, string> = {
      primary:
        'bg-primary-default text-white hover:bg-primary-dark active:bg-primary-darker disabled:hover:bg-primary-default disabled:active:bg-primary-default',
      secondary:
        'bg-bg-tertiary text-text-primary hover:bg-border-light active:bg-border-default disabled:hover:bg-bg-tertiary disabled:active:bg-bg-tertiary',
      outline:
        'border border-border-default text-text-primary hover:bg-bg-tertiary active:bg-border-light disabled:hover:bg-transparent disabled:active:bg-transparent',
      ghost:
        'text-text-primary hover:bg-bg-tertiary active:bg-border-light focus:ring-0 disabled:hover:bg-transparent disabled:active:bg-transparent',
      danger:
        'bg-error-default text-white hover:bg-error-dark active:bg-error-darker disabled:hover:bg-error-default disabled:active:bg-error-default',
      icon: '',
      link: 'bg-transparent text-primary-default hover:text-primary-dark focus:ring-0 disabled:hover:text-primary-default',
    }

    return baseVariants[props.variant ?? 'primary']
  })

  const spinnerColor = computed(() => {
    if (props.variant === 'primary' || props.variant === 'danger') {
      return 'text-white'
    }
    return 'text-current'
  })

  const iconSize = computed(() => {
    if (props.iconOnly) return 'sm'
    return props.size === 'lg' ? 'md' : props.size === 'sm' ? 'xs' : 'sm'
  })

  const handleClick = (e: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', e)
    }
  }
</script>
