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

      <p class="text-text-secondary" :class="hasActions ? 'mb-6' : 'mb-0'">
        <slot name="description">{{ description }}</slot>
      </p>

      <div v-if="hasActions" class="flex gap-3 justify-center mt-4">
        <slot name="actions">
          <Button v-if="showClearFilters" variant="outline" @click="$emit('clear-filters')">
            Сбросить фильтры
          </Button>
          <Button v-if="showActionButton" @click="$emit('action')">{{ actionButtonText }}</Button>
        </slot>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { Card, Button } from '@/shared/ui'
  import { PlusIcon } from '@/shared/ui/icon'

  const props = withDefaults(
    defineProps<{
      title?: string
      description?: string
      actionButtonText?: string
      showActionButton?: boolean
      showClearFilters?: boolean
      showIcon?: boolean
    }>(),
    {
      title: 'Нет данных',
      description: '',
      actionButtonText: 'Создать',
      showActionButton: true,
      showClearFilters: false,
      showIcon: true,
    },
  )

  const slots = useSlots()

  const hasActions = computed(
    () => props.showActionButton || props.showClearFilters || !!slots.actions,
  )

  defineEmits<{
    'clear-filters': []
    action: []
  }>()
</script>
