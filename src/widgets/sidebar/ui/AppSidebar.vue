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
            :aria-label="actionLabel('closeMenu')"
          />
          <Button
            v-else
            @click="toggleCollapsed"
            variant="icon"
            icon-only
            :left-icon="isCollapsed ? ArrowRightIcon : ArrowLeftIcon"
            :title="isCollapsed ? actionLabel('expand') : actionLabel('collapse')"
          />
        </div>

        <!-- Desktop layout -->
        <template v-if="!isMobile">
          <div class="mb-(--spacing-4) pb-(--spacing-4) border-b border-border-light flex-shrink-0">
            <div v-if="!isCollapsedEffective" class="w-full min-w-0 overflow-hidden">
              <SidebarSectionHeader
                :title="sectionTitle('workspaces')"
                :collapsed="isCollapsedEffective"
              />
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
            <SidebarSectionHeader
              :title="sectionTitle('modules')"
              :collapsed="isCollapsedEffective"
            />
            <SidebarNavigation
              :items="modulesNavItems"
              :collapsed="isCollapsedEffective"
              @item-click="handleModuleClick"
            />
          </div>

          <div
            v-if="selectedModule"
            class="module-routes-outer mb-(--spacing-4) flex-1 min-h-0"
            :class="{ 'module-routes-outer--open': hasModuleRoutes }"
          >
            <div class="module-routes-grid">
              <div class="module-routes-inner">
                <Transition name="module-routes" mode="out-in">
                  <div
                    v-if="hasModuleRoutes"
                    :key="selectedModule.id"
                    class="module-routes-content"
                  >
                    <div class="module-routes-content-inner">
                      <div class="flex-shrink-0">
                        <SidebarSectionHeader
                          :title="selectedModuleLabel"
                          :collapsed="isCollapsedEffective"
                        />
                      </div>
                      <div class="module-routes-scroll">
                        <SidebarNavigation
                          :items="moduleRoutesNavItems"
                          :collapsed="isCollapsedEffective"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>
          </div>

          <div
            class="border-t border-border-light pt-(--spacing-4) mt-auto flex-shrink-0 sidebar-footer"
          >
            <SidebarNavigation :items="footerNavItems" :collapsed="isCollapsedEffective" />
          </div>
        </template>

        <!-- Mobile: accordion layout -->
        <template v-else>
          <div class="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto">
            <SidebarAccordion
              id="workspaces"
              :title="sectionTitle('workspaces')"
              :is-open="openAccordion === 'workspaces'"
              @toggle="toggleAccordion('workspaces')"
            >
              <WorkspaceSwitcherContent :inline="true" />
            </SidebarAccordion>

            <SidebarAccordion
              id="modules"
              :title="sectionTitle('modules')"
              :is-open="openAccordion === 'modules'"
              @toggle="toggleAccordion('modules')"
            >
              <SidebarNavigation
                :items="modulesNavItems"
                :collapsed="false"
                @item-click="handleModuleClick"
              />
            </SidebarAccordion>

            <SidebarAccordion
              v-if="selectedModule && getModuleRoutes(selectedModule).length > 0"
              :id="`routes-${selectedModule.id}`"
              :title="selectedModuleLabel"
              :is-open="openAccordion === 'routes'"
              @toggle="toggleAccordion('routes')"
            >
              <SidebarNavigation
                :items="moduleRoutesNavItems"
                :collapsed="false"
                @click="handleMobileClick"
              />
            </SidebarAccordion>

            <SidebarAccordion
              v-if="footerAccordionItems.length > 0"
              id="footer"
              :title="sectionTitle('footer')"
              :is-open="openAccordion === 'footer'"
              @toggle="toggleAccordion('footer')"
            >
              <SidebarNavigation
                :items="footerAccordionItems"
                :collapsed="false"
                @click="handleMobileClick"
              />
            </SidebarAccordion>
          </div>

          <div class="border-t border-border-light pt-(--spacing-4) mt-auto flex-shrink-0">
            <SidebarNavigation :items="footerLogoutItems" :collapsed="false" />
          </div>
        </template>
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
    IconAdmin,
  } from '@/shared/ui/icon'
  import { Button } from '@/shared/ui'
  import { useAuthStore } from '@/features/auth'
  import { useUserStore } from '@/entities/user'
  import { usePermissions, useWorkspaceStore } from '@/entities/workspace'
  import { getAvailableModules, getAvailableModuleRoutes, type Module } from '@/app/modules/config'
  import WorkspaceSwitcher from '@/widgets/header/ui/WorkspaceSwitcher.vue'
  import WorkspaceSwitcherContent from '@/widgets/header/ui/WorkspaceSwitcherContent.vue'
  import SidebarSectionHeader from './SidebarSectionHeader.vue'
  import SidebarNavigation from './SidebarNavigation.vue'
  import SidebarAccordion from './SidebarAccordion.vue'
  import { useSidebarI18n } from '../model'
  import type { SidebarNavItem } from '../types'

  const route = useRoute()
  const { sectionTitle, actionLabel, moduleLabel, routeLabel, footerLabel, translateNavItem } =
    useSidebarI18n()
  const router = useRouter()
  const authStore = useAuthStore()
  const { hasPermission, isOwner, isAdmin } = usePermissions()
  const workspaceStore = useWorkspaceStore()

  const isCollapsed = ref(false)
  const isMobile = ref(false)
  const isOpen = ref(false)
  const selectedModuleId = ref<string | null>(null)
  const openAccordion = ref<'workspaces' | 'modules' | 'routes' | 'footer' | null>(null)

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

  const hasModuleRoutes = computed(
    () => !!selectedModule.value && getModuleRoutes(selectedModule.value).length > 0,
  )

  const selectedModuleLabel = computed(() =>
    selectedModule.value ? moduleLabel(selectedModule.value.id, selectedModule.value.label) : '',
  )

  const selectModule = (moduleId: string) => {
    const module = availableModules.value.find((m) => m.id === moduleId)
    if (!module) return

    selectedModuleId.value = moduleId
    if (isMobile.value) {
      openAccordion.value = 'routes'
    }

    const routes = getModuleRoutes(module)
    const firstRoute = routes[0]
    if (firstRoute) {
      router.push(firstRoute.path)
    } else {
      router.push(module.basePath)
    }
  }

  const toggleAccordion = (section: 'workspaces' | 'modules' | 'routes' | 'footer') => {
    openAccordion.value = openAccordion.value === section ? null : section
  }

  const modulesNavItems = computed<SidebarNavItem[]>(() => {
    return availableModules.value.map((module) =>
      translateNavItem(
        {
          id: module.id,
          label: module.label,
          icon: module.icon,
          onClick: () => selectModule(module.id),
          isActive: selectedModuleId.value === module.id,
        },
        (id, fallback) => moduleLabel(id, fallback),
      ),
    )
  })

  const moduleRoutesNavItems = computed<SidebarNavItem[]>(() => {
    if (!selectedModule.value) return []
    const moduleId = selectedModule.value.id
    return getModuleRoutes(selectedModule.value).map((route) => ({
      id: route.path,
      label: routeLabel(moduleId, route.name, route.label),
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
      items.push(
        translateNavItem(
          {
            id: 'admin',
            label: 'Админ-панель',
            icon: IconAdmin,
            to: '/admin',
          },
          footerLabel,
        ),
      )
    }
    if (isOwner.value || isAdmin.value || isGlobalAdmin) {
      items.push(
        translateNavItem(
          {
            id: 'workspace-settings',
            label: 'Воркспейс',
            icon: CogIcon,
            to: '/workspace-settings',
          },
          footerLabel,
        ),
      )
    }
    items.push(
      translateNavItem(
        {
          id: 'logout',
          label: 'Выйти',
          icon: LogoutIcon,
          onClick: handleLogout,
          variant: 'danger',
        },
        footerLabel,
      ),
    )
    return items
  })

  const footerAccordionItems = computed<SidebarNavItem[]>(() =>
    footerNavItems.value.filter((item) => item.id !== 'logout'),
  )
  const footerLogoutItems = computed<SidebarNavItem[]>(() =>
    footerNavItems.value.filter((item) => item.id === 'logout'),
  )

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
      selectModule(module.id)
    }
  }

  const sidebarClasses = computed(() => {
    const isPublicPage =
      route.name === 'Login' || route.name === 'Register' || route.name === 'VerifyEmail'
    if (isPublicPage) return 'hidden'

    if (isMobile.value) {
      return [
        'fixed top-0 left-0 h-svh h-screen transition-transform duration-300 ease-in-out',
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

  .module-routes-outer .module-routes-grid {
    display: grid;
    grid-template-rows: 0fr;
    transition:
      grid-template-rows 0.3s ease-out,
      visibility 0s linear 0.3s;
    overflow: hidden;
    visibility: hidden;
  }

  .module-routes-outer--open .module-routes-grid {
    grid-template-rows: minmax(0, 1fr);
    transition:
      grid-template-rows 0.3s ease-out,
      visibility 0s linear 0s;
    visibility: visible;
  }

  .module-routes-inner {
    min-height: 0;
    overflow: hidden;
  }

  .module-routes-content {
    display: grid;
    grid-template-rows: minmax(0, 1fr);
    overflow: hidden;
  }

  .module-routes-content.module-routes-leave-active,
  .module-routes-content.module-routes-enter-active {
    transition: grid-template-rows 0.3s ease-out;
  }

  .module-routes-content.module-routes-leave-to {
    grid-template-rows: 0fr;
  }

  .module-routes-content.module-routes-enter-from {
    grid-template-rows: 0fr;
  }

  .module-routes-content.module-routes-enter-to {
    grid-template-rows: minmax(0, 1fr);
  }

  .module-routes-content-inner {
    min-height: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .module-routes-scroll {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior-y: contain;
    scrollbar-gutter: stable;
  }

  .sidebar-nav {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }

  .sidebar-footer {
    padding-bottom: env(safe-area-inset-bottom);
  }

  @media (min-width: 1024px) {
    aside {
      height: 100%;
    }
  }
</style>
