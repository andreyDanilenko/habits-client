<template>
  <ModalContent
    :title="isEditing ? 'Редактировать привычку' : 'Создать привычку'"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Название -->
      <FormField
        label="Название привычки"
        required
        :show-char-count="true"
        :current-length="form.title.length"
        :max-length="50"
      >
        <input
          v-model="form.title"
          type="text"
          required
          maxlength="50"
          placeholder="Например: Утренняя зарядка"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </FormField>

      <!-- Описание -->
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
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </FormField>

      <!-- Цвет -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Цвет </label>
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

      <!-- Иконка -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Иконка </label>
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

      <!-- Цель -->
      <FormField label="Цель на день">
        <div class="flex items-center space-x-2">
          <input
            v-model.number="form.dailyGoal"
            type="number"
            min="1"
            max="10"
            class="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span class="text-gray-600">раз(а) в день</span>
        </div>
      </FormField>

      <!-- Время дня -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Предпочтительное время </label>
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

      <!-- Категория -->
      <FormField label="Категория">
        <select
          v-model="form.category"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Без категории</option>
          <option value="health">Здоровье</option>
          <option value="sport">Спорт</option>
          <option value="study">Учеба</option>
          <option value="work">Работа</option>
          <option value="personal">Личное</option>
        </select>
      </FormField>

      <!-- Тип расписания -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Тип расписания </label>
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

      <!-- Для регулярных привычек: выбор дней недели -->
      <div v-if="form.scheduleType === 'recurring'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Дни недели <span class="text-red-500">*</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="day in weekDays"
            :key="day.value"
            class="flex items-center space-x-2 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="day.value"
              v-model="form.recurringDays"
              class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span class="text-sm text-gray-700">{{ day.label }}</span>
          </label>
        </div>
        <p v-if="form.recurringDays.length === 0" class="mt-1 text-sm text-red-500">
          Выберите хотя бы один день недели
        </p>
      </div>

      <!-- Для разовых привычек: выбор даты -->
      <div v-if="form.scheduleType === 'one_time'">
        <FormField label="Дата выполнения" required>
          <input
            v-model="form.oneTimeDate"
            type="date"
            required
            :min="minDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
  import { ModalContent, Button, FormField, SelectButton } from '@/shared/ui'
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
      : [0, 1, 2, 3, 4, 5, 6], // По умолчанию все дни: 0=Вс, 1=Пн, ..., 6=Сб
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

  // Минимальная дата для разовых привычек (сегодня)
  const minDate = computed(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('Пожалуйста, введите название привычки')
      return
    }

    // Валидация для регулярных привычек
    if (form.scheduleType === 'recurring' && form.recurringDays.length === 0) {
      alert('Пожалуйста, выберите хотя бы один день недели')
      return
    }

    // Валидация для разовых привычек
    if (form.scheduleType === 'one_time' && !form.oneTimeDate) {
      alert('Пожалуйста, выберите дату выполнения')
      return
    }

    isSubmitting.value = true
    try {
      // Подготавливаем данные для отправки
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

      // Добавляем/очищаем поля в зависимости от типа расписания
      if (form.scheduleType === 'recurring') {
        habitData.recurringDays = form.recurringDays
        // Явно очищаем oneTimeDate при смене на recurring (если редактируем и тип меняется)
        if (isEditing.value && props.habit?.scheduleType === 'one_time') {
          habitData.oneTimeDate = null
        } else if (!isEditing.value) {
          // При создании не отправляем oneTimeDate для recurring
          delete habitData.oneTimeDate
        }
      } else if (form.scheduleType === 'one_time') {
        habitData.oneTimeDate = form.oneTimeDate
        // Явно очищаем recurringDays при смене на one_time (если редактируем и тип меняется)
        if (isEditing.value && props.habit?.scheduleType === 'recurring') {
          habitData.recurringDays = null
        } else if (!isEditing.value) {
          // При создании не отправляем recurringDays для one_time
          delete habitData.recurringDays
        }
      }

      // Если редактируем, добавляем id
      if (props.habit?.id) {
        habitData.id = props.habit.id
      }

      emit('confirm', habitData)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
