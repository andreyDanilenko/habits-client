<template>
  <div :class="['flex', containerClass]">
    <label
      :for="inputId"
      :class="[
        'flex items-center cursor-pointer select-none',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ]"
    >
      <input
        :id="inputId"
        v-model="modelValue"
        type="checkbox"
        :disabled="disabled"
        class="sr-only"
        v-bind="$attrs"
      />

      <span
        :class="[
          'inline-flex items-center justify-center border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-0',
          boxSizeClasses,
          radiusClass,
          checkboxClasses,
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ]"
      >
        <CheckIcon v-if="modelValue" :size="iconSize" />
      </span>

      <div v-if="label || hint" class="ml-2 flex-1 leading-snug">
        <span :class="['text-text-secondary font-medium', labelSizeClasses]">
          {{ label }}
          <span v-if="required" class="text-error-default ml-1">*</span>
        </span>

        <p
          v-if="hint"
          :class="['mt-1', hintSizeClasses, error ? 'text-error-default' : 'text-text-muted']"
        >
          {{ hint }}
        </p>
      </div>
    </label>
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
    size: 'sm',
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

  const boxSizeClasses = computed(() => {
    // 16 / 20 / 24 / 28 / 32 px в зависимости от размера
    const sizes: Record<ComponentSize, string> = {
      xs: 'w-4 h-4', // 16px
      sm: 'w-5 h-5', // 20px
      md: 'w-6 h-6', // 24px
      lg: 'w-7 h-7', // 28px
      xl: 'w-8 h-8', // 32px
      xxl: 'w-8 h-8', // 32px (крупнее не требуется)
    }
    return sizes[props.size]
  })

  const radiusClass = computed(() => {
    // Чуть более скруглённые углы для крупных чекбоксов
    if (props.size === 'lg' || props.size === 'xl' || props.size === 'xxl')
      return 'rounded-(--radius-md)'
    return 'rounded-(--radius-sm)'
  })

  const iconSize = computed(() => {
    const sizes = {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
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
      xxl: 'text-base',
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
      xxl: 'text-sm',
    }
    return sizes[props.size]
  })
</script>
