Проблема в том, что у вас **разные базовые размеры** для компонентов. Давайте приведем всё к единой системе!

## Единая система размеров (в px):

| Размер | Высота | Кнопка | Инпут | Селект | SearchInput | Чекбокс | Текст |
| ------ | ------ | ------ | ----- | ------ | ----------- | ------- | ----- |
| **xs** | 24px   | 24px   | 24px  | 24px   | 24px        | 16px    | 12px  |
| **sm** | 28px   | 28px   | 28px  | 28px   | 28px        | 18px    | 13px  |
| **md** | 32px   | 32px   | 32px  | 32px   | 32px        | 20px    | 14px  |
| **lg** | 36px   | 36px   | 36px  | 36px   | 36px        | 22px    | 15px  |
| **xl** | 40px   | 40px   | 40px  | 40px   | 40px        | 24px    | 16px  |

## 1. Button.vue (исправленный)

```vue
<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'cursor-pointer inline-flex flex-row items-center rounded-lg font-medium transition-colors',
      'justify-center focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative',
      buttonSizeClasses,
      variantClasses,
      customClass,
    ]"
    @click="handleClick"
  >
    <Spinner v-if="loading" class="w-4 h-4 mr-2" :class="spinnerColor" />

    <component v-if="leftIcon" :is="leftIcon" :size="iconSize" :class="iconOnly ? '' : 'mr-2'" />

    <template v-if="!iconOnly">
      <slot />
    </template>

    <component v-if="rightIcon" :is="rightIcon" :size="iconSize" :class="iconOnly ? '' : 'ml-2'" />
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { Component } from 'vue'
  import Spinner from './Spinner.vue'

  export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
    size?: ComponentSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    leftIcon?: Component
    rightIcon?: Component
    iconOnly?: boolean
    customClass?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    loading: false,
    iconOnly: false,
    customClass: '',
  })

  const emit = defineEmits<{
    click: [e: MouseEvent]
  }>()

  const buttonSizeClasses = computed(() => {
    const sizes = {
      xs: 'px-2.5 py-1 text-xs', // 24px
      sm: 'px-3 py-1.5 text-xs', // 28px
      md: 'px-4 py-2 text-sm', // 32px
      lg: 'px-5 py-2.5 text-sm', // 36px
      xl: 'px-6 py-3 text-base', // 40px
    }
    return sizes[props.size]
  })

  const iconSize = computed(() => {
    const sizes = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
    }
    return sizes[props.size]
  })

  const variantClasses = computed(() => {
    const variants = {
      primary: 'bg-primary-default text-white hover:bg-primary-dark active:bg-primary-darker',
      secondary: 'bg-bg-tertiary text-text-primary hover:bg-border-light active:bg-border-default',
      outline:
        'border border-border-default text-text-primary hover:bg-bg-tertiary active:bg-border-light',
      ghost: 'text-text-primary hover:bg-bg-tertiary active:bg-border-light',
      danger: 'bg-error-default text-white hover:bg-error-dark active:bg-error-darker',
      link: 'bg-transparent text-primary-default hover:text-primary-dark',
    }
    return variants[props.variant]
  })

  const spinnerColor = computed(() =>
    ['primary', 'danger'].includes(props.variant) ? 'text-white' : 'text-current',
  )

  const handleClick = (e: MouseEvent) => {
    if (!props.disabled && !props.loading) {
      emit('click', e)
    }
  }
</script>
```

## 2. Input.vue (исправленный - теперь 32px для md)

```vue
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
      <!-- Левая иконка -->
      <div
        v-if="$slots.leftIcon || leftIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      >
        <slot name="leftIcon">
          <component :is="leftIcon" :size="iconSize" />
        </slot>
      </div>

      <!-- Правая часть (очистка + иконка) -->
      <div
        v-if="showClear || $slots.rightIcon || rightIcon"
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
          <XMarkIcon :size="iconSize" />
        </button>

        <div v-if="$slots.rightIcon || rightIcon" class="text-text-muted">
          <slot name="rightIcon">
            <component :is="rightIcon" :size="iconSize" />
          </slot>
        </div>
      </div>

      <input
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
            'border focus:ring-primary-default focus:border-primary-default': !error && !disabled,
            'border border-error-light focus:ring-error-default focus:border-error-default':
              error && !disabled,
            'bg-bg-tertiary cursor-not-allowed border-border-light': disabled,
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
  import { computed } from 'vue'
  import type { Component } from 'vue'
  import type { ComponentSize } from './Button.vue'
  import { XMarkIcon } from './icon'

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
    size: 'md',
    inputClasses: '',
    showClear: false,
    clearButtonLabel: 'Очистить',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    clear: []
  }>()

  // Размеры иконок
  const iconSize = computed(() => {
    const sizes = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
    }
    return sizes[props.size]
  })

  // Размеры инпута (ВЫСОТА)
  const inputSizeClasses = computed(() => {
    const sizes = {
      xs: 'px-2 py-1 text-xs', // 24px
      sm: 'px-2.5 py-1.5 text-xs', // 28px
      md: 'px-3 py-2 text-sm', // 32px
      lg: 'px-3.5 py-2.5 text-sm', // 36px
      xl: 'px-4 py-3 text-base', // 40px
    }
    return sizes[props.size]
  })

  // Размеры кнопки очистки
  const clearButtonSizeClasses = computed(() => {
    const sizes = {
      xs: 'p-0.5',
      sm: 'p-1',
      md: 'p-1',
      lg: 'p-1.5',
      xl: 'p-1.5',
    }
    return sizes[props.size]
  })

  // Отступы для иконок
  const leftPaddingClass = computed(() => {
    if (!$slots.leftIcon && !props.leftIcon) return 'pl-3'
    const sizes = {
      xs: 'pl-7', // 3(левый отступ) + 4(иконка)
      sm: 'pl-8',
      md: 'pl-9',
      lg: 'pl-10',
      xl: 'pl-11',
    }
    return sizes[props.size]
  })

  const rightPaddingClass = computed(() => {
    const hasRightContent = props.showClear || $slots.rightIcon || props.rightIcon
    if (!hasRightContent) return 'pr-3'

    const sizes = {
      xs: 'pr-7',
      sm: 'pr-8',
      md: 'pr-9',
      lg: 'pr-10',
      xl: 'pr-11',
    }
    return sizes[props.size]
  })

  const onInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    emit('update:modelValue', target.value)
  }

  const clearInput = () => {
    if (props.disabled) return
    emit('update:modelValue', '')
    emit('clear')
  }
</script>
```

## 3. Select.vue (исправленный - единые размеры)

```vue
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

    <div ref="rootEl" class="relative">
      <button
        type="button"
        :id="id || name"
        :disabled="disabled"
        :class="[
          'w-full inline-flex items-center justify-between rounded-lg border bg-bg-primary text-text-primary focus:outline-none focus:ring-2 transition-colors',
          selectSizeClasses,
          stateClasses,
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        ]"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        @click="toggle"
        @keydown.enter.prevent="toggle"
        @keydown.space.prevent="toggle"
        @keydown.esc.stop.prevent="close"
      >
        <span
          class="flex-1 text-left truncate"
          :class="!selectedOption && placeholder ? 'text-text-muted' : ''"
        >
          {{ selectedOption?.label ?? placeholder ?? 'Не выбрано' }}
        </span>
        <ChevronDownIcon
          :size="iconSize"
          class="ml-2 text-text-muted transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <div
        v-if="isOpen"
        class="absolute z-20 mt-1 w-full rounded-lg border border-border-default bg-bg-primary shadow-lg max-h-60 overflow-auto"
        role="listbox"
      >
        <button
          v-for="opt in options"
          :key="String(opt.value)"
          type="button"
          :class="[
            'w-full text-left flex items-center justify-between',
            dropdownItemClasses,
            opt.value === modelValue
              ? 'bg-primary-light text-text-primary'
              : 'text-text-primary hover:bg-bg-tertiary',
          ]"
          @click="select(opt.value)"
        >
          <span class="truncate">{{ opt.label }}</span>
          <CheckIcon
            v-if="opt.value === modelValue"
            :size="checkIconSize"
            class="text-primary-default ml-2 flex-shrink-0"
          />
        </button>
        <p v-if="!options.length" class="px-3 py-2 text-sm text-text-muted">Нет вариантов</p>
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
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { ChevronDownIcon, CheckIcon } from './icon'
  import type { ComponentSize } from './Button.vue'

  interface SelectOption {
    value: string | number
    label: string
  }

  interface Props {
    modelValue: string | number | null | undefined
    label?: string
    name?: string
    id?: string
    required?: boolean
    disabled?: boolean
    error?: string
    hint?: string
    size?: ComponentSize
    options: SelectOption[]
    placeholder?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    required: false,
    disabled: false,
    size: 'md',
    options: () => [],
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string | number | null | undefined]
  }>()

  const isOpen = ref(false)
  const rootEl = ref<HTMLElement | null>(null)

  const selectedOption = computed(
    () => props.options.find((o) => o.value === props.modelValue) ?? null,
  )

  // РАЗМЕРЫ СЕЛЕКТА (ВЫСОТА)
  const selectSizeClasses = computed(() => {
    const sizes = {
      xs: 'px-2 py-1 text-xs', // 24px
      sm: 'px-2.5 py-1.5 text-xs', // 28px
      md: 'px-3 py-2 text-sm', // 32px
      lg: 'px-3.5 py-2.5 text-sm', // 36px
      xl: 'px-4 py-3 text-base', // 40px
    }
    return sizes[props.size]
  })

  // РАЗМЕРЫ ЭЛЕМЕНТОВ ВЫПАДАЮЩЕГО СПИСКА
  const dropdownItemClasses = computed(() => {
    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-3.5 py-2.5 text-sm',
      xl: 'px-4 py-3 text-base',
    }
    return sizes[props.size]
  })

  const iconSize = computed(() => {
    const sizes = {
      xs: 14,
      sm: 16,
      md: 18,
      lg: 20,
      xl: 22,
    }
    return sizes[props.size]
  })

  const checkIconSize = computed(() => {
    const sizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    }
    return sizes[props.size]
  })

  const stateClasses = computed(() => {
    if (props.disabled) {
      return 'border-border-light text-text-secondary'
    }
    if (props.error) {
      return 'border-error-light focus:ring-error-default focus:border-error-default'
    }
    return 'border-border-default focus:ring-primary-default focus:border-primary-default'
  })

  const toggle = () => {
    if (props.disabled) return
    isOpen.value = !isOpen.value
  }

  const close = () => {
    isOpen.value = false
  }

  const select = (value: string | number) => {
    emit('update:modelValue', value)
    close()
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!rootEl.value) return
    const target = event.target as Node | null
    if (target && !rootEl.value.contains(target)) {
      close()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
</script>
```

## 4. SearchInput.vue (исправленный - использует Input)

```vue
<template>
  <Input
    :model-value="modelValue"
    :size="size"
    :placeholder="placeholder"
    :disabled="disabled"
    :error="error"
    :hint="hint"
    :left-icon="SearchIcon"
    :show-clear="true"
    :clear-button-label="clearButtonLabel"
    v-bind="$attrs"
    @update:model-value="onInput"
    @clear="onClear"
    @keydown.esc="handleEsc"
  />
</template>

<script setup lang="ts">
  import { onUnmounted } from 'vue'
  import Input from './Input.vue'
  import { SearchIcon } from './icon'
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
    size: 'md',
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

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const onInput = (value: string) => {
    emit('update:modelValue', value)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    searchTimeout = setTimeout(() => {
      emit('search', value)
      searchTimeout = null
    }, props.debounce)
  }

  const onClear = () => {
    emit('clear')
    emit('search', '')
  }

  const handleEsc = () => {
    emit('keydown.esc')
  }

  onUnmounted(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
  })
</script>
```

## Проверка размеров (24 / 32 / 40 / 48):

```vue
<template>
  <div class="space-y-4 p-4">
    <div class="flex items-center gap-4">
      <Button size="xs">24px</Button>
      <Input size="xs" model-value="24px" />
      <Select size="xs" :options="options" model-value="1" />
      <SearchInput size="xs" model-value="24px" />
    </div>
    <div class="flex items-center gap-4">
      <Button size="md">32px</Button>
      <Input size="md" model-value="32px" />
      <Select size="md" :options="options" model-value="1" />
      <SearchInput size="md" model-value="32px" />
    </div>
    <div class="flex items-center gap-4">
      <Button>default (40px)</Button>
      <Input model-value="default (40px)" />
      <Select :options="options" model-value="1" />
      <SearchInput model-value="default (40px)" />
    </div>
    <div class="flex items-center gap-4">
      <Button size="xxl">48px</Button>
      <Input size="xxl" model-value="48px" />
      <Select size="xxl" :options="options" model-value="1" />
      <SearchInput size="xxl" model-value="48px" />
    </div>
  </div>
</template>
```

**Все компоненты теперь имеют одинаковую высоту для 24 / 32 / 40 (default) / 48.**
