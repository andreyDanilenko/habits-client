<template>
  <ModalContent :title="modalTitle" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">{{
          t('journal.modal.date')
        }}</span>
        <DatePicker v-model="form.date" required />
      </div>

      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">{{
          t('journal.modal.mood')
        }}</span>
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
          <Button v-if="form.mood" variant="ghost" size="md" @click="form.mood = undefined">
            {{ t('journal.modal.clearMood') }}
          </Button>
        </div>
      </div>

      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">{{
          t('journal.modal.descriptionLabel')
        }}</span>
        <Textarea
          v-model="descriptionModel"
          :rows="8"
          :placeholder="t('journal.modal.descriptionPlaceholder')"
          resize="none"
        />
      </div>

      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">{{
          t('journal.modal.tagsLabel')
        }}</span>
        <div class="flex flex-wrap gap-2 items-center">
          <Badge
            v-for="tag in form.tags || []"
            :key="tag"
            variant="outline"
            class="cursor-pointer hover:bg-primary-light/80 transition-colors"
            @click="removeTag(tag)"
          >
            {{ tag }} ×
          </Badge>
          <Input
            v-model="newTag"
            type="text"
            :placeholder="t('journal.modal.tagPlaceholder')"
            class="inline-block w-auto min-w-[140px]"
            @keydown.enter.prevent="addTag"
          />
          <Button type="button" variant="outline" size="md" @click="addTag">
            {{ t('common.actions.add') }}
          </Button>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="handleClose">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button type="submit" @click="handleSubmit">
          {{ t('common.actions.save') }}
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import {
    ModalContent,
    Input,
    Button,
    SelectButton,
    Badge,
    DatePicker,
    Textarea,
  } from '@/shared/ui'
  import type { JournalEntry, CreateJournalEntryDto } from '@/entities/journal'
  import { MOOD_DEFINITIONS, getTodayDateString } from '@/features/journal/model/journal-constants'

  interface Props {
    entry?: JournalEntry | null
  }

  const props = defineProps<Props>()

  const { t } = useAppI18n()
  const entry = computed(() => props.entry ?? null)

  const modalTitle = computed(() =>
    entry.value ? t('journal.modal.titleEdit') : t('journal.modal.titleCreate'),
  )

  const emit = defineEmits<{
    close: []
    confirm: [entry: CreateJournalEntryDto & { id?: string }]
  }>()

  const moods = computed(() =>
    MOOD_DEFINITIONS.map((m) => ({
      ...m,
      label: t(`dashboard.journalMood.m${m.value}`),
    })),
  )

  const form = ref<Partial<CreateJournalEntryDto> & { id?: string; date: string }>({
    description: '',
    mood: undefined,
    date: getTodayDateString(),
    tags: [],
  })

  const newTag = ref('')

  const descriptionModel = computed({
    get: () => form.value.description ?? '',
    set: (v: string) => {
      form.value.description = v
    },
  })

  const applyEntryToForm = (value: JournalEntry | null) => {
    if (value) {
      form.value = {
        id: value.id,
        description: value.description ?? '',
        mood: value.mood,
        date: value.date || getTodayDateString(),
        tags: value.tags || [],
      }
    } else {
      form.value = {
        description: '',
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
    const tags = form.value.tags ?? []
    if (!tags.includes(tag)) {
      form.value.tags = [...tags, tag]
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
