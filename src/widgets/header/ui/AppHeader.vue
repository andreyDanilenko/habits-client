<template>
  <header class="sticky top-0 bg-white border-b border-gray-300 shadow-sm flex-shrink-0 z-50">
    <div class="container mx-auto px-4">
      <!-- Desktop версия -->
      <div class="hidden lg:flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center space-x-3">
          <Logo :size="32" />
          <span class="text-xl font-bold text-gray-900"> HabitFlow </span>
        </router-link>
        <div class="flex items-center space-x-4">
          <component v-if="headerWidget" :is="headerWidget" />
          <Notifications />
          <ProfileDropdown />
        </div>
      </div>

      <!-- Mobile версия -->
      <div class="flex lg:hidden items-center justify-between h-16">
        <Button
          v-if="sidebarRef"
          @click="openSidebar"
          variant="icon"
          icon-only
          :left-icon="MenuIcon"
          aria-label="Открыть меню"
        />
        <div v-else class="w-10"></div>

        <router-link to="/" class="flex items-center space-x-2">
          <Logo :size="28" />
          <span class="text-lg font-bold text-gray-900"> HabitFlow </span>
        </router-link>

        <ProfileDropdown />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Logo, MenuIcon } from '@/shared/ui/icon'
  import { Button } from '@/shared/ui'
  import Notifications from './Notifications.vue'
  import ProfileDropdown from './ProfileDropdown.vue'
  import { getModuleByPath } from '@/app/modules/config'
  import type { ComponentPublicInstance } from 'vue'
  import type { Component } from 'vue'

  interface Props {
    sidebarRef?: ComponentPublicInstance | null
  }

  const props = defineProps<Props>()
  const route = useRoute()

  const headerWidget = ref<Component | null>(null)

  const currentModule = computed(() => getModuleByPath(route.path))

  watch(
    () => currentModule.value?.headerComponent,
    (loader) => {
      if (!loader) {
        headerWidget.value = null
        return
      }
      loader().then((m) => {
        headerWidget.value = m?.default ?? null
      })
    },
    { immediate: true },
  )

  const openSidebar = () => {
    if (props.sidebarRef && typeof (props.sidebarRef as any).open === 'function') {
      ;(props.sidebarRef as any).open()
    }
  }
</script>
