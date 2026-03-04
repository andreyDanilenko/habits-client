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
      <div
        v-if="slots?.leftIcon || leftIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        :class="iconLeftClasses"
      >
        <slot name="leftIcon">
          <component v-if="leftIcon" :is="leftIcon" :size="iconSizeValue" />
        </slot>
      </div>

      <!-- Кастомная иконка календаря для type="date" -->
      <div
        v-else-if="type === 'date' && !disabled"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        :class="iconLeftClasses"
      >
        <CalendarIcon :size="iconSizeValue" />
      </div>

      <div
        v-if="showClear || slots?.rightIcon || rightIcon"
        class="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-3 pointer-events-none"
      >
        <button
          v-if="showClear && modelValue && !disabled"
          type="button"
          class="text-text-muted hover:text-text-secondary transition-colors focus:outline-none rounded-full hover:bg-bg-tertiary pointer-events-auto"
          :class="clearButtonSizeClasses"
          :aria-label="clearButtonLabel"
          @click="clearInput"
          @mousedown.prevent
        >
          <XMarkIcon :size="iconSizeValue" />
        </button>

        <div v-if="slots?.rightIcon || rightIcon" class="text-text-muted flex items-center justify-center h-full min-w-[2rem] pointer-events-auto">
          <slot name="rightIcon">
            <component v-if="rightIcon" :is="rightIcon" :size="iconSizeValue" />
          </slot>
        </div>
      </div>

      <input
        ref="inputEl"
        :id="id || name"
        :value="modelValue"
        :type="type"
        :required="required"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="[
          'w-full rounded-lg focus:outline-none focus:ring-2 transition-colors bg-bg-primary text-text-primary',
          inputSizeClasses,
          inputClasses,
          {
            'border border-border-default focus:ring-primary-default focus:border-primary-default':
              !error && !disabled,
            'border border-error-light focus:ring-error-default focus:border-error-default':
              error && !disabled,
            'bg-bg-tertiary cursor-not-allowed border border-border-light': disabled,
          },
          leftPaddingClass,
          rightPaddingClass,
          // Скрываем нативную иконку для date
          { 'date-input': type === 'date' },
        ]"
        v-bind="$attrs"
        @input="onInput"
        @keydown.esc="clearInput"
      />
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
  import { computed, ref, useSlots } from 'vue'
  import type { Component } from 'vue'
  import type { ComponentSize } from './Button.vue'
  import { XMarkIcon, CalendarIcon } from './icon'

  const slots = useSlots()

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
    size?: ComponentSize
    inputClasses?: string
    leftIcon?: Component
    rightIcon?: Component
    showClear?: boolean
    clearButtonLabel?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
    disabled: false,
    size: 'lg',
    inputClasses: '',
    showClear: false,
    clearButtonLabel: 'Очистить',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    clear: []
  }>()

  const inputSizeClasses = computed(() => {
    const sizes = {
      xs: 'h-(--size-6) min-h-(--size-6) px-(--spacing-2) text-(--text-xs)',
      sm: 'h-(--size-6) min-h-(--size-6) px-(--spacing-2) text-(--text-xs)',
      md: 'h-(--size-8) min-h-(--size-8) px-(--spacing-3) text-(--text-sm)',
      lg: 'h-(--size-10) min-h-(--size-10) px-(--spacing-4) text-(--text-sm)',
      xl: 'h-(--size-10) min-h-(--size-10) px-(--spacing-4) text-(--text-base)',
      xxl: 'h-(--size-12) min-h-(--size-12) px-(--spacing-5) text-(--text-base)',
    }
    return sizes[props.size]
  })

  const iconSizeValue = computed(() => {
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

  const iconLeftClasses = computed(() => {
    const sizes = {
      xs: 'w-(--size-6) h-(--size-6)',
      sm: 'w-(--size-6) h-(--size-6)',
      md: 'w-(--size-8) h-(--size-8)',
      lg: 'w-(--size-8) h-(--size-8)',
      xl: 'w-(--size-8) h-(--size-8)',
      xxl: 'w-(--size-10) h-(--size-10)',
    }
    return sizes[props.size]
  })

  const clearButtonSizeClasses = computed(() => {
    const sizes = {
      xs: 'p-(--spacing-1)',
      sm: 'p-(--spacing-1)',
      md: 'p-(--spacing-2)',
      lg: 'p-(--spacing-2)',
      xl: 'p-(--spacing-2)',
      xxl: 'p-(--spacing-3)',
    }
    return sizes[props.size]
  })

  const leftPaddingClass = computed(() => {
    if (!slots?.leftIcon && !props.leftIcon) return 'pl-(--spacing-3)'
    const sizes = {
      xs: 'pl-(--spacing-6)',
      sm: 'pl-(--spacing-6)',
      md: 'pl-(--spacing-8)',
      lg: 'pl-(--spacing-8)',
      xl: 'pl-(--spacing-8)',
      xxl: 'pl-(--spacing-10)',
    }
    return sizes[props.size]
  })

  const rightPaddingClass = computed(() => {
    const hasRightContent = props.showClear || slots?.rightIcon || props.rightIcon
    if (!hasRightContent) return 'pr-(--spacing-3)'
    const sizes = {
      xs: 'pr-(--spacing-6)',
      sm: 'pr-(--spacing-6)',
      md: 'pr-(--spacing-8)',
      lg: 'pr-(--spacing-8)',
      xl: 'pr-(--spacing-8)',
      xxl: 'pr-(--spacing-10)',
    }
    return sizes[props.size]
  })

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  const inputEl = ref<HTMLInputElement | null>(null)

  const clearInput = () => {
    if (props.disabled) return
    emit('update:modelValue', '')
    emit('clear')
  }

  defineExpose({
    focus: () => inputEl.value?.focus(),
    blur: () => inputEl.value?.blur(),
  })
</script>

<style scoped>
/* Скрываем нативную иконку календаря */
.date-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

/* Для Firefox */
.date-input::-moz-calendar-picker-indicator {
  opacity: 0;
  width: 0;
  height: 0;
}
</style>
