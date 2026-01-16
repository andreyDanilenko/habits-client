<template>
  <div class="bg-white rounded-xl border shadow-sm p-6">
    <h2 class="text-xl font-bold text-gray-900 mb-4">Быстрая запись</h2>

    <div class="space-y-4">
      <textarea
        v-model="note"
        placeholder="Как прошел день?"
        class="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
      />

      <div class="flex items-center justify-between flex-wrap">
        <div class="flex items-center space-x-2">
          <button
            v-for="mood in moods"
            :key="mood.emoji"
            class="cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-indigo-100': selectedMood === mood.value }"
            @click="selectedMood = mood.value"
            :title="mood.label"
          >
            <span class="text-2xl">{{ mood.emoji }}</span>
          </button>
        </div>

        <Button @click="saveNote" :disabled="!note.trim()">Сохранить </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Button } from '@/shared/ui'

  const note = ref('')
  const selectedMood = ref<number | null>(null)

  const moods = [
    { emoji: '😊', value: 5, label: 'Отлично' },
    { emoji: '🙂', value: 4, label: 'Хорошо' },
    { emoji: '😐', value: 3, label: 'Нормально' },
    { emoji: '😔', value: 2, label: 'Плохо' },
    { emoji: '😢', value: 1, label: 'Очень плохо' },
  ]

  const saveNote = () => {
    // Заглушка: сохранение записи
    console.log('Save note:', { note: note.value, mood: selectedMood.value })
    note.value = ''
    selectedMood.value = null
  }
</script>
