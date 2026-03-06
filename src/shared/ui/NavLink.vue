<template>
  <router-link
    :to="to"
    :class="[
      'inline-flex flex-row items-center rounded-(--radius-md) font-medium transition-colors',
      customClass && customClass.includes('justify-') ? '' : 'justify-start',
      'focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-primary-light',
      sizeClasses,
      variantClasses,
      isActive ? activeClasses : '',
      customClass,
    ]"
    @click="handleClick"
  >
    <!-- Иконка слева -->
    <component
      v-if="leftIcon"
      :is="leftIcon"
      :size="iconSize"
      :class="iconOnly ? '' : customClass && customClass.includes('justify-center') ? '' : 'mr-2'"
    />

    <!-- Основной контент -->
    <template v-if="!iconOnly">
      <slot />
    </template>

    <!-- Иконка справа -->
    <component v-if="rightIcon" :is="rightIcon" :size="iconSize" :class="iconOnly ? '' : 'ml-2'" />
  </router-link>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import type { Component } from 'vue'
  import type { RouteLocationRaw } from 'vue-router'

  interface Props {
    to: RouteLocationRaw
    variant?: 'default' | 'ghost' | 'active'
    size?: 'sm' | 'md' | 'lg'
    leftIcon?: Component
    rightIcon?: Component
    iconOnly?: boolean
    customClass?: string
    exact?: boolean
    isActive?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
    iconOnly: false,
    customClass: '',
    exact: false,
    isActive: undefined,
  })

  const route = useRoute()
  const emit = defineEmits<{
    click: [e: MouseEvent]
  }>()

  const sizeClasses = computed(() => {
    if (props.iconOnly) {
      // выравниваем с buttonIconOnlyClasses по токенам
      return 'h-(--size-8) w-(--size-8) min-h-(--size-8) min-w-(--size-8) p-0 text-(--text-sm)'
    }

    const sizes: Record<string, string> = {
      sm: 'px-(--spacing-3) py-(--spacing-2) text-(--text-xs)',
      md: 'px-(--spacing-3) py-(--spacing-3) text-(--text-sm)',
      lg: 'px-(--spacing-4) py-(--spacing-3) text-(--text-base)',
    }

    return sizes[props.size]
  })

  const variantClasses = computed(() => {
    const baseVariants: Record<string, string> = {
      default: 'text-text-primary hover:bg-bg-tertiary hover:text-primary-default',
      ghost: 'text-text-primary hover:bg-bg-tertiary',
      active: 'bg-bg-tertiary text-primary-default font-medium',
    }
    return baseVariants[props.variant]
  })

  const activeClasses = computed(() => {
    return 'bg-bg-tertiary text-primary-default font-medium'
  })

  const isActive = computed(() => {
    if (props.isActive !== undefined) {
      return props.isActive
    }

    const currentPath = route.path

    if (typeof props.to === 'string') {
      if (props.exact) {
        return currentPath === props.to
      }
      if (currentPath === props.to) return true
      if (currentPath.startsWith(props.to) && currentPath[props.to.length] === '/') {
        return true
      }
      return false
    }

    if (typeof props.to === 'object' && 'name' in props.to) {
      return route.name === props.to.name
    }

    if (typeof props.to === 'object' && 'path' in props.to) {
      const path = props.to.path as string
      if (props.exact) {
        return currentPath === path
      }
      if (currentPath === path) return true
      if (currentPath.startsWith(path) && currentPath[path.length] === '/') {
        return true
      }
      return false
    }

    return false
  })

  const iconSize = computed(() => {
    // Делаем иконки в ссылках немного крупнее и выравниваем с размерами кнопок
    if (props.iconOnly) return 'lg'

    const map: Record<string, string> = {
      sm: 'sm',
      md: 'md',
      lg: 'lg',
    }

    return map[props.size] ?? 'md'
  })

  const handleClick = (e: MouseEvent) => {
    emit('click', e)
  }
</script>
