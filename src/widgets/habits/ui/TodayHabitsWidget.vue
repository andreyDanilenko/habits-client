<template>
  <div class="bg-white rounded-xl border shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Привычки на сегодня</h2>
      <button
        class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        @click="$emit('add-habit')"
      >
        + Добавить
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <div v-else-if="habits.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-4">Нет привычек на сегодня</p>
      <button
        class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        @click="$emit('add-habit')"
      >
        Создать первую привычку
      </button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center space-x-3">
          <button
            class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
            :class="
              habit.completed
                ? 'bg-indigo-600 border-indigo-600'
                : 'border-gray-300 hover:border-indigo-400'
            "
            @click="toggleCompletion(habit.id)"
          >
            <svg
              v-if="habit.completed"
              class="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
          <div>
            <p class="font-medium text-gray-900">{{ habit.title }}</p>
            <p v-if="habit.description" class="text-sm text-gray-500">
              {{ habit.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useHabitStore } from '@/entities/habit'

  const habitStore = useHabitStore()

  const habits = computed(() => habitStore.todayHabits)
  const isLoading = computed(() => habitStore.isLoading)

  const toggleCompletion = async (habitId: string) => {
    console.log(habitId)

    await habitStore.toggleCompletion(habitId)
  }

  onMounted(() => {
    habitStore.fetchHabits()
  })
</script>
