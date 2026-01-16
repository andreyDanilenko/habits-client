<template>
  <ModalContent :title="habit.title" @close="$emit('close')">
    <div class="space-y-6">
      <!-- Основная информация -->
      <div class="flex items-start space-x-4">
        <div
          class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white font-bold"
          :style="{ backgroundColor: habit.color || '#6366f1' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900">{{ habit.title }}</h3>
          <p v-if="habit.description" class="mt-2 text-gray-600">
            {{ habit.description }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-if="habit.category"
              class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
            >
              {{ getCategoryLabel(habit.category) }}
            </span>
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
              Цель: {{ habit.dailyGoal || 1 }} раз/день
            </span>
            <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
              {{ getTimeLabel(habit.preferredTime) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Сегодня выполнено</p>
          <p class="text-2xl font-semibold text-gray-900">
            {{ todayCompletions }} из {{ habit.dailyGoal || 1 }}
          </p>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">Всего выполнено</p>
          <p class="text-2xl font-semibold text-gray-900">
            {{ totalCompletions }}
          </p>
        </div>
      </div>

      <!-- Прогресс -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <p class="text-sm font-medium text-gray-700">Прогресс сегодня</p>
          <p class="text-sm text-gray-500">
            {{ Math.round((todayCompletions / (habit.dailyGoal || 1)) * 100) }}%
          </p>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: `${Math.min((todayCompletions / (habit.dailyGoal || 1)) * 100, 100)}%`,
              backgroundColor: habit.color || '#6366f1',
            }"
          />
        </div>
      </div>

      <!-- История последних выполнений -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-3">Последние выполнения</h4>
        <div v-if="recentCompletions.length === 0" class="text-center py-4">
          <p class="text-gray-500">Пока нет выполнений</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="completion in recentCompletions"
            :key="completion.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-gray-700">{{ formatDate(completion.date) }}</span>
            <span class="text-sm text-gray-500">{{ completion.time || 'Время не указано' }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between">
        <Button type="button" variant="outline" @click="$emit('confirm', 'delete')">
          Удалить
        </Button>
        <div class="flex space-x-3">
          <Button type="button" variant="outline" @click="$emit('close')"> Закрыть </Button>
          <Button type="button" @click="$emit('confirm', 'edit')"> Редактировать </Button>
        </div>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ModalContent, Button } from '@/shared/ui'
  import type { Habit, HabitCompletion } from '@/entities/habit'

  interface Props {
    habit: Habit
    completions: HabitCompletion[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    confirm: [action: 'edit' | 'delete']
  }>()

  const todayCompletions = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return props.completions.filter((c) => c.habitId === props.habit.id && c.date === today).length
  })

  const totalCompletions = computed(() => {
    return props.completions.filter((c) => c.habitId === props.habit.id).length
  })

  const recentCompletions = computed(() => {
    return props.completions
      .filter((c) => c.habitId === props.habit.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })

  const categories = {
    health: 'Здоровье',
    sport: 'Спорт',
    study: 'Учеба',
    work: 'Работа',
    personal: 'Личное',
  }

  const times = {
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    any: 'Любое время',
  }

  const getCategoryLabel = (category: string) => {
    return categories[category as keyof typeof categories] || category
  }

  const getTimeLabel = (time: string | undefined) => {
    if (!time) return times.any
    return times[time as keyof typeof times] || time
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
</script>
