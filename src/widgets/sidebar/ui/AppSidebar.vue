<template>
  <div>
    <Transition name="fade">
      <div
        v-if="isMobile && isOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <aside
      class="bg-bg-primary border-r border-border-default transition-all duration-300 flex-shrink-0 z-50 flex flex-col"
      :class="sidebarClasses"
    >
      <nav class="p-(--spacing-4) flex flex-col h-full sidebar-nav">
        <div class="flex justify-end mb-(--spacing-4) flex-shrink-0">
          <Button
            v-if="isMobile"
            @click="closeSidebar"
            variant="icon"
            icon-only
            :left-icon="XMarkIcon"
            aria-label="Закрыть меню"
          />
          <Button
            v-else
            @click="toggleCollapsed"
            variant="icon"
            icon-only
            :left-icon="isCollapsed ? ArrowRightIcon : ArrowLeftIcon"
            :title="isCollapsed ? 'Развернуть' : 'Свернуть'"
          />
        </div>

        <div class="mb-(--spacing-4) pb-(--spacing-4) border-b border-border-light flex-shrink-0">
          <div v-if="!isCollapsedEffective" class="w-full">
            <SidebarSectionHeader title="Workspaces" :collapsed="isCollapsedEffective" />
            <WorkspaceSwitcher />
          </div>
          <div v-else class="flex justify-center">
            <div
              class="w-(--size-8) h-(--size-8) rounded-(--radius-md) flex-shrink-0 cursor-pointer"
              :style="{
                backgroundColor: currentWorkspace?.color || 'var(--color-primary-default)',
              }"
              :title="currentWorkspace?.name || 'Workspace'"
            />
          </div>
        </div>

        <div class="mb-(--spacing-4) flex-shrink-0">
          <SidebarSectionHeader title="Модули" :collapsed="isCollapsedEffective" />
          <SidebarNavigation
            :items="modulesNavItems"
            :collapsed="isCollapsedEffective"
            @click="handleMobileClick"
            @item-click="handleModuleClick"
          />
        </div>

        <div
          v-if="selectedModule && getModuleRoutes(selectedModule).length > 0"
          class="mb-(--spacing-4) flex-1 min-h-0 overflow-y-auto"
        >
          <SidebarSectionHeader :title="selectedModule.label" :collapsed="isCollapsedEffective" />
          <SidebarNavigation
            :items="moduleRoutesNavItems"
            :collapsed="isCollapsedEffective"
            @click="handleMobileClick"
          />
        </div>

        <div
          class="border-t border-border-light pt-(--spacing-4) mt-auto flex-shrink-0 sidebar-footer"
        >
          <SidebarNavigation
            :items="footerNavItems"
            :collapsed="isCollapsedEffective"
            @click="handleMobileClick"
          />
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import {
    ArrowLeftIcon,
    ArrowRightIcon,
    XMarkIcon,
    CogIcon,
    LogoutIcon,
    ListIcon,
  } from '@/shared/ui/icon'
  import { Button } from '@/shared/ui'
  import { useAuthStore } from '@/features/auth'
  import { useUserStore } from '@/entities/user'
  import { usePermissions, useWorkspaceStore } from '@/entities/workspace'
  import { getAvailableModules, getAvailableModuleRoutes, type Module } from '@/app/modules/config'
  import WorkspaceSwitcher from '@/widgets/header/ui/WorkspaceSwitcher.vue'
  import SidebarSectionHeader from './SidebarSectionHeader.vue'
  import SidebarNavigation from './SidebarNavigation.vue'
  import type { SidebarNavItem } from '../types'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { hasPermission, isOwner, isAdmin } = usePermissions()
  const workspaceStore = useWorkspaceStore()

  const isCollapsed = ref(false)
  const isMobile = ref(false)
  const isOpen = ref(false)
  const selectedModuleId = ref<string | null>(null)

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const enabledModuleCodes = computed(() => workspaceStore.enabledModules)
  const availableModules = computed(() =>
    getAvailableModules(enabledModuleCodes.value, hasPermission),
  )

  // На мобильных всегда показываем развёрнутый сайдбар (текст не скрываем)
  const isCollapsedEffective = computed(() => !isMobile.value && isCollapsed.value)
  const selectedModule = computed(() => {
    if (selectedModuleId.value) {
      return availableModules.value.find((m) => m.id === selectedModuleId.value) || null
    }

    const currentPath = route.path
    for (const module of availableModules.value) {
      if (currentPath.startsWith(module.basePath)) {
        return module
      }
    }
    return availableModules.value[0] || null
  })

  const detectModuleFromRoute = () => {
    const currentPath = route.path
    for (const module of availableModules.value) {
      if (currentPath.startsWith(module.basePath)) {
        selectedModuleId.value = module.id
        return
      }
    }
    if (availableModules.value.length > 0 && !selectedModuleId.value) {
      selectedModuleId.value = availableModules.value[0].id
    }
  }

  watch(
    () => route.path,
    () => {
      detectModuleFromRoute()
    },
    { immediate: true },
  )

  watch(
    () => availableModules.value,
    () => {
      detectModuleFromRoute()
    },
    { immediate: true },
  )

  const getModuleRoutes = (module: Module) => {
    return getAvailableModuleRoutes(module, hasPermission)
  }

  const selectModule = (moduleId: string) => {
    selectedModuleId.value = moduleId
    const module = availableModules.value.find((m) => m.id === moduleId)
    if (module) {
      const routes = getModuleRoutes(module)
      if (routes.length > 0) {
        router.push(routes[0].path)
      }
    }
  }

  const modulesNavItems = computed<SidebarNavItem[]>(() => {
    return availableModules.value.map((module) => {
      const routes = getModuleRoutes(module)
      const firstRoute = routes.length > 0 ? routes[0].path : undefined
      return {
        id: module.id,
        label: module.label,
        icon: module.icon,
        to: firstRoute,
        onClick: firstRoute ? undefined : () => selectModule(module.id),
        isActive: selectedModuleId.value === module.id,
      }
    })
  })

  const moduleRoutesNavItems = computed<SidebarNavItem[]>(() => {
    if (!selectedModule.value) return []
    return getModuleRoutes(selectedModule.value).map((route) => ({
      id: route.path,
      label: route.label,
      icon: route.icon,
      to: route.path,
    }))
  })

  const footerNavItems = computed<SidebarNavItem[]>(() => {
    const items: SidebarNavItem[] = []
    const userStore = useUserStore()
    const isGlobalAdmin =
      userStore.currentUser?.role === 'ADMIN' ||
      (typeof userStore.currentUser?.role === 'string' &&
        userStore.currentUser.role.toUpperCase() === 'ADMIN')
    if (isGlobalAdmin) {
      items.push({
        id: 'admin',
        label: 'Админ-панель',
        icon: ListIcon,
        to: '/admin',
      })
    }
    if (isOwner.value || isAdmin.value || isGlobalAdmin) {
      items.push({
        id: 'workspace-settings',
        label: 'Воркспейс',
        icon: CogIcon,
        to: '/workspace-settings',
      })
    }
    items.push({
      id: 'logout',
      label: 'Выйти',
      icon: LogoutIcon,
      onClick: handleLogout,
      variant: 'danger',
    })
    return items
  })

  const checkMobile = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth < 1024
    if (wasMobile && !isMobile.value) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  }

  const closeSidebar = () => {
    isOpen.value = false
  }

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }

  const handleMobileClick = () => {
    if (isMobile.value) {
      closeSidebar()
    }
  }

  const handleModuleClick = (item: SidebarNavItem) => {
    const module = availableModules.value.find((m) => m.id === item.id)
    if (module) {
      selectedModuleId.value = module.id
    }
  }

  const sidebarClasses = computed(() => {
    const isPublicPage = route.name === 'Login' || route.name === 'Register'
    if (isPublicPage) return 'hidden'

    if (isMobile.value) {
      return [
        'fixed top-0 left-0 h-dvh h-screen transition-transform duration-300 ease-in-out',
        isOpen.value ? 'translate-x-0' : '-translate-x-full',
        'w-(--layout-sidebar-width)',
      ].join(' ')
    }

    return [
      'h-full transition-all duration-300',
      isCollapsed.value ? 'w-(--layout-sidebar-width-collapsed)' : 'w-(--layout-sidebar-width)',
    ].join(' ')
  })

  // Закрываем sidebar при изменении маршрута на мобильных
  watch(
    () => route.path,
    () => {
      if (isMobile.value) {
        closeSidebar()
      }
    },
  )

  // Экспортируем методы для управления sidebar извне
  defineExpose({
    open: () => {
      isOpen.value = true
    },
    close: closeSidebar,
    toggle: () => {
      isOpen.value = !isOpen.value
    },
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .sidebar-nav {
    padding-bottom: max(1rem, env(safe-area-inset-bottom), 34px);
  }

  .sidebar-footer {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom), 50px);
  }

  @media (max-width: 1023px) {
    aside {
      padding-bottom: max(env(safe-area-inset-bottom), 50px);
    }
  }

  @media (min-width: 1024px) {
    aside {
      height: 100%;
    }
  }
</style>
