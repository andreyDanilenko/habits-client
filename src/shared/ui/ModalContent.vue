<template>
  <div
    class="min-w-0 bg-bg-primary flex flex-col overflow-hidden"
    :class="
      fullscreenOnMobile
        ? 'flex-1 min-h-0 h-full max-h-[100dvh] rounded-none shadow-none lg:flex-none lg:min-h-0 lg:max-h-[calc(100vh-2rem)] lg:h-auto lg:max-h-[calc(100vh-2rem)] lg:rounded-xl lg:shadow-card-hover'
        : 'max-h-[calc(100vh-2rem)] rounded-xl shadow-card-hover'
    "
  >
    <div v-if="title" class="flex-shrink-0 px-6 py-4 border-b border-border-light">
      <div class="flex items-center justify-between">
        <h3 class="text-text-primary">
          {{ title }}
        </h3>
        <Button
          v-if="showCloseButton"
          @click="handleClose"
          icon-only
          variant="icon"
          size="md"
          :left-icon="XMarkIcon"
        />
      </div>
      <p v-if="description" class="mt-1 text-sm text-text-secondary">
        {{ description }}
      </p>
    </div>

    <div class="px-6 py-4 flex-1 min-h-0 overflow-y-auto overscroll-contain">
      <slot />
    </div>

    <div
      v-if="hasFooterSlot"
      class="flex-shrink-0 px-6 py-4 border-t border-border-light"
      :class="fullscreenOnMobile ? 'pb-[max(1rem,env(safe-area-inset-bottom))]' : ''"
    >
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
    fullscreenOnMobile?: boolean
  }

  withDefaults(defineProps<Props>(), {
    showCloseButton: true,
    fullscreenOnMobile: false,
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
