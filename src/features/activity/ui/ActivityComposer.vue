<template>
  <div class="rounded-xl border border-border-default bg-bg-primary overflow-hidden">
    <button
      v-if="!expanded"
      type="button"
      class="w-full px-4 py-3 text-left text-sm text-text-muted hover:bg-bg-tertiary transition-colors"
      @click="expanded = true"
    >
      + Добавить заметку...
    </button>
    <div v-else class="p-4 space-y-4">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Текст заметки</label>
        <textarea
          v-model="title"
          placeholder="Напишите текст заметки..."
          rows="3"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-default"
        />
        <p v-if="validationError" class="mt-1 text-sm text-danger-default">
          {{ validationError }}
        </p>
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Описание (опционально)</label>
        <textarea
          v-model="description"
          placeholder="Дополнительные детали..."
          rows="2"
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-default"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Прикрепить файлы</label>
        <input ref="fileInputRef" type="file" multiple class="hidden" @change="onFileSelect" />
        <Button type="button" variant="ghost" size="md" @click="fileInputRef?.click()">
          Выбрать файлы
        </Button>
        <ul v-if="selectedFiles.length" class="mt-2 space-y-1 text-sm text-text-secondary">
          <li v-for="(f, i) in selectedFiles" :key="i" class="flex items-center gap-2">
            <span>{{ f.name }}</span>
            <button
              type="button"
              class="text-danger-default hover:underline"
              @click="removeFile(i)"
            >
              удалить
            </button>
          </li>
        </ul>
      </div>
      <div class="flex items-center gap-2">
        <input
          v-model="isImportant"
          type="checkbox"
          id="composer-important"
          class="rounded border-border-default text-primary-default"
        />
        <label for="composer-important" class="text-sm text-text-secondary cursor-pointer">
          Важное
        </label>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button variant="ghost" size="md" @click="handleCancel">Отмена</Button>
        <Button variant="outline" size="md" @click="handleSaveAndAdd"> Сохранить и еще </Button>
        <Button variant="primary" size="md" @click="handleSave">Сохранить</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Button } from '@/shared/ui'
  import type { CreateNoteDto, ActivityEntityType } from '@/entities/activity'

  const props = defineProps<{
    entityType: ActivityEntityType
    entityId: string
  }>()

  const emit = defineEmits<{
    save: [dto: CreateNoteDto]
  }>()

  const expanded = ref(false)
  const title = ref('')
  const description = ref('')
  const isImportant = ref(false)
  const selectedFiles = ref<File[]>([])
  const fileInputRef = ref<HTMLInputElement | null>(null)

  function onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement
    const files = input.files
    if (files?.length) {
      selectedFiles.value = [...selectedFiles.value, ...Array.from(files)]
    }
    input.value = ''
  }

  function removeFile(index: number) {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index)
  }

  const validationError = computed(() => {
    const t = title.value.trim()
    if (!t) return 'Введите текст заметки.'
    return null
  })

  function buildDto(): CreateNoteDto | null {
    const t = title.value.trim()
    if (!t) return null
    return {
      entityType: props.entityType,
      entityId: props.entityId,
      title: t,
      description: description.value.trim() || undefined,
      isImportant: isImportant.value || undefined,
      files: selectedFiles.value.length ? selectedFiles.value : undefined,
    }
  }

  function submit(clearAfter = false) {
    const dto = buildDto()
    if (!dto) return
    emit('save', dto)
    selectedFiles.value = []
    if (clearAfter) {
      title.value = ''
      description.value = ''
      isImportant.value = false
    } else {
      expanded.value = false
      title.value = ''
      description.value = ''
      isImportant.value = false
    }
  }

  function handleCancel() {
    expanded.value = false
    title.value = ''
    description.value = ''
    isImportant.value = false
    selectedFiles.value = []
  }

  function handleSave() {
    submit(false)
  }

  function handleSaveAndAdd() {
    submit(true)
  }
</script>
