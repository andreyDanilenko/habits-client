<template>
  <Card :border="true" :padding="true">
    <h2 class="text-text-primary mb-4">Недавняя активность</h2>

    <div v-if="activities.length === 0" class="text-center py-8">
      <p class="text-text-secondary">Нет недавней активности</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="activity in activities" :key="activity.id" class="flex items-start space-x-3">
        <div
          class="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0"
        >
          <span class="text-primary-default text-sm">{{ activity.emoji }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-text-primary">{{ activity.title }}</p>
          <p class="text-xs text-text-secondary">{{ activity.time }}</p>
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
