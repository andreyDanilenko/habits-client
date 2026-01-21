<template>
  <div class="relative">
    <Tooltip 
      trigger="hover"
      placement="bottom"
    >
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
        </button>
      </template>

      <div class="w-64">
        <div class="px-3 pt-3 pb-2 border-b">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Рабочие пространства
          </p>
          <p class="mt-1 text-xs text-gray-500">
            Переключайтесь между проектами и зонами фокуса.
          </p>
        </div>

        <ul class="max-h-64 overflow-auto py-1">
          <li
            v-for="workspace in workspaces"
            :key="workspace.id"
          >
            <button
              type="button"
              class="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors"
              :class="workspace.id === currentWorkspace?.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <span
                class="mr-2 w-6 h-6 rounded"
                :style="{ backgroundColor: workspace.color || '#6366f1' }"
              />
              <span class="flex-1 text-left truncate">
                {{ workspace.name }}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useWorkspaceStore } from '@/entities/workspace'
  import {Tooltip} from '@/shared/ui'

  const workspaceStore = useWorkspaceStore()
  const showDropdown = ref(false)

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const workspaces = computed(() => workspaceStore.workspaces)

  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }
</script>
