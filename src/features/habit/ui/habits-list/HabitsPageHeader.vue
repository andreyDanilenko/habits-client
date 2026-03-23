<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-text-primary">{{ t('habits.page.title') }}</h1>
      <p class="text-text-secondary mt-1">{{ t('habits.page.description') }}</p>
    </div>
    <Button @click="$emit('add-habit')" class="w-full sm:w-auto">{{
      t('common.actions.create')
    }}</Button>
  </div>
</template>

<script setup lang="ts">
  import { useAppI18n } from '@/shared/lib/i18n'
  import { Button } from '@/shared/ui'

  const { t } = useAppI18n()

  defineEmits<{
    'add-habit': []
  }>()
</script>
