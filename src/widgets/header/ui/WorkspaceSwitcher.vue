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
      
      <div class="p-2">
        <p
          v-for="workspace in workspaces"
          :key="workspace.id"
          class=" text-xs text-gray-500 px-2 py-1"
        >
          {{ workspace.name }}
        </p>
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
