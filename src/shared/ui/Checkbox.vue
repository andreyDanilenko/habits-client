<template>
  <div :class="['flex', containerClass]">
    <label
      :for="inputId"
      :class="[
        'flex items-center cursor-pointer select-none',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ]"
      @click.prevent="onLabelClick"
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

      <div v-if="label || hint" class="ml-(--spacing-2) flex-1 min-w-0 leading-snug">
        <span :class="['text-text-secondary font-medium', labelSizeClasses]">
          {{ label }}
          <span v-if="required" class="text-error-default ml-(--spacing-1)">*</span>
        </span>

        <p
          v-if="hint"
          :class="[
            'mt-(--spacing-1)',
            hintSizeClasses,
            error ? 'text-error-default' : 'text-text-muted',
          ]"
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
    size: 'xs',
    error: false,
    containerClass: 'items-start',
  })

  const instanceId = `checkbox-${Math.random().toString(36).slice(2, 11)}`

  const inputId = computed(() => props.id || props.name || instanceId)

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

  const onLabelClick = () => {
    if (props.disabled) return
    modelValue.value = !modelValue.value
  }

  const boxSizeClasses = computed(() => {
    const sizes: Record<ComponentSize, string> = {
      xs: 'w-(--size-5) h-(--size-5) min-w-(--size-5) min-h-(--size-5)',
      sm: 'w-(--size-5) h-(--size-5) min-w-(--size-5) min-h-(--size-5)',
      md: 'w-(--size-5) h-(--size-5) min-w-(--size-5) min-h-(--size-5)',
      lg: 'w-(--size-6) h-(--size-6) min-w-(--size-6) min-h-(--size-6)',
      xl: 'w-(--size-6) h-(--size-6) min-w-(--size-6) min-h-(--size-6)',
      xxl: 'w-(--size-8) h-(--size-8) min-w-(--size-8) min-h-(--size-8)',
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
    const sizes: Record<ComponentSize, string> = {
      xs: 'text-(--text-xs)',
      sm: 'text-(--text-sm)',
      md: 'text-(--text-sm)',
      lg: 'text-(--text-sm)',
      xl: 'text-(--text-base)',
      xxl: 'text-(--text-base)',
    }
    return sizes[props.size]
  })

  const hintSizeClasses = computed(() => {
    const sizes: Record<ComponentSize, string> = {
      xs: 'text-(--text-xs)',
      sm: 'text-(--text-xs)',
      md: 'text-(--text-xs)',
      lg: 'text-(--text-xs)',
      xl: 'text-(--text-sm)',
      xxl: 'text-(--text-sm)',
    }
    return sizes[props.size]
  })
</script>
