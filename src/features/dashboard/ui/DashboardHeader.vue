<template>
  <div class="rounded-2xl p-6 bg-gradient-to-r from-primary-light to-secondary-light">
    <h1 class="text-text-primary mb-2">{{ greeting }}, {{ userName }}!</h1>
    <p class="text-text-secondary">{{ t('dashboard.header.dateLine', { date: formattedDate }) }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useAppI18n } from '@/shared/lib/i18n'

  const { t } = useAppI18n()

  defineProps<{
    greeting: string
    userName: string
    formattedDate: string
  }>()
</script>
