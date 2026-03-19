<template>
  <Tooltip trigger="click" placement="bottom" variant="dropdown">
    <template #trigger>
      <button
        type="button"
        class="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50"
        :class="typeClass(type)"
        :disabled="saving"
      >
        {{ typeLabel(type) }}
      </button>
    </template>
    <div class="w-40 bg-bg-primary rounded-lg shadow-card border border-border-default py-1">
      <button
        v-for="opt in typeOptions"
        :key="opt.value"
        type="button"
        class="w-full text-left px-3 py-1.5 text-(--text-xs) text-text-primary hover:bg-bg-tertiary transition-colors"
        :class="{ 'bg-bg-tertiary': type === opt.value }"
        @click="$emit('change', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </Tooltip>
</template>

<script setup lang="ts">
  import { typeClass, typeLabel } from '@/entities/task'
  import { Tooltip } from '@/shared/ui'
  import type { TaskType } from '@/entities/task'

  defineProps<{
    type: string
    saving?: boolean
  }>()

  defineEmits<{
    change: [type: TaskType]
  }>()

  const typeOptions: { value: TaskType; label: string }[] = [
    { value: 'task', label: 'Задача' },
    { value: 'bug', label: 'Ошибка' },
    { value: 'feature', label: 'Функция' },
    { value: 'meeting', label: 'Встреча' },
    { value: 'call', label: 'Звонок' },
    { value: 'email', label: 'Email' },
    { value: 'lunch', label: 'Обед' },
    { value: 'other', label: 'Другое' },
  ]
</script>
