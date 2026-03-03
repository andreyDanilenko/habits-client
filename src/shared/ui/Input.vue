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
        v-if="slots.leftIcon || leftIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        :class="iconLeftClasses"
      >
        <slot name="leftIcon">
          <component :is="leftIcon" :size="iconSizeValue" />
        </slot>
      </div>

      <div
        v-if="showClear || slots.rightIcon || rightIcon"
        class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1"
      >
        <button
          v-if="showClear && modelValue && !disabled"
          type="button"
          class="text-text-muted hover:text-text-secondary transition-colors focus:outline-none rounded-full hover:bg-bg-tertiary"
          :class="clearButtonSizeClasses"
          :aria-label="clearButtonLabel"
          @click="clearInput"
          @mousedown.prevent
        >
          <XMarkIcon :size="iconSizeValue" />
        </button>

        <div v-if="slots.rightIcon || rightIcon" class="text-text-muted">
          <slot name="rightIcon">
            <component :is="rightIcon" :size="iconSizeValue" />
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
  import { XMarkIcon } from './icon'

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
    'clear': []
  }>()

  // Единая высота 24 | 32 | 40 | 48 px как у Button/Select
  const inputSizeClasses = computed(() => {
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
      xs: 'w-3.5 h-3.5',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-4 h-4',
      xl: 'w-4 h-4',
      xxl: 'w-5 h-5',
    }
    return sizes[props.size]
  })

  const clearButtonSizeClasses = computed(() => {
    const sizes = {
      xs: 'p-0.5',
      sm: 'p-0.5',
      md: 'p-1',
      lg: 'p-1',
      xl: 'p-1',
      xxl: 'p-1.5',
    }
    return sizes[props.size]
  })

  const leftPaddingClass = computed(() => {
    if (!slots.leftIcon && !props.leftIcon) return 'pl-3'
    const sizes = {
      xs: 'pl-7',
      sm: 'pl-7',
      md: 'pl-8',
      lg: 'pl-10',
      xl: 'pl-10',
      xxl: 'pl-12',
    }
    return sizes[props.size]
  })

  const rightPaddingClass = computed(() => {
    const hasRightContent = props.showClear || slots.rightIcon || props.rightIcon
    if (!hasRightContent) return 'pr-3'
    const sizes = {
      xs: 'pr-7',
      sm: 'pr-7',
      md: 'pr-8',
      lg: 'pr-10',
      xl: 'pr-10',
      xxl: 'pr-12',
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
