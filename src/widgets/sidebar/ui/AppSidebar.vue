<template>
  <div>
    <!-- Mobile Overlay (как в модальном окне) -->
    <Transition name="fade">
      <div
        v-if="isMobile && isOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="closeSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="bg-white border-r border-gray-300 transition-all duration-300 flex-shrink-0 z-50 flex flex-col"
      :class="sidebarClasses"
    >
      <nav class="p-4 space-y-4 flex flex-col h-full overflow-y-auto">
        <!-- Кнопки управления -->
        <div class="flex justify-end mb-2 flex-shrink-0">
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

              <div class="mb-4 flex-shrink-0">
          <h3
            v-if="!isCollapsed"
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3"
          >
            Workspaces
          </h3>
        <div v-if="!isCollapsed" class="w-full mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
          <WorkspaceSwitcher />
        </div>
        <div v-else class="mb-4 pb-4 border-b border-gray-200 flex justify-center flex-shrink-0">
          <div
            class="w-8 h-8 rounded flex-shrink-0 cursor-pointer"
            :style="{ backgroundColor: currentWorkspace?.color || '#6366f1' }"
            :title="currentWorkspace?.name || 'Workspace'"
          />
        </div>
        </div>

        <div class="mb-4 flex-shrink-0">
          <h3
            v-if="!isCollapsed"
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3"
          >
            Модули
          </h3>

          <Button
            v-for="module in availableModules"
            :key="module.id"
            @click="selectModule(module.id)"
            variant="ghost"
            size="lg"
            :left-icon="module.icon"
            :icon-only="isCollapsed"
            :custom-class="`w-full ${isCollapsed ? 'justify-center' : 'justify-start'} ${selectedModuleId === module.id ? 'bg-indigo-50 text-indigo-600 font-medium' : ''}`"
          >
            <span v-if="!isCollapsed">{{ module.label }}</span>
          </Button>
        </div>

        <div
          v-if="selectedModule && getModuleRoutes(selectedModule).length > 0"
          class="mb-4 flex-1 min-h-0 overflow-y-auto"
        >
          <h3
            v-if="!isCollapsed"
            class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3"
          >
            {{ selectedModule.label }}
          </h3>
        <div class="grid gap-1">
          <NavLink
            v-for="route in getModuleRoutes(selectedModule)"
            :key="route.path"
            :to="route.path"
            variant="default"
            size="md"
            :left-icon="route.icon"
            :icon-only="isCollapsed"
            :custom-class="`w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`"
            @click="handleMobileClick"
          >
            <span v-if="!isCollapsed">{{ route.label }}</span>
          </NavLink>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-4 mt-auto flex-shrink-0">
          <NavLink
            v-if="isOwner"
            to="/workspace-settings"
            variant="default"
            size="md"
            :left-icon="CogIcon"
            :icon-only="isCollapsed"
            :custom-class="`w-full mb-2 ${isCollapsed ? 'justify-center' : 'justify-start'}`"
            @click="handleMobileClick"
          >
            <span v-if="!isCollapsed">Настройки воркспейса</span>
          </NavLink>

          <Button
            @click="handleLogout"
            variant="ghost"
            size="md"
            :left-icon="LogoutIcon"
            :icon-only="isCollapsed"
            :custom-class="`w-full text-red-600 hover:bg-red-50 ${isCollapsed ? 'justify-center' : 'justify-start'}`"
          >
            <span v-if="!isCollapsed" class="font-medium">Выйти</span>
          </Button>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon, CogIcon, LogoutIcon } from '@/shared/ui/icon'
  import { Button, NavLink } from '@/shared/ui'
  import { useAuthStore } from '@/features/auth'
  import { usePermissions, useWorkspaceStore } from '@/entities/workspace'
  import { getAvailableModules, getAvailableModuleRoutes, type Module } from '@/app/modules/config'
  import WorkspaceSwitcher from '@/widgets/header/ui/WorkspaceSwitcher.vue'

  const route = useRoute()
  const router = useRouter()
  const authStore = useAuthStore()
  const { hasPermission, isOwner } = usePermissions()
  const workspaceStore = useWorkspaceStore()

  const isCollapsed = ref(false)
  const isMobile = ref(false)
  const isOpen = ref(false)
  const selectedModuleId = ref<string | null>(null)

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const availableModules = computed(() => getAvailableModules(hasPermission))
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

  // Функция для определения модуля по роуту
  const detectModuleFromRoute = () => {
    const currentPath = route.path
    for (const module of availableModules.value) {
      if (currentPath.startsWith(module.basePath)) {
        selectedModuleId.value = module.id
        return
      }
    }
    // Если модуль не найден, выбираем первый доступный
    if (availableModules.value.length > 0 && !selectedModuleId.value) {
      selectedModuleId.value = availableModules.value[0].id
    }
  }

  // Обновляем selectedModuleId при изменении роута
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

  // Проверка размера экрана
  const checkMobile = () => {
    const wasMobile = isMobile.value
    isMobile.value = window.innerWidth < 1024
    // Закрываем sidebar при переходе с мобильного на desktop
    if (wasMobile && !isMobile.value) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    // Загружаем состояние collapsed из localStorage
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      isCollapsed.value = saved === 'true'
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  // Сохраняем состояние collapsed
  const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebar-collapsed', String(isCollapsed.value))
  }

  const closeSidebar = () => {
    isOpen.value = false
  }

  const handleMobileClick = () => {
    if (isMobile.value) {
      closeSidebar()
    }
  }

  const handleLogout = async () => {
    await authStore.logout()
    router.push('/login')
  }

  const sidebarClasses = computed(() => {
    const isPublicPage = route.name === 'Login' || route.name === 'Register'
    if (isPublicPage) return 'hidden'

    if (isMobile.value) {
      return [
        'fixed top-0 left-0 h-screen transition-transform duration-300 ease-in-out',
        isOpen.value ? 'translate-x-0' : '-translate-x-full',
        'w-64',
      ].join(' ')
    }

    return ['h-full transition-all duration-300', isCollapsed.value ? 'w-16' : 'w-64'].join(' ')
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

  @media (min-width: 1024px) {
    aside {
      height: 100%;
    }
  }
</style>
