<template>
  <div class="relative">
    <Tooltip variant="dropdown" trigger="click" placement="bottom" class="w-full justify-between">
      <template #trigger>
        <Button variant="ghost" size="md" custom-class="w-full justify-between gap-(--spacing-2)">
          <div
            class="w-6 h-6 rounded-(--radius-md) flex-shrink-0"
            :style="{ backgroundColor: currentWorkspace?.color || 'var(--color-primary-default)' }"
          />
          <span class="flex-1 min-w-0 truncate text-(--text-sm) font-medium text-text-primary text-left">
            {{ currentWorkspace?.name || 'Workspace' }}
          </span>
          <ChevronDownIcon class="w-4 h-4 text-text-muted flex-shrink-0" />
        </Button>
      </template>

      <div
        class="w-64 bg-bg-primary rounded-(--radius-lg) shadow-card border border-border-default"
      >
        <!-- Заголовок -->
        <div class="px-(--spacing-4) py-(--spacing-3) border-b border-border-light">
          <div class="flex items-center justify-between">
            <p class="text-(--text-sm) font-semibold text-text-primary">Рабочие пространства</p>
            <Button
              @click.stop="openWorkspaceSettings"
              icon-only
              variant="icon"
              :left-icon="CogIcon"
            />
          </div>
        </div>

        <!-- Список workspace -->
        <div class="max-h-64 overflow-auto">
          <Button
            v-for="workspace in workspaces"
            :key="workspace.id"
            variant="ghost"
            size="md"
            @click.stop="switchWorkspace(workspace.id)"
            custom-class="w-full justify-start gap-(--spacing-3) !px-(--spacing-4) !py-(--spacing-2)"
            :class="{ 'bg-primary-light': workspace.id === currentWorkspace?.id }"
          >
            <span
              class="w-4 h-4 rounded-(--radius-sm) flex-shrink-0"
              :style="{ backgroundColor: workspace.color || 'var(--color-primary-default)' }"
            />
            <span class="flex-1 text-left truncate min-w-0 text-text-primary">
              {{ workspace.name }}
            </span>
            <span v-if="workspace.id === currentWorkspace?.id" class="flex-shrink-0">
              <CheckIcon class="w-4 h-4 text-primary-default" />
            </span>
          </Button>
        </div>

        <!-- Действия -->
        <div class="border-t border-border-light p-(--spacing-2)">
          <Button
            @click.stop="openCreateModal"
            variant="ghost"
            size="md"
            class="w-full"
            :left-icon="PlusIcon"
          >
            Создать workspace
          </Button>
        </div>
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ChevronDownIcon, CogIcon, PlusIcon, CheckIcon } from '@/shared/ui/icon'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { Tooltip, Button } from '@/shared/ui'
  import { useModal } from '@/shared/lib/modal'
  import { WorkspaceCreateModal } from '@/features/workspace'

  const router = useRouter()
  const workspaceStore = useWorkspaceStore()
  const { openModal } = useModal()

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const workspaces = computed(() => workspaceStore.workspaces)

  const switchWorkspace = async (id: string) => {
    try {
      await workspaceStore.switchWorkspace(id)
    } catch (error) {
      console.error('Failed to switch workspace:', error)
    }
  }

  const openWorkspaceSettings = () => {
    router.push('/workspace-settings')
  }

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
