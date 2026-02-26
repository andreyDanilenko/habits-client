<template>
  <ModalContent
    :title="isEditing ? 'Редактировать привычку' : 'Создать привычку'"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <FormField
        label="Название привычки"
        required
        :show-char-count="true"
        :current-length="form.title.length"
        :max-length="50"
      >
        <Input
          v-model="form.title"
          type="text"
          required
          maxlength="50"
          placeholder="Например: Утренняя зарядка"
        />
      </FormField>

      <FormField
        label="Описание (необязательно)"
        :show-char-count="true"
        :current-length="form.description?.length || 0"
        :max-length="200"
      >
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="200"
          placeholder="Краткое описание вашей привычки..."
          class="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary text-text-primary placeholder:text-text-muted resize-none"
        />
      </FormField>

      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2"> Цвет </label>
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="color in colors"
            :key="color"
            :is-selected="form.color === color"
            size="circle"
            :custom-style="{ backgroundColor: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2"> Иконка </label>
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="icon in icons"
            :key="icon"
            :is-selected="form.icon === icon"
            size="md"
            @click="form.icon = icon"
          >
            {{ icon }}
          </SelectButton>
        </div>
      </div>

      <FormField label="Цель на день">
        <div class="flex items-center space-x-2">
          <Input
            v-model.number="form.dailyGoal"
            type="number"
            min="1"
            max="10"
            class="w-20"
          />
          <span class="text-text-secondary">раз(а) в день</span>
        </div>
      </FormField>

      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2"> Предпочтительное время </label>
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="time in timesOfDay"
            :key="time.value"
            :is-selected="form.preferredTime === time.value"
            size="sm"
            :label="time.label"
            @click="form.preferredTime = time.value"
          />
        </div>
      </div>

      <FormField label="Категория">
        <select
          v-model="form.category"
          class="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary-default focus:border-primary-default bg-bg-primary text-text-primary"
        >
          <option value="" class="text-text-muted">Без категории</option>
          <option value="health" class="text-text-primary">Здоровье</option>
          <option value="sport" class="text-text-primary">Спорт</option>
          <option value="study" class="text-text-primary">Учеба</option>
          <option value="work" class="text-text-primary">Работа</option>
          <option value="personal" class="text-text-primary">Личное</option>
        </select>
      </FormField>

      <div>
        <label class="block text-sm font-medium text-text-secondary mb-2"> Тип расписания </label>
        <div class="flex gap-2">
          <SelectButton
            :is-selected="form.scheduleType === 'recurring'"
            size="sm"
            label="Регулярная"
            @click="form.scheduleType = 'recurring'"
          />
          <SelectButton
            :is-selected="form.scheduleType === 'one_time'"
            size="sm"
            label="Разовая"
            @click="form.scheduleType = 'one_time'"
          />
        </div>
      </div>

      <div v-if="form.scheduleType === 'recurring'">
        <label class="block text-sm font-medium text-text-secondary mb-2">
          Дни недели <span class="text-error-default">*</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <SelectButton
            v-for="day in weekDays"
            :key="day.value"
            :is-selected="isDaySelected(day.value)"
            size="sm"
            :label="day.label"
            @click="toggleDay(day.value)"
          />
        </div>
        <p v-if="form.recurringDays.length === 0" class="mt-1 text-sm text-error-default">
          Выберите хотя бы один день недели
        </p>
      </div>

      <div v-if="form.scheduleType === 'one_time'">
        <FormField label="Дата выполнения" required>
          <Input
            v-model="form.oneTimeDate"
            type="date"
            required
            :min="minDate"
          />
        </FormField>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="$emit('close')"> Отмена </Button>
        <Button type="submit" @click="handleSubmit" :loading="isSubmitting">
          {{ isEditing ? 'Сохранить' : 'Создать' }}
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { reactive, computed, ref } from 'vue'
  import { ModalContent, Button, FormField, SelectButton, Input } from '@/shared/ui'
  import type { Habit } from '@/entities/habit'

  interface Props {
    habit?: Habit
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    confirm: [data: Partial<Habit>]
  }>()

  const isSubmitting = ref(false)
  const isEditing = computed(() => !!props.habit)

  const form = reactive({
    title: props.habit?.title || '',
    description: props.habit?.description || '',
    color: props.habit?.color || '#6366f1',
    icon: props.habit?.icon || '📝',
    dailyGoal: props.habit?.dailyGoal || 1,
    preferredTime: props.habit?.preferredTime || 'any',
    category: props.habit?.category || '',
    scheduleType: (props.habit?.scheduleType as 'recurring' | 'one_time') || 'recurring',
    recurringDays: props.habit?.recurringDays
      ? [...props.habit.recurringDays]
      : [0, 1, 2, 3, 4, 5, 6],
    oneTimeDate: props.habit?.oneTimeDate || '',
    isActive: props.habit?.isActive ?? true,
  })

  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#84cc16', // lime
  ]

  const icons = ['💪', '🧠', '🏃', '📚', '💧', '🍎', '🎯', '🌟', '🧘', '🚴']

  const timesOfDay = [
    { value: 'morning', label: 'Утро' },
    { value: 'afternoon', label: 'День' },
    { value: 'evening', label: 'Вечер' },
    { value: 'any', label: 'Любое время' },
  ]

  const weekDays = [
    { value: 0, label: 'Вс' },
    { value: 1, label: 'Пн' },
    { value: 2, label: 'Вт' },
    { value: 3, label: 'Ср' },
    { value: 4, label: 'Чт' },
    { value: 5, label: 'Пт' },
    { value: 6, label: 'Сб' },
  ]

  const minDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const selectedDaysSet = computed(() => new Set(form.recurringDays))
  const isDaySelected = (dayValue: number) => selectedDaysSet.value.has(dayValue)

  const toggleDay = (dayValue: number) => {
    if (selectedDaysSet.value.has(dayValue)) {
      form.recurringDays = form.recurringDays.filter((day) => day !== dayValue)
    } else {
      form.recurringDays.push(dayValue)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('Пожалуйста, введите название привычки')
      return
    }

    if (form.scheduleType === 'recurring' && form.recurringDays.length === 0) {
      alert('Пожалуйста, выберите хотя бы один день недели')
      return
    }

    if (form.scheduleType === 'one_time' && !form.oneTimeDate) {
      alert('Пожалуйста, выберите дату выполнения')
      return
    }

    isSubmitting.value = true
    try {
      const habitData: any = {
        title: form.title,
        description: form.description || undefined,
        color: form.color,
        icon: form.icon || undefined,
        dailyGoal: form.dailyGoal,
        preferredTime: form.preferredTime || undefined,
        category: form.category || undefined,
        scheduleType: form.scheduleType,
        isActive: form.isActive,
      }

      if (form.scheduleType === 'recurring') {
        habitData.recurringDays = form.recurringDays
        if (isEditing.value && props.habit?.scheduleType === 'one_time') {
          habitData.oneTimeDate = null
        } else if (!isEditing.value) {
          delete habitData.oneTimeDate
        }
      } else if (form.scheduleType === 'one_time') {
        habitData.oneTimeDate = form.oneTimeDate
        if (isEditing.value && props.habit?.scheduleType === 'recurring') {
          habitData.recurringDays = null
        } else if (!isEditing.value) {
          delete habitData.recurringDays
        }
      }

      if (props.habit?.id) {
        habitData.id = props.habit.id
      }

      emit('confirm', habitData)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
