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
          <CalendarIcon :size="calendarIconSize" class="text-current shrink-0 block" />
        </button>
      </template>
    </Input>

    <div
      v-if="showPicker && !disabled"
      ref="pickerRef"
      class="absolute z-50 bg-bg-primary border border-border-default rounded-lg shadow-lg p-4 min-w-[280px]"
      :style="pickerStyles"
    >
      <div class="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          class="p-1 hover:bg-bg-tertiary rounded text-text-primary shrink-0"
          aria-label="Предыдущий месяц"
          @click="prevMonth"
        >
          <ArrowLeftIcon :size="16" class="text-current" />
        </button>
        <div class="flex flex-1 gap-2 min-w-0" @click.stop>
          <div class="flex-1 min-w-0">
            <Select
              :model-value="currentMonth"
              :options="monthOptions"
              size="sm"
              @update:model-value="setMonth"
            />
          </div>
          <div class="w-24 shrink-0">
            <Select
              :model-value="currentYear"
              :options="yearOptions"
              size="sm"
              @update:model-value="setYear"
            />
          </div>
        </div>
        <button
          type="button"
          class="p-1 hover:bg-bg-tertiary rounded text-text-primary shrink-0"
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
          class="text-xs text-text-muted text-center w-8 h-8 flex items-center justify-center"
        >
          {{ day }}
        </div>
        <button
          v-for="(date, index) in calendarDays"
          :key="index"
          type="button"
          class="text-sm rounded hover:bg-bg-tertiary focus:outline-none focus:ring-1 focus:ring-primary-default w-8 h-8 flex items-center justify-center"
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
        <Button type="button" size="md" variant="ghost" @click="clearDate"> Очистить </Button>
        <Button type="button" size="md" @click="showPicker = false"> Закрыть </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { CalendarIcon, ArrowLeftIcon, ArrowRightIcon } from './icon'
  import Input from './Input.vue'
  import Button from './Button.vue'
  import Select from './Select.vue'
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

  /** Парсит "YYYY-MM-DD" как локальную дату (без сдвига по таймзоне). */
  function parseLocalDate(value: string): Date {
    const [y, m, d] = value.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const rootRef = ref<HTMLElement | null>(null)
  const pickerRef = ref<HTMLElement | null>(null)
  const showPicker = ref(false)
  const currentDate = ref(props.modelValue ? parseLocalDate(props.modelValue) : new Date())

  // Реактивные переменные для позиционирования
  const pickerTop = ref('100%')
  const pickerLeft = ref('0')
  const pickerMargin = ref('4px 0 0 0')

  // Размер иконки календаря в зависимости от размера инпута
  const calendarIconSize = computed(() => {
    const map: Record<ComponentSize, number> = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
      xxl: 24,
    }
    return map[props.size]
  })

  // Стили для пикера
  const pickerStyles = computed(() => ({
    top: pickerTop.value,
    left: pickerLeft.value,
    margin: pickerMargin.value,
  }))

  // Функция для определения оптимальной позиции пикера
  const updatePickerPosition = async () => {
    if (!showPicker.value || !rootRef.value || !pickerRef.value) return

    await nextTick()
    await new Promise((r) => requestAnimationFrame(r))

    const inputRect = rootRef.value.getBoundingClientRect()
    const pickerRect = pickerRef.value.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Сбрасываем стили перед вычислением
    pickerRef.value.style.top = ''
    pickerRef.value.style.bottom = ''
    pickerRef.value.style.left = ''
    pickerRef.value.style.right = ''
    pickerRef.value.style.margin = ''

    // Проверяем горизонтальное позиционирование
    const spaceRight = viewportWidth - inputRect.left
    const spaceLeft = inputRect.right

    if (spaceRight < pickerRect.width && spaceLeft > pickerRect.width) {
      // Справа мало места, слева достаточно - позиционируем справа
      pickerLeft.value = 'auto'
      pickerRef.value.style.right = '0'
      pickerRef.value.style.left = 'auto'
    } else {
      // По умолчанию позиционируем слева
      pickerLeft.value = '0'
      pickerRef.value.style.left = '0'
      pickerRef.value.style.right = 'auto'
    }

    // Проверяем вертикальное позиционирование
    const spaceBelow = viewportHeight - inputRect.bottom
    const spaceAbove = inputRect.top

    if (spaceBelow < pickerRect.height && spaceAbove > pickerRect.height) {
      // Снизу мало места, сверху достаточно - позиционируем сверху
      pickerTop.value = 'auto'
      pickerRef.value.style.bottom = '100%'
      pickerRef.value.style.top = 'auto'
      pickerMargin.value = '0 0 4px 0'
    } else {
      // По умолчанию позиционируем снизу
      pickerTop.value = '100%'
      pickerRef.value.style.top = '100%'
      pickerRef.value.style.bottom = 'auto'
      pickerMargin.value = '4px 0 0 0'
    }
  }

  function onClickOutside(e: MouseEvent): void {
    if (!rootRef.value?.contains(e.target as Node)) {
      showPicker.value = false
    }
  }

  const handleResizeOrScroll = () => {
    if (showPicker.value) updatePickerPosition()
  }

  onMounted(() => {
    document.addEventListener('click', onClickOutside)
    window.addEventListener('resize', handleResizeOrScroll)
    window.addEventListener('scroll', handleResizeOrScroll, true)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', onClickOutside)
    window.removeEventListener('resize', handleResizeOrScroll)
    window.removeEventListener('scroll', handleResizeOrScroll, true)
  })

  watch(showPicker, async (newVal) => {
    if (newVal) await updatePickerPosition()
  })

  watch(
    () => props.modelValue,
    (val) => {
      currentDate.value = val ? parseLocalDate(val) : new Date()
    },
  )

  const displayValue = computed(() => {
    if (!props.modelValue) return ''
    const date = parseLocalDate(props.modelValue)
    return date.toLocaleDateString('ru-RU')
  })

  const currentYear = computed(() => currentDate.value.getFullYear())
  const currentMonth = computed(() => currentDate.value.getMonth())

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ]

  const monthOptions = computed(() =>
    monthNames.map((label, value) => ({ value, label })),
  )

  const yearRange = computed(() => {
    const y = currentDate.value.getFullYear()
    const from = Math.min(y, Math.max(1970, y - 50))
    const to = Math.max(y, Math.min(2100, y + 50))
    const years: number[] = []
    for (let i = from; i <= to; i++) years.push(i)
    return years
  })

  const yearOptions = computed(() =>
    yearRange.value.map((value) => ({ value, label: String(value) })),
  )

  function setMonth(v: string | number | null | undefined): void {
    if (v == null) return
    currentDate.value = new Date(currentYear.value, Number(v), 1)
  }

  function setYear(v: string | number | null | undefined): void {
    if (v == null) return
    currentDate.value = new Date(Number(v), currentMonth.value, 1)
  }

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
    const selected = parseLocalDate(props.modelValue)
    return day.date.getTime() === selected.getTime()
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
