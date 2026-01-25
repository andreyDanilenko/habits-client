<template>
  <div class="flex items-center justify-between">
    <div>
      <h1>Календарь привычек</h1>
      <p class="mt-2 text-gray-600">Просмотр всех привычек по дням</p>
    </div>
    <div class="flex items-center space-x-2">
      <Button icon-only variant="icon" :left-icon="ArrowLeftIcon" @click="$emit('prev-month')" />
      <span class="font-medium min-w-[140px] text-center">{{ formattedMonth }}</span>
      <Button icon-only variant="icon" :left-icon="ArrowRightIcon" @click="$emit('next-month')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'

  defineProps<{
    formattedMonth: string
  }>()

  defineEmits<{
    'prev-month': []
    'next-month': []
  }>()
</script>
