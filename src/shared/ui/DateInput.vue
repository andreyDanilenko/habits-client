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

    <div class="relative">
      <input
        :id="id || name"
        v-model="modelValue"
        type="date"
        :name="name"
        :required="required"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary pr-10',
          sizeClasses,
          {
            'border-border-default focus:ring-primary-default focus:border-primary-default':
              !error && !disabled,
            'border-error-light focus:ring-error-default focus:border-error-default':
              error && !disabled,
            'bg-bg-tertiary cursor-not-allowed border border-border-light text-text-secondary': disabled,
          },
        ]"
        v-bind="$attrs"
      />

      <div
        class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-muted"
      >
        <CalendarIcon :size="iconSize" />
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
  import { computed } from 'vue'
  import type { ComponentSize } from './Button.vue'
  import { CalendarIcon } from './icon'

  interface Props {
    modelValue: string
    label?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    placeholder?: string
    size?: ComponentSize
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
  })

  // Высота: 24, 28, 32, 36, 40px (UI.md)
  const sizeClasses = computed(() => {
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-3.5 py-2.5 text-sm',
      xl: 'px-4 py-3 text-base',
    }
    return sizes[props.size]
  })

  const iconSize = computed(() => props.size)
</script>

