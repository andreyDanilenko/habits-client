<template>
  <div class="grid gap-1">
    <template v-for="item in items">
      <NavLink
        v-if="item.to"
        :key="`nav-link-${item.id}`"
        :to="item.to"
        variant="default"
        size="md"
        :left-icon="item.icon"
        :icon-only="collapsed"
        :is-active="item.isActive"
        :custom-class="`w-full ${collapsed ? 'justify-center' : 'justify-start'}`"
        @click="handleItemClick(item)"
      >
        <span v-if="!collapsed">{{ item.label }}</span>
      </NavLink>
      <Button
        v-else
        :key="`nav-button-${item.id}`"
        :variant="item.variant === 'danger' ? 'ghost' : item.isActive ? 'ghost' : 'ghost'"
        size="md"
        :left-icon="item.icon"
        :icon-only="collapsed"
        :custom-class="`w-full ${collapsed ? 'justify-center' : 'justify-start'} ${item.isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : ''} ${item.variant === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`"
        @click="handleItemClick(item)"
      >
        <span v-if="!collapsed" :class="{ 'font-medium': item.variant === 'danger' || item.isActive }">
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
