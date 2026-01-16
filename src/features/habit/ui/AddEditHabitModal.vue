<template>
  <ModalContent
    :title="isEditing ? 'Редактировать привычку' : 'Создать привычку'"
    @close="$emit('close')"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Название -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Название привычки * </label>
        <input
          v-model="form.title"
          type="text"
          required
          maxlength="50"
          placeholder="Например: Утренняя зарядка"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-gray-500">{{ form.title.length }}/50 символов</p>
      </div>

      <!-- Описание -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Описание (необязательно)
        </label>
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="200"
          placeholder="Краткое описание вашей привычки..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p class="mt-1 text-xs text-gray-500">{{ form.description?.length || 0 }}/200 символов</p>
      </div>

      <!-- Цвет -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Цвет </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            @click="form.color = color"
            class="w-8 h-8 rounded-full border-2 transition-all"
            :class="{
              'border-gray-300': form.color !== color,
              'border-gray-700': form.color === color,
            }"
            :style="{ backgroundColor: color }"
            :title="color"
          />
        </div>
      </div>

      <!-- Иконка -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Иконка </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="icon in icons"
            :key="icon"
            type="button"
            @click="form.icon = icon"
            class="w-10 h-10 flex items-center justify-center rounded-lg border-2 text-lg transition-all hover:bg-gray-50"
            :class="{
              'border-gray-300': form.icon !== icon,
              'border-indigo-500 bg-indigo-50': form.icon === icon,
            }"
          >
            {{ icon }}
          </button>
        </div>
      </div>

      <!-- Цель -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Цель на день </label>
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
      </div>

      <!-- Время дня -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"> Предпочтительное время </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="time in timesOfDay"
            :key="time.value"
            type="button"
            @click="form.preferredTime = time.value"
            class="px-3 py-1.5 text-sm rounded-lg border transition-all"
            :class="{
              'border-gray-300 text-gray-700 bg-white': form.preferredTime !== time.value,
              'border-indigo-500 text-indigo-700 bg-indigo-50': form.preferredTime === time.value,
            }"
          >
            {{ time.label }}
          </button>
        </div>
      </div>

      <!-- Категория -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"> Категория </label>
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
  import { ModalContent, Button } from '@/shared/ui'
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

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert('Пожалуйста, введите название привычки')
      return
    }

    isSubmitting.value = true
    try {
      const habitData = {
        ...form,
        ...(props.habit?.id && { id: props.habit.id }),
      }
      emit('confirm', habitData)
    } finally {
      isSubmitting.value = false
    }
  }
</script>
