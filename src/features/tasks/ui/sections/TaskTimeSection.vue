<template>
  <TaskDetailSection
    title="Время"
    :placeholder="totalSpentSeconds === 0 && (duration == null || duration === 0)"
  >
    <template v-if="canEdit" #action>
      <div class="flex flex-wrap items-center gap-(--spacing-2)">
        <Button
          v-for="preset in timePresets"
          :key="preset.min"
          variant="link"
          size="xs"
          custom-class="TaskTimeSection__Add text-[11px]"
          :disabled="saving"
          @click="addTime(preset.min * 60)"
        >
          +{{ preset.label }}
        </Button>
        <div class="flex items-center gap-(--spacing-2)">
          <Input
            v-model="customMinutes"
            type="number"
            size="sm"
            placeholder="мин"
            :input-classes="inputClasses"
            min="1"
            max="9999"
            @keydown.enter="addCustomTime"
          />
          <Button
            variant="outline"
            size="sm"
            :disabled="saving || !customMinutes || Number(customMinutes) < 1"
            @click="addCustomTime"
          >
            Добавить
          </Button>
        </div>
      </div>
    </template>
    <div class="flex flex-col gap-(--spacing-3)">
      <div class="flex flex-wrap items-center gap-(--spacing-4)">
        <div v-if="totalSpentSeconds > 0" class="flex items-center gap-(--spacing-2)">
          <span class="text-(--text-xs) text-text-secondary">Затрачено:</span>
          <span class="text-(--text-xs) font-medium text-text-primary tabular-nums">{{
            formatTimeHMS(totalSpentSeconds)
          }}</span>
        </div>
        <div v-if="duration != null && duration > 0" class="flex items-center gap-(--spacing-2)">
          <span class="text-(--text-xs) text-text-secondary">Оценка:</span>
          <span class="text-(--text-xs) text-text-primary">{{ formatDuration(duration) }}</span>
        </div>
        <div
          v-if="totalSpentSeconds === 0 && (duration == null || duration === 0)"
          class="text-(--text-xs) text-text-muted"
        >
          Время не учтено
        </div>
      </div>
      <div v-if="canEdit" class="flex items-center gap-(--spacing-2)">
        <span class="text-(--text-xs) text-text-muted shrink-0">Изменить затраченное:</span>
        <div class="flex items-center gap-(--spacing-2)">
          <Input
            v-model="editMinutes"
            type="number"
            size="sm"
            placeholder="мин"
            :input-classes="inputClasses"
            min="0"
            @keydown.enter="saveEdit"
          />
          <Button
            variant="outline"
            size="sm"
            :disabled="saving || editMinutes === ''"
            @click="saveEdit"
          >
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  </TaskDetailSection>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { Button, Input } from '@/shared/ui'
  import TaskDetailSection from './TaskDetailSection.vue'

  const inputClasses = 'w-16 tabular-nums time-number-input'

  const props = defineProps<{
    spentMinutes?: number
    spentSeconds?: number
    duration?: number
    canEdit?: boolean
    saving?: boolean
  }>()

  const emit = defineEmits<{
    addTime: [seconds: number]
    setSpent: [minutes: number]
  }>()

  const customMinutes = ref<string>('')
  const editMinutes = ref<string>('')

  const totalSpentSeconds = computed(
    () => (props.spentMinutes ?? 0) * 60 + (props.spentSeconds ?? 0),
  )

  watch(
    () => totalSpentSeconds.value,
    (total) => {
      editMinutes.value = String(Math.floor(total / 60))
    },
    { immediate: true },
  )

  function formatTimeHMS(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
  }

  const timePresets = [
    { min: 15, label: '15 мин' },
    { min: 30, label: '30 мин' },
    { min: 60, label: '1 ч' },
  ]

  function addTime(seconds: number) {
    emit('addTime', seconds)
  }

  function addCustomTime() {
    const m = parseInt(customMinutes.value, 10)
    if (m >= 1) {
      emit('addTime', m * 60)
      customMinutes.value = ''
    }
  }

  function saveEdit() {
    const v = Math.max(0, Math.floor(Number(editMinutes.value) || 0))
    const currentMins = Math.floor(totalSpentSeconds.value / 60)
    if (v !== currentMins) {
      emit('setSpent', v)
    }
  }

  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} мин`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`
  }
</script>

<style scoped>
  .time-number-input::-webkit-outer-spin-button,
  .time-number-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .time-number-input {
    -moz-appearance: textfield;
    appearance: textfield;
  }
  @media (hover: hover) {
    .TaskTimeSection__Add:hover {
      color: var(--color-primary-dark);
    }
  }
</style>
