<template>
  <div class="border-b border-gray-200 bg-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <button
        @click="isOpen = !isOpen"
        class="w-full flex items-center justify-between py-3 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span>Метаданные</span>
        <svg
          :class="['w-5 h-5 transition-transform', isOpen ? 'rotate-180' : '']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-show="isOpen" class="pb-4 space-y-4 border-t border-gray-100 pt-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Заголовок" required>
            <Input
              :model-value="form.title"
              @update:model-value="updateField('title', $event)"
              placeholder="Введите заголовок..."
              class="w-full"
            />
          </FormField>

          <FormField label="Дата">
            <Input
              :model-value="form.date"
              @update:model-value="updateField('date', $event)"
              type="date"
              class="w-full"
            />
          </FormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Настроение">
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="mood in moodOptions"
                :key="mood.value"
                type="button"
                @click="updateField('mood', mood.value)"
                :class="[
                  'p-2 rounded-lg transition-all',
                  form.mood === mood.value
                    ? 'bg-indigo-100 ring-2 ring-indigo-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                ]"
                :title="mood.label"
              >
                <span class="text-xl">{{ mood.emoji }}</span>
              </button>
              <button
                v-if="form.mood"
                type="button"
                @click="updateField('mood', undefined)"
                class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Убрать
              </button>
            </div>
          </FormField>

          <FormField label="Тип контента">
            <select
              :value="form.contentType"
              @change="handleContentTypeChange"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="text">Текст</option>
              <option value="markdown">Markdown</option>
            </select>
          </FormField>
        </div>

        <FormField label="Теги">
          <div class="flex flex-wrap gap-2 mb-2">
            <Badge
              v-for="tag in form.tags"
              :key="tag"
              variant="outline"
              class="bg-indigo-50 text-indigo-700 border-indigo-200 cursor-pointer hover:bg-indigo-100"
              @click="removeTag(tag)"
            >
              {{ tag }} ×
            </Badge>
          </div>
            <Input
              :model-value="newTag"
              @update:model-value="emit('update:newTag', $event)"
              placeholder="Добавить тег..."
              class="w-full"
              @keydown.enter.prevent="addTag"
            />
        </FormField>

        <div class="flex gap-6 text-sm pt-2 border-t border-gray-100">
          <div>
            <span class="text-gray-600">Символов: </span>
            <span class="font-medium">{{ characterCount }}</span>
          </div>
          <div>
            <span class="text-gray-600">Слов: </span>
            <span class="font-medium">{{ wordCount }}</span>
          </div>
          <div>
            <span class="text-gray-600">Время чтения: </span>
            <span class="font-medium">{{ readingTime }} мин</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Input, FormField, Badge } from '@/shared/ui'
  import type { CreateJournalEntryDto } from '@/entities/journal'

  interface Props {
    form: CreateJournalEntryDto & { id?: string; date: string }
    moodOptions: Array<{ value: number; emoji: string; label: string }>
    newTag: string
    characterCount: number
    wordCount: number
    readingTime: number
  }

  defineProps<Props>()
  const emit = defineEmits<{
    'update:form': [field: keyof Props['form'], value: any]
    'update:newTag': [value: string]
    'addTag': []
    'removeTag': [tag: string]
    'autoSave': []
  }>()

  const isOpen = ref(false)

  const updateField = (field: keyof Props['form'], value: any) => {
    emit('update:form', field, value)
    emit('autoSave')
  }

  const handleContentTypeChange = (event: Event) => {
    const target = event.target as HTMLSelectElement
    updateField('contentType', target.value)
  }

  const addTag = () => {
    emit('addTag')
  }

  const removeTag = (tag: string) => {
    emit('removeTag', tag)
  }
</script>
