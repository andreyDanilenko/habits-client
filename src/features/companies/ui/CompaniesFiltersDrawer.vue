<template>
  <Drawer
    :is-open="isOpen"
    title="Фильтры"
    width="md"
    show-close-button
    @close="$emit('close')"
  >
    <div class="py-(--spacing-4) text-text-muted text-(--text-sm) text-center">
      Пока нет дополнительных фильтров.
    </div>

    <template #footer>
      <Button variant="primary" class="w-full" @click="$emit('close')">
        Закрыть
      </Button>
    </template>
  </Drawer>
</template>

<script setup lang="ts">
  import { Drawer, Button } from '@/shared/ui'

  defineProps<{
    isOpen: boolean
  }>()

  defineEmits<{
    close: []
  }>()
</script>
