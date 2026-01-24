<template>
  <ModalContent
    :title="`Отметить выполнение`"
    :description="`Привычка: ${habit.title}`"
    @close="$emit('close')"
  >
    <div class="space-y-4">
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
  import { ModalContent, Button, FormField } from '@/shared/ui'
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
        time?: string
        note?: string
      },
    ]
  }>()

  const isSubmitting = ref(false)

  const form = reactive({
    time: new Date().toTimeString().slice(0, 5), // текущее время HH:MM
    note: '',
  })

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
