<template>
  <Card :border="true" :padding="true">
    <h2 class="text-text-primary mb-4">{{ t('dashboard.journal.title') }}</h2>

    <div class="grid gap-2">
      <Textarea
        v-model="description"
        :placeholder="t('dashboard.journal.placeholder')"
        :rows="4"
        resize="none"
        :disabled="saving"
      />

      <div class="flex items-center gap-2 justify-between flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <SelectButton
            v-for="mood in moods"
            :key="mood.emoji"
            :is-selected="selectedMood === mood.value"
            size="md"
            @click="selectedMood = mood.value"
            :title="mood.label"
          >
            <span class="text-2xl">{{ mood.emoji }}</span>
          </SelectButton>
        </div>

        <Button @click="saveEntry" :disabled="!description.trim() || saving" :loading="saving">
          {{ t('common.actions.save') }}
        </Button>
      </div>

      <p v-if="error" class="text-sm text-error-default">{{ error }}</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { Button, Card, SelectButton, Textarea } from '@/shared/ui'
  import { journalService } from '@/entities/journal'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { MOOD_DEFINITIONS, getTodayDateString } from '@/features/journal/model/journal-constants'

  const { t } = useAppI18n()
  const workspaceStore = useWorkspaceStore()
  const description = ref('')
  const selectedMood = ref<number | null>(null)
  const saving = ref(false)
  const error = ref('')

  const moods = computed(() =>
    MOOD_DEFINITIONS.map((m) => ({
      ...m,
      label: t(`dashboard.journalMood.m${m.value}`),
    })),
  )

  const saveEntry = async () => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      error.value = t('dashboard.journal.errorNoWorkspace')
      return
    }
    const text = description.value.trim()
    if (!text) return

    error.value = ''
    saving.value = true
    try {
      await journalService.create(workspaceId, {
        description: text,
        mood: selectedMood.value ?? undefined,
        date: getTodayDateString(),
      })
      description.value = ''
      selectedMood.value = null
    } catch (e) {
      console.error('QuickJournal save failed:', e)
      error.value = t('dashboard.journal.errorSave')
    } finally {
      saving.value = false
    }
  }
</script>
