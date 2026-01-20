<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div v-if="title" class="px-6 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ title }}
        </h3>
        <button
          v-if="showCloseButton"
          @click="handleClose"
          class="cursor-pointer text-gray-400 hover:text-gray-500 transition-colors"
        >
          <XMarkIcon size="sm" />
        </button>
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
