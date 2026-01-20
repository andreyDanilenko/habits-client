<template>
  <div>
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
          :style="{ backgroundColor: habit.color || '#6366f1' }"
        >
          {{ habit.icon || '📝' }}
        </div>
        <div>
          <h3 class="font-semibold text-gray-900">{{ habit.title }}</h3>
          <p v-if="habit.description" class="text-sm text-gray-500 mt-1">
            {{ habit.description }}
          </p>
        </div>
      </div>
      <div class="opacity-0 group-hover:opacity-100 transition-opacity">
        <div class="flex items-center space-x-1">
          <button
            class="p-1 text-gray-400 hover:text-gray-600"
            @click.stop="$emit('mark-completion', habit)"
            title="Отметить выполнение"
          >
            <CheckIcon size="xs" />
          </button>
          <button
            class="p-1 text-gray-400 hover:text-red-600"
            @click.stop="$emit('delete', habit)"
            title="Удалить привычку"
          >
            <DeleteIcon size="xs" />
          </button>
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

    <div class="flex items-center justify-between pt-4 border-t">
      <div class="text-sm text-gray-600">
        <span class="font-medium">{{ progress }}</span> выполнений сегодня
      </div>
      <div class="flex items-center space-x-2">
        <button
          class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          @click.stop="$emit('edit', habit)"
        >
          Редактировать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ProgressBar } from '@/shared/ui'
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
