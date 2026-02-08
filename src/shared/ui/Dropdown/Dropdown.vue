<template>
  <div class="relative inline-block" :ref="(el) => { dropdown.containerRef.value = (el as HTMLElement) ?? null }">
    <div
      :ref="(el) => { dropdown.triggerRef.value = (el as HTMLElement) ?? null }"
      @click="toggle"
      class="cursor-pointer"
      :class="triggerClass"
    >
      <slot name="trigger" />
    </div>

    <!-- Dropdown в потоке HTML -->
    <template v-if="!useTeleport">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-[-8px]"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-[-8px]"
      >
        <div
          v-if="isOpen"
          :ref="(el) => { dropdown.dropdownRef.value = (el as HTMLElement) ?? null }"
          :class="[
            'absolute z-50 pointer-events-auto',
            'bg-white rounded-lg shadow-lg border border-gray-200',
            'min-w-[200px] max-w-[90vw]',
            contentClass,
          ]"
          :style="dropdownStyle"
          @click.stop
          @touchstart.stop
        >
          <slot />
        </div>
      </Transition>
    </template>

    <!-- Dropdown через Teleport (для особых случаев) -->
    <Teleport v-else to="body">
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-[-8px]"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-[-8px]"
      >
        <div
          v-if="isOpen"
          :ref="(el) => { dropdown.dropdownRef.value = (el as HTMLElement) ?? null }"
          :class="[
            'fixed z-50 pointer-events-auto',
            'bg-white rounded-lg shadow-lg border border-gray-200',
            'min-w-[200px] max-w-[90vw]',
            contentClass,
          ]"
          :style="dropdownStyle"
          @click.stop
          @touchstart.stop
        >
          <slot />
        </div>
      </Transition>

      <!-- Overlay для мобильных устройств (только с Teleport) -->
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen && showOverlay"
          class="fixed inset-0 bg-black/10 z-40"
          @click="close"
          @touchstart="close"
        />
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { useDropdown } from './useDropdown'
  import type { DropdownProps } from './types'

  const props = withDefaults(defineProps<DropdownProps>(), {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    showOverlay: false,
    closeOnClickOutside: true,
    contentClass: '',
    triggerClass: '',
    useTeleport: false,
  })

  const emit = defineEmits<{
    'update:open': [value: boolean]
    open: []
    close: []
  }>()

  const dropdown = useDropdown({
    placement: props.placement,
    trigger: props.trigger,
    width: props.width,
    offset: props.offset,
    closeOnClickOutside: props.closeOnClickOutside,
    useTeleport: props.useTeleport,
    onOpen: () => {
      emit('update:open', true)
      emit('open')
    },
    onClose: () => {
      emit('update:open', false)
      emit('close')
    },
  })

  const { isOpen, dropdownStyle, open, close, toggle } = dropdown

  // Экспортируем методы для внешнего использования
  defineExpose({
    open,
    close,
    toggle,
    isOpen,
  })
</script>
