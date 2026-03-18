<template>
  <div class="grid gap-1">
    <template v-for="item in items">
      <NavLink
        v-if="item.to"
        :key="`nav-link-${item.id}`"
        :to="item.to"
        variant="default"
        size="sm"
        :left-icon="item.icon"
        :icon-only="collapsed"
        :icon-stroke-width="collapsed ? 1 : undefined"
        :is-active="item.isActive"
        :custom-class="`w-full ${collapsed ? 'justify-center' : 'justify-start'}`"
        @click="handleItemClick(item)"
      >
        <span v-if="!collapsed">{{ item.label }}</span>
      </NavLink>
      <Button
        v-else
        :key="`nav-button-${item.id}`"
        :variant="item.variant === 'danger' ? 'ghost' : 'ghost'"
        size="sm"
        :icon-size="collapsed ? 'lg' : 'sm'"
        :left-icon="item.icon"
        :icon-only="collapsed"
        :icon-stroke-width="collapsed ? 1 : undefined"
        :custom-class="
          [
            'w-full',
            collapsed
              ? 'justify-center !h-(--size-8) !w-(--size-8) !min-h-(--size-8) !min-w-(--size-8)'
              : 'justify-start !min-h-0 px-(--spacing-3) py-(--spacing-2)',
            item.isActive ? 'bg-bg-tertiary text-primary-default font-medium' : '',
            item.variant === 'danger' ? 'text-error-default hover:bg-error-light' : '',
          ]
            .filter(Boolean)
            .join(' ')
        "
        @click="handleItemClick(item)"
      >
        <span
          v-if="!collapsed"
          :class="{ 'font-medium': item.variant === 'danger' || item.isActive }"
        >
          {{ item.label }}
        </span>
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { Button, NavLink } from '@/shared/ui'
  import type { SidebarNavItem } from '../types'

  interface Props {
    items: SidebarNavItem[]
    collapsed?: boolean
  }

  withDefaults(defineProps<Props>(), {
    collapsed: false,
  })

  const emit = defineEmits<{
    click: []
    'item-click': [item: SidebarNavItem]
  }>()

  const handleItemClick = (item: SidebarNavItem) => {
    if (item.onClick) {
      item.onClick()
    }
    emit('click')
    emit('item-click', item)
  }
</script>
