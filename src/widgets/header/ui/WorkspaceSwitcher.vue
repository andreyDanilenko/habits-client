<template>
  <div class="relative">
    <Tooltip variant="dropdown" trigger="click" placement="bottom" class="w-full justify-between">
      <template #trigger>
        <Button variant="ghost" custom-class="w-full justify-between gap-(--spacing-2)">
          <div
            class="w-6 h-6 rounded-(--radius-md) flex-shrink-0"
            :style="{ backgroundColor: currentWorkspace?.color || 'var(--color-primary-default)' }"
          />
          <span
            class="flex-1 min-w-0 truncate text-(--text-sm) font-medium text-text-primary text-left"
          >
            {{ currentWorkspace?.name || 'Workspace' }}
          </span>
          <ChevronDownIcon class="w-4 h-4 text-text-muted flex-shrink-0" />
        </Button>
      </template>

      <WorkspaceSwitcherContent />
    </Tooltip>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ChevronDownIcon } from '@/shared/ui/icon'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { Tooltip, Button } from '@/shared/ui'
  import WorkspaceSwitcherContent from './WorkspaceSwitcherContent.vue'

  const workspaceStore = useWorkspaceStore()
  const currentWorkspace = computed(() => workspaceStore.currentWorkspace)
</script>
