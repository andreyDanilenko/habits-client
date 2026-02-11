<template>
  <ModalContent :title="entry ? 'Редактировать запись' : 'Запись за день'" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Дата -->
      <FormField label="Дата">
        <Input v-model="form.date" type="date" required />
      </FormField>

      <!-- Настроение -->
      <FormField label="Настроение">
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="mood in moods"
            :key="mood.value"
            :is-selected="form.mood === mood.value"
            size="md"
            @click="form.mood = mood.value"
            :title="mood.label"
          >
            <span class="text-2xl">{{ mood.emoji }}</span>
          </SelectButton>
          <Button v-if="form.mood" variant="ghost" size="sm" @click="form.mood = undefined">
            Убрать
          </Button>
        </div>
      </FormField>

      <!-- Состояние и впечатления -->
      <FormField label="Состояние и впечатления за день" required>
        <textarea
          v-model="form.content"
          rows="8"
          required
          placeholder="Как прошел ваш день? Что вы чувствуете?"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </FormField>

      <!-- Теги -->
      <FormField label="Теги">
        <div class="flex flex-wrap gap-2">
          <Badge
            v-for="tag in form.tags"
            :key="tag"
            variant="outline"
            class="cursor-pointer"
            @click="removeTag(tag)"
          >
            {{ tag }} ×
          </Badge>
          <Input
            v-model="newTag"
            type="text"
            placeholder="Добавить тег..."
            class="inline-block w-auto min-w-[140px]"
            @keydown.enter.prevent="addTag"
          />
        </div>
      </FormField>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="handleClose"> Отмена </Button>
        <Button type="submit" @click="handleSubmit"> Сохранить </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ModalContent, FormField, Input, Button, SelectButton, Badge } from '@/shared/ui'
  import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'
  import {
    MOOD_DEFINITIONS,
    getTodayDateString,
  } from '@/features/journal/model/journal-constants'

  interface Props {
    entry?: JournalEntry | null
  }

  const props = defineProps<Props>()

  const entry = computed(() => props.entry ?? null)

  const emit = defineEmits<{
    close: []
    confirm: [entry: CreateJournalEntryDto & { id?: string }]
  }>()

  const moods = MOOD_DEFINITIONS

  const form = ref<Partial<CreateJournalEntryDto> & { id?: string; date: string }>({
    title: '',
    content: '',
    mood: undefined,
    date: getTodayDateString(),
    tags: [],
  })

  const newTag = ref('')

  const applyEntryToForm = (value: JournalEntry | null) => {
    if (value) {
      form.value = {
        id: value.id,
        title: value.title ?? '',
        content: value.content,
        mood: value.mood,
        date: value.date || getTodayDateString(),
        tags: value.tags || [],
      }
    } else {
      form.value = {
        title: '',
        content: '',
        mood: undefined,
        date: getTodayDateString(),
        tags: [],
      }
    }
  }

  watch(
    () => props.entry,
    (val) => {
      applyEntryToForm(val ?? null)
    },
    { immediate: true },
  )

  const addTag = () => {
    const tag = newTag.value.trim()
    if (!tag) return
    if (!form.value.tags) {
      form.value.tags = []
    }
    if (!form.value.tags.includes(tag)) {
      form.value.tags = [...form.value.tags, tag]
    }
    newTag.value = ''
  }

  const removeTag = (tag: string) => {
    form.value.tags = (form.value.tags || []).filter((t) => t !== tag)
  }

  const handleClose = () => {
    emit('close')
  }

  const handleSubmit = () => {
    emit('confirm', form.value as CreateJournalEntryDto & { id?: string })
  }
</script>

<style scoped>
</style>
