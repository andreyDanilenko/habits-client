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
            'bg-bg-tertiary cursor-not-allowed border border-border-light text-text-secondary':
              disabled,
          },
        ]"
        v-bind="$attrs"
      />

      <div
        class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-text-primary"
      >
        <CalendarIcon :size="iconSize" class="text-current" />
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
    size: 'lg',
    placeholder: 'ДД.ММ.ГГГГ',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value: string) => emit('update:modelValue', value),
  })

  // Единая высота 24 | 32 | 40 | 48 px как у Input/Button/Select
  const sizeClasses = computed(() => {
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

  const iconSize = computed(() => {
    const sizes = { xs: 14, sm: 14, md: 16, lg: 18, xl: 18, xxl: 20 }
    return sizes[props.size]
  })
</script>
