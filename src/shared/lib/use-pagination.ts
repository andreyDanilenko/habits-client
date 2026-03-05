import { ref, computed } from 'vue'

export function usePagination<T>(items: ref<T[]>, pageSize: number) {
  const currentPage = ref(1)

  const totalItems = computed(() => items.value.length)

  const currentPageSafe = computed(() => {
    if (totalItems.value === 0) return 1
    const maxPage = Math.max(1, Math.ceil(totalItems.value / pageSize))
    return Math.min(currentPage.value, maxPage)
  })

  const paginatedItems = computed(() => {
    if (totalItems.value === 0) return []
    const page = currentPageSafe.value
    const start = (page - 1) * pageSize
    return items.value.slice(start, start + pageSize)
  })

  const setPage = (page: number) => {
    currentPage.value = page
  }

  return {
    currentPage,
    currentPageSafe,
    paginatedItems,
    totalItems,
    setPage,
  }
}
