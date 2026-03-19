<template>
  <TaskDetailSection title="Вложения" :placeholder="attachments.length === 0">
    <template v-if="canEdit" #action>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        multiple
        @change="handleFileSelect"
      />
      <Button
        variant="link"
        size="xs"
        custom-class="TaskAttachmentsSection__Add text-[11px]"
        :disabled="uploading"
        @click="fileInputRef?.click()"
      >
        {{ uploading ? 'Загрузка...' : '+ Добавить' }}
      </Button>
    </template>
    <div v-if="loading" class="text-(--text-xs) text-text-muted py-(--spacing-2)">
      Загрузка...
    </div>
    <ul v-else-if="attachments.length" class="space-y-(--spacing-3)">
      <li
        v-for="a in attachments"
        :key="a.id"
        class="flex items-start gap-(--spacing-2) py-(--spacing-2) group"
      >
        <template v-if="isImage(a)">
          <AttachmentImagePreview
            v-if="workspaceId && taskId"
            :workspace-id="workspaceId"
            :task-id="taskId"
            :attachment-id="a.id"
            :alt="a.name"
          >
            <template #link="{ previewUrl }">
              <a
                v-if="previewUrl"
                :href="previewUrl"
                target="_blank"
                rel="noopener"
                class="text-(--text-xs) text-primary-default hover:underline truncate"
              >
                {{ a.name }}
              </a>
            </template>
          </AttachmentImagePreview>
          <div v-else class="flex items-start gap-(--spacing-2) min-w-0 flex-1">
            <a
              :href="imageViewUrl(a.url)"
              target="_blank"
              rel="noopener"
              class="shrink-0 block rounded overflow-hidden border border-border-light"
            >
              <span class="w-20 h-20 flex items-center justify-center bg-bg-tertiary text-2xl">🖼</span>
            </a>
            <a
              :href="imageViewUrl(a.url)"
              target="_blank"
              rel="noopener"
              class="text-(--text-xs) text-primary-default hover:underline truncate"
            >
              {{ a.name }}
            </a>
          </div>
          <div class="min-w-0 flex-1 flex flex-col gap-0.5">
            <span v-if="a.size" class="text-[11px] text-text-muted">{{ formatSize(a.size) }}</span>
            <Button
              v-if="canEdit"
              variant="ghost"
              size="xs"
              custom-class="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-error-default self-start"
              @click.stop="$emit('delete', a.id)"
            >
              ✕
            </Button>
          </div>
        </template>
        <template v-else>
          <span class="text-(--text-xs) shrink-0">📎</span>
          <a
            :href="a.url"
            target="_blank"
            rel="noopener"
            class="text-(--text-xs) text-primary-default hover:underline truncate min-w-0"
          >
            {{ a.name }}
          </a>
          <span v-if="a.size" class="text-[11px] text-text-muted shrink-0">{{ formatSize(a.size) }}</span>
          <Button
            v-if="canEdit"
            variant="ghost"
            size="xs"
            custom-class="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-error-default shrink-0"
            @click.stop="$emit('delete', a.id)"
          >
            ✕
          </Button>
        </template>
      </li>
    </ul>
    <p v-else class="text-(--text-xs) text-text-muted">Нет вложений</p>
  </TaskDetailSection>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Button } from '@/shared/ui'
  import TaskDetailSection from './TaskDetailSection.vue'
  import AttachmentImagePreview from './AttachmentImagePreview.vue'

  export interface TaskAttachment {
    id: string
    name: string
    url: string
    size?: number
    mimeType?: string
  }

  const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i

  function isImage(a: TaskAttachment): boolean {
    if (a.mimeType?.startsWith('image/')) return true
    return IMAGE_EXT.test(a.name)
  }

  function imageViewUrl(url: string): string {
    return url.replace(/\/download$/, '/view')
  }

  defineProps<{
    attachments: TaskAttachment[]
    loading?: boolean
    canEdit?: boolean
    uploading?: boolean
    workspaceId?: string
    taskId?: string
  }>()

  const emit = defineEmits<{
    upload: [file: File]
    delete: [id: string]
  }>()

  const fileInputRef = ref<HTMLInputElement | null>(null)

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const files = input.files
    if (!files?.length) return
    for (let i = 0; i < files.length; i++) {
      emit('upload', files[i])
    }
    input.value = ''
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} Б`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
  }
</script>

<style scoped>
  @media (hover: hover) {
    .TaskAttachmentsSection__Add:hover {
      color: var(--color-primary-dark);
    }
  }
</style>
