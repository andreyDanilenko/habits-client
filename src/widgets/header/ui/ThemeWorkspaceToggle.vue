<template>
  <label class="flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer">
    <Checkbox v-model="enabled" size="sm" container-class="items-center" @change="onToggle" />
    <span class="text-text-primary flex-1 min-w-0">Цвет воркспейса</span>
  </label>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { themeService } from '@/shared/lib/theme.service'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { Checkbox } from '@/shared/ui'

  const enabled = ref(false)
  const workspaceStore = useWorkspaceStore()

  onMounted(() => {
    enabled.value = themeService.isWorkspaceThemeEnabled()
  })

  const applyTheme = (value: boolean) => {
    if (value) {
      themeService.enableWorkspaceTheme()
      themeService.applyWorkspaceTheme(workspaceStore.currentWorkspace)
    } else {
      themeService.disableWorkspaceTheme()
      themeService.applyWorkspaceTheme(null)
    }
  }

  const onToggle = (value: boolean) => {
    enabled.value = value
    applyTheme(value)
  }
</script>
