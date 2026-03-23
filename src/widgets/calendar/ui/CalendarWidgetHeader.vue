<template>
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-text-primary">{{ t('habits.calendar.pageTitle') }}</h3>
    <div class="flex items-center space-x-2">
      <Button icon-only variant="icon" :left-icon="ArrowLeftIcon" @click="$emit('prev-month')" />
      <span class="font-medium text-text-primary">{{ formattedMonth }}</span>
      <Button icon-only variant="icon" :left-icon="ArrowRightIcon" @click="$emit('next-month')" />
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
