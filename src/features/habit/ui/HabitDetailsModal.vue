<template>
  <ModalContent :title="habit.title" @close="$emit('close')">
    <div class="space-y-6">
      <div class="flex items-start space-x-4">
        <div
          class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white font-bold"
          :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div class="flex-1">
          <h3 class="text-text-primary">{{ habit.title }}</h3>
          <p v-if="habit.description" class="mt-2 text-text-secondary">
            {{ habit.description }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Badge v-if="habit.category" variant="outline" class="bg-badge-blue-bg text-badge-blue-text border-blue-200">
              {{ getCategoryLabel(habit.category) }}
            </Badge>
            <Badge variant="blue" class="bg-badge-blue-bg text-badge-blue-text">
              Цель: {{ habit.dailyGoal || 1 }} раз/день
            </Badge>
            <Badge variant="green" class="bg-badge-green-bg text-badge-green-text">
              {{ getTimeLabel(habit.preferredTime) }}
            </Badge>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <StatCard
          label="Сегодня выполнено"
          :value="`${todayCompletions} из ${habit.dailyGoal || 1}`"
          :description="
            todayCompletions >= (habit.dailyGoal || 1)
              ? '✅ Цель достигнута!'
              : 'Осталось ' + ((habit.dailyGoal || 1) - todayCompletions) + ' раз(а)'
          "
        />
        <StatCard
          label="Всего выполнений"
          :value="totalCompletions"
          :description="`${completedDaysCount} ${completedDaysCount === 1 ? 'день' : completedDaysCount < 5 ? 'дня' : 'дней'} с выполнениями`"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <StatCard
          label="Текущая серия"
          :value="currentStreak"
          :description="
            currentStreak === 0
              ? 'Начните сегодня!'
              : currentStreak === 1
                ? 'день подряд'
                : currentStreak < 5
                  ? 'дня подряд'
                  : 'дней подряд'
          "
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

      <ProgressBar
        variant="detailed"
        label="Прогресс сегодня"
        :current="todayCompletions"
        :total="habit.dailyGoal || 1"
        :color="habit.color || 'var(--color-primary-default)'"
        :description="`Цель: выполнить ${habit.dailyGoal || 1} ${habit.dailyGoal === 1 ? 'раз' : 'раза'} в день`"
      />

      <div>
        <h4 class="text-text-primary mb-3">Последние выполнения</h4>
        <div v-if="recentCompletions.length === 0" class="text-center py-4">
          <p class="text-text-secondary">Пока нет выполнений</p>
          <p class="text-xs text-text-muted mt-2">
            Отмечайте выполнение привычки, чтобы видеть историю
          </p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="completion in recentCompletions"
            :key="completion.id"
            class="p-3 bg-bg-secondary rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <span class="text-sm font-medium text-text-primary">{{
                    formatDate(completion.date)
                  }}</span>
                  <span v-if="completion.time" class="text-xs text-text-muted"
                    >в {{ completion.time }}</span
                  >
                </div>
                <p v-if="completion.notes" class="text-sm text-text-secondary mt-1 italic">
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
  import { getLocalDateString } from '@/shared/lib'
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
      const response = await habitService.getStats(props.habit.workspaceId, props.habit.id)
      stats.value = response
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      isLoadingStats.value = false
    }
  }

  const todayCompletions = computed(() => {
    const today = getLocalDateString()
    return props.completions.filter((c) => c.habitId === props.habit.id && c.date === today).length
  })

  const totalCompletions = computed(() => {
    return props.completions.filter((c) => c.habitId === props.habit.id).length
  })

  const completedDates = computed(() => {
    const dates = new Set<string>()
    props.completions.filter((c) => c.habitId === props.habit.id).forEach((c) => dates.add(c.date))
    return Array.from(dates).sort()
  })

  const currentStreak = computed(() => {
    if (completedDates.value.length === 0) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let streak = 0
    let checkDate = new Date(today)

    const todayStr = getLocalDateString(today)
    const hasToday = completedDates.value.includes(todayStr)

    if (hasToday) {
      streak = 1
      checkDate.setDate(checkDate.getDate() - 1)
    }
    let loop = true

    while (loop) {
      const dateStr = getLocalDateString(checkDate)
      if (completedDates.value.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  })

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
