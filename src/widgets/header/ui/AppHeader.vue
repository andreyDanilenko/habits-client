<template>
  <header
    class="sticky top-0 bg-bg-primary border-b border-border-default shadow-sm flex-shrink-0 z-50"
  >
    <div class="max-w-6xl mx-auto px-(--spacing-4)">
      <!-- Desktop версия -->
      <div class="hidden lg:flex items-center justify-between h-(--layout-header-height)">
        <router-link to="/" class="flex items-center gap-(--spacing-3) min-w-0">
          <img
            v-if="brandLogoUrl"
            :src="brandLogoUrl"
            alt="Company logo"
            class="block object-contain"
            :style="{ height: `${desktopLogoSize}px`, width: 'auto', maxWidth: '100%' }"
          />
          <Logo v-else :size="desktopLogoSize" />
          <span
            class="font-bold text-text-primary truncate"
            :style="{ fontSize: `calc(var(--text-xl) * ${brandScale})`, lineHeight: 'var(--text-xl--line-height)' }"
          >
            {{ brandName }}
          </span>
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
          <img
            v-if="brandLogoUrl"
            :src="brandLogoUrl"
            alt="Company logo"
            class="block object-contain"
            :style="{ height: `${mobileLogoSize}px`, width: 'auto', maxWidth: '100%' }"
          />
          <Logo v-else :size="mobileLogoSize" />
          <span
            class="font-bold text-text-primary truncate"
            :style="{ fontSize: `calc(var(--text-lg) * ${brandScale})`, lineHeight: 'var(--text-lg--line-height)' }"
          >
            {{ brandName }}
          </span>
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
  import { useWorkspaceStore } from '@/entities/workspace'
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

  const workspaceStore = useWorkspaceStore()

  const headerWidget = shallowRef<Component | null>(null)

  const currentModule = computed(() => getModuleByPath(route.path))

  const brandName = computed(() => workspaceStore.currentWorkspace?.name || 'HabitFlow')
  const brandLogoUrl = computed(() => workspaceStore.currentWorkspace?.logoUrl ?? null)
  const brandScale = computed(() => workspaceStore.currentWorkspace?.logoScale ?? 1)

  const desktopLogoSize = computed(() => Math.max(20, Math.round(32 * brandScale.value)))
  const mobileLogoSize = computed(() => Math.max(18, Math.round(28 * brandScale.value)))

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
