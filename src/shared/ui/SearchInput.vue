<template>
  <div class="relative w-full">
    <div
      v-if="loading"
      class="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-text-muted pointer-events-none flex items-center justify-center"
    >
      <Spinner size="md" class="animate-spin" />
    </div>
    <div
      v-else
      class="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-text-muted pointer-events-none flex items-center justify-center"
      :class="iconWrapperClasses"
    >
      <SearchIcon :size="iconSize" />
    </div>

    <Input
      ref="inputRef"
      :model-value="modelValue"
      :size="size"
      :placeholder="placeholder"
      :disabled="disabled"
      :error="error"
      :hint="hint"
      :show-clear="true"
      :clear-button-label="clearButtonLabel"
      :input-classes="leftIconClasses"
      v-bind="$attrs"
      @update:model-value="onInput"
      @clear="onClear"
      @keydown.esc="handleEsc"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import Input from './Input.vue'
  import { SearchIcon } from './icon'
  import Spinner from './Spinner.vue'
  import { useDebounceFn } from '@/shared/lib'
  import type { ComponentSize } from './Button.vue'

  interface Props {
    modelValue: string
    size?: ComponentSize
    placeholder?: string
    disabled?: boolean
    error?: string
    hint?: string
    clearButtonLabel?: string
    loading?: boolean
    debounce?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'lg',
    placeholder: 'Поиск...',
    disabled: false,
    clearButtonLabel: 'Очистить поиск',
    loading: false,
    debounce: 300,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    clear: []
    search: [value: string]
    'keydown.esc': []
  }>()

  const inputRef = ref<InstanceType<typeof Input> | null>(null)

  // Создаем debounced функцию для поиска
  const debouncedSearch = useDebounceFn((value: string) => {
    emit('search', value)
  }, props.debounce)

  const iconSize = computed(() => {
    const sizes = { xs: 14, sm: 14, md: 16, lg: 18, xl: 18, xxl: 20 }
    return sizes[props.size]
  })

  const iconWrapperClasses = computed(() => {
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

  const leftIconClasses = computed(() => {
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

  const onInput = (value: string) => {
    emit('update:modelValue', value)
    debouncedSearch(value)
  }

  const onClear = () => {
    emit('clear')
    emit('search', '') // при очистке отправляем сразу, без debounce
  }

  const handleEsc = () => {
    emit('keydown.esc')
  }

  defineExpose({
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur(),
  })
</script>
