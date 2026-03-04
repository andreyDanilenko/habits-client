<template>
  <div ref="rootRef" class="relative">
    <Input
      :model-value="displayValue"
      :placeholder="placeholder"
      :label="label"
      :error="error"
      :hint="hint"
      :required="required"
      :disabled="disabled"
      :size="size"
      readonly
      class="cursor-pointer"
      @click="showPicker = true"
    >
      <template #rightIcon>
        <button
          type="button"
          class="inline-flex items-center justify-center w-full h-full min-w-0 min-h-0 p-0 border-0 bg-transparent cursor-pointer text-text-muted hover:text-text-secondary focus:outline-none"
          aria-label="Открыть календарь"
          @click.stop="showPicker = true"
        >
          <CalendarIcon :size="iconSizeForIcon" class="text-current shrink-0 block" />
        </button>
      </template>
    </Input>

    <div
      v-if="showPicker && !disabled"
      class="absolute z-50 mt-1 bg-bg-primary border border-border-default rounded-lg shadow-lg p-4"
      :class="pickerPositionClass"
    >
      <div class="flex items-center justify-between mb-4">
        <button
          type="button"
          class="p-1 hover:bg-bg-tertiary rounded text-text-primary"
          aria-label="Предыдущий месяц"
          @click="prevMonth"
        >
          <ArrowLeftIcon :size="16" class="text-current" />
        </button>
        <span class="text-sm font-medium text-text-primary">
          {{ currentMonthName }} {{ currentYear }}
        </span>
        <button
          type="button"
          class="p-1 hover:bg-bg-tertiary rounded text-text-primary"
          aria-label="Следующий месяц"
          @click="nextMonth"
        >
          <ArrowRightIcon :size="16" class="text-current" />
        </button>
      </div>

      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-xs text-text-muted text-center w-8"
        >
          {{ day }}
        </div>
        <button
          v-for="(date, index) in calendarDays"
          :key="index"
          type="button"
          class="text-sm p-1 rounded hover:bg-bg-tertiary focus:outline-none focus:ring-1 focus:ring-primary-default min-w-8"
          :class="{
            'text-text-muted': !date.isCurrentMonth,
            'text-text-primary': date.isCurrentMonth && !isSelected(date),
            'bg-primary-default text-white hover:bg-primary-dark': isSelected(date),
          }"
          :disabled="!date.isCurrentMonth"
          @click="selectDate(date)"
        >
          {{ date.day }}
        </button>
      </div>

      <div class="flex justify-between mt-4 gap-2">
        <Button
          type="button"
          size="md"
          variant="ghost"
          @click="clearDate"
        >
          Очистить
        </Button>
        <Button
          type="button"
          size="md"
          @click="showPicker = false"
        >
          Закрыть
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon } from './icon'
  import Input from './Input.vue'
  import Button from './Button.vue'
  import type { ComponentSize } from './Button.vue'

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      label?: string
      placeholder?: string
      error?: string
      hint?: string
      required?: boolean
      disabled?: boolean
      size?: ComponentSize
    }>(),
    {
      size: 'lg',
      placeholder: 'ДД.ММ.ГГГГ',
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const rootRef = ref<HTMLElement | null>(null)
  const showPicker = ref(false)
  const currentDate = ref(props.modelValue ? new Date(props.modelValue) : new Date())

  function onClickOutside(e: MouseEvent): void {
    if (!rootRef.value?.contains(e.target as Node)) showPicker.value = false
  }

  onMounted(() => {
    document.addEventListener('click', onClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
  })

  watch(
    () => props.modelValue,
    (val) => {
      currentDate.value = val ? new Date(val) : new Date()
    },
  )

  const displayValue = computed(() => {
    if (!props.modelValue) return ''
    const date = new Date(props.modelValue)
    return date.toLocaleDateString('ru-RU')
  })

  // Иконка календаря меньше инпута по соотношению и по центру (на шаг ниже: lg→md, md→sm, sm→xs)
  const iconSizeForIcon = computed(() => {
    const map: Record<ComponentSize, 'xs' | 'sm' | 'md' | 'lg' | 'xl'> = {
      xs: 'xs',
      sm: 'xs',
      md: 'sm',
      lg: 'md',
      xl: 'lg',
      xxl: 'lg',
    }
    return map[props.size]
  })

  const pickerPositionClass = computed(() => 'left-0')

  const currentYear = computed(() => currentDate.value.getFullYear())
  const currentMonth = computed(() => currentDate.value.getMonth())
  const currentMonthName = computed(() =>
    currentDate.value.toLocaleString('ru-RU', { month: 'long' }),
  )

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  interface CalendarDay {
    day: number
    isCurrentMonth: boolean
    date: Date
  }

  const calendarDays = computed(() => {
    const year = currentYear.value
    const month = currentMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: CalendarDay[] = []
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i),
      })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      })
    }

    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      })
    }

    return days
  })

  function isSelected(day: CalendarDay): boolean {
    if (!props.modelValue || !day.isCurrentMonth) return false
    const selected = new Date(props.modelValue)
    return day.date.toDateString() === selected.toDateString()
  }

  function selectDate(day: CalendarDay): void {
    const date = day.date
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayNum = String(date.getDate()).padStart(2, '0')
    emit('update:modelValue', `${year}-${month}-${dayNum}`)
    showPicker.value = false
  }

  function prevMonth(): void {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
  }

  function nextMonth(): void {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
  }

  function clearDate(): void {
    emit('update:modelValue', '')
    showPicker.value = false
  }
</script>
