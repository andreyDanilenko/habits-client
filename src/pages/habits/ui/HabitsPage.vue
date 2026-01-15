<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Мои привычки</h1>
        <p class="mt-2 text-gray-600">Управляйте своими привычками и отслеживайте прогресс</p>
      </div>
      <Button @click="showAddModal = true"> + Добавить привычку </Button>
    </div>

    <!-- Список привычек -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <div v-else-if="habits.length === 0" class="text-center py-12">
      <div class="max-w-md mx-auto">
        <div
          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Нет привычек</h3>
        <p class="text-gray-500 mb-6">
          Создайте свою первую привычку, чтобы начать отслеживать прогресс
        </p>
        <Button @click="showAddModal = true"> Создать привычку </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="habit in habits"
        :key="habit.id"
        class="p-6 hover:shadow-md transition-shadow cursor-pointer"
        @click="selectHabit(habit)"
      >
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
        </div>

        <div class="flex items-center justify-between pt-4 border-t">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ completedCount(habit.id) }}</span> выполнений
          </div>
          <button
            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            @click.stop="editHabit(habit)"
          >
            Редактировать
          </button>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { Card, Button } from '@/shared/ui'
  import { useHabitStore } from '@/entities/habit/model/habit-store'
  import type { Habit } from '@/entities/habit/types/habit'

  const habitStore = useHabitStore()

  const habits = computed(() => habitStore.habits)
  const isLoading = computed(() => habitStore.isLoading)
  const showAddModal = ref(false)

  const completedCount = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return habitStore.completions.filter((c) => c.habitId === habitId && c.date === today).length
  }

  const selectHabit = (habit: Habit) => {
    console.log('Select habit:', habit)
    // TODO: Переход на страницу деталей привычки
  }

  const editHabit = (habit: Habit) => {
    console.log('Edit habit:', habit)
    // TODO: Открыть модальное окно редактирования
  }

  onMounted(() => {
    habitStore.fetchHabits()
  })
</script>
