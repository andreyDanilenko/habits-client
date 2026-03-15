<template>
  <header
    class="sticky top-0 bg-bg-primary border-b border-border-default shadow-sm flex-shrink-0 z-50"
  >
    <div class="max-w-6xl mx-auto px-(--spacing-4)">
      <!-- Desktop версия -->
      <div class="hidden lg:flex items-center justify-between h-(--layout-header-height)">
        <router-link to="/" class="flex items-center gap-(--spacing-3) min-w-0">
          <Logo :size="32" />
          <span class="text-(--text-xl) font-bold text-text-primary truncate"> HabitFlow </span>
        </router-link>
        <div class="flex items-center gap-(--spacing-4) min-w-0">
          <component v-if="headerWidget" :is="headerWidget" />
          <ThemeSwitcher />
          <Notifications />
          <ProfileDropdown />
        </div>
      </div>

      <!-- Mobile версия -->
      <div class="flex lg:hidden items-center justify-between h-(--layout-header-height)">
        <Button
          v-if="sidebarRef"
          @click="openSidebar"
          variant="icon"
          icon-only
          :left-icon="MenuIcon"
          aria-label="Открыть меню"
        />
        <div v-else class="w-10"></div>

        <router-link to="/" class="flex items-center gap-(--spacing-2) min-w-0">
          <Logo :size="28" />
          <span class="text-(--text-lg) font-bold text-text-primary truncate"> HabitFlow </span>
        </router-link>

        <div class="flex items-center gap-1">
          <ThemeSwitcher />
          <Notifications />
          <ProfileDropdown />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
  import { shallowRef, watch, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Logo, MenuIcon } from '@/shared/ui/icon'
  import { Button } from '@/shared/ui'
  import ThemeSwitcher from './ThemeSwitcher.vue'
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

  const headerWidget = shallowRef<Component | null>(null)

  const currentModule = computed(() => getModuleByPath(route.path))

  watch(
    () => currentModule.value?.headerComponent,
    (loader) => {
      if (!loader) {
        headerWidget.value = null
        return
      }
      loader().then((m) => {
        const comp = m && typeof m === 'object' && 'default' in m ? m.default : m
        headerWidget.value = comp ?? null
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
