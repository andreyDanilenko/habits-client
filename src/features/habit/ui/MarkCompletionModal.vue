<template>
  <ModalContent
    :title="`Отметить выполнение`"
    :description="`Привычка: ${habit.title}`"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <!-- Количество раз -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Сколько раз выполнили сегодня?
        </label>
        <div class="flex items-center space-x-4">
          <button
            v-for="count in [1, 2, 3, 4, 5]"
            :key="count"
            type="button"
            @click="form.count = count"
            class="w-12 h-12 flex items-center justify-center rounded-lg border-2 text-lg font-medium transition-all"
            :class="{
              'border-gray-300 text-gray-700 bg-white': form.count !== count,
              'border-indigo-500 text-indigo-700 bg-indigo-50': form.count === count,
            }"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <!-- Время выполнения -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Во сколько выполнили? </label>
        <input
          v-model="form.time"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Заметка -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Заметка (необязательно)
        </label>
        <textarea
          v-model="form.note"
          rows="3"
          placeholder="Как прошло выполнение? Какие были сложности или успехи?"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <!-- Чувства после выполнения -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Как вы себя чувствуете после выполнения?
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="feeling in feelings"
            :key="feeling.value"
            type="button"
            @click="form.feeling = feeling.value"
            class="px-3 py-1.5 text-sm rounded-lg border transition-all"
            :class="{
              'border-gray-300 text-gray-700 bg-white': form.feeling !== feeling.value,
              'border-indigo-500 text-indigo-700 bg-indigo-50': form.feeling === feeling.value,
            }"
          >
            {{ feeling.emoji }} {{ feeling.label }}
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="$emit('close')"> Отмена </Button>
        <Button type="button" @click="handleSubmit" :loading="isSubmitting">
          Отметить выполнение
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue'
  import { ModalContent, Button } from '@/shared/ui'
  import type { Habit } from '@/entities/habit'

  interface Props {
    habit: Habit
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    confirm: [
      data: {
        habitId: string
        count: number
        time?: string
        note?: string
        feeling?: string
      },
    ]
  }>()

  const isSubmitting = ref(false)

  const form = reactive({
    count: 1,
    time: new Date().toTimeString().slice(0, 5), // текущее время HH:MM
    note: '',
    feeling: '',
  })

  const feelings = [
    { value: 'great', emoji: '😊', label: 'Отлично' },
    { value: 'good', emoji: '🙂', label: 'Хорошо' },
    { value: 'ok', emoji: '😐', label: 'Нормально' },
    { value: 'tired', emoji: '😴', label: 'Устал(а)' },
    { value: 'hard', emoji: '😓', label: 'Было тяжело' },
  ]

  const handleSubmit = async () => {
    isSubmitting.value = true
    try {
      const completionData = {
        habitId: props.habit.id,
        ...form,
      }
      emit('confirm', completionData)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
