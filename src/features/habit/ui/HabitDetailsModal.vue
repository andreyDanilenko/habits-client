<template>
  <ModalContent :title="habit.title" :fullscreen-on-mobile="isMobile" @close="$emit('close')">
    <div class="space-y-6">
      <div class="flex items-start space-x-4">
        <div
          class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl text-white font-bold"
          :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-text-primary">{{ habit.title }}</h3>
            <Badge
              v-if="habit.ownerName && habit.ownerName !== 'null'"
              variant="outline"
              class="text-xs"
            >
              {{ habit.ownerName }}
            </Badge>
          </div>
          <p v-if="habit.description" class="mt-2 text-text-secondary">
            {{ habit.description }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Badge
              v-if="habit.category"
              variant="outline"
              class="bg-badge-blue-bg text-badge-blue-text border-blue-200"
            >
              {{ getCategoryLabel(habit.category) }}
            </Badge>
            <Badge variant="blue" class="bg-badge-blue-bg text-badge-blue-text">
              {{ t('habits.details.goalPerDay', { n: habit.dailyGoal || 1 }) }}
            </Badge>
            <Badge variant="green" class="bg-badge-green-bg text-badge-green-text">
              {{ getTimeLabel(habit.preferredTime) }}
            </Badge>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <StatCard
          :label="t('habits.details.todayDone')"
          :value="todayProgressValue"
          :description="todayDoneDescription"
        />
        <StatCard
          :label="t('habits.details.totalCompletions')"
          :value="totalCompletions"
          :description="completedDaysDescription"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <StatCard
          :label="t('habits.details.currentStreak')"
          :value="currentStreak"
          :description="currentStreakDescription"
          variant="gradient"
          color="indigo"
        />
        <StatCard
          :label="t('habits.details.longestStreak')"
          :value="longestStreak"
          :description="longestStreakDescription"
          variant="gradient"
          color="purple"
        />
      </div>

      <ProgressBar
        variant="detailed"
        :label="t('habits.details.progressToday')"
        :current="todayCompletions"
        :total="habit.dailyGoal || 1"
        :color="habit.color || 'var(--color-primary-default)'"
        :description="progressBarDescription"
      />

      <div>
        <h4 class="text-text-primary mb-3">{{ t('habits.details.recentTitle') }}</h4>
        <div v-if="recentCompletions.length === 0" class="text-center py-4">
          <p class="text-text-secondary">{{ t('habits.details.noCompletions') }}</p>
          <p class="text-xs text-text-muted mt-2">
            {{ t('habits.details.noCompletionsHint') }}
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
                  <span v-if="completion.time" class="text-xs text-text-muted">{{
                    t('habits.details.atTime', { time: completion.time })
                  }}</span>
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
      <div class="grid grid-cols-2 gap-3">
        <template v-if="canDelete">
          <Button
            type="button"
            variant="outline"
            class="col-span-2 w-full"
            @click="$emit('confirm', 'delete')"
          >
            {{ t('common.actions.delete') }}
          </Button>
        </template>
        <Button
          type="button"
          variant="outline"
          :class="['w-full', { 'col-span-2': !canEdit }]"
          @click="$emit('close')"
        >
          {{ t('common.actions.close') }}
        </Button>
        <Button v-if="canEdit" type="button" class="w-full" @click="$emit('confirm', 'edit')">
          {{ t('common.actions.edit') }}
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { ModalContent, Button, StatCard, Badge, ProgressBar } from '@/shared/ui'

  const { t, locale } = useAppI18n()
  import { getLocalDateString } from '@/shared/lib'
  import type { Habit, HabitCompletion, HabitStats } from '@/entities/habit'
  import { habitService } from '@/entities/habit'
  import { useUserStore } from '@/entities/user'
  import { usePermissions } from '@/entities/workspace/lib/permissions'

  interface Props {
    habit: Habit
    completions: HabitCompletion[]
  }

  const props = defineProps<Props>()
  const userStore = useUserStore()
  const { isOwner } = usePermissions()
  const canDelete = computed(
    () => props.habit.userId === userStore.currentUser?.id || isOwner.value,
  )
  const canEdit = computed(() => props.habit.userId === userStore.currentUser?.id)
  const emit = defineEmits<{
    close: []
    confirm: [action: 'edit' | 'delete']
  }>()

  const stats = ref<HabitStats | null>(null)
  const isLoadingStats = ref(false)
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }

  onMounted(async () => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    await loadStats()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
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

  const goalN = computed(() => props.habit.dailyGoal || 1)

  const todayProgressValue = computed(() =>
    t('habits.details.todayProgress', {
      done: todayCompletions.value,
      goal: goalN.value,
    }),
  )

  const todayDoneDescription = computed(() => {
    if (todayCompletions.value >= goalN.value) return t('habits.details.goalReached')
    return t('habits.details.remaining', { n: goalN.value - todayCompletions.value })
  })

  const completedDaysDescription = computed(() =>
    t('habits.details.completedDaysLine', { n: completedDaysCount.value }),
  )

  const currentStreakDescription = computed(() => {
    const s = currentStreak.value
    if (s === 0) return t('habits.details.startToday')
    if (s === 1) return t('habits.details.streakDayOne')
    if (s >= 2 && s <= 4) return t('habits.details.streakDayFew')
    return t('habits.details.streakDayMany')
  })

  const longestStreakDescription = computed(() => {
    const s = longestStreak.value
    if (s === 0) return t('habits.details.noStreaksYet')
    if (s === 1) return `1 ${t('habits.details.streakDayOne')}`
    if (s >= 2 && s <= 4) return `${s} ${t('habits.details.streakDayFew')}`
    return `${s} ${t('habits.details.streakDayMany')}`
  })

  const progressBarDescription = computed(() => {
    const n = goalN.value
    const timesWord = n === 1 ? t('habits.details.timesOne') : t('habits.details.timesMany')
    return t('habits.details.goalProgressLine', { n, times: timesWord })
  })

  const getCategoryLabel = (category: string) => {
    const key = category as 'health' | 'sport' | 'study' | 'work' | 'personal'
    if (['health', 'sport', 'study', 'work', 'personal'].includes(category)) {
      return t(`habits.category.${key}`)
    }
    return category
  }

  const getTimeLabel = (time: string | undefined) => {
    if (!time) return t('habits.timeOfDay.any')
    if (['morning', 'afternoon', 'evening', 'any'].includes(time)) {
      return t(`habits.timeOfDay.${time}` as 'habits.timeOfDay.morning')
    }
    return time
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completionDate = new Date(date)
    completionDate.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - completionDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('habits.details.relativeToday')
    if (diffDays === 1) return t('habits.details.relativeYesterday')
    if (diffDays < 7) return t('habits.details.relativeDaysAgo', { n: diffDays })

    const loc = locale.value === 'en' ? 'en-US' : 'ru-RU'
    return date.toLocaleDateString(loc, {
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
