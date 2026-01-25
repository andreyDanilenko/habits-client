<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'cursor-pointer inline-flex flex-row items-center rounded-lg font-medium transition-colors',
      customClass && customClass.includes('justify-') ? '' : 'justify-center',
      'focus:outline-none',
      props.variant !== 'ghost' && props.variant !== 'link' && props.variant !== 'icon'
        ? 'focus:ring-1 focus:ring-offset-0 focus:ring-indigo-300'
        : '',
      'disabled:opacity-50 disabled:cursor-not-allowed relative',
      iconOnly ? 'p-1 rounded' : sizeClasses,
      variantClasses,
      customClass,
    ]"
    @click="handleClick"
  >
    <!-- Спиннер при загрузке -->
    <Spinner v-if="loading" class="w-4 h-4 mr-2" />

    <!-- Иконка слева -->
    <component v-if="leftIcon" :is="leftIcon" :size="iconSize" :class="iconOnly ? '' : 'mr-2'" />

    <!-- Основной контент -->
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
        default: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:hover:text-gray-400 disabled:hover:bg-transparent',
        danger: 'text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent',
        success: 'text-gray-400 hover:text-green-600 hover:bg-green-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent',
        warning: 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent',
        info: 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent',
      }
      return `p-1 rounded ${iconColorClasses[props.iconColor]}`
    }

    const baseVariants: Record<NonNullable<Props['variant']>, string> = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:hover:bg-indigo-600 disabled:active:bg-indigo-600',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-gray-100 disabled:active:bg-gray-100',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:hover:bg-transparent disabled:active:bg-transparent',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-0 disabled:hover:bg-transparent disabled:active:bg-transparent',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:hover:bg-red-600 disabled:active:bg-red-600',
      icon: '',
      link: 'bg-transparent text-indigo-600 hover:text-indigo-700 focus:ring-0 disabled:hover:text-indigo-600',
    }

    return baseVariants[props.variant ?? 'primary']
  })

  // Маппинг размера кнопки к размеру иконки
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
