<template>
  <div class="relative">
    <Tooltip variant="dropdown" trigger="click" placement="bottom" width="256px">
      <template #trigger>
        <button
          class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div
            class="w-6 h-6 rounded"
            :style="{ backgroundColor: currentWorkspace?.color || '#6366f1' }"
          />
          <span class="text-sm font-medium text-gray-700 hidden md:inline">
            {{ currentWorkspace?.name || 'Workspace' }}
          </span>
          <ChevronDownIcon class="w-4 h-4 text-gray-400" />
        </button>
      </template>

      <div class="w-64 bg-white rounded-lg shadow-lg border">
        <!-- Заголовок -->
        <div class="px-4 py-3 border-b">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-700">Рабочие пространства</p>
            <button
              @click.stop="openWorkspaceSettings"
              class="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              <CogIcon class="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <!-- Список workspace -->
        <div class="max-h-64 overflow-auto">
          <button
            v-for="workspace in workspaces"
            :key="workspace.id"
            type="button"
            @click.stop="switchWorkspace(workspace.id)"
            class="w-full flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
            :class="{ 'bg-indigo-50': workspace.id === currentWorkspace?.id }"
          >
            <span
              class="mr-3 w-4 h-4 rounded"
              :style="{ backgroundColor: workspace.color || '#6366f1' }"
            />
            <span class="flex-1 text-left truncate">
              {{ workspace.name }}
            </span>
            <span v-if="workspace.id === currentWorkspace?.id" class="ml-2">
              <CheckIcon class="w-4 h-4 text-indigo-600" />
            </span>
          </button>
        </div>

        <!-- Действия -->
        <div class="border-t p-2">
          <button
            @click.stop="openCreateModal"
            class="w-full flex items-center justify-center px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            type="button"
          >
            <PlusIcon class="w-4 h-4 mr-2" />
            Создать workspace
          </button>
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
  import { Tooltip } from '@/shared/ui'
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
