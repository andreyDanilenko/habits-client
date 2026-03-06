<template>
  <div class="flex flex-wrap items-center justify-between gap-4 w-full min-h-12">
    <span class="text-sm text-text-secondary">
      Показано
      <span class="font-medium text-text-primary">{{ start }}</span
      >–
      <span class="font-medium text-text-primary">{{ end }}</span>
      из
      <span class="font-medium text-text-primary">{{ total }}</span>
    </span>

    <nav class="flex items-center gap-2" aria-label="Пагинация">
      <button
        type="button"
        class="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-primary-default disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Предыдущая страница"
        :disabled="page <= 1"
        @click="emit('page-change', page - 1)"
      >
        <ArrowLeftIcon size="md" />
      </button>

      <div class="flex items-center gap-1">
        <template v-for="(p, i) in pageNumbers">
          <span
            v-if="p === 'ellipsis'"
            :key="`e-${i}`"
            class="min-w-8 text-center text-sm text-text-secondary"
            aria-hidden="true"
          >
            …
          </span>
          <button
            v-else
            :key="p"
            type="button"
            :class="[
              'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded text-sm border transition-colors',
              p === page
                ? 'bg-primary-default text-white border-primary-default cursor-default'
                : 'bg-bg-primary text-text-secondary border-border-default hover:border-primary-default hover:text-primary-default',
            ]"
            :aria-current="p === page ? 'page' : undefined"
            @click="emit('page-change', p)"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <button
        type="button"
        class="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-primary-default disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Следующая страница"
        :disabled="page >= totalPages"
        @click="emit('page-change', page + 1)"
      >
        <ArrowRightIcon size="md" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'

  const MAX_VISIBLE_PAGES = 5

  const props = defineProps<{
    total: number
    pageSize: number
    currentPage: number
  }>()

  const emit = defineEmits<{
    'page-change': [page: number]
  }>()

  const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
  const page = computed(() => Math.max(1, Math.min(props.currentPage, totalPages.value)))
  const start = computed(() => (props.total === 0 ? 0 : (page.value - 1) * props.pageSize + 1))
  const end = computed(() => Math.min(page.value * props.pageSize, props.total))

  function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
    if (total <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = []
    const left = Math.max(1, current - 1)
    const right = Math.min(total, current + 1)
    if (left > 1) {
      pages.push(1)
      if (left > 2) pages.push('ellipsis')
    }
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < total) {
      if (right < total - 1) pages.push('ellipsis')
      pages.push(total)
    }
    return pages
  }

  const pageNumbers = computed(() => getPageNumbers(page.value, totalPages.value))
</script>
