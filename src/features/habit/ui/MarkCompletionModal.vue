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
          <SelectButton
            v-for="count in [1, 2, 3, 4, 5]"
            :key="count"
            :is-selected="form.count === count"
            size="lg"
            @click="form.count = count"
          >
            {{ count }}
          </SelectButton>
        </div>
      </div>

      <!-- Время выполнения -->
      <FormField label="Во сколько выполнили?">
        <input
          v-model="form.time"
          type="time"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </FormField>

      <!-- Заметка -->
      <FormField label="Заметка (необязательно)">
        <textarea
          v-model="form.note"
          rows="3"
          placeholder="Как прошло выполнение? Какие были сложности или успехи?"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </FormField>

      <!-- Чувства после выполнения -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Как вы себя чувствуете после выполнения?
        </label>
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="feeling in feelings"
            :key="feeling.value"
            :is-selected="form.feeling === feeling.value"
            size="sm"
            :label="`${feeling.emoji} ${feeling.label}`"
            @click="form.feeling = feeling.value"
          />
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
  import { ModalContent, Button, FormField, SelectButton } from '@/shared/ui'
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
