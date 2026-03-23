<template>
  <Card
    :border="true"
    :padding="true"
    class="cursor-pointer hover:shadow-card-hover transition-all duration-200 group border-border-default hover:border-primary-light relative overflow-hidden"
    @click.stop="$emit('click')"
  >
    <div
      class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-default to-secondary-default opacity-0 group-hover:opacity-100 transition-opacity"
    ></div>

    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 text-sm text-text-secondary">
          <span>{{ formatDate(entry.date) }}</span>
          <span v-if="entry.mood" class="flex items-center gap-1">
            <span class="text-border-light">•</span>
            <span class="text-lg">{{ getMoodEmoji(entry.mood) }}</span>
          </span>
        </div>
      </div>

      <div
        v-if="entry.mood"
        class="ml-3 flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-secondary-light flex items-center justify-center border-2 border-primary-light group-hover:border-primary-default transition-colors"
      >
        <span class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
      </div>
    </div>

    <div class="mb-4">
      <p class="text-text-primary line-clamp-3 leading-relaxed">
        {{ getPreview(entry.description) }}
      </p>
    </div>

    <div v-if="entry.tags && entry.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
      <Badge
        v-for="tag in entry.tags"
        :key="tag"
        variant="outline"
        size="md"
        class="bg-primary-light text-primary-dark border-primary-light hover:bg-primary-light/80 transition-colors"
      >
        {{ tag }}
      </Badge>
    </div>

    <div class="flex items-center justify-between pt-3 border-t border-border-light">
      <div class="flex items-center gap-2 text-xs text-text-secondary">
        <span>{{ formatTime(entry.updatedAt) }}</span>
      </div>
      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          @click.stop="$emit('edit')"
          icon-only
          variant="icon"
          icon-color="info"
          :left-icon="CogIcon"
          :title="t('journal.card.editTitle')"
        />
        <Button
          @click.stop="$emit('delete')"
          icon-only
          variant="icon"
          icon-color="danger"
          :left-icon="DeleteIcon"
          :title="t('journal.card.deleteTitle')"
        />
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { format, parseISO } from 'date-fns'
  import { enUS, ru } from 'date-fns/locale'
  import { Card, Badge, Button } from '@/shared/ui'
  import { CogIcon, DeleteIcon } from '@/shared/ui/icon'
  import { getTextPreview } from '@/shared/lib'
  import { useAppI18n } from '@/shared/lib/i18n'
  import type { JournalEntry } from '@/entities/journal'
  import { getMoodEmoji } from '@/features/journal/model/journal-constants'

  interface Props {
    entry: JournalEntry
  }

  defineProps<Props>()
  defineEmits<{
    click: []
    edit: []
    delete: []
  }>()

  const { t, locale } = useAppI18n()
  const dfLocale = computed(() => (locale.value === 'en' ? enUS : ru))

  const formatDate = (dateStr: string) =>
    format(parseISO(dateStr), 'd MMMM yyyy', { locale: dfLocale.value })
  const formatTime = (dateStr: string) =>
    format(parseISO(dateStr), 'HH:mm', { locale: dfLocale.value })
  const getPreview = (description: string) => getTextPreview(description ?? '', 150)
</script>
