<template>
  <div class="relative">
    <button
      class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      @click="toggleDropdown"
    >
      <div
        class="w-6 h-6 rounded"
        :style="{ backgroundColor: currentWorkspace?.color || '#6366f1' }"
      />
      <span class="text-sm font-medium text-gray-700 hidden md:inline">
        {{ currentWorkspace?.name || 'Workspace' }}
      </span>
    </button>

    <!-- Dropdown заглушка -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border"
    >
      <div class="p-2">
        <p v-for="workspace in workspaces" :key="workspace.id" class="text-xs text-gray-500 px-2 py-1">
          {{ workspace.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useWorkspaceStore } from '@/entities/workspace/model/workspace-store'

  const workspaceStore = useWorkspaceStore()
  const showDropdown = ref(false)

  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
  const workspaces = computed(() => workspaceStore.workspaces)
  
  const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value
  }
</script>
