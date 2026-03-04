<template>
  <label class="flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer">
    <input
      type="checkbox"
      class="h-4 w-4 rounded border-border-default text-primary-default focus:ring-primary-default"
      :checked="enabled"
      @change="onToggle"
    />
    <span class="text-text-primary flex-1 min-w-0">Использовать цвет воркспейса</span>
  </label>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { themeService } from '@/shared/lib/theme.service'
  import { useWorkspaceStore } from '@/entities/workspace'

  const enabled = ref(false)
  const workspaceStore = useWorkspaceStore()

  onMounted(() => {
    enabled.value = themeService.isWorkspaceThemeEnabled()
  })

  const onToggle = (event: Event) => {
    const target = event.target as HTMLInputElement
    enabled.value = target.checked

    if (enabled.value) {
      themeService.enableWorkspaceTheme()
      themeService.applyWorkspaceTheme(workspaceStore.currentWorkspace)
    } else {
      themeService.disableWorkspaceTheme()
      themeService.applyWorkspaceTheme(null)
    }
  }
</script>

