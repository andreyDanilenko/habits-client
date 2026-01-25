<template>
  <Card :border="true" :padding="true">
    <h2 class="mb-4">Недавняя активность</h2>

    <div v-if="activities.length === 0" class="text-center py-8">
      <p class="text-gray-500">Нет недавней активности</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
        <div
          class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0"
        >
          <span class="text-indigo-600 text-sm">{{ activity.emoji }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900">{{ activity.title }}</p>
          <p class="text-xs text-gray-500">{{ activity.time }}</p>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Card } from '@/shared/ui'

  interface Activity {
    id: string
    emoji: string
    title: string
    time: string
  }

  const activities = ref<Activity[]>([])

  onMounted(() => {
    // Заглушка: загрузка активности
    activities.value = [
      {
        id: '1',
        emoji: '✅',
        title: 'Завершена привычка "Чтение"',
        time: '2 часа назад',
      },
      {
        id: '2',
        emoji: '➕',
        title: 'Создана новая привычка "Спорт"',
        time: '5 часов назад',
      },
    ]
  })
</script>
