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
            <Badge v-if="habit.category">
              {{ getCategoryLabel(habit.category) }}
            </Badge>
            <Badge variant="blue">
              Цель: {{ habit.dailyGoal || 1 }} раз/день
            </Badge>
            <Badge variant="green">
              {{ getTimeLabel(habit.preferredTime) }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="grid grid-cols-2 gap-4">
        <StatCard
          label="Сегодня выполнено"
          :value="`${todayCompletions} из ${habit.dailyGoal || 1}`"
          :description="todayCompletions >= (habit.dailyGoal || 1) ? '✅ Цель достигнута!' : 'Осталось ' + ((habit.dailyGoal || 1) - todayCompletions) + ' раз(а)'"
        />
        <StatCard
          label="Всего выполнений"
          :value="totalCompletions"
          :description="`${completedDaysCount} ${completedDaysCount === 1 ? 'день' : completedDaysCount < 5 ? 'дня' : 'дней'} с выполнениями`"
        />
      </div>

      <!-- Стрики -->
      <div class="grid grid-cols-2 gap-4">
        <StatCard
          label="Текущая серия"
          :value="currentStreak"
          :description="currentStreak === 0 ? 'Начните сегодня!' : currentStreak === 1 ? 'день подряд' : currentStreak < 5 ? 'дня подряд' : 'дней подряд'"
          variant="gradient"
          color="indigo"
        />
        <StatCard
          label="Лучшая серия"
          :value="longestStreak"
          :description="`${longestStreak === 0 ? 'Пока нет серий' : longestStreak === 1 ? 'день' : longestStreak < 5 ? 'дня' : 'дней'} подряд`"
          variant="gradient"
          color="purple"
        />
      </div>

      <!-- Прогресс сегодня -->
      <ProgressBar
        variant="detailed"
        label="Прогресс сегодня"
        :current="todayCompletions"
        :total="habit.dailyGoal || 1"
        :color="habit.color || '#6366f1'"
        :description="`Цель: выполнить ${habit.dailyGoal || 1} ${habit.dailyGoal === 1 ? 'раз' : 'раза'} в день`"
      />

      <!-- История последних выполнений -->
      <div>
        <h4 class="text-lg font-medium text-gray-900 mb-3">Последние выполнения</h4>
        <div v-if="recentCompletions.length === 0" class="text-center py-4">
          <p class="text-gray-500">Пока нет выполнений</p>
          <p class="text-xs text-gray-400 mt-2">Отмечайте выполнение привычки, чтобы видеть историю</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="completion in recentCompletions"
            :key="completion.id"
            class="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(completion.date) }}</span>
                  <span v-if="completion.time" class="text-xs text-gray-500">в {{ completion.time }}</span>
                </div>
                <p v-if="completion.notes" class="text-sm text-gray-600 mt-1 italic">
                  "{{ completion.notes }}"
                </p>
              </div>
              <div v-if="completion.rating" class="flex items-center space-x-1">
                <span class="text-lg">{{ getRatingEmoji(completion.rating) }}</span>
              </div>
            </div>
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
  import { computed, ref, onMounted } from 'vue'
  import { ModalContent, Button, StatCard, Badge, ProgressBar } from '@/shared/ui'
  import type { Habit, HabitCompletion, HabitStats } from '@/entities/habit'
  import { habitService } from '@/entities/habit'

  interface Props {
    habit: Habit
    completions: HabitCompletion[]
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    confirm: [action: 'edit' | 'delete']
  }>()

  const stats = ref<HabitStats | null>(null)
  const isLoadingStats = ref(false)

  onMounted(async () => {
    await loadStats()
  })

  const loadStats = async () => {
    isLoadingStats.value = true
    try {
      const response = await habitService.getStats(props.habit.id)
      stats.value = response
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      isLoadingStats.value = false
    }
  }

  const todayCompletions = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return props.completions.filter((c) => c.habitId === props.habit.id && c.date === today).length
  })

  const totalCompletions = computed(() => {
    return props.completions.filter((c) => c.habitId === props.habit.id).length
  })

  // Уникальные даты выполнения (для расчета стриков)
  const completedDates = computed(() => {
    const dates = new Set<string>()
    props.completions
      .filter((c) => c.habitId === props.habit.id)
      .forEach((c) => dates.add(c.date))
    return Array.from(dates).sort()
  })

  // Расчет текущего стрика (дни подряд до сегодня)
  const currentStreak = computed(() => {
    if (completedDates.value.length === 0) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let streak = 0
    let checkDate = new Date(today)
    
    // Проверяем, выполнено ли сегодня
    const todayStr = today.toISOString().split('T')[0]
    const hasToday = completedDates.value.includes(todayStr)
    
    if (hasToday) {
      streak = 1
      checkDate.setDate(checkDate.getDate() - 1)
    }
    
    // Идем назад по дням
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (completedDates.value.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  })

  // Расчет самого длинного стрика
  const longestStreak = computed(() => {
    if (completedDates.value.length === 0) return 0
    
    let maxStreak = 0
    let currentStreak = 1
    
    for (let i = 1; i < completedDates.value.length; i++) {
      const prevDate = new Date(completedDates.value[i - 1])
      const currDate = new Date(completedDates.value[i])
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        currentStreak++
      } else {
        maxStreak = Math.max(maxStreak, currentStreak)
        currentStreak = 1
      }
    }
    
    return Math.max(maxStreak, currentStreak)
  })

  const recentCompletions = computed(() => {
    return props.completions
      .filter((c) => c.habitId === props.habit.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  })

  // Уникальные дни выполнения (для статистики)
  const completedDaysCount = computed(() => {
    return completedDates.value.length
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
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completionDate = new Date(date)
    completionDate.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - completionDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Сегодня'
    if (diffDays === 1) return 'Вчера'
    if (diffDays < 7) return `${diffDays} дня назад`
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getRatingEmoji = (rating: number) => {
    if (rating >= 5) return '😊'
    if (rating >= 4) return '🙂'
    if (rating >= 3) return '😐'
    if (rating >= 2) return '😴'
    return '😓'
  }
</script>
