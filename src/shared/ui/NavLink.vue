<template>
  <router-link
    :to="to"
    :class="[
      'inline-flex flex-row items-center rounded-lg font-medium transition-colors',
      customClass && customClass.includes('justify-') ? '' : 'justify-start',
      'focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-indigo-300',
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
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    size: 'md',
    iconOnly: false,
    customClass: '',
    exact: false,
  })

  const route = useRoute()
  const emit = defineEmits<{
    click: [e: MouseEvent]
  }>()

  const sizeClasses = computed(() => {
    if (props.iconOnly) return 'p-1 rounded'
    return {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
    }[props.size]
  })

  const variantClasses = computed(() => {
    const baseVariants: Record<NonNullable<Props['variant']>, string> = {
      default: 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600',
      ghost: 'text-gray-700 hover:bg-gray-100',
      active: 'bg-indigo-50 text-indigo-600 font-medium',
    }
    return baseVariants[props.variant]
  })

  const activeClasses = computed(() => {
    return 'bg-indigo-50 text-indigo-600 font-medium'
  })

  const isActive = computed(() => {
    const currentPath = route.path

    if (typeof props.to === 'string') {
      if (props.exact) {
        return currentPath === props.to
      }
      // Для вложенных путей проверяем точное совпадение или начало пути
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
    if (props.iconOnly) return 'md'
    return props.size === 'lg' ? 'md' : props.size === 'sm' ? 'xs' : 'sm'
  })

  const handleClick = (e: MouseEvent) => {
    emit('click', e)
  }
</script>
