<template>
  <div class="text-center py-16">
    <Card :border="true" :padding="true" class="max-w-md mx-auto">
      <div
        v-if="showIcon"
        class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <slot name="icon">
          <PlusIcon size="lg" class="text-text-muted" />
        </slot>
      </div>

      <h3 class="text-text-primary mb-2">
        <slot name="title">{{ title }}</slot>
      </h3>

      <p class="text-text-secondary mb-6">
        <slot name="description">{{ description }}</slot>
      </p>

      <div class="flex gap-3 justify-center">
        <slot name="actions">
          <Button v-if="showClearFilters" variant="outline" @click="$emit('clear-filters')">
            Сбросить фильтры
          </Button>
          <Button @click="$emit('action')">{{ actionButtonText }}</Button>
        </slot>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { Card, Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  withDefaults(
    defineProps<{
      title?: string
      description?: string
      actionButtonText?: string
      showClearFilters?: boolean
      showIcon?: boolean
    }>(),
    {
      title: 'Нет данных',
      description: '',
      actionButtonText: 'Создать',
      showClearFilters: false,
      showIcon: true,
    },
  )

  defineEmits<{
    'clear-filters': []
    action: []
  }>()
</script>
