<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'cursor-pointer inline-flex items-center rounded-(--radius-md) font-medium transition-colors',
      customClass && customClass.includes('justify-') ? '' : 'justify-center',
      'focus:outline-none',
      props.variant !== 'ghost' && props.variant !== 'link' && props.variant !== 'icon'
        ? 'focus:ring-1 focus:ring-offset-0 focus:ring-primary-light'
        : '',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      iconOnly ? buttonIconOnlyClasses : buttonSizeClasses,
      variantClasses,
      customClass,
    ]"
    @click="handleClick"
  >
    <Spinner v-if="loading" class="mr-2" :class="[spinnerColor, spinnerSize]" />

    <component
      v-if="leftIcon"
      :is="leftIcon"
      :size="resolvedIconSize"
      :stroke-width="iconStrokeWidth"
      :class="iconOnly ? '' : 'mr-2'"
    />

    <template v-if="!iconOnly">
      <slot />
    </template>

    <component
      v-if="rightIcon"
      :is="rightIcon"
      :size="resolvedIconSize"
      :stroke-width="iconStrokeWidth"
      :class="iconOnly ? '' : 'ml-2'"
    />
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Component } from 'vue'
  import Spinner from './Spinner.vue'

  export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon' | 'link'
    size?: ComponentSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    leftIcon?: Component
    rightIcon?: Component
    iconOnly?: boolean
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    iconColor?: 'default' | 'danger' | 'success' | 'warning' | 'info'
    iconStrokeWidth?: string | number
    customClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'lg',
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

  // Размер кнопки задаётся на корневом уровне через --size-button (mobile/desktop).
  const buttonSizeClasses = computed(() => {
    const sizes = {
      xs: 'min-h-[var(--size-button)] px-(--spacing-2) text-(--text-xs)',
      sm: 'min-h-[var(--size-button)] px-(--spacing-2) text-(--text-xs)',
      md: 'min-h-[var(--size-button)] px-(--spacing-3) text-(--text-sm)',
      lg: 'min-h-[var(--size-button)] px-(--spacing-4) text-(--text-sm)',
      xl: 'min-h-[var(--size-button)] px-(--spacing-4) text-(--text-base)',
      xxl: 'min-h-[var(--size-button)] px-(--spacing-5) text-(--text-base)',
    }
    return sizes[props.size]
  })

  const buttonIconOnlyClasses = computed(() => {
    const sizes = {
      xs: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-xs)',
      sm: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-xs)',
      md: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-xs)',
      lg: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-sm)',
      xl: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-base)',
      xxl: 'min-h-[var(--size-button)] min-w-[var(--size-button)] p-0 text-(--text-base)',
    }
    return sizes[props.size]
  })

  // ВСЁ остальное как в твоей рабочей кнопке
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
      return `rounded-full ${iconColorClasses[props.iconColor]}`
    }

    const baseVariants: Record<string, string> = {
      primary:
        'border border-transparent bg-primary-default text-white hover:bg-primary-dark active:bg-primary-darker disabled:hover:bg-primary-default disabled:active:bg-primary-default',
      secondary:
        'border border-transparent bg-bg-tertiary text-text-primary hover:bg-border-light active:bg-border-default disabled:hover:bg-bg-tertiary disabled:active:bg-bg-tertiary',
      outline:
        'border border-border-default text-text-primary hover:bg-bg-tertiary active:bg-border-light disabled:hover:bg-transparent disabled:active:bg-transparent',
      ghost:
        'border border-transparent text-text-primary hover:bg-bg-tertiary active:bg-border-light focus:ring-0 disabled:hover:bg-transparent disabled:active:bg-transparent',
      danger:
        'border border-transparent bg-error-default text-white hover:bg-error-dark active:bg-error-darker disabled:hover:bg-error-default disabled:active:bg-error-default',
      icon: '',
      link: 'border border-transparent bg-transparent text-primary-default hover:text-primary-dark focus:ring-0 disabled:hover:text-primary-default',
    }

    return baseVariants[props.variant ?? 'primary']
  })

  const spinnerColor = computed(() => {
    if (props.variant === 'primary' || props.variant === 'danger') {
      return 'text-white'
    }
    return 'text-current'
  })

  const spinnerSize = computed(() => {
    const sizes = {
      xs: 'w-3 h-3',
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-4 h-4',
      xl: 'w-4 h-4',
      xxl: 'w-5 h-5',
    }
    return sizes[props.size]
  })

  const resolvedIconSize = computed(() => {
    if (props.iconSize) return props.iconSize
    const sizes: Record<ComponentSize, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'lg',
      xxl: 'xl',
    }
    return sizes[props.size]
  })

  const handleClick = (e: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', e)
    }
  }
</script>
