<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-text-primary">{{ t('journal.page.title') }}</h1>
      <p class="text-text-secondary mt-1">{{ t('journal.page.description') }}</p>
    </div>
    <Button @click="$emit('create-entry')" class="w-full sm:w-auto">
      {{ t('journal.page.addEntry') }}
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button } from '@/shared/ui'
  import { useAppI18n } from '@/shared/lib/i18n'

  const { t } = useAppI18n()

  defineEmits<{
    'create-entry': []
  }>()
</script>
