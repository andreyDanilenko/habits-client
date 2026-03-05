<template>
  <div>
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-text-secondary mb-1"
    >
      {{ label }}
      <span v-if="required" class="text-error-default">*</span>
    </label>

    <textarea
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :required="required"
      :maxlength="maxlength"
      :class="[
        'w-full px-(--spacing-3) py-(--spacing-2) border rounded-(--radius-md) focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary placeholder:text-text-muted text-(--text-sm)',
        resizeClass,
        {
          'border-border-default focus:ring-primary-default focus:border-primary-default':
            !error && !disabled,
          'border-error-default focus:ring-error-default focus:border-error-default':
            error && !disabled,
          'bg-bg-tertiary cursor-not-allowed border-border-light': disabled,
        },
      ]"
      v-bind="$attrs"
      @input="onInput"
    />

    <p
      v-if="error || hint || (maxlength && showCount)"
      :class="['mt-1 text-(--text-xs)', error ? 'text-error-default' : 'text-text-muted']"
    >
      <template v-if="error">{{ error }}</template>
      <template v-else-if="hint">{{ hint }}</template>
      <template v-else-if="maxlength && showCount">
        {{ (modelValue ?? '').length }} / {{ maxlength }}
      </template>
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      modelValue: string
      label?: string
      placeholder?: string
      rows?: number
      disabled?: boolean
      required?: boolean
      error?: string
      hint?: string
      maxlength?: number
      showCount?: boolean
      resize?: 'none' | 'y' | 'both'
    }>(),
    {
      rows: 3,
      disabled: false,
      required: false,
      showCount: false,
      resize: 'y',
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  let textareaIdCounter = 0
  const inputId = `textarea-${++textareaIdCounter}`

  const resizeClass = computed(() => {
    switch (props.resize) {
      case 'none':
        return 'resize-none'
      case 'both':
        return 'resize'
      default:
        return 'resize-y'
    }
  })

  function onInput(e: Event) {
    const target = e.target as HTMLTextAreaElement
    emit('update:modelValue', target?.value ?? '')
  }
</script>
