<template>
  <Card :border="true" :padding="true">
    <h2 class="mb-4">Быстрая запись</h2>

    <div class="grid gap-2">
      <textarea
        v-model="description"
        placeholder="Как прошел день?"
        class="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
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
          Сохранить
        </Button>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Button, Card, SelectButton } from '@/shared/ui'
  import { journalService } from '@/entities/journal'
  import { useWorkspaceStore } from '@/entities/workspace'
  import { MOOD_DEFINITIONS, getTodayDateString } from '@/features/journal/model/journal-constants'

  const workspaceStore = useWorkspaceStore()
  const description = ref('')
  const selectedMood = ref<number | null>(null)
  const saving = ref(false)
  const error = ref('')

  const moods = MOOD_DEFINITIONS

  const saveEntry = async () => {
    const workspaceId = workspaceStore.currentWorkspace?.id
    if (!workspaceId) {
      error.value = 'Выберите воркспейс'
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
      error.value = 'Не удалось сохранить запись'
    } finally {
      saving.value = false
    }
  }
</script>
