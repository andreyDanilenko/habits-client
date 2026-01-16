<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleBackdropClick"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 bg-black/50" @click="handleBackdropClick" />
          </Transition>

          <Transition name="slide-up">
            <div v-if="isOpen" class="relative z-10 w-full max-w-md mx-auto" :class="contentClass">
              <slot />
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { onUnmounted, watch } from 'vue'

  interface Props {
    isOpen: boolean
    contentClass?: string
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    contentClass: '',
    closeOnBackdrop: true,
    closeOnEscape: true,
  })

  const emit = defineEmits<{
    'update:isOpen': [value: boolean]
    close: []
  }>()

  const handleEscape = (e: KeyboardEvent) => {
    if (props.isOpen && props.closeOnEscape && e.key === 'Escape') {
      closeModal()
    }
  }

  const handleBackdropClick = () => {
    if (props.isOpen && props.closeOnBackdrop) {
      closeModal()
    }
  }

  const closeModal = () => {
    emit('update:isOpen', false)
    emit('close')
  }

  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'
      } else {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    },
    { immediate: true },
  )

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
  })
</script>

<style scoped>
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease;
  }

  .slide-up-enter-from,
  .slide-up-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
