<template>
  <div class="flex items-start gap-(--spacing-2) shrink-0">
    <a
      v-if="previewUrl"
      :href="previewUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="shrink-0 block rounded overflow-hidden border border-border-light hover:border-primary-default/50 transition-colors"
    >
      <img
        v-if="objectUrl"
        :src="objectUrl"
        :alt="alt"
        class="w-20 h-20 object-cover"
        loading="lazy"
      />
      <div
        v-else-if="error"
        class="w-20 h-20 flex items-center justify-center bg-bg-tertiary text-text-muted text-2xl"
      >
        🖼
      </div>
      <div v-else class="w-20 h-20 flex items-center justify-center bg-bg-tertiary text-text-muted">
        <span class="text-[10px]">...</span>
      </div>
    </a>
    <div
      v-else
      class="shrink-0 w-20 h-20 flex items-center justify-center bg-bg-tertiary text-text-muted"
    >
      <span class="text-[10px]">...</span>
    </div>
    <slot name="link" :preview-url="previewUrl" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { taskService } from '@/entities/task'

  const props = defineProps<{
    workspaceId: string
    taskId: string
    attachmentId: string
    alt?: string
  }>()

  const previewUrl = ref<string | null>(null)
  const objectUrl = ref<string | null>(null)
  const error = ref(false)

  async function fetchTokenAndLoad() {
    previewUrl.value = null
    objectUrl.value = null
    error.value = false
    try {
      const { url } = await taskService.getPreviewToken(
        props.workspaceId,
        props.taskId,
        props.attachmentId,
      )
      previewUrl.value = url
      const res = await fetch(url, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load')
      const blob = await res.blob()
      objectUrl.value = URL.createObjectURL(blob)
    } catch {
      error.value = true
    }
  }

  onMounted(fetchTokenAndLoad)
  watch(() => [props.workspaceId, props.taskId, props.attachmentId], fetchTokenAndLoad)
  onUnmounted(() => {
    if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
  })
</script>
