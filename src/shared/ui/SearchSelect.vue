<template>
  <div ref="rootRef" class="relative">
    <Input
      :model-value="query"
      :placeholder="placeholder"
      :size="size"
      :disabled="disabled"
      autocomplete="off"
      @update:model-value="onQueryInput"
      @focus="showDropdown = true"
      @blur="onBlur"
    />
    <div
      v-if="showDropdown && (query || options.length > 0 || loading)"
      class="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-auto rounded-lg border border-border-default bg-bg-primary shadow-lg z-10"
    >
      <button
        v-if="createLabel && query"
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-primary-default hover:bg-bg-tertiary"
        @mousedown.prevent="onCreate"
      >
        {{ createLabel }}
      </button>
      <button
        v-for="item in options"
        :key="getItemId(item)"
        type="button"
        class="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-tertiary"
        @mousedown.prevent="selectItem(item)"
      >
        {{ getOptionLabel(item) }}
      </button>
      <p v-if="loading" class="px-3 py-2 text-sm text-text-muted">Поиск...</p>
      <p v-if="query && !loading && options.length === 0" class="px-3 py-2 text-sm text-text-muted">Ничего не найдено</p>
    </div>
    <p v-if="selectedLabel" class="mt-1 text-xs text-text-muted">
      Выбран: {{ selectedLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import Input from './Input.vue'
  import type { ComponentSize } from './Button.vue'

  export interface SearchSelectOption {
    id: string
    [key: string]: unknown
  }

  const props = withDefaults(
    defineProps<{
      modelValue: string
      query?: string
      selectedLabel?: string
      options: SearchSelectOption[]
      getOptionLabel: (item: SearchSelectOption) => string
      getItemId?: (item: SearchSelectOption) => string
      loading?: boolean
      placeholder?: string
      createLabel?: string
      size?: ComponentSize
      disabled?: boolean
    }>(),
    {
      query: undefined,
      selectedLabel: '',
      loading: false,
      placeholder: 'Поиск...',
      createLabel: '',
      size: 'lg',
      disabled: false,
      getItemId: (item) => item.id,
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [id: string]
    'update:query': [query: string]
    search: [query: string]
    select: [item: SearchSelectOption]
    create: []
  }>()

  const rootRef = ref<HTMLElement | null>(null)
  const internalQuery = ref('')
  const showDropdown = ref(false)

  const query = computed({
    get: () => (props.query !== undefined ? props.query : internalQuery.value),
    set: (v: string) => {
      if (props.query !== undefined) emit('update:query', v)
      else internalQuery.value = v
    },
  })

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  function onQueryInput(value: string) {
    query.value = value
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => emit('search', value.trim()), 300)
  }

  function onBlur() {
    setTimeout(() => { showDropdown.value = false }, 150)
  }

  function onCreate() {
    showDropdown.value = false
    emit('create')
  }

  function selectItem(item: SearchSelectOption) {
    const id = props.getItemId ? props.getItemId(item) : item.id
    emit('update:modelValue', id)
    emit('select', item)
    query.value = ''
    showDropdown.value = false
  }

  watch(
    () => props.modelValue,
    (id) => {
      if (!id) query.value = ''
    },
  )
</script>
