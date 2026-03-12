<template>
  <ModalContent
    :title="`Отметить выполнение`"
    :description="`Привычка: ${habit.title}`"
    :fullscreen-on-mobile="isMobile"
    @close="$emit('close')"
  >
    <div class="space-y-4">
      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
          >Во сколько выполнили?</span
        >
        <Input v-model="form.time" type="time" />
      </div>

      <div>
        <span class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
          >Заметка (необязательно)</span
        >
        <Textarea
          v-model="form.note"
          :rows="3"
          placeholder="Как прошло выполнение? Какие были сложности или успехи?"
          resize="none"
        />
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline" class="w-full" @click="$emit('close')">
          Отмена
        </Button>
        <Button type="button" class="w-full" @click="handleSubmit" :loading="isSubmitting">
          Отметить выполнение
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted, onUnmounted } from 'vue'
  import { ModalContent, Button, Input, Textarea } from '@/shared/ui'
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
  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

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
