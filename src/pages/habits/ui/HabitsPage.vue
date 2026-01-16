<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Мои привычки</h1>
        <p class="mt-2 text-gray-600">Управляйте своими привычками и отслеживайте прогресс</p>
      </div>
      <Button @click="handleAddHabit"> + Добавить привычку </Button>
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
        <Button @click="handleAddHabit"> Создать привычку </Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="habit in habits"
        :key="habit.id"
        class="p-6 hover:shadow-md transition-shadow cursor-pointer group"
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
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="flex items-center space-x-1">
              <button
                class="p-1 text-gray-400 hover:text-gray-600"
                @click.stop="markCompletion(habit)"
                title="Отметить выполнение"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <button
                class="p-1 text-gray-400 hover:text-red-600"
                @click.stop="deleteHabit(habit)"
                title="Удалить привычку"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <ProgressBar
            :current="habitProgressMap[habit.id] || 0"
            :total="habit.dailyGoal || 1"
            label="Прогресс сегодня"
            :color="habit.color"
          />
        </div>

        <div class="flex items-center justify-between pt-4 border-t">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ habitProgressMap[habit.id] || 0 }}</span> выполнений сегодня
          </div>
          <div class="flex items-center space-x-2">
            <button
              class="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              @click.stop="editHabit(habit)"
            >
              Редактировать
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import { Card, Button, ConfirmModal, ProgressBar } from '@/shared/ui'
  import { AddEditHabitModal, HabitDetailsModal, MarkCompletionModal } from '@/features/habit/ui'
  import { useHabitStore, type Habit } from '@/entities/habit'
  import { useModal } from '@/shared/lib/modal'

  const habitStore = useHabitStore()
  const { openModal } = useModal()

  const habits = computed(() => habitStore.habits)
  const isLoading = computed(() => habitStore.isLoading)

  // Создание привычки
  const handleAddHabit = () => {
    openModal<Partial<Habit>>({
      component: AddEditHabitModal,
      props: {
        habit: undefined,
      },
      onConfirm: async (habitData?: Partial<Habit>) => {
        if (habitData) {
          await habitStore.createHabit(habitData)
        }
      },
    })
  }

  // Редактирование привычки
  const editHabit = (habit: Habit) => {
    openModal<Partial<Habit>>({
      component: AddEditHabitModal,
      props: {
        habit,
      },
      onConfirm: async (habitData?: Partial<Habit>) => {
        if (habitData) {
          await habitStore.updateHabit(habit.id, habitData)
        }
      },
    })
  }

  // Просмотр деталей привычки
  const selectHabit = (habit: Habit) => {
    openModal<'edit' | 'delete'>({
      component: HabitDetailsModal,
      props: {
        habit,
        completions: habitStore.completions,
      },
      onConfirm: (action?: 'edit' | 'delete') => {
        if (action === 'edit') {
          editHabit(habit)
        } else if (action === 'delete') {
          deleteHabit(habit)
        }
      },
    })
  }

  // Удаление привычки
  const deleteHabit = (habit: Habit) => {
    openModal<boolean>({
      component: ConfirmModal,
      props: {
        title: 'Удалить привычку',
        message: `Вы уверены, что хотите удалить привычку "${habit.title}"? Все данные о выполнениях также будут удалены.`,
        confirmText: 'Удалить',
        confirmVariant: 'danger',
      },
      onConfirm: async (confirmed?: boolean) => {
        await habitStore.deleteHabit(habit.id)
      },
    })
  }

  // Отметка выполнения
  const markCompletion = (habit: Habit) => {
    openModal<{
      habitId: string
      count: number
      time?: string
      note?: string
      feeling?: string
    }>({
      component: MarkCompletionModal,
      props: {
        habit,
      },
      onConfirm: async (completionData?: {
        habitId: string
        count: number
        time?: string
        note?: string
        feeling?: string
      }) => {
        if (completionData) {
          await habitStore.markCompletion(completionData)
        }
      },
    })
  }

  const habitProgressMap = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const map: Record<string, number> = {}
    
    habitStore.completions.forEach((c) => {
      if (c.date === today) {
        map[c.habitId] = (map[c.habitId] || 0) + 1
      }
    })
    
    return map
  })

  onMounted(() => {
    habitStore.fetchHabits()
  })
</script>
