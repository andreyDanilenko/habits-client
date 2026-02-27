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

    <input
      :id="id || name"
      v-model="modelValue"
      :type="type"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary',
        inputClasses,
        {
          'border-border-default focus:ring-primary-default focus:border-primary-default':
            !error && !disabled,
          'border-error-light focus:ring-error-default focus:border-error-default':
            error && !disabled,
          'bg-bg-tertiary cursor-not-allowed border-border-light': disabled,
        },
      ]"
      v-bind="$attrs"
    />

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

  interface Props {
    modelValue: string
    label?: string
    type?: string
    name?: string
    id?: string
    required?: boolean
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    inputClasses?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    inputClasses: '',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const modelValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })
</script>

<style scoped>
  /* Для date input */
  input[type='date'] {
    color-scheme: light dark;
  }

  input[type='date']::-webkit-datetime-edit-text,
  input[type='date']::-webkit-datetime-edit-month-field,
  input[type='date']::-webkit-datetime-edit-day-field,
  input[type='date']::-webkit-datetime-edit-year-field {
    color: var(--color-text-primary);
  }

  input[type='date']::-webkit-datetime-edit-fields-wrapper {
    color: var(--color-text-primary);
  }

  input[type='date']::-webkit-calendar-picker-indicator {
    filter: invert(0.5);
    cursor: pointer;
  }

  /* Для time input */
  input[type='time'] {
    color-scheme: light dark;
  }

  input[type='time']::-webkit-datetime-edit-hour-field,
  input[type='time']::-webkit-datetime-edit-minute-field,
  input[type='time']::-webkit-datetime-edit-ampm-field {
    color: var(--color-text-primary);
  }

  input[type='time']::-webkit-datetime-edit-fields-wrapper {
    color: var(--color-text-primary);
  }

  input[type='time']::-webkit-calendar-picker-indicator {
    filter: invert(0.5);
    cursor: pointer;
  }

  .dark input[type='date']::-webkit-calendar-picker-indicator,
  .dark input[type='time']::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
</style>
