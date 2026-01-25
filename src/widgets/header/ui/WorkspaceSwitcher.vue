<template>
  <div class="relative">
    <Tooltip variant="dropdown" trigger="click" placement="bottom" width="256px">
      <template #trigger>
        <Button variant="ghost" size="md" custom-class="justify-start gap-2">
          <div
            class="w-6 h-6 rounded flex-shrink-0"
            :style="{ backgroundColor: currentWorkspace?.color || '#6366f1' }"
          />
          <span class="text-sm font-medium text-gray-700 hidden md:inline whitespace-nowrap">
            {{ currentWorkspace?.name || 'Workspace' }}
          </span>
          <ChevronDownIcon class="w-4 h-4 text-gray-400 flex-shrink-0" />
        </Button>
      </template>

      <div class="w-64 bg-white rounded-lg shadow-lg border">
        <!-- Заголовок -->
        <div class="px-4 py-3 border-b">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-700">Рабочие пространства</p>
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
            size="sm"
            @click.stop="switchWorkspace(workspace.id)"
            custom-class="w-full justify-start gap-3 !px-4 !py-2"
            :class="{ 'bg-indigo-50': workspace.id === currentWorkspace?.id }"
          >
            <span
              class="w-4 h-4 rounded flex-shrink-0"
              :style="{ backgroundColor: workspace.color || '#6366f1' }"
            />
            <span class="flex-1 text-left truncate min-w-0">
              {{ workspace.name }}
            </span>
            <span v-if="workspace.id === currentWorkspace?.id" class="flex-shrink-0">
              <CheckIcon class="w-4 h-4 text-indigo-600" />
            </span>
          </Button>
        </div>

        <!-- Действия -->
        <div class="border-t p-2">
          <Button
            @click.stop="openCreateModal"
            variant="ghost"
            size="sm"
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
