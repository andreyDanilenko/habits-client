<template>
  <div :class="['flex', containerClass]">
    <div class="flex items-start">
      <input
        :id="inputId"
        v-model="modelValue"
        type="checkbox"
        :disabled="disabled"
        class="sr-only"
        v-bind="$attrs"
      />

      <button
        type="button"
        :aria-checked="modelValue"
        role="checkbox"
        :disabled="disabled"
        :class="[
          'inline-flex items-center justify-center rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-0',
          boxSizeClasses,
          checkboxClasses,
          {
            'cursor-not-allowed opacity-60': disabled,
            'cursor-pointer': !disabled,
          },
        ]"
        @click="toggle"
        @keydown.space.prevent="toggle"
        @keydown.enter.prevent="toggle"
      >
        <CheckIcon v-if="modelValue" :size="iconSize" />
      </button>
    </div>

    <div v-if="label" class="ml-2 flex-1">
      <label
        :for="inputId"
        :class="[
          'text-text-secondary select-none font-medium',
          labelSizeClasses,
          {
            'cursor-not-allowed opacity-50': disabled,
            'cursor-pointer': !disabled,
          },
        ]"
      >
        {{ label }}
        <span v-if="required" class="text-error-default ml-1">*</span>
      </label>

      <p
        v-if="hint"
        :class="['mt-1', hintSizeClasses, error ? 'text-error-default' : 'text-text-muted']"
      >
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { CheckIcon } from './icon'
  import type { ComponentSize } from './Button.vue'

  let checkboxIdCounter = 0

  interface Props {
    modelValue: boolean
    label?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    hint?: string
    error?: boolean
    size?: ComponentSize
    containerClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    size: 'md',
    error: false,
    containerClass: 'items-start',
  })

  const localId = `checkbox-${++checkboxIdCounter}`

  const inputId = computed(() => props.id || props.name || localId)

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    change: [value: boolean]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => {
      emit('update:modelValue', value)
      emit('change', value)
    },
  })

  const toggle = () => {
    if (props.disabled) return
    modelValue.value = !modelValue.value
  }

  const boxSizeClasses = computed(() => {
    const sizes = {
      xs: 'w-3.5 h-3.5',   // 14px
      sm: 'w-4 h-4',       // 16px
      md: 'w-5 h-5',       // 20px
      lg: 'w-6 h-6',       // 24px
      xl: 'w-7 h-7',       // 28px
    }
    return sizes[props.size]
  })

  const iconSize = computed(() => {
    const sizes = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
    }
    return sizes[props.size]
  })

  const checkboxClasses = computed(() => {
    if (props.disabled) {
      return 'bg-bg-tertiary border-border-light text-text-muted'
    }

    if (props.error) {
      return props.modelValue
        ? 'bg-error-default border-error-default text-white hover:bg-error-dark'
        : 'bg-bg-primary border-error-default hover:bg-error-light'
    }

    if (props.modelValue) {
      return 'bg-primary-default border-primary-default text-white hover:bg-primary-dark'
    }

    return 'bg-bg-primary border-border-default text-transparent hover:border-primary-default hover:bg-bg-tertiary'
  })

  const labelSizeClasses = computed(() => {
    const sizes = {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
      xl: 'text-sm',
    }
    return sizes[props.size]
  })

  const hintSizeClasses = computed(() => {
    const sizes = {
      xs: 'text-2xs',
      sm: 'text-2xs',
      md: 'text-xs',
      lg: 'text-xs',
      xl: 'text-sm',
    }
    return sizes[props.size]
  })
</script>
