<template>
  <div class="bg-white rounded-xl border shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900">Привычки на сегодня</h2>
      <Button variant="link" size="sm" @click="$emit('add-habit')"> + Добавить </Button>
    </div>

    <div v-if="isLoading" class="text-center py-8">
      <p class="text-gray-500">Загрузка...</p>
    </div>

    <div v-else-if="habits.length === 0" class="text-center py-8">
      <p class="text-gray-500 mb-4">Нет привычек на сегодня</p>
      <Button variant="link" size="sm" @click="$emit('add-habit')">
        Создать первую привычку
      </Button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Checkbox
          v-model="habit.completed"
          @change="toggleCompletion(habit.id)"
          :label="habit.title"
          :hint="habit.description"
          size="lg"
          :container-class="'items-center'"
        />
        
      
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { useHabitStore } from '@/entities/habit'
  import { Button, Checkbox } from '@/shared/ui'

  const habitStore = useHabitStore()

  const habits = computed(() => habitStore.todayHabits)
  const isLoading = computed(() => habitStore.isLoading)

  const toggleCompletion = async (habitId: string) => {
    await habitStore.toggleCompletion(habitId)
  }

  onMounted(() => {
    habitStore.fetchHabits()
  })
</script>
