<template>
  <div>
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
          :style="{ backgroundColor: habit.color || 'var(--color-primary-default)' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div>
          <h3 class="text-text-primary">{{ habit.title }}</h3>
          <p v-if="habit.description" class="text-sm text-text-secondary mt-1">
            {{ habit.description }}
          </p>
        </div>
      </div>
      <div class="opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex items-center space-x-1">
          <Button
            icon-only
            variant="icon"
            icon-color="success"
            :left-icon="CheckIcon"
            @click.stop="$emit('mark-completion', habit)"
          />
          <Button
            icon-only
            variant="icon"
            icon-color="danger"
            :left-icon="DeleteIcon"
            @click.stop="$emit('delete', habit)"
          />
        </div>
      </div>
    </div>

    <div class="mt-4">
      <ProgressBar
        :current="progress"
        :total="habit.dailyGoal || 1"
        label="Прогресс сегодня"
        :color="habit.color"
      />
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-border-light">
      <div class="text-sm text-text-secondary">
        <span class="font-medium">{{ progress }}</span>
        {{ progress === 1 ? 'выполнение' : progress < 5 ? 'выполнения' : 'выполнений' }} сегодня
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="link" size="sm" @click.stop="$emit('edit', habit)"> Редактировать </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ProgressBar, Button } from '@/shared/ui'
  import type { Habit } from '@/entities/habit'
  import { CheckIcon, DeleteIcon } from '@/shared/ui/icon'

  defineProps<{
    habit: Habit
    progress: number
  }>()

  defineEmits<{
    edit: [habit: Habit]
    'mark-completion': [habit: Habit]
    delete: [habit: Habit]
  }>()
</script>
