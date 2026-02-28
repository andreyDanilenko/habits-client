<template>
  <div class="Pagination">
    <span class="Pagination__ResultsInfo">
      Показано
      <span class="Pagination__ResultsInfoNum">{{ start }}</span>–
      <span class="Pagination__ResultsInfoNum">{{ end }}</span>
      из
      <span class="Pagination__ResultsInfoNum">{{ total }}</span>
    </span>
    <nav class="Pagination__Nav" aria-label="Пагинация">
      <button
        type="button"
        class="Pagination__Btn"
        aria-label="Предыдущая страница"
        :disabled="page <= 1"
        @click="emit('page-change', page - 1)"
      >
        <ArrowLeftIcon size="sm" />
      </button>
      <div class="Pagination__Numbers">
        <template v-for="(p, i) in pageNumbers" :key="p === 'ellipsis' ? `e-${i}` : p">
          <span v-if="p === 'ellipsis'" class="Pagination__Ellipsis" aria-hidden>…</span>
          <button
            v-else
            type="button"
            :class="['Pagination__Page', { 'Pagination__Page--active': p === page }]"
            :aria-current="p === page ? 'page' : undefined"
            @click="emit('page-change', p)"
          >
            {{ p }}
          </button>
        </template>
      </div>
      <button
        type="button"
        class="Pagination__Btn"
        aria-label="Следующая страница"
        :disabled="page >= totalPages"
        @click="emit('page-change', page + 1)"
      >
        <ArrowRightIcon size="sm" />
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ArrowLeftIcon, ArrowRightIcon } from '@/shared/ui/icon'
  import './Pagination.css'

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
  const start = computed(() =>
    props.total === 0 ? 0 : (page.value - 1) * props.pageSize + 1,
  )
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
