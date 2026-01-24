<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Хедер редактора -->
    <div class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <button
            @click="handleCancel"
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon class="w-5 h-5" />
            <span class="hidden sm:inline">Назад</span>
          </button>

          <div class="flex items-center gap-3">
            <div v-if="isSaving" class="flex items-center gap-2 text-sm text-gray-500">
              <Spinner class="w-4 h-4" />
              <span>Сохранение...</span>
            </div>
            <div v-else-if="lastSaved" class="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircleIcon class="w-4 h-4 text-green-500" />
              <span>Сохранено {{ formatTime(lastSaved) }}</span>
            </div>

            <div class="flex items-center gap-2">
              <Button variant="outline" @click="handleSaveDraft" :loading="isSaving">
                Сохранить
              </Button>
              <Button @click="handlePublish" :loading="isPublishing" :disabled="!canPublish">
                {{ isEditMode ? 'Обновить' : 'Опубликовать' }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Панель метаданных -->
    <JournalMetadataPanel
      :form="form"
      :mood-options="moodOptions"
      :new-tag="newTag"
      :character-count="characterCount"
      :word-count="wordCount"
      :reading-time="readingTime"
      @update:form="(field, value) => updateForm(field, value)"
      @update:new-tag="(value) => { newTag = value }"
      @add-tag="addTag"
      @remove-tag="removeTag"
      @auto-save="handleAutoSave"
    />

    <!-- Редактор -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Card :border="true" :padding="true">
        <JournalEditorToolbar
          v-if="form.contentType === 'markdown'"
          @insert="insertMarkdown"
        />

        <JournalContentEditor
          ref="contentEditorRef"
          :content-type="(form.contentType ?? 'text') as 'text' | 'markdown'"
          :content="form.content"
          @update:content="updateForm('content', $event)"
        />
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Card, Button, Spinner } from '@/shared/ui'
  import { ArrowLeftIcon, CheckCircleIcon } from '@/shared/ui/icon'
  import { JournalMetadataPanel } from '@/features/journal/ui'
  import { JournalEditorToolbar } from '@/features/journal/ui'
  import { JournalContentEditor } from '@/features/journal/ui'
  import { useJournalEditor } from '@/features/journal/model'

  const router = useRouter()
  const route = useRoute()

  const {
    form,
    isEditMode,
    isSaving,
    isPublishing,
    lastSaved,
    newTag,
    moodOptions,
    characterCount,
    wordCount,
    readingTime,
    canPublish,
    addTag,
    removeTag,
    handleAutoSave,
    handleSaveDraft,
    handlePublish,
    insertMarkdown,
  } = useJournalEditor(route.params.id as string | undefined)

  const contentEditorRef = ref<InstanceType<typeof JournalContentEditor> | null>(null)

  const updateForm = (field: keyof typeof form, value: any) => {
    ;(form as any)[field] = value
    handleAutoSave()
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)

    if (minutes < 1) return 'только что'
    if (minutes < 60) return `${minutes} мин назад`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ч назад`
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  }

  const handleCancel = () => {
    if (confirm('Вы уверены? Несохраненные изменения будут потеряны.')) {
      router.push('/journal')
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSaveDraft()
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b' && form.contentType === 'markdown') {
      e.preventDefault()
      insertMarkdown('**', '**')
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i' && form.contentType === 'markdown') {
      e.preventDefault()
      insertMarkdown('*', '*')
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
    nextTick(() => {
      if (contentEditorRef.value?.textareaRef && !form.content) {
        contentEditorRef.value.textareaRef.focus()
      }
    })
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
</script>
