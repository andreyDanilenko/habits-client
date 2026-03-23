<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-text-primary">{{ t('habits.calendar.pageTitle') }}</h1>
      <p class="mt-2 text-text-secondary">{{ t('habits.calendar.pageDescription') }}</p>
    </div>

    <div class="flex items-center space-x-2">
      <Button
        icon-only
        variant="icon"
        :left-icon="ArrowLeftIcon"
        :aria-label="t('habits.calendar.prevMonth')"
        @click="$emit('prev-month')"
      />

      <span class="font-medium min-w-[140px] text-center text-text-primary">
        {{ formattedMonth }}
      </span>

      <Button
        icon-only
        variant="icon"
        :left-icon="ArrowRightIcon"
        :aria-label="t('habits.calendar.nextMonth')"
        @click="$emit('next-month')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useAppI18n } from '@/shared/lib/i18n'
  import { Button } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'

  const { t } = useAppI18n()

  defineProps<{
    formattedMonth: string
  }>()

  defineEmits<{
    'prev-month': []
    'next-month': []
  }>()
</script>
