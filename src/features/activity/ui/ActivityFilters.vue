<template>
  <div
    v-if="visible"
    class="rounded-lg border border-border-default bg-bg-primary p-4 space-y-4"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-text-secondary">Фильтр активности</span>
      <Button variant="ghost" size="sm" @click="$emit('close')">Закрыть</Button>
    </div>

    <div>
      <label class="block text-xs font-medium text-text-muted mb-2">Тип событий</label>
      <div class="flex flex-wrap gap-3">
        <label class="inline-flex items-center gap-2 cursor-pointer">
          <input
            v-model="localTypesAll"
            type="checkbox"
            class="rounded border-border-default text-primary-default"
            @change="onTypesAllChange"
          />
          <span class="text-sm">Все</span>
        </label>
        <label
          v-for="opt in typeOptions"
          :key="opt.value"
          class="inline-flex items-center gap-2 cursor-pointer"
        >
          <input
            :checked="localTypes.includes(opt.value)"
            type="checkbox"
            class="rounded border-border-default text-primary-default"
            @change="toggleType(opt.value)"
          />
          <span class="text-sm">{{ opt.label }} {{ opt.emoji }}</span>
        </label>
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-text-muted mb-2">Период</label>
      <div class="space-y-2">
        <label
          v-for="p in periodOptions"
          :key="p.value"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            v-model="localPeriod"
            type="radio"
            :value="p.value"
            class="text-primary-default"
          />
          <span class="text-sm">{{ p.label }}</span>
        </label>
      </div>
      <div v-if="localPeriod === 'custom'" class="mt-2 grid grid-cols-2 gap-2">
        <div>
          <label class="block text-xs text-text-muted mb-1">С</label>
          <input
            v-model="localDateFrom"
            type="date"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
        </div>
        <div>
          <label class="block text-xs text-text-muted mb-1">По</label>
          <input
            v-model="localDateTo"
            type="date"
            class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm"
          />
        </div>
      </div>
    </div>

    <div>
      <label class="inline-flex items-center gap-2 cursor-pointer">
        <input
          v-model="localImportantOnly"
          type="checkbox"
          class="rounded border-border-default text-primary-default"
        />
        <span class="text-sm text-text-muted">Только важные</span>
      </label>
    </div>

    <div>
      <label class="block text-xs font-medium text-text-muted mb-1">Поиск</label>
      <input
        v-model="localSearch"
        type="text"
        placeholder="Поиск по тексту..."
        class="w-full px-3 py-2 border border-border-default rounded-lg bg-bg-primary text-text-primary text-sm placeholder-text-muted"
        @input="onSearchInput"
      />
    </div>

    <div class="flex gap-2 pt-2">
      <Button variant="ghost" size="sm" @click="handleReset">Сбросить</Button>
      <Button variant="primary" size="sm" @click="handleApply">Применить</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { Button } from '@/shared/ui'
  import type { ActivityFilters as ActivityFiltersType, ActivityType } from '@/entities/activity'

  const props = defineProps<{
    visible: boolean
    filters: ActivityFiltersType
  }>()

  const emit = defineEmits<{
    apply: [filters: ActivityFiltersType]
    reset: []
    close: []
  }>()

  const typeOptions: { value: string; label: string; emoji: string }[] = [
    { value: 'note', label: 'Заметки', emoji: '📝' },
    { value: 'call', label: 'Звонки', emoji: '📞' },
    { value: 'email', label: 'Письма', emoji: '✉️' },
    { value: 'deal_stage_changed', label: 'Сделки', emoji: '🔄' },
    {
      value: 'system',
      label: 'Системные',
      emoji: '✨',
    },
  ]

  const periodOptions = [
    { value: 'all', label: 'Все время' },
    { value: 'today', label: 'Сегодня' },
    { value: 'yesterday', label: 'Вчера' },
    { value: '7d', label: 'Последние 7 дней' },
    { value: '30d', label: 'Последние 30 дней' },
    { value: 'custom', label: 'Произвольный' },
  ] as const

  const localTypes = ref<string[]>([])
  const localTypesAll = ref(true)
  const localPeriod = ref<string>('all')
  const localDateFrom = ref('')
  const localDateTo = ref('')
  const localImportantOnly = ref(false)
  const localSearch = ref('')
  let searchDebounce: ReturnType<typeof setTimeout> | null = null
  const debouncedSearch = ref('')

  watch(
    () => props.filters,
    (f) => {
      localTypes.value = f.types ? [...f.types] : []
      localTypesAll.value = !f.types?.length
      localImportantOnly.value = f.importantOnly ?? false
      localSearch.value = f.search ?? ''
      debouncedSearch.value = f.search ?? ''
      if (f.dateFrom && f.dateTo) {
        localPeriod.value = 'custom'
        localDateFrom.value = f.dateFrom.slice(0, 10)
        localDateTo.value = f.dateTo.slice(0, 10)
      } else {
        localPeriod.value = 'all'
        localDateFrom.value = ''
        localDateTo.value = ''
      }
    },
    { immediate: true },
  )

  const localTypesAsActivityTypes = computed((): ActivityType[] => {
    const list: ActivityType[] = []
    for (const v of localTypes.value) {
      if (v === 'system') {
        list.push(
          'contact_created',
          'contact_updated',
          'company_created',
          'company_updated',
          'deal_created',
          'file_attached',
          'message',
          'task',
        )
      } else {
        list.push(v as ActivityType)
      }
    }
    return list
  })

  function onTypesAllChange() {
    if (localTypesAll.value) {
      localTypes.value = []
    }
  }

  function toggleType(value: string) {
    if (localTypes.value.includes(value)) {
      localTypes.value = localTypes.value.filter((t) => t !== value)
    } else {
      localTypes.value = [...localTypes.value, value]
    }
    localTypesAll.value = localTypes.value.length === 0
  }

  function onSearchInput() {
    if (searchDebounce) clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
      debouncedSearch.value = localSearch.value
    }, 300)
  }

  function buildFilters(): ActivityFiltersType {
    let dateFrom: string | undefined
    let dateTo: string | undefined
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (localPeriod.value === 'today') {
      dateFrom = todayStart.toISOString()
      dateTo = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
    } else if (localPeriod.value === 'yesterday') {
      const yesterday = new Date(todayStart)
      yesterday.setDate(yesterday.getDate() - 1)
      dateFrom = yesterday.toISOString()
      dateTo = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
    } else if (localPeriod.value === '7d') {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 7)
      dateFrom = from.toISOString()
      dateTo = now.toISOString()
    } else if (localPeriod.value === '30d') {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 30)
      dateFrom = from.toISOString()
      dateTo = now.toISOString()
    } else if (localPeriod.value === 'custom' && localDateFrom.value && localDateTo.value) {
      dateFrom = localDateFrom.value + 'T00:00:00.000Z'
      dateTo = localDateTo.value + 'T23:59:59.999Z'
    }
    const types = localTypesAll.value ? undefined : [...new Set(localTypesAsActivityTypes.value)]
    const searchText = localSearch.value.trim() || undefined
    return {
      types: types?.length ? types : undefined,
      dateFrom,
      dateTo,
      importantOnly: localImportantOnly.value || undefined,
      search: searchText,
    }
  }

  function handleReset() {
    localTypes.value = []
    localTypesAll.value = true
    localPeriod.value = 'all'
    localDateFrom.value = ''
    localDateTo.value = ''
    localImportantOnly.value = false
    localSearch.value = ''
    debouncedSearch.value = ''
    emit('reset')
    emit('close')
  }

  function handleApply() {
    emit('apply', buildFilters())
    emit('close')
  }
</script>
