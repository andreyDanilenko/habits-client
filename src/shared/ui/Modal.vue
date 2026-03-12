<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50"
        :class="
          fullscreenOnMobile
            ? 'overflow-hidden lg:overflow-y-auto'
            : bottomSheetOnMobile
              ? 'overflow-hidden lg:overflow-y-auto'
              : 'overflow-y-auto'
        "
        @click.self="handleBackdropClick"
      >
        <div
          class="flex min-h-full min-w-0 justify-center"
          :class="[
            fullscreenOnMobile ? 'p-0 lg:p-4 items-center' : 'p-4',
            bottomSheetOnMobile ? 'items-end p-0 lg:items-center lg:p-4' : 'items-center',
          ]"
        >
          <Transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 bg-black/50" @click="handleBackdropClick" />
          </Transition>

          <Transition :name="bottomSheetOnMobile ? 'slide-up-bottom' : 'slide-up'">
            <div
              v-if="isOpen"
              class="relative z-10 w-full min-w-0 mx-auto"
              :class="contentWrapperClass"
            >
              <div
                v-if="bottomSheetOnMobile"
                class="flex-shrink-0 flex justify-center pt-3 pb-1 lg:hidden"
              >
                <div class="w-10 h-1 rounded-full bg-border-default" aria-hidden="true" />
              </div>
              <slot />
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, onUnmounted, watch } from 'vue'

  interface Props {
    isOpen: boolean
    contentClass?: string
    fullscreenOnMobile?: boolean
    bottomSheetOnMobile?: boolean
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    contentClass: '',
    fullscreenOnMobile: false,
    bottomSheetOnMobile: false,
    closeOnBackdrop: true,
    closeOnEscape: true,
  })

  const contentWrapperClass = computed(() => {
    if (props.bottomSheetOnMobile) {
      return [
        'lg:max-w-[min(30rem,calc(100vw-2rem))] lg:max-h-[calc(100vh-2rem)] lg:overflow-x-auto lg:overflow-y-auto lg:rounded-xl lg:my-4 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:max-h-[calc(100vh-2rem)]',
        'fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden flex flex-col rounded-t-xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]',
        props.contentClass,
      ]
        .filter(Boolean)
        .join(' ')
    }
    return [
      'max-w-[min(30rem,calc(100vw-2rem))] max-h-[calc(100vh-2rem)] overflow-x-auto overflow-y-auto',
      props.contentClass,
    ]
      .filter(Boolean)
      .join(' ')
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

  .slide-up-bottom-enter-active,
  .slide-up-bottom-leave-active {
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  }

  .slide-up-bottom-enter-from,
  .slide-up-bottom-leave-to {
    transform: translateY(100%);
  }
</style>
