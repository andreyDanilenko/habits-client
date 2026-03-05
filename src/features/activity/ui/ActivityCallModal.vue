<template>
  <Modal
    :is-open="isOpen"
    content-class="bg-bg-primary rounded-xl shadow-lg p-6 max-w-md w-full"
    @close="handleClose"
  >
    <h2 class="text-lg font-semibold text-text-primary mb-4">Запись звонка</h2>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-xs font-medium text-text-muted mb-2">Направление</label>
        <div class="flex gap-4">
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="direction" type="radio" value="in" class="text-primary-default" />
            <span class="text-sm">Входящий</span>
          </label>
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input v-model="direction" type="radio" value="out" class="text-primary-default" />
            <span class="text-sm">Исходящий</span>
          </label>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-2">Результат</label>
        <div class="space-y-2">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="status" type="radio" value="answered" class="text-primary-default" />
            <span class="text-sm">Дозвонился</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="status" type="radio" value="missed" class="text-primary-default" />
            <span class="text-sm">Не дозвонился</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="status" type="radio" value="no_answer" class="text-primary-default" />
            <span class="text-sm">Перезвонить позже</span>
          </label>
        </div>
      </div>
      <div v-if="status === 'answered'">
        <label class="block text-xs font-medium text-text-muted mb-1">Длительность (мм:сс)</label>
        <div class="flex gap-2 items-center">
          <input
            v-model="durationMinutes"
            type="number"
            min="0"
            max="59"
            placeholder="мм"
            class="w-20 px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
          <span class="text-text-muted">:</span>
          <input
            v-model="durationSeconds"
            type="number"
            min="0"
            max="59"
            placeholder="сс"
            class="w-20 px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
        </div>
        <p v-if="durationError" class="mt-1 text-sm text-danger-default">{{ durationError }}</p>
      </div>
      <div v-if="status === 'no_answer'">
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input
            v-model="createTask"
            type="checkbox"
            class="rounded border-border-default text-primary-default"
          />
          <span class="text-sm text-text-muted">Создать задачу (напоминание)</span>
        </label>
        <input
          v-if="createTask"
          v-model="taskTitle"
          type="text"
          placeholder="Тема задачи"
          class="mt-2 w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-text-muted mb-1">Описание разговора</label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Кратко опишите разговор..."
          class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm placeholder-text-muted"
        />
      </div>
      <div>
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input
            v-model="isImportant"
            type="checkbox"
            class="rounded border-border-default text-primary-default"
          />
          <span class="text-sm text-text-muted">Важное</span>
        </label>
      </div>
      <p v-if="validationError" class="text-sm text-danger-default">{{ validationError }}</p>
      <div class="flex gap-2 pt-2">
        <Button type="button" variant="ghost" @click="handleClose">Отмена</Button>
        <Button type="submit" variant="primary">Сохранить</Button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Modal, Button } from '@/shared/ui'
  import type { CreateCallDto, ActivityEntityType } from '@/entities/activity'

  const props = defineProps<{
    isOpen: boolean
    entityType: ActivityEntityType
    entityId: string
  }>()

  const emit = defineEmits<{
    close: []
    save: [dto: CreateCallDto]
  }>()

  const direction = ref<'in' | 'out'>('out')
  const status = ref<'answered' | 'missed' | 'no_answer'>('answered')
  const durationMinutes = ref<string>('')
  const durationSeconds = ref<string>('')
  const description = ref('')
  const isImportant = ref(false)
  const createTask = ref(false)
  const taskTitle = ref('')

  const durationError = computed(() => {
    if (status.value !== 'answered') return null
    const m = parseInt(durationMinutes.value, 10)
    const s = parseInt(durationSeconds.value, 10)
    if (Number.isNaN(m) && Number.isNaN(s)) return 'Укажите длительность звонка.'
    if (m < 0 || m > 59 || s < 0 || s > 59) return 'Минуты и секунды от 0 до 59.'
    return null
  })

  const validationError = computed(() => {
    if (status.value === 'answered' && durationError.value) return durationError.value
    return null
  })

  function getDurationSeconds(): number | undefined {
    if (status.value !== 'answered') return undefined
    const m = parseInt(durationMinutes.value, 10)
    const s = parseInt(durationSeconds.value, 10)
    if (Number.isNaN(m) && Number.isNaN(s)) return undefined
    return (Number.isNaN(m) ? 0 : m) * 60 + (Number.isNaN(s) ? 0 : s)
  }

  function handleClose() {
    emit('close')
  }

  function handleSubmit() {
    if (validationError.value) return
    const duration = getDurationSeconds()
    if (status.value === 'answered' && (duration == null || duration === 0)) {
      return
    }
    const dto: CreateCallDto = {
      entityType: props.entityType,
      entityId: props.entityId,
      direction: direction.value,
      status: status.value,
      duration: duration,
      description: description.value.trim() || undefined,
      isImportant: isImportant.value || undefined,
    }
    emit('save', dto)
    resetForm()
    emit('close')
  }

  function resetForm() {
    direction.value = 'out'
    status.value = 'answered'
    durationMinutes.value = ''
    durationSeconds.value = ''
    description.value = ''
    isImportant.value = false
    createTask.value = false
    taskTitle.value = ''
  }

  watch(
    () => props.isOpen,
    (open) => {
      if (!open) resetForm()
    },
  )
</script>
