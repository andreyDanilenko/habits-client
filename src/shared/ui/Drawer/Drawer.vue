<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="isOpen"
        class="DrawerRoot fixed inset-0 z-[100] flex justify-end"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Панель'"
      >
        <div
          class="absolute inset-0 z-0 bg-black/40"
          aria-hidden="true"
          @click="closeOnOverlay && $emit('close')"
        />
        <aside
          :class="[
            'Drawer relative z-10 flex flex-col bg-bg-primary border-l border-border-default shadow-xl',
            widthClass,
          ]"
          @click.stop
        >
          <header
            v-if="title || $slots.header || showCloseButton"
            class="Drawer__Header flex shrink-0 items-center justify-between gap-2 p-4 border-b border-border-light"
          >
            <slot name="header">
              <h2 v-if="title" class="Drawer__Title text-lg font-semibold text-text-primary m-0">
                {{ title }}
              </h2>
            </slot>
            <button
              v-if="showCloseButton"
              type="button"
              class="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
              aria-label="Закрыть"
              @click="$emit('close')"
            >
              <XMarkIcon class="size-5" />
            </button>
          </header>
          <div class="Drawer__Body flex-1 overflow-auto p-4">
            <slot />
          </div>
          <footer
            v-if="$slots.footer"
            class="Drawer__Footer shrink-0 p-4 border-t border-border-light"
          >
            <slot name="footer" />
          </footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { XMarkIcon } from '@/shared/ui/icon'

  const props = withDefaults(
    defineProps<{
      isOpen: boolean
      title?: string
      width?: 'sm' | 'md' | 'lg'
      closeOnOverlay?: boolean
      showCloseButton?: boolean
    }>(),
    {
      width: 'md',
      closeOnOverlay: true,
      showCloseButton: true,
    },
  )

  defineEmits<{ close: [] }>()

  const WIDTH_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
  }
  const widthClass = computed(() => WIDTH_CLASSES[props.width as keyof typeof WIDTH_CLASSES])
</script>

<style scoped>
  .DrawerRoot {
    height: 100vh;
    height: 100dvh;
  }
  .Drawer {
    height: 100%;
    max-height: 100%;
  }
  .drawer-enter-active,
  .drawer-leave-active {
    transition: opacity 0.2s ease;
  }
  .drawer-enter-active .Drawer,
  .drawer-leave-active .Drawer {
    transition: transform 0.25s ease;
  }
  .drawer-enter-from,
  .drawer-leave-to {
    opacity: 0;
  }
  .drawer-enter-from .Drawer,
  .drawer-leave-to .Drawer {
    transform: translateX(100%);
  }
</style>
