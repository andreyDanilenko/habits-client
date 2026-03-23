<template>
  <ModalContent
    :title="isEditing ? t('habits.form.titleEdit') : t('habits.form.titleCreate')"
    :description="isEditing ? undefined : t('habits.form.subtitleCreate')"
    :fullscreen-on-mobile="isMobile"
    @close="$emit('close')"
  >
    <form id="habit-form" @submit.prevent="handleSubmit" class="flex flex-col min-h-0">
      <div class="space-y-4 lg:space-y-5">
        <div>
          <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            {{ t('habits.form.name') }} <span class="text-error-default">*</span>
          </label>
          <Input
            v-model="form.title"
            type="text"
            required
            maxlength="50"
            :placeholder="t('habits.form.placeholderTitle')"
            :error="errors.title"
            :class="isMobile ? 'text-base' : ''"
          />
          <span class="block mt-(--spacing-1) text-(--text-xs) text-text-secondary">
            {{ form.title.length }} / 50
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-2">{{
              t('habits.form.color')
            }}</label>
            <div class="flex flex-wrap gap-2 min-h-[44px]">
              <SelectButton
                v-for="color in colors"
                :key="color"
                :is-selected="form.color === color"
                size="circle"
                :custom-style="{ backgroundColor: color }"
                custom-class="min-w-[44px] min-h-[44px] w-11 h-11 md:!min-w-0 md:!min-h-0 md:!w-8 md:!h-8"
                @click="form.color = color"
              />
            </div>
          </div>
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-2">{{
              t('habits.form.icon')
            }}</label>
            <div class="flex flex-wrap gap-2 min-h-[44px]">
              <SelectButton
                v-for="icon in icons"
                :key="icon"
                :is-selected="form.icon === icon"
                size="md"
                custom-class="min-w-[44px] min-h-[44px] text-xl md:!min-w-0 md:!min-h-0 md:!w-10 md:!h-10 md:!text-lg"
                @click="form.icon = icon"
              >
                {{ icon }}
              </SelectButton>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-(--text-sm) font-medium text-text-secondary mb-2">
            {{ t('habits.form.scheduleType') }}
          </label>
          <div class="flex gap-2 flex-wrap">
            <SelectButton
              :is-selected="form.scheduleType === 'recurring'"
              :label="t('habits.form.scheduleRecurring')"
              custom-class="min-h-[44px] md:!min-h-0"
              @click="form.scheduleType = 'recurring'"
            />
            <SelectButton
              :is-selected="form.scheduleType === 'one_time'"
              :label="t('habits.form.scheduleOneTime')"
              custom-class="min-h-[44px] md:!min-h-0"
              @click="form.scheduleType = 'one_time'"
            />
          </div>
        </div>

        <div v-if="form.scheduleType === 'recurring'">
          <label class="block text-(--text-sm) font-medium text-text-secondary mb-2">
            {{ t('habits.form.weekDays') }} <span class="text-error-default">*</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <SelectButton
              v-for="day in weekDays"
              :key="day.value"
              :is-selected="isDaySelected(day.value)"
              :label="day.label"
              custom-class="min-h-[44px] md:!min-h-0"
              @click="toggleDay(day.value)"
            />
          </div>
          <p v-if="errors.recurringDays" class="mt-1 text-(--text-xs) text-error-default">
            {{ errors.recurringDays }}
          </p>
        </div>

        <div v-if="form.scheduleType === 'one_time'">
          <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
            {{ t('habits.form.oneTimeDate') }} <span class="text-error-default">*</span>
          </label>
          <DatePicker v-model="form.oneTimeDate" />
          <p v-if="errors.oneTimeDate" class="mt-1 text-(--text-xs) text-error-default">
            {{ errors.oneTimeDate }}
          </p>
        </div>

        <!-- Collapsible "Дополнительно" (create mode) -->
        <div
          v-if="!isEditing"
          class="border border-border-default rounded-(--radius-md) overflow-hidden"
        >
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-left text-(--text-sm) font-medium text-text-primary hover:bg-bg-tertiary transition-colors"
            @click="showAdvanced = !showAdvanced"
          >
            <span>{{ t('habits.form.advanced') }}</span>
            <ChevronDownIcon
              class="w-5 h-5 text-text-muted transition-transform"
              :class="{ 'rotate-180': showAdvanced }"
            />
          </button>
          <div v-show="showAdvanced" class="px-4 pb-4 pt-0 space-y-4 border-t border-border-light">
            <div>
              <label
                class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >
                {{ t('habits.form.description') }}
              </label>
              <Textarea
                v-model="form.description"
                :rows="2"
                :maxlength="200"
                :placeholder="t('habits.form.placeholderDescription')"
                resize="none"
              />
              <span class="block mt-(--spacing-1) text-(--text-xs) text-text-secondary">
                {{ form.description?.length || 0 }} / 200
              </span>
            </div>
            <div>
              <label
                class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >
                {{ t('habits.form.dailyGoal') }}
              </label>
              <div class="flex items-center gap-2">
                <Input
                  :model-value="String(form.dailyGoal)"
                  type="number"
                  min="1"
                  max="10"
                  class="w-20"
                  @update:model-value="
                    (v) => (form.dailyGoal = Math.max(1, Math.min(10, Number(v) || 1)))
                  "
                />
                <span class="text-text-secondary">{{ t('habits.form.timesPerDay') }}</span>
              </div>
            </div>
            <div>
              <label
                class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >
                {{ t('habits.form.preferredTime') }}
              </label>
              <div class="flex flex-wrap gap-2">
                <SelectButton
                  v-for="time in timesOfDay"
                  :key="time.value"
                  :is-selected="form.preferredTime === time.value"
                  :label="time.label"
                  @click="form.preferredTime = time.value"
                />
              </div>
            </div>
            <div>
              <label
                class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)"
              >
                {{ t('habits.form.category') }}
              </label>
              <Select
                v-model="form.category"
                :options="categoryOptions"
                :placeholder="t('habits.form.noCategory')"
              />
            </div>
          </div>
        </div>

        <!-- Editing: show all fields expanded -->
        <template v-if="isEditing">
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              {{ t('habits.form.description') }}
            </label>
            <Textarea
              v-model="form.description"
              :rows="3"
              :maxlength="200"
              :placeholder="t('habits.form.placeholderDescriptionEdit')"
              resize="none"
            />
            <span class="block mt-(--spacing-1) text-(--text-xs) text-text-secondary">
              {{ form.description?.length || 0 }} / 200
            </span>
          </div>
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              {{ t('habits.form.dailyGoal') }}
            </label>
            <div class="flex items-center gap-2">
              <Input
                :model-value="String(form.dailyGoal)"
                type="number"
                min="1"
                max="10"
                class="w-20"
                @update:model-value="
                  (v) => (form.dailyGoal = Math.max(1, Math.min(10, Number(v) || 1)))
                "
              />
              <span class="text-text-secondary">{{ t('habits.form.timesPerDay') }}</span>
            </div>
          </div>
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              {{ t('habits.form.preferredTime') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <SelectButton
                v-for="time in timesOfDay"
                :key="time.value"
                :is-selected="form.preferredTime === time.value"
                :label="time.label"
                @click="form.preferredTime = time.value"
              />
            </div>
          </div>
          <div>
            <label class="block text-(--text-sm) font-medium text-text-secondary mb-(--spacing-1)">
              {{ t('habits.form.category') }}
            </label>
            <Select
              v-model="form.category"
              :options="categoryOptions"
              :placeholder="t('habits.form.noCategory')"
            />
          </div>
        </template>
      </div>
    </form>

    <template #footer>
      <div class="grid gap-3" :class="isMobile ? 'grid-cols-2' : 'grid-cols-[1fr_auto]'">
        <Button type="button" variant="outline" class="w-full" @click="$emit('close')">
          {{ t('common.actions.cancel') }}
        </Button>
        <Button form="habit-form" type="submit" :loading="isSubmitting" :disabled="!isStep1Valid">
          {{ isEditing ? t('common.actions.save') : t('common.actions.create') }}
        </Button>
      </div>
    </template>
  </ModalContent>
</template>

<script setup lang="ts">
  import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'
  import { useAppI18n } from '@/shared/lib/i18n'
  import {
    ModalContent,
    Button,
    SelectButton,
    Input,
    Select,
    DatePicker,
    Textarea,
  } from '@/shared/ui'
  import { ChevronDownIcon } from '@/shared/ui/icon'
  import type { Habit } from '@/entities/habit'

  interface Props {
    habit?: Habit
  }

  const { t } = useAppI18n()

  const props = defineProps<Props>()
  const emit = defineEmits<{
    close: []
    confirm: [data: Partial<Habit>]
  }>()

  const isSubmitting = ref(false)
  const isEditing = computed(() => !!props.habit)
  const showAdvanced = ref(false)
  const isMobile = ref(false)

  const errors = reactive({
    title: '',
    recurringDays: '',
    oneTimeDate: '',
  })

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
    '#6366f1',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#3b82f6',
    '#06b6d4',
    '#84cc16',
  ]

  const icons = ['💪', '🧠', '🏃', '📚', '💧', '🍎', '🎯', '🌟', '🧘', '🚴']

  const timesOfDay = computed(() => [
    { value: 'morning', label: t('habits.timeOfDay.morning') },
    { value: 'afternoon', label: t('habits.timeOfDay.afternoon') },
    { value: 'evening', label: t('habits.timeOfDay.evening') },
    { value: 'any', label: t('habits.timeOfDay.any') },
  ])

  const categoryOptions = computed(() => [
    { value: '', label: t('habits.form.noCategory') },
    { value: 'health', label: t('habits.category.health') },
    { value: 'sport', label: t('habits.category.sport') },
    { value: 'study', label: t('habits.category.study') },
    { value: 'work', label: t('habits.category.work') },
    { value: 'personal', label: t('habits.category.personal') },
  ])

  const weekDays = computed(() =>
    [0, 1, 2, 3, 4, 5, 6].map((value) => ({
      value,
      label: t('habits.weekdayShort.' + value),
    })),
  )

  const selectedDaysSet = computed(() => new Set(form.recurringDays))
  const isDaySelected = (dayValue: number) => selectedDaysSet.value.has(dayValue)

  const isStep1Valid = computed(() => {
    if (!form.title.trim()) return false
    if (form.scheduleType === 'recurring' && form.recurringDays.length === 0) return false
    if (form.scheduleType === 'one_time' && !form.oneTimeDate) return false
    return true
  })

  const toggleDay = (dayValue: number) => {
    if (selectedDaysSet.value.has(dayValue)) {
      form.recurringDays = form.recurringDays.filter((day) => day !== dayValue)
    } else {
      form.recurringDays.push(dayValue)
    }
  }

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

  const validate = (): boolean => {
    errors.title = ''
    errors.recurringDays = ''
    errors.oneTimeDate = ''

    if (!form.title.trim()) {
      errors.title = t('habits.form.errTitle')
      return false
    }

    if (form.scheduleType === 'recurring' && form.recurringDays.length === 0) {
      errors.recurringDays = t('habits.form.errWeekDays')
      return false
    }

    if (form.scheduleType === 'one_time' && !form.oneTimeDate) {
      errors.oneTimeDate = t('habits.form.errOneTimeDate')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

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

<style scoped>
  .rotate-180 {
    transform: rotate(180deg);
  }
</style>
