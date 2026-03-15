<template>
  <div class="app-layout bg-bg-secondary flex flex-col overflow-hidden">
    <AppHeader v-if="showHeader" :sidebar-ref="sidebarRef" />
    <div class="flex flex-1 min-h-0 overflow-hidden items-stretch">
      <AppSidebar v-if="showHeader" ref="sidebarRef" />
      <main
        class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain"
        :class="[showHeader ? 'bg-bg-primary' : 'bg-bg-secondary']"
      >
        <div :class="contentClass">
          <div
            v-if="showHeader && !currentWorkspace"
            class="flex flex-col items-center justify-center min-h-[50vh] px-(--spacing-6)"
          >
            <p class="text-text-secondary text-center mb-(--spacing-4)">
              У вас пока нет workspace. Создайте своё или дождитесь приглашения.
            </p>
            <Button :left-icon="PlusIcon" @click="openCreateModal"> Создать workspace </Button>
          </div>
          <div
            v-else-if="showHeader && currentWorkspace && hasNoPermissions"
            class="flex flex-col items-center justify-center min-h-[50vh] px-(--spacing-6)"
          >
            <h2 class="text-text-primary text-xl font-medium mb-(--spacing-2)">
              У вас пока нет доступа к воркспейсу
            </h2>
            <p class="text-text-secondary text-center max-w-md">
              Обратитесь к администратору workspace, чтобы получить права доступа.
            </p>
          </div>
          <template v-else>
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component v-if="Component" :is="Component" :key="route.fullPath" />
              </transition>
            </router-view>
          </template>
        </div>
      </main>
    </div>
    <ModalProvider />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { PlusIcon } from '@/shared/ui/icon'
  import { AppHeader } from '@/widgets/header'
  import { AppSidebar } from '@/widgets/sidebar'
  import { Button } from '@/shared/ui'
  import ModalProvider from '@/app/providers/ModalProvider.vue'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { useAuthStore } from '@/features/auth'
  import { useModal } from '@/shared/lib/modal'
  import { WorkspaceCreateModal } from '@/features/workspace'
  import { useRealtime } from '@/shared/realtime'
  import { useHabitStore } from '@/entities/habit'
  import { useNotificationsStore } from '@/features/notifications'

  const route = useRoute()
  const workspaceStore = useWorkspaceStore()
  const authStore = useAuthStore()
  const habitStore = useHabitStore()

  const { on } = useRealtime()
  useNotificationsStore()
  on('habit.completed', () => habitStore.fetchHabits())
  on('habit.created', () => habitStore.fetchHabits())
  on('habit.updated', () => habitStore.fetchHabits())
  on('habit.deleted', () => habitStore.fetchHabits())
  on('invitation.accepted', () => workspaceStore.fetchWorkspaces())
  const { openModal } = useModal()

  const showHeader = computed(
    () =>
      route.name !== 'Login' &&
      route.name !== 'Register' &&
      route.name !== 'VerifyEmail' &&
      route.name !== 'Invite',
  )
  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const hasNoPermissions = computed(
    () =>
      authStore.effectivePermissions !== null &&
      (authStore.effectivePermissions?.permissions?.length ?? 0) === 0,
  )
  const sidebarRef = ref<InstanceType<typeof AppSidebar> | null>(null)

  const contentClass = computed(() => {
    return showHeader.value ? 'mx-auto px-(--spacing-6) py-(--spacing-6) md:py-(--spacing-8)' : ''
  })

  const openCreateModal = () => {
    openModal({
      component: WorkspaceCreateModal,
      onConfirm: (workspace: any) => {
        if (workspace) {
          workspaceStore.addWorkspace(workspace)
          workspaceStore.switchWorkspace(workspace.id)
        }
      },
    })
  }
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
</style>
