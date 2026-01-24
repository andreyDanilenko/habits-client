<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div v-if="title" class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h3>
          {{ title }}
        </h3>
        <Button
          v-if="showCloseButton"
          @click="handleClose"
          icon-only
          variant="icon"
          size="sm"
          :left-icon="XMarkIcon"
        />
      </div>
      <p v-if="description" class="mt-1 text-sm text-gray-600">
        {{ description }}
      </p>
    </div>

    <div class="px-6 py-4">
      <slot />
    </div>

    <div v-if="hasFooterSlot" class="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSlots, computed } from 'vue'
  import { XMarkIcon } from '@/shared/ui/icon'
  import { Button } from '@/shared/ui'

  interface Props {
    title?: string
    description?: string
    showCloseButton?: boolean
  }

  withDefaults(defineProps<Props>(), {
    showCloseButton: true,
  })

  const emit = defineEmits<{
    close: []
  }>()

  const slots = useSlots()
  const hasFooterSlot = computed(() => !!slots.footer)

  const handleClose = () => {
    emit('close')
  }
</script>
