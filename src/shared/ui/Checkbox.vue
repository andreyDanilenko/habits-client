<template>
  <div :class="['flex', containerClass]">
    <!-- Визуальный чекбокс по дизайн-системе -->
    <div class="flex items-start">
      <!-- Реальный input для форм и доступности -->
      <input
        :id="inputId"
        v-model="modelValue"
        type="checkbox"
        :disabled="disabled"
        class="sr-only"
        v-bind="$attrs"
      />

      <!-- Кастомный визуальный бокс -->
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
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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

  // Размер визуального бокса: 16 / 20 / 24 / 32 / 40 px
  const boxSizeClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-4 h-4'
      case 'sm':
        return 'w-5 h-5'
      case 'lg':
        return 'w-10 h-10'
      case 'xl':
        return 'w-10 h-10'
      default:
        return 'w-6 h-6'
    }
  })

  // Размер иконки галочки внутри
  const iconSize = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'xs'
      case 'sm':
        return 'xs'
      case 'lg':
        return 'lg'
      case 'xl':
        return 'lg'
      default:
        return 'sm'
    }
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
    switch (props.size) {
      case 'xs':
        return 'text-xs'
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-base'
      case 'xl':
        return 'text-base'
      default:
        return 'text-sm'
    }
  })

  const hintSizeClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'text-2xs'
      case 'sm':
        return 'text-xs'
      case 'lg':
        return 'text-sm'
      case 'xl':
        return 'text-sm'
      default:
        return 'text-xs'
    }
  })
</script>
