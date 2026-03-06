<template>
  <div :class="['flex', containerClass]">
    <label
      :for="inputId"
      :class="[
        'flex items-start flex-1 cursor-pointer select-none font-medium',
        labelSizeClasses,
        {
          'cursor-not-allowed opacity-50': disabled,
          'text-text-secondary': !disabled,
        },
      ]"
      @click="onLabelClick"
    >
      <!-- Реальный input для форм и доступности -->
      <input
        :id="inputId"
        v-model="modelValue"
        type="radio"
        :name="name"
        :value="value"
        :disabled="disabled"
        class="sr-only"
        v-bind="$attrs"
      />

      <!-- Кастомный визуальный радиобаттон -->
      <button
        type="button"
        :aria-checked="modelValue"
        role="radio"
        :disabled="disabled"
        :class="[
          'inline-flex items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-default focus:ring-offset-0 shrink-0',
          circleSizeClasses,
          radioClasses,
          {
            'cursor-not-allowed opacity-60': disabled,
            'cursor-pointer': !disabled,
          },
        ]"
        @click.prevent="toggle"
        @keydown.space.prevent="toggle"
        @keydown.enter.prevent="toggle"
      >
        <span v-if="modelValue" :class="['rounded-full bg-white', dotSizeClasses]" />
      </button>

      <span v-if="label" class="ml-2 flex-1">
        {{ label }}
        <span v-if="required" class="text-error-default ml-1">*</span>
      </span>
    </label>

    <p
      v-if="hint"
      :class="[
        'mt-1 ml-2 flex-1',
        hintSizeClasses,
        error ? 'text-error-default' : 'text-text-muted',
      ]"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  let radioIdCounter = 0

  interface Props {
    modelValue: boolean
    label?: string
    name?: string
    id?: string
    value?: string | number | boolean
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

  const localId = `radio-${++radioIdCounter}`

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

  const onLabelClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    toggle()
  }

  // Диаметр внешнего круга: 16 / 20 / 24 / 32 / 40 px
  const circleSizeClasses = computed(() => {
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

  // Размер внутренней точки
  const dotSizeClasses = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-2 h-2'
      case 'sm':
        return 'w-2.5 h-2.5'
      case 'lg':
        return 'w-4 h-4'
      case 'xl':
        return 'w-4 h-4'
      default:
        return 'w-3 h-3'
    }
  })

  const radioClasses = computed(() => {
    if (props.disabled) {
      return 'bg-bg-tertiary border-border-light'
    }

    if (props.error) {
      return props.modelValue
        ? 'bg-error-default border-error-default'
        : 'bg-bg-primary border-error-default hover:bg-error-light'
    }

    if (props.modelValue) {
      return 'bg-primary-default border-primary-default'
    }

    return 'bg-bg-primary border-border-default hover:border-primary-default hover:bg-bg-tertiary'
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
