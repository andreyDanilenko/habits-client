<template>
  <Card :border="true" :padding="true">
    <h2 class="text-text-primary mb-4">{{ t('dashboard.stats.title') }}</h2>

    <div class="space-y-4" v-auto-animate>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-text-secondary">{{ t('habits.stats.completedToday') }}</p>
          <Transition name="number-fade" mode="out-in">
            <p
              :key="`${completedToday}-${totalToday}`"
              class="text-2xl font-bold text-text-primary"
            >
              {{ completedToday }}/{{ totalToday }}
            </p>
          </Transition>
        </div>
        <div class="bg-primary-light rounded-full flex items-center justify-center p-3">
          <CheckCircleIcon size="md" class="text-primary-default" stroke-width="2" />
        </div>
      </div>
      <ProgressBar :percentage="progressPercentage" />
    </div>
  </Card>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import { useHabitStore } from '@/entities/habit'

  const { t } = useAppI18n()
  import { ProgressBar, Card } from '@/shared/ui'
  import { CheckCircleIcon } from '@/shared/ui/icon'

  const habitStore = useHabitStore()

  const completedToday = computed(() => habitStore.completedToday)
  const totalToday = computed(() => habitStore.totalToday)

  const progressPercentage = computed(() => {
    if (totalToday.value === 0) return 0
    return Math.round((completedToday.value / totalToday.value) * 100)
  })
</script>

<style scoped>
  .number-fade-enter-active,
  .number-fade-leave-active {
    transition: opacity 0.2s ease;
  }
  .number-fade-enter-from,
  .number-fade-leave-to {
    opacity: 0;
  }
</style>
