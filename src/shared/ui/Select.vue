<template>
  <div>
    <label
      v-if="label"
      :for="id || name"
      class="block text-sm font-medium text-text-secondary mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-error-default">*</span>
    </label>

    <div ref="rootEl" class="relative">
      <button
        type="button"
        :id="id || name"
        :disabled="disabled"
        :class="[
          'w-full inline-flex items-center justify-between rounded-lg border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 transition-colors',
          selectSizeClasses,
          stateClasses,
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ]"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        @click="toggle"
        @keydown.enter.prevent="toggle"
        @keydown.space.prevent="toggle"
        @keydown.esc.stop.prevent="close"
      >
        <span
          class="flex-1 text-left truncate"
          :class="!selectedOption && placeholder ? 'text-text-muted' : ''"
        >
          {{ selectedOption?.label ?? placeholder ?? 'Не выбрано' }}
        </span>
        <ChevronDownIcon
          :size="iconSize"
          class="ml-2 text-text-muted transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <div
        v-if="isOpen"
        class="absolute z-20 mt-1 w-full rounded-lg border border-border-default bg-bg-primary shadow-lg max-h-60 overflow-auto"
        role="listbox"
      >
        <button
          v-for="opt in options"
          :key="String(opt.value)"
          type="button"
          :class="[
            'w-full text-left flex items-center justify-between',
            dropdownItemClasses,
            opt.value === modelValue
              ? 'bg-primary-light text-text-primary'
              : 'text-text-primary hover:bg-bg-tertiary',
          ]"
          @click="select(opt.value)"
        >
          <span class="truncate">{{ opt.label }}</span>
          <CheckIcon
            v-if="opt.value === modelValue"
            :size="checkIconSize"
            class="text-primary-default ml-2 flex-shrink-0"
          />
        </button>
        <p v-if="!options.length" class="px-3 py-2 text-sm text-text-muted">Нет вариантов</p>
      </div>
    </div>

    <p
      v-if="error || hint"
      :class="['mt-1 text-sm', error ? 'text-error-default' : 'text-text-muted']"
    >
      {{ error || hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { ChevronDownIcon, CheckIcon } from './icon'
  import type { ComponentSize } from './Button.vue'

  interface SelectOption {
    value: string | number
    label: string
  }

  interface Props {
    modelValue: string | number | null | undefined
    label?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    size?: ComponentSize
    options: SelectOption[]
    placeholder?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    size: 'lg',
    options: () => [],
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | null | undefined]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value: string | number | null | undefined) => emit('update:modelValue', value),
  })

  const isOpen = ref(false)
  const rootEl = ref<HTMLElement | null>(null)

  const selectedOption = computed(
    () => props.options.find((o) => o.value === modelValue.value) ?? null,
  )

  // Единая высота 24 | 32 | 40 | 48 px как у Button
  const selectSizeClasses = computed(() => {
    const sizes = {
      xs: 'h-6 min-h-6 px-2 text-xs',
      sm: 'h-6 min-h-6 px-2 text-xs',
      md: 'h-8 min-h-8 px-3 text-sm',
      lg: 'h-10 min-h-10 px-4 text-sm',
      xl: 'h-10 min-h-10 px-4 text-base',
      xxl: 'h-12 min-h-12 px-5 text-base',
    }
    return sizes[props.size]
  })

  const dropdownItemClasses = computed(() => {
    const sizes = {
      xs: 'px-2 py-1.5 text-xs',
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-sm',
      xl: 'px-4 py-2.5 text-base',
      xxl: 'px-5 py-3 text-base',
    }
    return sizes[props.size]
  })

  const iconSize = computed(() => {
    const sizes = {
      xs: 14,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 18,
      xxl: 20,
    }
    return sizes[props.size]
  })

  const checkIconSize = computed(() => {
    const sizes = {
      xs: 12,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 16,
      xxl: 18,
    }
    return sizes[props.size]
  })

  const stateClasses = computed(() => {
    if (props.disabled) {
      return 'border-border-light text-text-secondary'
    }
    if (props.error) {
      return 'border-error-light focus:ring-error-default focus:border-error-default'
    }
    return 'border-border-default focus:ring-primary-default focus:border-primary-default'
  })

  const toggle = () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const select = (value: string | number) => {
    modelValue.value = value
    close()
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!rootEl.value) return
    const target = event.target as Node | null
    if (target && !rootEl.value.contains(target)) {
      close()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>
